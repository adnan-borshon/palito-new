import "reflect-metadata";
import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import {
  ClaimDecisionDto,
  ClaimVetOpinionDto,
  CreateClaimDto,
  CreateLoanQuoteDto,
  CreatePolicyDto,
  GraceDecisionDto,
  ProviderWebhookDto,
  RepaymentIntentDto,
} from "../src/finance/dto.js";
import {
  addCalendarMonthsUtc,
  allocateClaimSettlement,
  allocateRepayment,
  buildInstallmentSchedule,
  canonicalWebhookJson,
  maxLoanCap70,
  signWebhookPayload,
  verifyWebhookSignature,
} from "../src/finance/lending-math.js";
import { harness } from "./helpers.js";

test("lending-math: maxLoanCap70 computes exact integer 70% cap without overflow", () => {
  assert.equal(maxLoanCap70(10_000_000n), 7_000_000n);
  assert.equal(maxLoanCap70(15n), 10n);
  assert.equal(maxLoanCap70(19n), 13n);
  assert.equal(maxLoanCap70(1n), 0n);
  assert.throws(() => maxLoanCap70(0n), RangeError);
  assert.throws(() => maxLoanCap70(-50n), RangeError);
});

test("lending-math: addCalendarMonthsUtc clamps month-end dates and handles leap years", () => {
  assert.equal(
    addCalendarMonthsUtc(new Date("2026-01-31T10:15:00.000Z"), 1).toISOString(),
    "2026-02-28T10:15:00.000Z",
  );
  assert.equal(
    addCalendarMonthsUtc(new Date("2028-01-31T10:15:00.000Z"), 1).toISOString(),
    "2028-02-29T10:15:00.000Z",
  );
  assert.equal(
    addCalendarMonthsUtc(new Date("2026-11-15T08:00:00.000Z"), 3).toISOString(),
    "2027-02-15T08:00:00.000Z",
  );
  assert.throws(() => addCalendarMonthsUtc(new Date(), 0), RangeError);
  assert.throws(() => addCalendarMonthsUtc(new Date(), 1.5), RangeError);
});

test("lending-math: buildInstallmentSchedule preserves exact integer sum on final installment", () => {
  const anchor = new Date("2026-01-31T00:00:00.000Z");
  const schedule = buildInstallmentSchedule(1000n, 3, anchor);
  assert.equal(schedule.length, 3);
  assert.deepEqual(
    schedule.map((s) => s.principalMinor),
    [333n, 333n, 334n],
  );
  assert.equal(
    schedule.reduce((acc, s) => acc + s.principalMinor, 0n),
    1000n,
  );
  assert.equal(schedule[0]!.dueAt.toISOString(), "2026-02-28T00:00:00.000Z");

  assert.throws(() => buildInstallmentSchedule(0n, 3, anchor), RangeError);
  assert.throws(() => buildInstallmentSchedule(1000n, 0, anchor), RangeError);
  assert.throws(() => buildInstallmentSchedule(1000n, 25, anchor), RangeError);
  assert.throws(() => buildInstallmentSchedule(2n, 3, anchor), RangeError);
});

test("lending-math: allocateRepayment applies FIFO across installments and rejects overpayment", () => {
  const installments = [
    { id: "i2", installmentNumber: 2, principalMinor: 500n, paidMinor: 0n },
    { id: "i1", installmentNumber: 1, principalMinor: 500n, paidMinor: 200n },
    { id: "i3", installmentNumber: 3, principalMinor: 500n, paidMinor: 0n },
  ];

  const alloc = allocateRepayment(installments, 600n);
  assert.deepEqual(alloc, [
    {
      installmentId: "i1",
      installmentNumber: 1,
      amountMinor: 300n,
      newPaidMinor: 500n,
      fullyPaid: true,
    },
    {
      installmentId: "i2",
      installmentNumber: 2,
      amountMinor: 300n,
      newPaidMinor: 300n,
      fullyPaid: false,
    },
  ]);

  assert.throws(() => allocateRepayment(installments, 0n), RangeError);
  assert.throws(() => allocateRepayment(installments, 1301n), RangeError);
});

