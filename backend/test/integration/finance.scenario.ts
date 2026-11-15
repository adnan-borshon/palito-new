import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import type { PrismaClient } from "../../src/generated/prisma/client.js";
import type { AccountPrincipal } from "../../src/identity/accounts.js";
import { CareService } from "../../src/care/care.service.js";
import { FinanceService } from "../../src/finance/finance.service.js";
import { signWebhookPayload } from "../../src/finance/lending-math.js";
import { SYNTHETIC_IDS } from "../../src/database/synthetic.js";
import { loadConfig } from "../../src/platform/config.js";
import { DatabaseService } from "../../src/platform/database.js";
import { createLogger } from "../../src/platform/logger.js";

const key = () => randomUUID();
const WEBHOOK_SECRET = "synthetic-m6-webhook-secret-value";

async function denied(work: Promise<unknown>, status: number) {
  await assert.rejects(
    work,
    (e: { getStatus?: () => number }) => e.getStatus?.() === status,
  );
}

export async function financeScenario(
  prisma: PrismaClient,
  env: NodeJS.ProcessEnv,
) {
  const config = loadConfig({
    ...env,
    HEALTHCARE_NO_CHARGE_PILOT: "true",
    FINANCE_SANDBOX_ENABLED: "true",
    PAYMENT_PROVIDER: "sandbox",
    SANDBOX_WEBHOOK_SECRET: WEBHOOK_SECRET,
    LOG_LEVEL: "silent",
  });
  const logger = createLogger(config);
  const db = new DatabaseService(config, logger);
  const secondDb = new DatabaseService(config, logger);
  const care = new CareService(db, config);
  const finance = new FinanceService(db, config);
  const secondFinance = new FinanceService(secondDb, config);

  async function actor(
    role?: "VET" | "ADMIN" | "BANK_STAFF",
    existingOrgId?: string,
  ) {
    const user = await prisma.user.create({
      data: {
        firebaseUid: `synthetic-m6-${key()}`,
        displayName: `Synthetic M6 ${role ?? "Farmer"}`,
        status: "ACTIVE",
      },
    });
    const memberships: AccountPrincipal["memberships"] = [];
    if (role) {
      const kind =
        role === "VET" ? "CLINIC" : role === "ADMIN" ? "PLATFORM" : "BANK";
      const org = existingOrgId
        ? await prisma.organization.findUniqueOrThrow({
            where: { id: existingOrgId },
          })
        : await prisma.organization.create({
            data: { name: `Synthetic M6 ${role} Org`, kind, status: "ACTIVE" },
          });
      const m = await prisma.membership.create({
        data: {
          organizationId: org.id,
          organizationKind: kind,
          userId: user.id,
          role,
          status: "ACTIVE",
        },
      });
      memberships.push({ id: m.id, organizationId: org.id, role });
    }
    if (role === "VET") {
      await prisma.vetCredential.create({
        data: {
          userId: user.id,
          registrationNumber: `SYNTHETIC-M6-${key()}`,
          status: "VERIFIED",
          reviewedById: SYNTHETIC_IDS.reviewer,
          reviewedAt: new Date(),
        },
      });
    }
    return {
      userId: user.id,
      displayName: user.displayName,
      locale: "en",
      status: "ACTIVE",
      firebaseUid: user.firebaseUid,
      memberships,
      capabilities: [],
    } as AccountPrincipal;
  }

  try {
    const farmer = await actor();
    const otherFarmer = await actor();
    const vet = await actor("VET");
    const assessor = await actor("BANK_STAFF");
    const bankOrgId = assessor.memberships[0]!.organizationId;
    const approver = await actor("BANK_STAFF", bankOrgId);
    const otherBankStaff = await actor("BANK_STAFF");
    const admin = await actor("ADMIN");

    // 1. Disabled sandbox fails closed with 503
    const disabledFinance = new FinanceService(
      db,
      loadConfig({ ...env, FINANCE_SANDBOX_ENABLED: "false", LOG_LEVEL: "silent" }),
    );
    await denied(disabledFinance.wallet(farmer), 503);

    // 2. Setup farm, animal, and completed vet consultation with confidential clinical text
    const farm = await care.createFarm(farmer, key(), {
      name: "M6 Finance Farm",
      district: "Sirajganj",
      address: "Private M6 Address",
      areaAcres: "3.5",
    });
    const animal = await care.createAnimal(farmer, key(), {
      farmId: farm.id,
      name: "M6 Bull",
      species: "cattle",
      breed: "Sahiwal",
      sex: "male",
      birthDate: "2023-03-15",
      weightKg: "310.0",
      estimateMinor: "12000000",
    });
    const slotTime = new Date(Date.now() + 2 * 3_600_000);
    slotTime.setUTCSeconds(0, 0);
    await care.availability(vet, key(), 0, [slotTime.toISOString()]);
    const vetSlots = await care.slots(vet.userId);
    const appt = await care.book(farmer, key(), {
      animalId: animal.id,
      slotId: vetSlots.items[0]!.id,
      mode: "visit",
      reason: "Pre-collateral health vaccination",
      consent: true,
      consentVersion: "care-v1",
    });
    await care.decision(vet, appt.id, key(), 1, {
      decision: "accept",
      note: "Accepted",
    });
    await care.start(vet, appt.id, key(), 2);
    const confidentialNote = "SECRET_CLINICAL_NOTE_M6_REDACTED";
    await care.complete(vet, appt.id, key(), 3, {
      kind: "vaccination",
      diagnosis: confidentialNote,
      advice: "Boosters up to date",
      medicines: [
        { name: "FMD-Vax", dose: "2ml", frequency: "Once", days: 1 },
      ],
    });

    // 3. Maker/checker collateral valuations
    await denied(
      finance.createValuation(farmer, key(), {
        animalId: animal.id,
        assessedValueMinor: "10000000",
        approvedValueMinor: "10000000",
        notes: "Farmer self valuation forbidden",
        expiresAt: "2030-01-01T00:00:00Z",
      }),
      403,
    );

    const draftVal = await finance.createValuation(assessor, key(), {
      animalId: animal.id,
      assessedValueMinor: "11000000",
      approvedValueMinor: "10000000",
      notes: "Physical inspection passed",
      expiresAt: "2030-01-01T00:00:00Z",
    });
    assert.equal(draftVal.status, "DRAFT");

    // Maker cannot approve own valuation; unrelated bank org cannot approve
    await denied(finance.approveValuation(assessor, draftVal.id, key(), 1), 403);
    await denied(
      finance.approveValuation(otherBankStaff, draftVal.id, key(), 1),
      403,
    );

    const approvedVal = await finance.approveValuation(
      approver,
      draftVal.id,
      key(),
      1,
    );
    assert.equal(approvedVal.status, "APPROVED");
    assert.equal(approvedVal.maxLoanCap70Minor, "7000000");

    // 4. Collateral eligibility & redacted bank risk summary (zero clinical diagnosis leakage)
    const eligibility = await finance.collateralEligibility(farmer, animal.id);
    assert.equal(eligibility.eligible, true);
    assert.equal(eligibility.latestApprovedValuation?.maxLoanCap70Minor, "7000000");

    const risk = await finance.collateralRiskSummary(approver, animal.id);
    assert.equal(risk.verifiedVetVaccinationCount, 1);
    assert.equal(risk.clinicalDetailsRedacted, true);
    assert.ok(!JSON.stringify(risk).includes(confidentialNote));
    assert.ok(!JSON.stringify(risk).includes("FMD-Vax"));
    await denied(finance.collateralRiskSummary(otherBankStaff, animal.id), 404);

    // 5. 70% LTV cap & quote expiry
    await denied(
      finance.createQuote(farmer, key(), {
        animalId: animal.id,
        valuationId: approvedVal.id,
        requestedPrincipalMinor: "7000001",
        termMonths: 6,
      }),
      400,
    );

    const expiredQuote = await finance.createQuote(farmer, key(), {
      animalId: animal.id,
      valuationId: approvedVal.id,
      requestedPrincipalMinor: "3000000",
      termMonths: 3,
    });
    await prisma.loanQuote.update({
      where: { id: expiredQuote.id },
      data: { expiresAt: new Date(Date.now() - 60_000) },
    });
    await denied(
      finance.createLoan(farmer, key(), {
        quoteId: expiredQuote.id,
        purpose: "Expired quote attempt",
      }),
      409,
    );

    // 6. Concurrent loan creation race against one_live_collateral_per_animal
    const qRace1 = await finance.createQuote(farmer, key(), {
      animalId: animal.id,
      valuationId: approvedVal.id,
      requestedPrincipalMinor: "3000000",
      termMonths: 3,
    });
    const qRace2 = await finance.createQuote(farmer, key(), {
      animalId: animal.id,
      valuationId: approvedVal.id,
      requestedPrincipalMinor: "3000000",
      termMonths: 3,
    });
    const raceResults = await Promise.allSettled([
      finance.createLoan(farmer, key(), {
        quoteId: qRace1.id,
        purpose: "Race loan 1",
      }),
      secondFinance.createLoan(farmer, key(), {
        quoteId: qRace2.id,
        purpose: "Race loan 2",
      }),
    ]);
    assert.equal(
      raceResults.filter((r) => r.status === "fulfilled").length,
      1,
    );
    const rejectedLoan = (
      raceResults.find((r) => r.status === "fulfilled") as PromiseFulfilledResult<{
        id: string;
        version: number;
      }>
    ).value;
    assert.equal(
      await prisma.collateralReservation.count({
        where: { animalId: animal.id, status: { in: ["HELD", "ACTIVE"] } },
      }),
      1,
    );

    // Rejecting a submitted loan releases collateral reservation
    await finance.decideLoan(approver, rejectedLoan.id, key(), 1, {
      decision: "reject",
      note: "Rejected to verify collateral release",
    });
    assert.equal(
      (
        await prisma.collateralReservation.findFirstOrThrow({
          where: { loanId: rejectedLoan.id },
        })
      ).status,
      "RELEASED",
    );

    // 7. Full loan lifecycle: quote -> apply -> approve -> disburse -> HMAC webhook -> schedule -> grace -> repay -> paid
    const qLive = await finance.createQuote(farmer, key(), {
      animalId: animal.id,
      valuationId: approvedVal.id,
      requestedPrincipalMinor: "3000001",
      termMonths: 3,
    });
    const liveLoan = await finance.createLoan(farmer, key(), {
      quoteId: qLive.id,
      purpose: "Working capital & fodder",
    });
    await finance.decideLoan(approver, liveLoan.id, key(), 1, {
      decision: "approve",
      note: "Approved in sandbox",
    });
    const disburseRes = await finance.disburseLoan(
      approver,
      liveLoan.id,
      key(),
      2,
      { provider: "SANDBOX_SIMULATOR" },
    );

    const disburseWebhookPayload = {
      provider: "SANDBOX_SIMULATOR" as const,
      externalEventId: `wh-disburse-${key()}`,
      paymentIntentId: disburseRes.paymentIntent.id,
      status: "SETTLED" as const,
      amountMinor: "3000001",
      currency: "BDT" as const,
    };
    await denied(
      finance.handleWebhook("sha256=badsignature", disburseWebhookPayload),
      401,
    );
    const sig1 = signWebhookPayload(WEBHOOK_SECRET, disburseWebhookPayload);
    const settledDisburse = await finance.handleWebhook(
      sig1,
      disburseWebhookPayload,
    );
    assert.equal(settledDisburse.deduplicated, false);

    // Duplicate webhook deduplicates; tampered replay conflicts (409)
    const replayDisburse = await finance.handleWebhook(
      sig1,
      disburseWebhookPayload,
    );
    assert.equal(replayDisburse.deduplicated, true);
    const tamperedPayload = {
      ...disburseWebhookPayload,
      amountMinor: "100",
    };
    await denied(
      finance.handleWebhook(
        signWebhookPayload(WEBHOOK_SECRET, tamperedPayload),
        tamperedPayload,
      ),
      409,
    );

    // Sandbox wallet reflects credited disbursement (non-withdrawable)
    const walletAfterDisburse = await finance.wallet(farmer);
    assert.equal(walletAfterDisburse.balanceMinor, "3000001");
    assert.equal(walletAfterDisburse.withdrawable, false);

    const schedule = await finance.listInstallments(farmer, liveLoan.id);
    assert.equal(schedule.items.length, 3);
    assert.equal(schedule.items[0]!.principalMinor, "1000000");
    assert.equal(schedule.items[2]!.principalMinor, "1000001");

    // Reviewed grace extension on installment #1
    const graced = await finance.grantGrace(
      approver,
      liveLoan.id,
      key(),
      3,
      {
        installmentId: schedule.items[0]!.id,
        graceDays: 14,
        reason: "Temporary flood disruption",
      },
    );
    assert.equal(graced.installment.status, "GRACE");

    // Partial repayment from sandbox wallet (allocates across #1 -> PAID and #2 -> PARTIAL)
    const partialRepay = await finance.createRepaymentIntent(
      farmer,
      liveLoan.id,
      key(),
      { amountMinor: "1500000", provider: "WALLET" },
    );
    assert.equal(partialRepay.loanStatus, "ACTIVE");
    assert.equal(partialRepay.outstandingMinor, "1500001");

    // Final payoff via SANDBOX_SIMULATOR + HMAC webhook
    const finalRepayIntent = await finance.createRepaymentIntent(
      farmer,
      liveLoan.id,
      key(),
      { amountMinor: "1500001", provider: "SANDBOX_SIMULATOR" },
    );
    const repayWebhook = {
      provider: "SANDBOX_SIMULATOR" as const,
      externalEventId: `wh-repay-${key()}`,
      paymentIntentId: finalRepayIntent.paymentIntent.id,
      status: "SETTLED" as const,
      amountMinor: "1500001",
      currency: "BDT" as const,
    };
    await finance.handleWebhook(
      signWebhookPayload(WEBHOOK_SECRET, repayWebhook),
      repayWebhook,
    );

    const paidLoan = await finance.loanDetail(farmer, liveLoan.id);
    assert.equal(paidLoan.status, "PAID");
    assert.equal(paidLoan.outstandingMinor, "0");
    assert.equal(
      (
        await prisma.collateralReservation.findFirstOrThrow({
          where: { loanId: liveLoan.id },
        })
      ).status,
      "RELEASED",
    );
    assert.equal((await finance.wallet(farmer)).balanceMinor, "1500001");
    await denied(finance.loanDetail(otherFarmer, liveLoan.id), 404);

    // 8. Admin ledger reconciliation & DB-level double-entry immutability/balance triggers
    await denied(finance.reconcileLedger(farmer), 403);
    const report = await finance.reconcileLedger(admin);
    assert.equal(report.balanced, true);
    assert.equal(report.totalDebitMinor, report.totalCreditMinor);
    assert.deepEqual(report.unbalancedTransactionIds, []);

    await assert.rejects(
      db.prisma.$transaction(async (tx) => {
        const account = await tx.ledgerAccount.findFirstOrThrow();
        const ltx = await tx.ledgerTransaction.create({
          data: {
            idempotencyKey: `unbalanced-${key()}`,
            referenceKind: "REVERSAL",
            referenceId: randomUUID(),
            currency: "BDT",
            description: "Illegal single-leg test",
          },
        });
        await tx.ledgerEntry.create({
          data: {
            transactionId: ltx.id,
            accountId: account.id,
            direction: "DEBIT",
            amountMinor: 100n,
            currency: "BDT",
          },
        });
      }),
    );

    await assert.rejects(
      db.prisma.$executeRawUnsafe(
        "UPDATE palito.ledger_entries SET amount_minor = 1",
      ),
    );
    await assert.rejects(
      db.prisma.$executeRawUnsafe("DELETE FROM palito.ledger_entries"),
    );
  } finally {
    await secondDb.onApplicationShutdown();
    await db.onApplicationShutdown();
  }
}
