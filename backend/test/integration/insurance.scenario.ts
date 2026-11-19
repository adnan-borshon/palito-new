import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
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
const WEBHOOK_SECRET = "synthetic-m7-webhook-secret-value";

async function denied(work: Promise<unknown>, status: number) {
  await assert.rejects(
    work,
    (e: { getStatus?: () => number }) => e.getStatus?.() === status,
  );
}

export async function insuranceScenario(
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
    role?: "VET" | "ADMIN" | "BANK_STAFF" | "INSURER_STAFF",
    existingOrgId?: string,
  ) {
    const user = await prisma.user.create({
      data: {
        firebaseUid: `synthetic-m7-${key()}`,
        displayName: `Synthetic M7 ${role ?? "Farmer"}`,
        status: "ACTIVE",
      },
    });
    const memberships: AccountPrincipal["memberships"] = [];
    if (role) {
      const kind =
        role === "VET"
          ? "CLINIC"
          : role === "ADMIN"
            ? "PLATFORM"
            : role === "BANK_STAFF"
              ? "BANK"
              : "INSURER";
      const org = existingOrgId
        ? await prisma.organization.findUniqueOrThrow({
            where: { id: existingOrgId },
          })
        : await prisma.organization.create({
            data: { name: `Synthetic M7 ${role} Org`, kind, status: "ACTIVE" },
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
          registrationNumber: `SYNTHETIC-M7-${key()}`,
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

  async function createReadyEvidenceFile(
    owner: AccountPrincipal,
    animalId: string,
  ) {
    const pngBytes = await sharp({
      create: {
        width: 2,
        height: 2,
        channels: 4,
        background: { r: 90, g: 40, b: 140, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
    const upload = await care.upload(owner, key(), {
      animalId,
      purpose: "clinical-evidence",
      contentType: "image/png",
      sizeBytes: pngBytes.length,
    });
    const stored = await care.content(
      owner,
      upload.id,
      "image/png",
      pngBytes,
    );
    await care.fileComplete(owner, upload.id, key(), stored.sha256);
    return upload.id;
  }

  try {
    const farmer = await actor();
    const otherFarmer = await actor();
    const referredVet = await actor("VET");
    const nonReferredVet = await actor("VET");
    const bankAssessor = await actor("BANK_STAFF");
    const bankOrgId = bankAssessor.memberships[0]!.organizationId;
    const bankApprover = await actor("BANK_STAFF", bankOrgId);
    const insurerReviewer = await actor("INSURER_STAFF");
    const insurerOrgId = insurerReviewer.memberships[0]!.organizationId;
    const insurerDecider = await actor("INSURER_STAFF", insurerOrgId);
    const otherInsurerStaff = await actor("INSURER_STAFF");
    const admin = await actor("ADMIN");

    const farm = await care.createFarm(farmer, key(), {
      name: "M7 Insurance Farm",
      district: "Bogra",
      address: "Private M7 Address",
      areaAcres: "4.0",
    });
    const animalA = await care.createAnimal(farmer, key(), {
      farmId: farm.id,
      name: "M7 Insured Cow A",
      species: "cattle",
      breed: "Friesian",
      sex: "female",
      birthDate: "2022-04-01",
      weightKg: "320.0",
      estimateMinor: "12000000",
    });
    const animalB = await care.createAnimal(farmer, key(), {
      farmId: farm.id,
      name: "M7 Insured Cow B",
      species: "cattle",
      breed: "Sahiwal",
      sex: "male",
      birthDate: "2022-06-01",
      weightKg: "340.0",
      estimateMinor: "14000000",
    });

    // 1. Setup active loans on animalA (debt = 3,000,000) and animalB (debt = 5,000,000)
    for (const [targetAnimal, principalMinor] of [
      [animalA, "3000000"],
      [animalB, "5000000"],
    ] as const) {
      const val = await finance.createValuation(bankAssessor, key(), {
        animalId: targetAnimal.id,
        assessedValueMinor: "10000000",
        approvedValueMinor: "10000000",
        notes: "M7 collateral valuation",
        expiresAt: "2030-01-01T00:00:00Z",
      });
      await finance.approveValuation(bankApprover, val.id, key(), 1);
      const quote = await finance.createQuote(farmer, key(), {
        animalId: targetAnimal.id,
        valuationId: val.id,
        requestedPrincipalMinor: principalMinor,
        termMonths: 3,
      });
      const loan = await finance.createLoan(farmer, key(), {
        quoteId: quote.id,
        purpose: "Dairy expansion",
      });
      await finance.decideLoan(bankApprover, loan.id, key(), 1, {
        decision: "approve",
        note: "Approved",
      });
      const disb = await finance.disburseLoan(bankApprover, loan.id, key(), 2, {
        provider: "SANDBOX_SIMULATOR",
      });
      const wh = {
        provider: "SANDBOX_SIMULATOR" as const,
        externalEventId: `m7-loan-disb-${key()}`,
        paymentIntentId: disb.paymentIntent.id,
        status: "SETTLED" as const,
        amountMinor: principalMinor,
        currency: "BDT" as const,
      };
      await finance.handleWebhook(signWebhookPayload(WEBHOOK_SECRET, wh), wh);
    }

    // 2. Policy enrollment, duplicate prevention, approval awaiting premium, and renewal
    const policyV1 = await finance.applyPolicy(farmer, key(), {
      animalId: animalA.id,
      insurerOrganizationId: insurerOrgId,
      coverageMinor: "6000000",
      premiumMinor: "200000",
      termMonths: 6,
      consent: true,
      consentVersion: "ins-sandbox-v1",
    });
    assert.equal(policyV1.status, "SUBMITTED");

    // Duplicate live policy on same animal rejected
    await denied(
      finance.applyPolicy(farmer, key(), {
        animalId: animalA.id,
        insurerOrganizationId: insurerOrgId,
        coverageMinor: "6000000",
        premiumMinor: "200000",
        termMonths: 6,
        consent: true,
        consentVersion: "ins-sandbox-v1",
      }),
      409,
    );

    // Foreign insurer cannot decide policy
    await denied(
      finance.decidePolicy(otherInsurerStaff, policyV1.id, key(), 1, {
        decision: "approve",
        note: "Wrong org",
      }),
      403,
    );

    const approvedAwaitingPrem = await finance.decidePolicy(
      insurerReviewer,
      policyV1.id,
      key(),
      1,
      {
        decision: "approve",
        note: "Approved pending premium payment",
      },
    );
    assert.equal(approvedAwaitingPrem.status, "APPROVED_AWAITING_PREMIUM");

    // Approval does NOT bypass confirmed premium: submitting claim before premium confirmation fails (409)
    const readyEvidenceA = await createReadyEvidenceFile(farmer, animalA.id);
    await denied(
      finance.submitClaim(farmer, key(), {
        policyId: policyV1.id,
        incidentKind: "DEATH",
        incidentAt: new Date().toISOString(),
        claimedAmountMinor: "5000000",
        description: "Premature claim before premium",
        evidenceFileIds: [readyEvidenceA],
      }),
      409,
    );

    // Pay premium from farmer's sandbox wallet -> activates coverage
    const premPaid = await finance.createPolicyPremiumIntent(
      farmer,
      policyV1.id,
      key(),
      2,
      { provider: "WALLET" },
    );
    assert.equal(premPaid.policy.status, "ACTIVE");
    assert.ok(premPaid.policy.startsAt);
    assert.ok(premPaid.policy.endsAt);

    // Expire policyV1 in the past and test incident outside window + policy renewal
    await prisma.insurancePolicy.update({
      where: { id: policyV1.id },
      data: {
        startsAt: new Date(Date.now() - 180 * 86_400_000),
        endsAt: new Date(Date.now() - 10 * 86_400_000),
        status: "EXPIRED",
      },
    });
    await denied(
      finance.submitClaim(farmer, key(), {
        policyId: policyV1.id,
        incidentKind: "DEATH",
        incidentAt: new Date().toISOString(),
        claimedAmountMinor: "5000000",
        description: "Incident after policy expiry",
        evidenceFileIds: [readyEvidenceA],
      }),
      409,
    );

    const policyV2 = await finance.renewPolicy(farmer, policyV1.id, key(), {
      coverageMinor: "6000000",
      premiumMinor: "200000",
      termMonths: 6,
      consent: true,
      consentVersion: "ins-sandbox-v1",
    });
    assert.equal(policyV2.policyVersion, 2);
    assert.equal(policyV2.renewedFromPolicyId, policyV1.id);

    await finance.decidePolicy(insurerReviewer, policyV2.id, key(), 1, {
      decision: "approve",
      note: "Renewal approved",
    });
    await finance.createPolicyPremiumIntent(farmer, policyV2.id, key(), 2, {
      provider: "WALLET",
    });

    // 3. Repeat/illness claim policy rejection (SRS-GAP-09) and unfinalized PENDING file rejection
    await denied(
      finance.submitClaim(farmer, key(), {
        policyId: policyV2.id,
        incidentKind: "CRITICAL_ILLNESS",
        incidentAt: new Date().toISOString(),
        claimedAmountMinor: "1000000",
        description: "Illness claim disabled in ins-sandbox-v1",
        evidenceFileIds: [readyEvidenceA],
      }),
      409,
    );

    const pendingFile = await care.upload(farmer, key(), {
      animalId: animalA.id,
      purpose: "clinical-evidence",
      contentType: "image/png",
      sizeBytes: 120,
    });
    await denied(
      finance.submitClaim(farmer, key(), {
        policyId: policyV2.id,
        incidentKind: "DEATH",
        incidentAt: new Date().toISOString(),
        claimedAmountMinor: "5000000",
        description: "Unfinalized evidence file attempt",
        evidenceFileIds: [pendingFile.id],
      }),
      400,
    );

    // 4. Valid DEATH claim submission, advisory review, vet referral, private evidence download scope, vet opinion, and maker/checker approval
    const claimA = await finance.submitClaim(farmer, key(), {
      policyId: policyV2.id,
      incidentKind: "DEATH",
      incidentAt: new Date().toISOString(),
      claimedAmountMinor: "5000000",
      description: "Sudden mortality confirmed on farm",
      evidenceFileIds: [readyEvidenceA],
    });
    assert.equal(claimA.status, "SUBMITTED");

    const advReview = await finance.requestClaimReview(
      insurerReviewer,
      claimA.id,
      key(),
      1,
    );
    assert.equal(advReview.status, "UNDER_REVIEW");

    await finance.referClaimToVet(insurerReviewer, claimA.id, key(), 2, {
      vetId: referredVet.userId,
      note: "Please verify mortality photo evidence",
      expiresInHours: 48,
    });

    // Referred vet and case insurer staff can download linked private claim evidence; non-referred vet is denied (404)
    const insurerDownloaded = await care.download(
      insurerReviewer,
      readyEvidenceA,
    );
    assert.ok(insurerDownloaded.length > 0);
    const vetDownloaded = await care.download(referredVet, readyEvidenceA);
    assert.equal(vetDownloaded.length, insurerDownloaded.length);
    await denied(care.download(nonReferredVet, readyEvidenceA), 404);

    // Non-referred vet cannot submit clinical opinion (403)
    await denied(
      finance.submitClaimVetOpinion(nonReferredVet, claimA.id, key(), 3, {
        recommendation: "CONFIRM_MORTALITY",
        clinicalOpinion: "Unauthorized opinion",
      }),
      403,
    );

    const vetOpinion = await finance.submitClaimVetOpinion(
      referredVet,
      claimA.id,
      key(),
      3,
      {
        recommendation: "CONFIRM_MORTALITY",
        clinicalOpinion: "Verified mortality evidence matches animal tag.",
      },
    );
    assert.equal(vetOpinion.status, "VET_REVIEWED");

    // Maker/checker separation: insurerReviewer (who initiated advisory check & referral) cannot approve final payout (403)
    await denied(
      finance.decideClaim(insurerReviewer, claimA.id, key(), 4, {
        decision: "approve",
        approvedAmountMinor: "4500000",
        reason: "Self-approval attempt",
      }),
      403,
    );

    // Second insurer staff in same org approves partial payout (4,500,000 of 5,000,000 claimed)
    const approvedClaimA = await finance.decideClaim(
      insurerDecider,
      claimA.id,
      key(),
      4,
      {
        decision: "approve",
        approvedAmountMinor: "4500000",
        reason: "Approved partial payout after vet confirmation",
      },
    );
    assert.equal(approvedClaimA.status, "APPROVED");

    // 5. Deceased animal cannot secure new borrowing or new policies
    const animalAAfterClaim = await prisma.animal.findUniqueOrThrow({
      where: { id: animalA.id },
    });
    assert.equal(animalAAfterClaim.status, "DECEASED");
    await denied(
      finance.createValuation(bankAssessor, key(), {
        animalId: animalA.id,
        assessedValueMinor: "9000000",
        approvedValueMinor: "9000000",
        notes: "Cannot value deceased animal",
        expiresAt: "2030-01-01T00:00:00Z",
      }),
      409,
    );
    await denied(
      finance.applyPolicy(farmer, key(), {
        animalId: animalA.id,
        insurerOrganizationId: insurerOrgId,
        coverageMinor: "5000000",
        premiumMinor: "100000",
        termMonths: 6,
        consent: true,
        consentVersion: "ins-sandbox-v1",
      }),
      409,
    );

    // 6. Case A (debt below claim amount) + concurrent loan repayment and claim settlement race
    const loanA = await prisma.loan.findFirstOrThrow({
      where: { animalId: animalA.id, status: "ACTIVE" },
    });
    // Race a 2,500,000 wallet repayment against the 4,500,000 claim settlement on the 3,000,000 loan
    const walletBeforeSettleA = BigInt(
      (await finance.wallet(farmer)).balanceMinor,
    );
    const raceOutcomes = await Promise.allSettled([
      finance.settleClaim(insurerDecider, claimA.id, key(), 5, {
        provider: "WALLET",
      }),
      secondFinance.createRepaymentIntent(farmer, loanA.id, key(), {
        amountMinor: "2500000",
        provider: "WALLET",
      }),
    ]);
    assert.ok(raceOutcomes.some((o) => o.status === "fulfilled"));

    // Ensure claimA is settled (if repayment won first, remaining debt was 500,000 so claim settlement also succeeded!)
    const settledClaimADetail = await finance.claimDetail(farmer, claimA.id);
    assert.equal(settledClaimADetail.status, "SETTLED");
    assert.ok(settledClaimADetail.settlementAllocation);

    const loanAAfter = await finance.loanDetail(farmer, loanA.id);
    assert.equal(loanAAfter.status, "PAID");
    assert.equal(loanAAfter.outstandingMinor, "0");

    // Allocation never exceeds claim or debt
    const allocA = settledClaimADetail.settlementAllocation!;
    assert.equal(
      BigInt(allocA.debtAllocatedMinor) + BigInt(allocA.farmerAllocatedMinor),
      4_500_000n,
    );
    assert.ok(BigInt(allocA.debtAllocatedMinor) <= 3_000_000n);
    const walletAfterSettleA = BigInt(
      (await finance.wallet(farmer)).balanceMinor,
    );
    assert.ok(walletAfterSettleA >= walletBeforeSettleA);

    const loanASettlements = await finance.listLoanSettlements(
      bankApprover,
      loanA.id,
    );
    assert.equal(loanASettlements.items.length, 1);
    await denied(finance.listLoanSettlements(otherFarmer, loanA.id), 404);

    // 7. Case B (debt above claim amount: debt = 5,000,000, approved claim = 3,000,000) via provider webhook + callback deduplication
    const policyB = await finance.applyPolicy(farmer, key(), {
      animalId: animalB.id,
      insurerOrganizationId: insurerOrgId,
      coverageMinor: "4000000",
      premiumMinor: "150000",
      termMonths: 6,
      consent: true,
      consentVersion: "ins-sandbox-v1",
    });
    await finance.decidePolicy(insurerReviewer, policyB.id, key(), 1, {
      decision: "approve",
      note: "Approved",
    });
    const premIntentB = await finance.createPolicyPremiumIntent(
      farmer,
      policyB.id,
      key(),
      2,
      { provider: "SANDBOX_SIMULATOR" },
    );
    const premWhB = {
      provider: "SANDBOX_SIMULATOR" as const,
      externalEventId: `m7-prem-b-${key()}`,
      paymentIntentId: premIntentB.paymentIntent.id,
      status: "SETTLED" as const,
      amountMinor: "150000",
      currency: "BDT" as const,
    };
    await finance.handleWebhook(
      signWebhookPayload(WEBHOOK_SECRET, premWhB),
      premWhB,
    );

    const readyEvidenceB = await createReadyEvidenceFile(farmer, animalB.id);
    const claimB = await finance.submitClaim(farmer, key(), {
      policyId: policyB.id,
      incidentKind: "DEATH",
      incidentAt: new Date().toISOString(),
      claimedAmountMinor: "3000000",
      description: "Mortality with active loan above claim amount",
      evidenceFileIds: [readyEvidenceB],
    });
    await finance.requestClaimReview(insurerReviewer, claimB.id, key(), 1);
    await finance.decideClaim(insurerDecider, claimB.id, key(), 2, {
      decision: "approve",
      approvedAmountMinor: "3000000",
      reason: "Approved 3,000,000 against 5,000,000 debt",
    });
    const settleIntentB = await finance.settleClaim(
      insurerDecider,
      claimB.id,
      key(),
      3,
      { provider: "SANDBOX_SIMULATOR" },
    );
    assert.equal(settleIntentB.claim.status, "SETTLING");

    const claimPayoutWh = {
      provider: "SANDBOX_SIMULATOR" as const,
      externalEventId: `m7-claim-payout-b-${key()}`,
      paymentIntentId: settleIntentB.paymentIntent.id,
      status: "SETTLED" as const,
      amountMinor: "3000000",
      currency: "BDT" as const,
    };
    const payoutSig = signWebhookPayload(WEBHOOK_SECRET, claimPayoutWh);
    const firstPayout = await finance.handleWebhook(payoutSig, claimPayoutWh);
    assert.equal(firstPayout.deduplicated, false);

    // Duplicate callback deduplicates without double-allocating
    const dupPayout = await finance.handleWebhook(payoutSig, claimPayoutWh);
    assert.equal(dupPayout.deduplicated, true);

    const settledClaimB = await finance.claimDetail(farmer, claimB.id);
    assert.equal(settledClaimB.status, "SETTLED");
    assert.equal(
      settledClaimB.settlementAllocation?.debtAllocatedMinor,
      "3000000",
    );
    assert.equal(
      settledClaimB.settlementAllocation?.farmerAllocatedMinor,
      "0",
    );

    const loanB = await prisma.loan.findFirstOrThrow({
      where: { animalId: animalB.id },
    });
    assert.equal(loanB.status, "ACTIVE");
    assert.equal(loanB.outstandingMinor, 2_000_000n);

    // 8. Global ledger reconciliation & DB immutability triggers on M7 tables
    const recon = await finance.reconcileLedger(admin);
    assert.equal(recon.balanced, true);
    assert.equal(recon.totalDebitMinor, recon.totalCreditMinor);
    assert.deepEqual(recon.unbalancedTransactionIds, []);

    await assert.rejects(
      db.prisma.$executeRawUnsafe(
        "DELETE FROM palito.claim_settlement_allocations",
      ),
    );
    await assert.rejects(
      db.prisma.$executeRawUnsafe(
        "UPDATE palito.claim_reviews SET notes = 'TAMPERED'",
      ),
    );
  } finally {
    await secondDb.onApplicationShutdown();
    await db.onApplicationShutdown();
  }
}