test("lending-math: allocateClaimSettlement enforces debt-first allocation for debt below, above, and zero debt", () => {
  // Debt below claim amount: pays full debt first, exact remainder to farmer
  const below = allocateClaimSettlement(5_000_000n, 3_200_000n);
  assert.deepEqual(below, {
    debtPayoffMinor: 3_200_000n,
    farmerRemainderMinor: 1_800_000n,
    totalSettledMinor: 5_000_000n,
  });

  // Debt above claim amount: 100% to debt, 0 remainder to farmer
  const above = allocateClaimSettlement(3_000_000n, 4_500_000n);
  assert.deepEqual(above, {
    debtPayoffMinor: 3_000_000n,
    farmerRemainderMinor: 0n,
    totalSettledMinor: 3_000_000n,
  });

  // Zero debt: 100% to farmer
  const noDebt = allocateClaimSettlement(2_500_000n, 0n);
  assert.deepEqual(noDebt, {
    debtPayoffMinor: 0n,
    farmerRemainderMinor: 2_500_000n,
    totalSettledMinor: 2_500_000n,
  });

  assert.throws(() => allocateClaimSettlement(0n, 100n), RangeError);
  assert.throws(() => allocateClaimSettlement(100n, -1n), RangeError);
});

test("lending-math: canonical webhook signing and timing-safe HMAC verification", () => {
  const secret = "test-sandbox-webhook-secret-value";
  const a = { b: 2, a: 1, nested: { y: true, x: "ok", skip: undefined } };
  const b = { nested: { x: "ok", y: true }, a: 1, b: 2 };
  assert.equal(canonicalWebhookJson(a), canonicalWebhookJson(b));

  const sig = signWebhookPayload(secret, a);
  assert.match(sig, /^sha256=[a-f0-9]{64}$/);
  assert.equal(verifyWebhookSignature(secret, b, sig), true);
  assert.equal(verifyWebhookSignature(secret, { ...b, a: 99 }, sig), false);
  assert.equal(verifyWebhookSignature(secret, b, "sha256=deadbeef"), false);
  assert.equal(verifyWebhookSignature("short-secret", b, sig), false);
  assert.equal(verifyWebhookSignature(secret, b, undefined), false);
});

test("M6 DTOs validate positive integer minor units, term bounds, and grace limits", async () => {
  const badQuote = plainToInstance(CreateLoanQuoteDto, {
    animalId: "00000000-0000-4000-8000-000000000001",
    valuationId: "00000000-0000-4000-8000-000000000002",
    requestedPrincipalMinor: "0",
    termMonths: 36,
  });
  assert.ok((await validate(badQuote)).length >= 2);

  const badRepay = plainToInstance(RepaymentIntentDto, {
    amountMinor: "-100",
    provider: "WALLET",
  });
  assert.ok((await validate(badRepay)).length > 0);

  const badGrace = plainToInstance(GraceDecisionDto, {
    installmentId: "00000000-0000-4000-8000-000000000003",
    graceDays: 120,
    reason: "Drought relief",
  });
  assert.ok((await validate(badGrace)).length > 0);

  const goodWebhook = plainToInstance(ProviderWebhookDto, {
    provider: "SANDBOX_SIMULATOR",
    externalEventId: "evt-1",
    paymentIntentId: "00000000-0000-4000-8000-000000000004",
    status: "SETTLED",
    amountMinor: "50000",
    currency: "BDT",
  });
  assert.equal((await validate(goodWebhook)).length, 0);

  const badPolicy = plainToInstance(CreatePolicyDto, {
    animalId: "00000000-0000-4000-8000-000000000001",
    insurerOrganizationId: "00000000-0000-4000-8000-000000000002",
    coverageMinor: "5000000",
    premiumMinor: "100000",
    termMonths: 12,
    consent: true,
    consentVersion: "wrong-v0",
  });
  assert.ok((await validate(badPolicy)).length > 0);

  const badClaim = plainToInstance(CreateClaimDto, {
    policyId: "00000000-0000-4000-8000-000000000001",
    incidentKind: "DEATH",
    incidentAt: "2026-11-15T10:00:00Z",
    claimedAmountMinor: "5000000",
    description: "Sudden mortality",
    evidenceFileIds: [],
  });
  assert.ok((await validate(badClaim)).length > 0);

  const goodOpinion = plainToInstance(ClaimVetOpinionDto, {
    recommendation: "CONFIRM_MORTALITY",
    clinicalOpinion: "Post-mortem evidence consistent with sudden mortality.",
  });
  assert.equal((await validate(goodOpinion)).length, 0);

  const badDecision = plainToInstance(ClaimDecisionDto, {
    decision: "approve",
    approvedAmountMinor: "0",
    reason: "",
  });
  assert.ok((await validate(badDecision)).length >= 2);
});

test("HTTP harness: sandbox disabled returns 503 on webhook and protected finance routes return 401", async () => {
  const { app } = await harness({
    env: { FINANCE_SANDBOX_ENABLED: "false" },
  });
  try {
    const server = app.getHttpServer();
    await request(server)
      .post("/api/v1/webhooks/payments/sandbox")
      .send({
        provider: "SANDBOX_SIMULATOR",
        externalEventId: "evt-disabled-1",
        paymentIntentId: "00000000-0000-4000-8000-000000000004",
        status: "SETTLED",
        amountMinor: "50000",
        currency: "BDT",
      })
      .expect(503);

    await request(server).get("/api/v1/loans").expect(401);
    await request(server).get("/api/v1/me/wallet").expect(401);
    await request(server).get("/api/v1/policies").expect(401);
    await request(server).get("/api/v1/claims").expect(401);
    await request(server)
      .get("/api/v1/loans/00000000-0000-4000-8000-000000000001/settlements")
      .expect(401);
    await request(server)
      .post("/api/v1/valuations")
      .send({
        animalId: "00000000-0000-4000-8000-000000000001",
        assessedValueMinor: "100000",
        approvedValueMinor: "100000",
        notes: "Initial test",
        expiresAt: "2030-01-01T00:00:00Z",
      })
      .expect(401);
    await request(server).get("/api/v1/admin/ledger/reconciliation").expect(401);
  } finally {
    await app.close();
  }
});

test("HTTP harness: sandbox enabled enforces HMAC signature (401) and validates webhook DTO (400)", async () => {
  const { app } = await harness({
    env: {
      FINANCE_SANDBOX_ENABLED: "true",
      PAYMENT_PROVIDER: "sandbox",
      SANDBOX_WEBHOOK_SECRET: "sandbox-webhook-secret-16+",
    },
  });
  try {
    const server = app.getHttpServer();
    await request(server)
      .post("/api/v1/webhooks/payments/sandbox")
      .set("X-Palito-Signature", "sha256=0000")
      .send({
        provider: "SANDBOX_SIMULATOR",
        externalEventId: "evt-bad-sig-1",
        paymentIntentId: "00000000-0000-4000-8000-000000000004",
        status: "SETTLED",
        amountMinor: "50000",
        currency: "BDT",
      })
      .expect(401);

    await request(server)
      .post("/api/v1/webhooks/payments/sandbox")
      .send({
        provider: "SANDBOX_SIMULATOR",
        externalEventId: "evt-bad-dto-1",
        paymentIntentId: "not-a-uuid",
        status: "SETTLED",
        amountMinor: "0",
        currency: "USD",
      })
      .expect(400);
  } finally {
    await app.close();
  }
});
