import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { createHash } from "node:crypto";
import { Prisma } from "../generated/prisma/client.js";
import type { AccountPrincipal } from "../identity/accounts.js";
import { APP_CONFIG, type AppConfig } from "../platform/config.js";
import { lockWalletSpend } from "../platform/wallet-lock.js";
import { parseMinorUnits } from "../platform/data-contracts.js";
import { DatabaseService } from "../platform/database.js";
import { OutboxWorkerService } from "../ops/outbox.worker.js";
import type {
  CareFeeIntentDto,
  ClaimDecisionDto,
  ClaimReferralDto,
  ClaimSettlementDto,
  ClaimVetOpinionDto,
  ClaimsPageDto,
  CreateClaimDto,
  CreateLoanDto,
  CreateLoanQuoteDto,
  CreatePolicyDto,
  CreateValuationDto,
  DisburseLoanDto,
  GraceDecisionDto,
  LoanDecisionDto,
  LoansPageDto,
  PoliciesPageDto,
  PolicyDecisionDto,
  PolicyPremiumIntentDto,
  ProviderWebhookDto,
  RenewPolicyDto,
  RepaymentIntentDto,
} from "./dto.js";
import {
  addCalendarMonthsUtc,
  allocateClaimSettlement,
  allocateRepayment,
  buildInstallmentSchedule,
  maxLoanCap70,
  verifyWebhookSignature,
} from "./lending-math.js";

type Tx = Prisma.TransactionClient;

const json = <T>(value: T): T =>
  JSON.parse(
    JSON.stringify(value, (_key, item) =>
      typeof item === "bigint" ? item.toString() : item,
    ),
  );

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, canonical(v)]),
    );
  }
  return value;
}

function instant(value: string): Date {
  const date = new Date(value);
  if (!value.endsWith("Z") || !Number.isFinite(date.getTime())) {
    throw new BadRequestException("Invalid UTC timestamp");
  }
  return date;
}

function decorateValuation<
  T extends { amountMinor: bigint },
>(row: T) {
  return {
    ...row,
    assessedValueMinor: row.amountMinor.toString(),
    approvedValueMinor: row.amountMinor.toString(),
    maxLoanCap70Minor: maxLoanCap70(row.amountMinor).toString(),
  };
}

function decorateLoan<
  T extends {
    totalPayableMinor: bigint;
    outstandingMinor: bigint;
    collateralReservation?: unknown;
  },
>(row: T) {
  const repaidMinor = row.totalPayableMinor - row.outstandingMinor;
  return {
    ...row,
    totalRepayableMinor: row.totalPayableMinor.toString(),
    repaidMinor: (repaidMinor > 0n ? repaidMinor : 0n).toString(),
    collateral: row.collateralReservation ?? null,
  };
}

@Injectable()
export class FinanceService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  private requireSandboxEnabled() {
    if (!this.config.FINANCE_SANDBOX_ENABLED) {
      throw new ServiceUnavailableException(
        "Financial sandbox is disabled unless FINANCE_SANDBOX_ENABLED=true",
      );
    }
  }

  private async lockAnimal(tx: Tx, animalId: string) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('animal'), hashtext(${animalId}))`;
  }

  private async requireActiveFarmerOwner(
    tx: Tx,
    p: AccountPrincipal,
    animalId: string,
  ) {
    const user = await tx.user.findUnique({ where: { id: p.userId } });
    if (!user || user.status !== "ACTIVE") throw new ForbiddenException();
    const animal = await tx.animal.findFirst({
      where: { id: animalId, ownerId: p.userId },
    });
    if (!animal) throw new NotFoundException();
    return animal;
  }

  private async requireBankStaff(
    tx: Tx,
    p: AccountPrincipal,
    organizationId?: string,
  ) {
    const membership = await tx.membership.findFirst({
      where: {
        userId: p.userId,
        role: "BANK_STAFF",
        status: "ACTIVE",
        ...(organizationId ? { organizationId } : {}),
        user: { status: "ACTIVE" },
        organization: { kind: "BANK", status: "ACTIVE" },
      },
    });
    if (!membership) throw new ForbiddenException();
    return membership;
  }

  private async requireAdmin(tx: Tx, p: AccountPrincipal) {
    const membership = await tx.membership.findFirst({
      where: {
        userId: p.userId,
        role: "ADMIN",
        status: "ACTIVE",
        user: { status: "ACTIVE" },
        organization: { kind: "PLATFORM", status: "ACTIVE" },
      },
    });
    if (!membership) throw new ForbiddenException();
    return membership;
  }

  private async requireInsurerStaff(
    tx: Tx,
    p: AccountPrincipal,
    organizationId?: string,
  ) {
    const membership = await tx.membership.findFirst({
      where: {
        userId: p.userId,
        role: "INSURER_STAFF",
        status: "ACTIVE",
        ...(organizationId ? { organizationId } : {}),
        user: { status: "ACTIVE" },
        organization: { kind: "INSURER", status: "ACTIVE" },
      },
    });
    if (!membership) throw new ForbiddenException();
    return membership;
  }

  private async requireVerifiedVet(tx: Tx, p: AccountPrincipal) {
    if (!p.memberships.some((m) => m.role === "VET")) {
      throw new ForbiddenException();
    }
    const valid = await tx.vetCredential.findFirst({
      where: {
        userId: p.userId,
        status: "VERIFIED",
        user: {
          status: "ACTIVE",
          memberships: {
            some: {
              role: "VET",
              status: "ACTIVE",
              organization: { status: "ACTIVE", kind: "CLINIC" },
            },
          },
        },
      },
    });
    if (!valid) throw new ForbiddenException();
    return valid;
  }

  private async verifyReplayAuthority(
    tx: Tx,
    p: AccountPrincipal,
    operation: string,
    result: unknown,
  ) {
    const body = result as Record<string, unknown> | null;
    if (
      operation.startsWith("valuation.") ||
      operation.startsWith("loan.decide:") ||
      operation.startsWith("loan.disburse:") ||
      operation.startsWith("loan.grace:")
    ) {
      const orgId =
        typeof body?.organizationId === "string"
          ? body.organizationId
          : typeof body?.bankOrganizationId === "string"
            ? body.bankOrganizationId
            : undefined;
      await this.requireBankStaff(tx, p, orgId);
      return;
    }
    if (
      operation.startsWith("policy.decide:") ||
      operation.startsWith("claim.review-request:") ||
      operation.startsWith("claim.refer:") ||
      operation.startsWith("claim.decide:") ||
      operation.startsWith("claim.settle:")
    ) {
      const orgId =
        typeof body?.insurerOrganizationId === "string"
          ? body.insurerOrganizationId
          : undefined;
      await this.requireInsurerStaff(tx, p, orgId);
      return;
    }
    if (operation.startsWith("claim.opinion:")) {
      await this.requireVerifiedVet(tx, p);
      return;
    }
    if (
      operation === "quote.create" ||
      operation === "loan.create" ||
      operation === "policy.apply" ||
      operation.startsWith("policy.renew:") ||
      operation === "claim.submit"
    ) {
      const animalId =
        typeof body?.animalId === "string" ? body.animalId : undefined;
      if (animalId) {
        await this.requireActiveFarmerOwner(tx, p, animalId);
      }
    }
  }

  private async command<T>(
    p: AccountPrincipal,
    key: string | undefined,
    operation: string,
    payload: unknown,
    work: (tx: Tx) => Promise<T>,
  ): Promise<T> {
    this.requireSandboxEnabled();
    if (!key || !/^[A-Za-z0-9_-]{8,100}$/.test(key)) {
      throw new BadRequestException("Valid Idempotency-Key header is required");
    }
    const payloadHash = createHash("sha256")
      .update(`${operation}:${JSON.stringify(canonical(payload))}`)
      .digest("hex");

    return this.db.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${p.userId}), hashtext(${key}))`;
      const actor = await tx.user.findUnique({
        where: { id: p.userId },
        select: { status: true },
      });
      if (actor?.status !== "ACTIVE") throw new ForbiddenException();
      const saved = await tx.financeCommand.findUnique({
        where: { actorId_key: { actorId: p.userId, key } },
      });
      if (saved) {
        if (saved.operation !== operation || saved.payloadHash !== payloadHash) {
          throw new ConflictException("Idempotency key payload mismatch");
        }
        await this.verifyReplayAuthority(tx, p, operation, saved.result);
        return saved.result as T;
      }
      const result = json(await work(tx));
      await tx.financeCommand.create({
        data: {
          actorId: p.userId,
          key,
          operation,
          payloadHash,
          result: result as Prisma.InputJsonValue,
        },
      });
      return result;
    });
  }

  private async ensureAccount(
    tx: Tx,
    accountKind:
      | "USER_WALLET"
      | "BANK_POOL"
      | "BANK_RECEIVABLE"
      | "INSURER_POOL"
      | "PLATFORM_ESCROW"
      | "PROVIDER_CLEARING",
    opts: { ownerUserId?: string; organizationId?: string } = {},
  ) {
    const existing = await tx.ledgerAccount.findFirst({
      where: {
        accountKind,
        ownerUserId: opts.ownerUserId ?? null,
        organizationId: opts.organizationId ?? null,
        currency: "BDT",
      },
    });
    if (existing) return existing;
    return tx.ledgerAccount.create({
      data: {
        accountKind,
        ownerUserId: opts.ownerUserId ?? null,
        organizationId: opts.organizationId ?? null,
        currency: "BDT",
      },
    });
  }

  private async postBalancedTransaction(
    tx: Tx,
    input: {
      idempotencyKey: string;
      referenceKind:
        | "LOAN_DISBURSEMENT"
        | "LOAN_REPAYMENT"
        | "CARE_FEE"
        | "POLICY_PREMIUM"
        | "CLAIM_SETTLEMENT"
        | "ORDER_PAYMENT"
        | "ORDER_REFUND"
        | "REVERSAL"
        | "SANDBOX_TOPUP";
      referenceId: string;
      description: string;
      debitAccountId: string;
      creditAccountId: string;
      amountMinor: bigint;
    },
  ) {
    return this.postMultiLegBalancedTransaction(tx, {
      idempotencyKey: input.idempotencyKey,
      referenceKind: input.referenceKind,
      referenceId: input.referenceId,
      description: input.description,
      legs: [
        {
          accountId: input.debitAccountId,
          direction: "DEBIT",
          amountMinor: input.amountMinor,
        },
        {
          accountId: input.creditAccountId,
          direction: "CREDIT",
          amountMinor: input.amountMinor,
        },
      ],
    });
  }

  private async postMultiLegBalancedTransaction(
    tx: Tx,
    input: {
      idempotencyKey: string;
      referenceKind:
        | "LOAN_DISBURSEMENT"
        | "LOAN_REPAYMENT"
        | "CARE_FEE"
        | "POLICY_PREMIUM"
        | "CLAIM_SETTLEMENT"
        | "ORDER_PAYMENT"
        | "ORDER_REFUND"
        | "REVERSAL"
        | "SANDBOX_TOPUP";
      referenceId: string;
      description: string;
      legs: Array<{
        accountId: string;
        direction: "DEBIT" | "CREDIT";
        amountMinor: bigint;
      }>;
    },
  ) {
    const activeLegs = input.legs.filter((leg) => leg.amountMinor > 0n);
    if (activeLegs.length < 2) {
      throw new BadRequestException("Ledger transaction requires at least 2 legs");
    }
    let debitSum = 0n;
    let creditSum = 0n;
    const debitAccounts = new Set<string>();
    const creditAccounts = new Set<string>();
    for (const leg of activeLegs) {
      if (leg.direction === "DEBIT") {
        debitSum += leg.amountMinor;
        debitAccounts.add(leg.accountId);
      } else {
        creditSum += leg.amountMinor;
        creditAccounts.add(leg.accountId);
      }
    }
    if (debitSum <= 0n || debitSum !== creditSum) {
      throw new BadRequestException(
        "Ledger transaction debit and credit totals must balance",
      );
    }
    if (
      debitAccounts.size === 1 &&
      creditAccounts.size === 1 &&
      [...debitAccounts][0] === [...creditAccounts][0]
    ) {
      throw new BadRequestException("Debit and credit accounts must differ");
    }
    const existing = await tx.ledgerTransaction.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
    });
    if (existing) return existing;

    const ledgerTx = await tx.ledgerTransaction.create({
      data: {
        idempotencyKey: input.idempotencyKey,
        referenceKind: input.referenceKind,
        referenceId: input.referenceId,
        currency: "BDT",
        description: input.description,
      },
    });
    await tx.ledgerEntry.createMany({
      data: activeLegs.map((leg) => ({
        transactionId: ledgerTx.id,
        accountId: leg.accountId,
        direction: leg.direction,
        amountMinor: leg.amountMinor,
        currency: "BDT",
      })),
    });
    return ledgerTx;
  }

  private async computeAccountBalanceMinor(
    tx: Tx,
    accountId: string,
  ): Promise<bigint> {
    const grouped = await tx.ledgerEntry.groupBy({
      by: ["direction"],
      where: { accountId },
      _sum: { amountMinor: true },
    });
    let credits = 0n;
    let debits = 0n;
    for (const row of grouped) {
      if (row.direction === "CREDIT") credits = row._sum.amountMinor ?? 0n;
      if (row.direction === "DEBIT") debits = row._sum.amountMinor ?? 0n;
    }
    return credits - debits;
  }

  async createValuation(
    p: AccountPrincipal,
    key: string | undefined,
    d: CreateValuationDto,
  ) {
    return this.command(p, key, "valuation.create", d, async (tx) => {
      await this.lockAnimal(tx, d.animalId);
      const bankMembership = await this.requireBankStaff(tx, p);
      const animal = await tx.animal.findUnique({ where: { id: d.animalId } });
      if (!animal) throw new NotFoundException();
      if (animal.status !== "ACTIVE") {
        throw new ConflictException("Only ACTIVE animals can be assessed");
      }
      if (animal.ownerId === p.userId) {
        throw new ForbiddenException("Assessor cannot value their own animal");
      }
      const rawApproved = d.approvedValueMinor ?? d.amountMinor;
      if (!rawApproved) {
        throw new BadRequestException(
          "approvedValueMinor or amountMinor is required",
        );
      }
      const approvedValueMinor = parseMinorUnits(rawApproved);
      const assessedValueMinor = d.assessedValueMinor
        ? parseMinorUnits(d.assessedValueMinor)
        : approvedValueMinor;
      if (approvedValueMinor > assessedValueMinor) {
        throw new BadRequestException(
          "approvedValueMinor cannot exceed assessedValueMinor",
        );
      }
      const expiresAt = instant(d.expiresAt);
      if (expiresAt.getTime() <= Date.now()) {
        throw new BadRequestException(
          "Valuation expiresAt must be in the future",
        );
      }
      const lastVal = await tx.valuation.findFirst({
        where: { animalId: animal.id },
        orderBy: { version: "desc" },
      });
      const nextVersion = (lastVal?.version ?? 0) + 1;
      const valuation = await tx.valuation.create({
        data: {
          animalId: animal.id,
          ownerAtAssessmentId: animal.ownerId,
          organizationId: bankMembership.organizationId,
          assessorId: p.userId,
          version: nextVersion,
          status: "DRAFT",
          amountMinor: approvedValueMinor,
          currency: d.currency ?? "BDT",
          notes: d.notes.trim(),
          assessedAt: new Date(),
          expiresAt,
        },
      });
      await tx.auditEvent.create({
        data: {
          actorId: p.userId,
          actorKind: "USER",
          action: "VALUATION_CREATED",
          targetKind: "valuation",
          targetId: valuation.id,
          metadata: {
            animalId: animal.id,
            organizationId: bankMembership.organizationId,
            assessedValueMinor: assessedValueMinor.toString(),
            approvedValueMinor: approvedValueMinor.toString(),
          },
        },
      });
      return {
        ...decorateValuation(valuation),
        assessedValueMinor: assessedValueMinor.toString(),
      };
    });
  }

  async approveValuation(
    p: AccountPrincipal,
    id: string,
    key: string | undefined,
    version: number,
  ) {
    return this.command(
      p,
      key,
      `valuation.approve:${id}`,
      { version },
      async (tx) => {
        const before = await tx.valuation.findUnique({ where: { id } });
        if (!before || !before.organizationId) throw new NotFoundException();
        await this.lockAnimal(tx, before.animalId);
        await this.requireBankStaff(tx, p, before.organizationId);
        const animal = await tx.animal.findUnique({
          where: { id: before.animalId },
        });
        if (
          !animal ||
          animal.status !== "ACTIVE" ||
          animal.ownerId !== before.ownerAtAssessmentId
        ) {
          throw new ConflictException(
            "Animal ownership or status changed since assessment",
          );
        }
        if (before.assessorId === p.userId) {
          throw new ForbiddenException(
            "Maker/checker violation: assessor cannot approve their own valuation",
          );
        }
        if (animal.ownerId === p.userId) {
          throw new ForbiddenException("Approver cannot be the animal owner");
        }
        if (before.status !== "DRAFT") {
          throw new ConflictException("Valuation is not in DRAFT status");
        }
        if (before.expiresAt.getTime() <= Date.now()) {
          throw new ConflictException("Valuation has already expired");
        }
        const updated = await tx.valuation.updateMany({
          where: { id, version, status: "DRAFT" },
          data: {
            status: "APPROVED",
            approvedById: p.userId,
            approvedAt: new Date(),
          },
        });
        if (!updated.count) throw new ConflictException();
        const row = await tx.valuation.findUniqueOrThrow({ where: { id } });
        await OutboxWorkerService.enqueue(tx, {
          topic: "VALUATION_APPROVED",
          dedupeKey: `valuation-approved:${id}`,
          aggregateKind: "valuation",
          aggregateId: id,
          payload: {
            recipientId: animal.ownerId,
            linkKind: "valuation",
            linkId: id,
          },
        });
        await tx.auditEvent.create({
          data: {
            actorId: p.userId,
            actorKind: "USER",
            action: "VALUATION_APPROVED",
            targetKind: "valuation",
            targetId: id,
            metadata: {
              animalId: animal.id,
              organizationId: before.organizationId,
              approvedValueMinor: row.amountMinor.toString(),
            },
          },
        });
        return decorateValuation(row);
      },
    );
  }

  async listValuations(p: AccountPrincipal, animalId: string) {
    this.requireSandboxEnabled();
    return this.db.prisma.$transaction(async (tx) => {
      const animal = await tx.animal.findUnique({ where: { id: animalId } });
      if (!animal) throw new NotFoundException();
      const isOwner = animal.ownerId === p.userId;
      const bankOrgIds = p.memberships
        .filter((m) => m.role === "BANK_STAFF")
        .map((m) => m.organizationId);
      if (!isOwner && bankOrgIds.length === 0) {
        throw new NotFoundException();
      }
      const rows = await tx.valuation.findMany({
        where: {
          animalId,
          ...(isOwner
            ? { ownerAtAssessmentId: p.userId }
            : { organizationId: { in: bankOrgIds } }),
        },
        orderBy: [{ assessedAt: "desc" }, { version: "desc" }],
      });
      return json({
        items: rows.map(decorateValuation),
      });
    });
  }

  async collateralEligibility(p: AccountPrincipal, animalId: string) {
    this.requireSandboxEnabled();
    return this.db.prisma.$transaction(async (tx) => {
      const animal = await tx.animal.findUnique({ where: { id: animalId } });
      if (!animal) throw new NotFoundException();
      const isOwner = animal.ownerId === p.userId;
      const bankOrgIds = p.memberships
        .filter((m) => m.role === "BANK_STAFF")
        .map((m) => m.organizationId);
      if (!isOwner && bankOrgIds.length === 0) {
        throw new NotFoundException();
      }
      const liveCollateral = await tx.collateralReservation.findFirst({
        where: {
          animalId,
          status: { in: ["HELD", "ACTIVE"] },
        },
      });
      const latestApproved = await tx.valuation.findFirst({
        where: {
          animalId,
          ownerAtAssessmentId: animal.ownerId,
          status: "APPROVED",
          expiresAt: { gt: new Date() },
          ...(isOwner ? {} : { organizationId: { in: bankOrgIds } }),
        },
        orderBy: [{ approvedAt: "desc" }, { version: "desc" }],
      });
      const eligible =
        animal.status === "ACTIVE" && !liveCollateral && !!latestApproved;
      const reason =
        animal.status !== "ACTIVE"
          ? "ANIMAL_NOT_ACTIVE"
          : liveCollateral
            ? "COLLATERAL_ALREADY_RESERVED"
            : !latestApproved
              ? "NO_ACTIVE_APPROVED_VALUATION"
              : "ELIGIBLE";

      return json({
        animalId: animal.id,
        animalStatus: animal.status,
        farmerEstimatedValueMinor: animal.estimateMinor.toString(),
        eligible,
        reason,
        hasLiveCollateralReservation: !!liveCollateral,
        latestApprovedValuation: latestApproved
          ? {
              id: latestApproved.id,
              version: latestApproved.version,
              organizationId: latestApproved.organizationId,
              assessedValueMinor: latestApproved.amountMinor.toString(),
              approvedValueMinor: latestApproved.amountMinor.toString(),
              maxLoanCap70Minor: maxLoanCap70(
                latestApproved.amountMinor,
              ).toString(),
              currency: latestApproved.currency,
              expiresAt: latestApproved.expiresAt,
            }
          : null,
      });
    });
  }

  async collateralRiskSummary(p: AccountPrincipal, animalId: string) {
    this.requireSandboxEnabled();
    return this.db.prisma.$transaction(async (tx) => {
      const animal = await tx.animal.findUnique({ where: { id: animalId } });
      if (!animal) throw new NotFoundException();
      const isOwner = animal.ownerId === p.userId;
      const bankOrgIds = p.memberships
        .filter((m) => m.role === "BANK_STAFF")
        .map((m) => m.organizationId);
      if (!isOwner) {
        if (bankOrgIds.length === 0) throw new NotFoundException();
        const hasBankRelationship =
          (await tx.valuation.count({
            where: { animalId, organizationId: { in: bankOrgIds } },
          })) > 0 ||
          (await tx.loan.count({
            where: { animalId, bankOrganizationId: { in: bankOrgIds } },
          })) > 0;
        if (!hasBankRelationship) throw new NotFoundException();
      }
      const [vaccinationCount, checkupCount, liveCollateral, latestApproved] =
        await Promise.all([
          tx.healthRecord.count({
            where: { animalId, source: "VET", kind: "vaccination" },
          }),
          tx.healthRecord.count({
            where: { animalId, source: "VET", kind: "checkup" },
          }),
          tx.collateralReservation.findFirst({
            where: { animalId, status: { in: ["HELD", "ACTIVE"] } },
          }),
          tx.valuation.findFirst({
            where: {
              animalId,
              ownerAtAssessmentId: animal.ownerId,
              status: "APPROVED",
              expiresAt: { gt: new Date() },
            },
            orderBy: [{ approvedAt: "desc" }],
          }),
        ]);

      return json({
        animalId: animal.id,
        species: animal.species,
        breed: animal.breed,
        status: animal.status,
        weightKg: animal.weightKg.toString(),
        verifiedVetVaccinationCount: vaccinationCount,
        verifiedVetCheckupCount: checkupCount,
        hasLiveCollateralReservation: !!liveCollateral,
        approvedValuation: latestApproved
          ? {
              id: latestApproved.id,
              approvedValueMinor: latestApproved.amountMinor.toString(),
              maxLoanCap70Minor: maxLoanCap70(
                latestApproved.amountMinor,
              ).toString(),
              expiresAt: latestApproved.expiresAt,
            }
          : null,
        clinicalDetailsRedacted: true,
      });
    });
  }

  async createQuote(
    p: AccountPrincipal,
    key: string | undefined,
    d: CreateLoanQuoteDto,
  ) {
    return this.command(p, key, "quote.create", d, async (tx) => {
      await this.lockAnimal(tx, d.animalId);
      const animal = await this.requireActiveFarmerOwner(tx, p, d.animalId);
      if (animal.status !== "ACTIVE") {
        throw new ConflictException("Animal must be ACTIVE for collateral");
      }
      const liveCollateral = await tx.collateralReservation.findFirst({
        where: { animalId: animal.id, status: { in: ["HELD", "ACTIVE"] } },
      });
      if (liveCollateral) {
        throw new ConflictException(
          "Animal already has an active collateral reservation",
        );
      }
      const valuation = await tx.valuation.findFirst({
        where: {
          id: d.valuationId,
          animalId: animal.id,
          ownerAtAssessmentId: p.userId,
          status: "APPROVED",
          expiresAt: { gt: new Date() },
        },
      });
      if (!valuation || !valuation.organizationId) {
        throw new ConflictException(
          "A current APPROVED bank valuation is required before requesting a quote",
        );
      }
      const maxPrincipalMinor = maxLoanCap70(valuation.amountMinor);
      const requestedPrincipalMinor = parseMinorUnits(
        d.requestedPrincipalMinor,
      );
      if (requestedPrincipalMinor > maxPrincipalMinor) {
        throw new BadRequestException(
          `Requested principal (${requestedPrincipalMinor.toString()}) exceeds 70% LTV cap (${maxPrincipalMinor.toString()})`,
        );
      }
      buildInstallmentSchedule(
        requestedPrincipalMinor,
        d.termMonths,
        new Date(),
      );
      const quote = await tx.loanQuote.create({
        data: {
          animalId: animal.id,
          farmerId: p.userId,
          bankOrganizationId: valuation.organizationId,
          valuationId: valuation.id,
          valuationVersion: valuation.version,
          approvedValueMinor: valuation.amountMinor,
          maxPrincipalMinor,
          requestedPrincipalMinor,
          termMonths: d.termMonths,
          annualRateBps: 0,
          feeMinor: 0n,
          currency: "BDT",
          termVersion: "sandbox-v1",
          status: "ACTIVE",
          expiresAt: new Date(Date.now() + 30 * 60_000),
        },
      });
      return {
        ...quote,
        maxAllowedMinor: quote.maxPrincipalMinor.toString(),
        totalRepayableMinor: (
          quote.requestedPrincipalMinor + quote.feeMinor
        ).toString(),
      };
    });
  }

  async createLoan(
    p: AccountPrincipal,
    key: string | undefined,
    d: CreateLoanDto,
  ) {
    return this.command(p, key, "loan.create", d, async (tx) => {
      const quote = await tx.loanQuote.findUnique({ where: { id: d.quoteId } });
      if (!quote || quote.farmerId !== p.userId) {
        throw new NotFoundException();
      }
      await this.lockAnimal(tx, quote.animalId);
      const animal = await this.requireActiveFarmerOwner(tx, p, quote.animalId);
      if (animal.status !== "ACTIVE") {
        throw new ConflictException("Animal is no longer ACTIVE");
      }
      if (quote.status !== "ACTIVE" || quote.expiresAt.getTime() <= Date.now()) {
        throw new ConflictException("Loan quote is expired or already used");
      }
      const valuation = await tx.valuation.findFirst({
        where: {
          id: quote.valuationId,
          animalId: animal.id,
          ownerAtAssessmentId: p.userId,
          status: "APPROVED",
          expiresAt: { gt: new Date() },
        },
      });
      if (!valuation) {
        throw new ConflictException("Underlying valuation is no longer valid");
      }
      const cap = maxLoanCap70(valuation.amountMinor);
      if (quote.requestedPrincipalMinor > cap) {
        throw new ConflictException(
          "Quote exceeds 70% cap of approved valuation",
        );
      }
      const quoteUpdate = await tx.loanQuote.updateMany({
        where: { id: quote.id, status: "ACTIVE" },
        data: { status: "USED" },
      });
      if (!quoteUpdate.count) {
        throw new ConflictException("Loan quote was already consumed");
      }
      const totalPayableMinor = quote.requestedPrincipalMinor + quote.feeMinor;
      const loan = await tx.loan.create({
        data: {
          quoteId: quote.id,
          animalId: animal.id,
          farmerId: p.userId,
          bankOrganizationId: quote.bankOrganizationId,
          purpose: d.purpose.trim(),
          repaymentSource:
            d.repaymentSource?.trim() || "Livestock dairy and farm income",
          termVersion: quote.termVersion,
          principalMinor: quote.requestedPrincipalMinor,
          totalPayableMinor,
          outstandingMinor: 0n,
          termMonths: quote.termMonths,
          currency: "BDT",
          status: "SUBMITTED",
        },
      });
      let collateralReservation;
      try {
        collateralReservation = await tx.collateralReservation.create({
          data: {
            animalId: animal.id,
            loanId: loan.id,
            quoteId: quote.id,
            farmerId: p.userId,
            bankOrganizationId: quote.bankOrganizationId,
            status: "HELD",
            expiresAt: valuation.expiresAt,
          },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002"
        ) {
          throw new ConflictException(
            "Animal already has a live collateral reservation",
          );
        }
        throw err;
      }
      await OutboxWorkerService.enqueue(tx, {
        topic: "LOAN_SUBMITTED",
        dedupeKey: `loan-submitted:${loan.id}`,
        aggregateKind: "loan",
        aggregateId: loan.id,
        payload: {
          recipientId: p.userId,
          linkKind: "loan",
          linkId: loan.id,
        },
      });
      await tx.auditEvent.create({
        data: {
          actorId: p.userId,
          actorKind: "USER",
          action: "LOAN_SUBMITTED",
          targetKind: "loan",
          targetId: loan.id,
          metadata: {
            animalId: animal.id,
            quoteId: quote.id,
            principalMinor: loan.principalMinor.toString(),
          },
        },
      });
      return decorateLoan({ ...loan, collateralReservation });
    });
  }

  async listLoans(p: AccountPrincipal, q: LoansPageDto = {}) {
    this.requireSandboxEnabled();
    const limit = q.limit ?? 25;
    let after: { createdAt: Date; id: string } | undefined;
    if (q.cursor) {
      try {
        const parsed = JSON.parse(
          Buffer.from(q.cursor, "base64url").toString("utf8"),
        );
        if (
          !Array.isArray(parsed) ||
          parsed.length !== 2 ||
          typeof parsed[0] !== "string" ||
          typeof parsed[1] !== "string"
        ) {
          throw new Error("Bad cursor");
        }
        after = { createdAt: instant(parsed[0]), id: parsed[1] };
      } catch {
        throw new BadRequestException("Invalid cursor");
      }
    }
    const bankOrgIds = p.memberships
      .filter((m) => m.role === "BANK_STAFF")
      .map((m) => m.organizationId);

    const rows = await this.db.prisma.loan.findMany({
      where: {
        OR: [
          { farmerId: p.userId },
          ...(bankOrgIds.length > 0
            ? [{ bankOrganizationId: { in: bankOrgIds } }]
            : []),
        ],
        ...(q.status ? { status: q.status } : {}),
        ...(after
          ? {
              AND: [
                {
                  OR: [
                    { createdAt: { lt: after.createdAt } },
                    { createdAt: after.createdAt, id: { lt: after.id } },
                  ],
                },
              ],
            }
          : {}),
      },
      include: {
        collateralReservation: true,
        installments: {
          orderBy: { installmentNumber: "asc" },
        },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
    });
    const more = rows.length > limit;
    const items = rows.slice(0, limit).map(decorateLoan);
    const last = rows.slice(0, limit).at(-1);
    return json({
      items,
      nextCursor:
        more && last
          ? Buffer.from(
              JSON.stringify([last.createdAt.toISOString(), last.id]),
            ).toString("base64url")
          : null,
      sandboxMode: true,
    });
  }

  private async getScopedLoan(tx: Tx, p: AccountPrincipal, id: string) {
    const loan = await tx.loan.findUnique({
      where: { id },
      include: {
        collateralReservation: true,
        installments: { orderBy: { installmentNumber: "asc" } },
      },
    });
    if (!loan) throw new NotFoundException();
    const isFarmer = loan.farmerId === p.userId;
    const isBankStaff = p.memberships.some(
      (m) =>
        m.role === "BANK_STAFF" && m.organizationId === loan.bankOrganizationId,
    );
    if (!isFarmer && !isBankStaff) {
      throw new NotFoundException();
    }
    if (isBankStaff && !isFarmer) {
      await this.requireBankStaff(tx, p, loan.bankOrganizationId);
    }
    return loan;
  }

  async loanDetail(p: AccountPrincipal, id: string) {
    this.requireSandboxEnabled();
    return this.db.prisma.$transaction(async (tx) =>
      json(decorateLoan(await this.getScopedLoan(tx, p, id))),
    );
  }

  async listInstallments(p: AccountPrincipal, id: string) {
    this.requireSandboxEnabled();
    return this.db.prisma.$transaction(async (tx) => {
      const loan = await this.getScopedLoan(tx, p, id);
      const decorated = decorateLoan(loan);
      return json({
        loanId: loan.id,
        status: loan.status,
        totalPayableMinor: loan.totalPayableMinor.toString(),
        totalRepayableMinor: decorated.totalRepayableMinor,
        repaidMinor: decorated.repaidMinor,
        outstandingMinor: loan.outstandingMinor.toString(),
        items: loan.installments.map((inst) => ({
          ...inst,
          principalDueMinor: inst.principalMinor.toString(),
          principalPaidMinor: inst.paidMinor.toString(),
        })),
      });
    });
  }

  async decideLoan(
    p: AccountPrincipal,
    id: string,
    key: string | undefined,
    version: number,
    d: LoanDecisionDto,
  ) {
    return this.command(
      p,
      key,
      `loan.decide:${id}`,
      { version, d },
      async (tx) => {
        const before = await tx.loan.findUnique({ where: { id } });
        if (!before) throw new NotFoundException();
        await this.lockAnimal(tx, before.animalId);
        await this.requireBankStaff(tx, p, before.bankOrganizationId);
        if (before.farmerId === p.userId) {
          throw new ForbiddenException(
            "Bank officer cannot decide their own loan",
          );
        }
        if (before.status !== "SUBMITTED") {
          throw new ConflictException("Loan is not in SUBMITTED status");
        }
        if (d.decision === "approve") {
          const animal = await tx.animal.findUnique({
            where: { id: before.animalId },
          });
          if (
            !animal ||
            animal.status !== "ACTIVE" ||
            animal.ownerId !== before.farmerId
          ) {
            throw new ConflictException(
              "Collateral animal is no longer ACTIVE and owned by the applicant",
            );
          }
          const updated = await tx.loan.updateMany({
            where: { id, version, status: "SUBMITTED" },
            data: {
              status: "APPROVED",
              decidedById: p.userId,
              decidedAt: new Date(),
              decisionNote: d.note.trim(),
              version: { increment: 1 },
            },
          });
          if (!updated.count) throw new ConflictException();
        } else {
          const updated = await tx.loan.updateMany({
            where: { id, version, status: "SUBMITTED" },
            data: {
              status: "REJECTED",
              decidedById: p.userId,
              decidedAt: new Date(),
              decisionNote: d.note.trim(),
              version: { increment: 1 },
            },
          });
          if (!updated.count) throw new ConflictException();
          await tx.collateralReservation.updateMany({
            where: { loanId: id, status: "HELD" },
            data: { status: "RELEASED", releasedAt: new Date() },
          });
        }
        const row = await tx.loan.findUniqueOrThrow({
          where: { id },
          include: { collateralReservation: true },
        });
        await OutboxWorkerService.enqueue(tx, {
          topic: "LOAN_DECIDED",
          dedupeKey: `loan-decided:${id}:${row.version}`,
          aggregateKind: "loan",
          aggregateId: id,
          payload: {
            recipientId: row.farmerId,
            linkKind: "loan",
            linkId: id,
          },
        });
        await tx.auditEvent.create({
          data: {
            actorId: p.userId,
            actorKind: "USER",
            action:
              d.decision === "approve" ? "LOAN_APPROVED" : "LOAN_REJECTED",
            targetKind: "loan",
            targetId: id,
            metadata: { decision: d.decision, note: d.note.trim() },
          },
        });
        return decorateLoan(row);
      },
    );
  }

  async disburseLoan(
    p: AccountPrincipal,
    id: string,
    key: string | undefined,
    version: number,
    d: DisburseLoanDto,
  ) {
    return this.command(
      p,
      key,
      `loan.disburse:${id}`,
      { version, d },
      async (tx) => {
        const before = await tx.loan.findUnique({ where: { id } });
        if (!before) throw new NotFoundException();
        await this.lockAnimal(tx, before.animalId);
        await this.requireBankStaff(tx, p, before.bankOrganizationId);
        if (before.status !== "APPROVED") {
          throw new ConflictException("Only APPROVED loans can be disbursed");
        }
        const animal = await tx.animal.findUnique({
          where: { id: before.animalId },
        });
        if (
          !animal ||
          animal.status !== "ACTIVE" ||
          animal.ownerId !== before.farmerId
        ) {
          throw new ConflictException(
            "Collateral animal ownership or status changed",
          );
        }
        const updated = await tx.loan.updateMany({
          where: { id, version, status: "APPROVED" },
          data: {
            status: "DISBURSING",
            version: { increment: 1 },
          },
        });
        if (!updated.count) throw new ConflictException();
        const provider = d.provider ?? "SANDBOX_SIMULATOR";
        const intent = await tx.paymentIntent.create({
          data: {
            actorId: p.userId,
            kind: "LOAN_DISBURSEMENT",
            targetKind: "loan",
            targetId: id,
            provider,
            status: "PROVIDER_ACCEPTED",
            amountMinor: before.principalMinor,
            currency: "BDT",
            idempotencyKey: `disburse:${id}:${version + 1}`,
          },
        });
        return {
          loanId: id,
          bankOrganizationId: before.bankOrganizationId,
          status: "DISBURSING",
          version: version + 1,
          paymentIntent: intent,
        };
      },
    );
  }

  private async applyLoanRepaymentSettlement(
    tx: Tx,
    loan: {
      id: string;
      farmerId: string;
      bankOrganizationId: string;
      totalPayableMinor: bigint;
      outstandingMinor: bigint;
      status: string;
    },
    paymentIntentId: string,
    amountMinor: bigint,
  ) {
    if (loan.status !== "ACTIVE") {
      throw new ConflictException("Loan is not ACTIVE");
    }
    if (amountMinor <= 0n || amountMinor > loan.outstandingMinor) {
      throw new ConflictException(
        "Repayment amount exceeds current loan outstanding balance",
      );
    }
    const openInstallments = await tx.loanInstallment.findMany({
      where: {
        loanId: loan.id,
        status: { in: ["DUE", "PARTIAL", "GRACE"] },
      },
      orderBy: { installmentNumber: "asc" },
    });
    const planned = allocateRepayment(openInstallments, amountMinor);
    const now = new Date();
    for (const item of planned) {
      await tx.loanInstallment.update({
        where: { id: item.installmentId },
        data: {
          paidMinor: item.newPaidMinor,
          status: item.fullyPaid ? "PAID" : "PARTIAL",
          version: { increment: 1 },
        },
      });
      await tx.repaymentAllocation.create({
        data: {
          loanId: loan.id,
          installmentId: item.installmentId,
          paymentIntentId,
          amountMinor: item.amountMinor,
        },
      });
    }
    const newOutstanding = loan.outstandingMinor - amountMinor;
    const fullyRepaid = newOutstanding === 0n;
    const updatedLoan = await tx.loan.update({
      where: { id: loan.id },
      data: {
        outstandingMinor: newOutstanding,
        status: fullyRepaid ? "PAID" : "ACTIVE",
        version: { increment: 1 },
      },
    });
    if (fullyRepaid) {
      await tx.collateralReservation.updateMany({
        where: { loanId: loan.id, status: { in: ["HELD", "ACTIVE"] } },
        data: { status: "RELEASED", releasedAt: now },
      });
    }
    await OutboxWorkerService.enqueue(tx, {
      topic: "LOAN_REPAID",
      dedupeKey: `loan-repayment-settled:${paymentIntentId}`,
      aggregateKind: "loan",
      aggregateId: loan.id,
      payload: {
        recipientId: loan.farmerId,
        linkKind: "loan",
        linkId: loan.id,
      },
    });
    return { updatedLoan, allocations: planned };
  }

  async createRepaymentIntent(
    p: AccountPrincipal,
    loanId: string,
    key: string | undefined,
    d: RepaymentIntentDto,
  ) {
    return this.command(p, key, `loan.repay:${loanId}`, d, async (tx) => {
      const targetLoan = await tx.loan.findUnique({
        where: { id: loanId },
        select: { animalId: true, farmerId: true },
      });
      if (!targetLoan || targetLoan.farmerId !== p.userId) {
        throw new NotFoundException();
      }
      await this.lockAnimal(tx, targetLoan.animalId);
      await tx.$queryRaw`SELECT id FROM palito.loans WHERE id = ${loanId}::uuid FOR UPDATE`;
      const loan = await tx.loan.findUnique({ where: { id: loanId } });
      if (!loan || loan.farmerId !== p.userId) {
        throw new NotFoundException();
      }
      if (loan.status !== "ACTIVE") {
        throw new ConflictException(
          "Repayments are only allowed on ACTIVE loans",
        );
      }
      const amountMinor = parseMinorUnits(d.amountMinor);
      if (amountMinor > loan.outstandingMinor) {
        throw new ConflictException(
          "Repayment amount cannot exceed loan outstandingMinor",
        );
      }
      const provider = d.provider ?? "SANDBOX_SIMULATOR";
      if (provider === "WALLET") {
        const walletAccount = await this.ensureAccount(tx, "USER_WALLET", {
          ownerUserId: p.userId,
        });
        await lockWalletSpend(tx, walletAccount.id);
        const balance = await this.computeAccountBalanceMinor(
          tx,
          walletAccount.id,
        );
        if (balance < amountMinor) {
          throw new ConflictException("Insufficient sandbox wallet balance");
        }
        const bankAccount = await this.ensureAccount(tx, "BANK_POOL", {
          organizationId: loan.bankOrganizationId,
        });
        const intent = await tx.paymentIntent.create({
          data: {
            actorId: p.userId,
            kind: "LOAN_REPAYMENT",
            targetKind: "loan",
            targetId: loan.id,
            provider: "WALLET",
            status: "CONFIRMED",
            amountMinor,
            currency: "BDT",
            idempotencyKey: `wallet-repay:${p.userId}:${key}`,
            confirmedAt: new Date(),
          },
        });
        const ledgerTx = await this.postBalancedTransaction(tx, {
          idempotencyKey: `payment-intent:${intent.id}`,
          referenceKind: "LOAN_REPAYMENT",
          referenceId: intent.id,
          description: `Sandbox wallet loan repayment for loan ${loan.id}`,
          debitAccountId: walletAccount.id,
          creditAccountId: bankAccount.id,
          amountMinor,
        });
        await tx.paymentIntent.update({
          where: { id: intent.id },
          data: { ledgerTxId: ledgerTx.id },
        });
        const { updatedLoan, allocations } =
          await this.applyLoanRepaymentSettlement(
            tx,
            loan,
            intent.id,
            amountMinor,
          );
        const repaidMinor =
          updatedLoan.totalPayableMinor - updatedLoan.outstandingMinor;
        return {
          paymentIntent: { ...intent, ledgerTxId: ledgerTx.id },
          loanStatus: updatedLoan.status,
          outstandingMinor: updatedLoan.outstandingMinor.toString(),
          repaidMinor: repaidMinor.toString(),
          allocations,
        };
      }

      const intent = await tx.paymentIntent.create({
        data: {
          actorId: p.userId,
          kind: "LOAN_REPAYMENT",
          targetKind: "loan",
          targetId: loan.id,
          provider,
          status: "PROVIDER_ACCEPTED",
          amountMinor,
          currency: "BDT",
          idempotencyKey: `repay:${p.userId}:${key}`,
        },
      });
      const repaidMinor = loan.totalPayableMinor - loan.outstandingMinor;
      return {
        paymentIntent: intent,
        loanStatus: loan.status,
        outstandingMinor: loan.outstandingMinor.toString(),
        repaidMinor: repaidMinor.toString(),
        allocations: [],
      };
    });
  }

  async createCareFeeIntent(
    p: AccountPrincipal,
    key: string | undefined,
    d: CareFeeIntentDto,
  ) {
    return this.command(p, key, "care.fee-intent", d, async (tx) => {
      const appointment = await tx.appointment.findFirst({
        where: { id: d.appointmentId, farmerId: p.userId },
      });
      if (!appointment) throw new NotFoundException();
      const amountMinor = parseMinorUnits(d.amountMinor);
      const intent = await tx.paymentIntent.create({
        data: {
          actorId: p.userId,
          kind: "CARE_FEE",
          targetKind: "appointment",
          targetId: appointment.id,
          provider: d.provider ?? "SANDBOX_SIMULATOR",
          status: "PROVIDER_ACCEPTED",
          amountMinor,
          currency: "BDT",
          idempotencyKey: `care-fee:${p.userId}:${key}`,
        },
      });
      return intent;
    });
  }

  async grantGrace(
    p: AccountPrincipal,
    loanId: string,
    key: string | undefined,
    version: number,
    d: GraceDecisionDto,
  ) {
    return this.command(
      p,
      key,
      `loan.grace:${loanId}`,
      { version, d },
      async (tx) => {
        const loan = await tx.loan.findUnique({ where: { id: loanId } });
        if (!loan) throw new NotFoundException();
        await this.requireBankStaff(tx, p, loan.bankOrganizationId);
        if (loan.status !== "ACTIVE") {
          throw new ConflictException(
            "Grace can only be granted on ACTIVE loans",
          );
        }
        const installment = await tx.loanInstallment.findFirst({
          where: { id: d.installmentId, loanId: loan.id },
        });
        if (!installment) throw new NotFoundException();
        if (installment.status === "PAID") {
          throw new ConflictException("Installment is already PAID");
        }
        const loanUpdated = await tx.loan.updateMany({
          where: { id: loan.id, version, status: "ACTIVE" },
          data: { version: { increment: 1 } },
        });
        if (!loanUpdated.count) throw new ConflictException();

        const newDueAt = new Date(
          installment.dueAt.getTime() + d.graceDays * 86_400_000,
        );
        const updatedInstallment = await tx.loanInstallment.update({
          where: { id: installment.id },
          data: {
            dueAt: newDueAt,
            graceUntil: newDueAt,
            graceReason: d.reason.trim(),
            status: "GRACE",
            version: { increment: 1 },
          },
        });
        await OutboxWorkerService.enqueue(tx, {
          topic: "LOAN_GRACE_GRANTED",
          dedupeKey: `loan-grace:${installment.id}:${updatedInstallment.version}`,
          aggregateKind: "loan",
          aggregateId: loan.id,
          payload: {
            recipientId: loan.farmerId,
            linkKind: "loan",
            linkId: loan.id,
          },
        });
        await tx.auditEvent.create({
          data: {
            actorId: p.userId,
            actorKind: "USER",
            action: "LOAN_GRACE_GRANTED",
            targetKind: "loan",
            targetId: loan.id,
            metadata: {
              installmentId: installment.id,
              graceDays: d.graceDays,
              newDueAt: newDueAt.toISOString(),
              reason: d.reason.trim(),
            },
          },
        });
        return {
          loanId: loan.id,
          bankOrganizationId: loan.bankOrganizationId,
          loanVersion: version + 1,
          installment: updatedInstallment,
        };
      },
    );
  }

  async handleWebhook(signature: string | undefined, d: ProviderWebhookDto) {
    this.requireSandboxEnabled();
    if (
      !verifyWebhookSignature(this.config.SANDBOX_WEBHOOK_SECRET, d, signature)
    ) {
      throw new UnauthorizedException("Invalid webhook signature");
    }
    const reportedAmountMinor = parseMinorUnits(d.amountMinor);
    const normalizedStatus = d.status === "FAILED" ? "FAILED" : "CONFIRMED";

    return this.db.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${d.provider}), hashtext(${d.externalEventId}))`;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('payment_intent'), hashtext(${d.paymentIntentId}))`;

      const existingEvent = await tx.providerEvent.findUnique({
        where: {
          provider_externalEventId: {
            provider: d.provider,
            externalEventId: d.externalEventId,
          },
        },
      });
      if (existingEvent) {
        if (
          existingEvent.paymentIntentId !== d.paymentIntentId ||
          existingEvent.amountMinor !== reportedAmountMinor ||
          existingEvent.eventType !== normalizedStatus
        ) {
          throw new ConflictException(
            "Webhook externalEventId replayed with different payload",
          );
        }
        return json({
          deduplicated: true,
          providerEventId: existingEvent.id,
          status: existingEvent.eventType,
        });
      }

      const intent = await tx.paymentIntent.findUnique({
        where: { id: d.paymentIntentId },
      });
      if (!intent) {
        throw new NotFoundException("Unknown paymentIntentId");
      }
      if (
        intent.provider !== d.provider ||
        intent.currency !== d.currency ||
        intent.amountMinor !== reportedAmountMinor
      ) {
        throw new ConflictException(
          "Webhook provider, currency, or amountMinor does not match PaymentIntent",
        );
      }

      if (intent.status === "CONFIRMED") {
        const ignored = await tx.providerEvent.create({
          data: {
            provider: d.provider,
            externalEventId: d.externalEventId,
            paymentIntentId: intent.id,
            eventType: normalizedStatus,
            amountMinor: reportedAmountMinor,
            currency: d.currency,
            payload: d as unknown as Prisma.InputJsonValue,
            signatureVerified: true,
            processedAt: new Date(),
          },
        });
        return json({
          deduplicated: true,
          providerEventId: ignored.id,
          status: "IGNORED",
        });
      }

      if (normalizedStatus === "FAILED") {
        await tx.paymentIntent.update({
          where: { id: intent.id },
          data: {
            status: "FAILED",
            failureReason: d.failureReason ?? "Provider reported failure",
            version: { increment: 1 },
          },
        });
        if (
          intent.kind === "LOAN_DISBURSEMENT" &&
          intent.targetKind === "loan"
        ) {
          await tx.loan.updateMany({
            where: { id: intent.targetId, status: "DISBURSING" },
            data: { status: "APPROVED", version: { increment: 1 } },
          });
        } else if (
          intent.kind === "CLAIM_PAYOUT" &&
          intent.targetKind === "claim"
        ) {
          await tx.insuranceClaim.updateMany({
            where: { id: intent.targetId, status: "SETTLING" },
            data: { status: "APPROVED", version: { increment: 1 } },
          });
        }
        const ev = await tx.providerEvent.create({
          data: {
            provider: d.provider,
            externalEventId: d.externalEventId,
            paymentIntentId: intent.id,
            eventType: "FAILED",
            amountMinor: reportedAmountMinor,
            currency: d.currency,
            payload: d as unknown as Prisma.InputJsonValue,
            signatureVerified: true,
            processedAt: new Date(),
          },
        });
        return json({
          deduplicated: false,
          providerEventId: ev.id,
          paymentStatus: "FAILED",
        });
      }

      const now = new Date();
      let ledgerTxId: string | null = null;
      if (intent.kind === "LOAN_DISBURSEMENT") {
        await tx.$queryRaw`SELECT id FROM palito.loans WHERE id = ${intent.targetId}::uuid FOR UPDATE`;
        const loan = await tx.loan.findUniqueOrThrow({
          where: { id: intent.targetId },
        });
        if (loan.status !== "DISBURSING") {
          throw new ConflictException("Loan is not in DISBURSING state");
        }
        const bankAccount = await this.ensureAccount(tx, "BANK_POOL", {
          organizationId: loan.bankOrganizationId,
        });
        const walletAccount = await this.ensureAccount(tx, "USER_WALLET", {
          ownerUserId: loan.farmerId,
        });
        const ledgerTx = await this.postBalancedTransaction(tx, {
          idempotencyKey: `payment-intent:${intent.id}`,
          referenceKind: "LOAN_DISBURSEMENT",
          referenceId: intent.id,
          description: `Sandbox loan disbursement for loan ${loan.id}`,
          debitAccountId: bankAccount.id,
          creditAccountId: walletAccount.id,
          amountMinor: intent.amountMinor,
        });
        ledgerTxId = ledgerTx.id;
        const planned = buildInstallmentSchedule(
          loan.totalPayableMinor,
          loan.termMonths,
          now,
        );
        await tx.loanInstallment.createMany({
          data: planned.map((inst) => ({
            loanId: loan.id,
            installmentNumber: inst.installmentNumber,
            dueAt: inst.dueAt,
            principalMinor: inst.principalMinor,
            feeMinor: 0n,
            paidMinor: 0n,
            status: "DUE",
          })),
        });
        await tx.loan.update({
          where: { id: loan.id },
          data: {
            status: "ACTIVE",
            disbursedAt: now,
            outstandingMinor: loan.totalPayableMinor,
            version: { increment: 1 },
          },
        });
        await tx.collateralReservation.updateMany({
          where: { loanId: loan.id, status: "HELD" },
          data: { status: "ACTIVE" },
        });
        await OutboxWorkerService.enqueue(tx, {
          topic: "LOAN_DISBURSED",
          dedupeKey: `loan-disbursed:${loan.id}`,
          aggregateKind: "loan",
          aggregateId: loan.id,
          payload: {
            recipientId: loan.farmerId,
            linkKind: "loan",
            linkId: loan.id,
          },
        });
      } else if (intent.kind === "LOAN_REPAYMENT") {
        const targetLoan = await tx.loan.findUnique({
          where: { id: intent.targetId },
          select: { animalId: true },
        });
        if (targetLoan) {
          await this.lockAnimal(tx, targetLoan.animalId);
        }
        await tx.$queryRaw`SELECT id FROM palito.loans WHERE id = ${intent.targetId}::uuid FOR UPDATE`;
        const loan = await tx.loan.findUniqueOrThrow({
          where: { id: intent.targetId },
        });
        if (loan.status !== "ACTIVE" || intent.amountMinor > loan.outstandingMinor) {
          throw new ConflictException(
            "Loan debt was already reduced or settled before provider repayment confirmation",
          );
        }
        const clearingAccount = await this.ensureAccount(
          tx,
          "PROVIDER_CLEARING",
        );
        const bankAccount = await this.ensureAccount(tx, "BANK_POOL", {
          organizationId: loan.bankOrganizationId,
        });
        const ledgerTx = await this.postBalancedTransaction(tx, {
          idempotencyKey: `payment-intent:${intent.id}`,
          referenceKind: "LOAN_REPAYMENT",
          referenceId: intent.id,
          description: `Sandbox provider loan repayment for loan ${loan.id}`,
          debitAccountId: clearingAccount.id,
          creditAccountId: bankAccount.id,
          amountMinor: intent.amountMinor,
        });
        ledgerTxId = ledgerTx.id;
        await this.applyLoanRepaymentSettlement(
          tx,
          loan,
          intent.id,
          intent.amountMinor,
        );
      } else if (intent.kind === "CARE_FEE") {
        const clearingAccount = await this.ensureAccount(
          tx,
          "PROVIDER_CLEARING",
        );
        const escrowAccount = await this.ensureAccount(tx, "PLATFORM_ESCROW");
        const ledgerTx = await this.postBalancedTransaction(tx, {
          idempotencyKey: `payment-intent:${intent.id}`,
          referenceKind: "CARE_FEE",
          referenceId: intent.id,
          description: `Sandbox care fee payment for appointment ${intent.targetId}`,
          debitAccountId: clearingAccount.id,
          creditAccountId: escrowAccount.id,
          amountMinor: intent.amountMinor,
        });
        ledgerTxId = ledgerTx.id;
        await OutboxWorkerService.enqueue(tx, {
          topic: "PAYMENT_SETTLED",
          dedupeKey: `payment-settled:${intent.id}`,
          aggregateKind: "payment_intent",
          aggregateId: intent.id,
          payload: {
            recipientId: intent.actorId,
            linkKind: "payment_intent",
            linkId: intent.id,
          },
        });
      } else if (intent.kind === "POLICY_PREMIUM") {
        const settledPremium = await this.applyPolicyPremiumConfirmation(
          tx,
          intent.targetId,
          intent.id,
          intent.amountMinor,
          "PROVIDER_CLEARING",
          now,
        );
        ledgerTxId = settledPremium.ledgerTxId;
      } else if (intent.kind === "CLAIM_PAYOUT") {
        const settledClaim = await this.applyClaimSettlementConfirmation(
          tx,
          intent.targetId,
          intent.id,
          intent.amountMinor,
          now,
        );
        ledgerTxId = settledClaim.ledgerTxId;
      } else if (intent.kind === "ORDER_PAYMENT") {
        await tx.$queryRaw`SELECT id FROM palito.orders WHERE id = ${intent.targetId}::uuid FOR UPDATE`;
        const order = await tx.order.findUniqueOrThrow({
          where: { id: intent.targetId },
          include: { items: true },
        });
        if (order.status !== "PAYMENT_PENDING") {
          throw new ConflictException("Order is not awaiting payment");
        }
        const clearingAccount = await this.ensureAccount(
          tx,
          "PROVIDER_CLEARING",
        );
        const escrowAccount = await this.ensureAccount(tx, "PLATFORM_ESCROW");
        const ledgerTx = await this.postBalancedTransaction(tx, {
          idempotencyKey: `payment-intent:${intent.id}`,
          referenceKind: "ORDER_PAYMENT",
          referenceId: intent.id,
          description: `Sandbox commerce payment for order ${order.id}`,
          debitAccountId: clearingAccount.id,
          creditAccountId: escrowAccount.id,
          amountMinor: intent.amountMinor,
        });
        ledgerTxId = ledgerTx.id;
        await tx.order.update({
          where: { id: order.id },
          data: { status: "PAID", version: { increment: 1 } },
        });
        await tx.orderItem.updateMany({
          where: { orderId: order.id, reservedStatus: "RESERVED" },
          data: { reservedStatus: "COMMITTED" },
        });
        await OutboxWorkerService.enqueue(tx, {
          topic: "ORDER_PAID",
          dedupeKey: `order-paid:${order.id}`,
          aggregateKind: "order",
          aggregateId: order.id,
          payload: {
            recipientId: order.farmerId,
            linkKind: "order",
            linkId: order.id,
          },
        });
      }

      await tx.paymentIntent.update({
        where: { id: intent.id },
        data: {
          status: "CONFIRMED",
          providerRef: d.externalEventId,
          ledgerTxId,
          confirmedAt: now,
          version: { increment: 1 },
        },
      });
      const ev = await tx.providerEvent.create({
        data: {
          provider: d.provider,
          externalEventId: d.externalEventId,
          paymentIntentId: intent.id,
          eventType: "CONFIRMED",
          amountMinor: reportedAmountMinor,
          currency: d.currency,
          payload: d as unknown as Prisma.InputJsonValue,
          signatureVerified: true,
          processedAt: now,
        },
      });
      return json({
        deduplicated: false,
        providerEventId: ev.id,
        paymentStatus: "CONFIRMED",
      });
    });
  }

  async wallet(p: AccountPrincipal) {
    this.requireSandboxEnabled();
    return this.db.prisma.$transaction(async (tx) => {
      const account = await tx.ledgerAccount.findFirst({
        where: {
          accountKind: "USER_WALLET",
          ownerUserId: p.userId,
          currency: "BDT",
        },
      });
      const balanceMinor = account
        ? await this.computeAccountBalanceMinor(tx, account.id)
        : 0n;
      const entries = account
        ? await tx.ledgerEntry.findMany({
            where: { accountId: account.id },
            include: { transaction: true },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            take: 25,
          })
        : [];
      const paymentIntents = await tx.paymentIntent.findMany({
        where: { actorId: p.userId },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 25,
      });
      return json({
        accountCode: `USER_WALLET:${p.userId}`,
        balanceMinor: balanceMinor.toString(),
        currency: "BDT",
        sandboxMode: true,
        withdrawable: false,
        disclosure:
          "Sandbox ledger preview only — no real-money transfer or withdrawal is enabled.",
        entries,
        paymentIntents,
      });
    });
  }

  async paymentDetail(p: AccountPrincipal, id: string) {
    this.requireSandboxEnabled();
    return this.db.prisma.$transaction(async (tx) => {
      const intent = await tx.paymentIntent.findUnique({ where: { id } });
      if (!intent) throw new NotFoundException();
      const isActor = intent.actorId === p.userId;
      const isAdmin = p.memberships.some((m) => m.role === "ADMIN");
      let isLoanBankStaff = false;
      if (intent.targetKind === "loan") {
        const loan = await tx.loan.findUnique({
          where: { id: intent.targetId },
        });
        if (loan) {
          isLoanBankStaff = p.memberships.some(
            (m) =>
              m.role === "BANK_STAFF" &&
              m.organizationId === loan.bankOrganizationId,
          );
        }
      }
      if (!isActor && !isAdmin && !isLoanBankStaff) {
        throw new NotFoundException();
      }
      return json(intent);
    });
  }

  async reconcileLedger(p: AccountPrincipal) {
    this.requireSandboxEnabled();
    return this.db.prisma.$transaction(async (tx) => {
      await this.requireAdmin(tx, p);
      const totals = await tx.ledgerEntry.groupBy({
        by: ["direction"],
        _sum: { amountMinor: true },
        _count: { _all: true },
      });
      let totalDebitMinor = 0n;
      let totalCreditMinor = 0n;
      let entryCount = 0;
      for (const row of totals) {
        entryCount += row._count._all;
        if (row.direction === "DEBIT") {
          totalDebitMinor = row._sum.amountMinor ?? 0n;
        }
        if (row.direction === "CREDIT") {
          totalCreditMinor = row._sum.amountMinor ?? 0n;
        }
      }
      const unbalancedRows = await tx.$queryRaw<
        Array<{ transaction_id: string }>
      >`
        SELECT t.id AS transaction_id
        FROM palito.ledger_transactions t
        LEFT JOIN palito.ledger_entries e ON e.transaction_id = t.id
        GROUP BY t.id
        HAVING COALESCE(SUM(CASE WHEN e.direction = 'DEBIT' THEN e.amount_minor ELSE 0 END), 0)
            <> COALESCE(SUM(CASE WHEN e.direction = 'CREDIT' THEN e.amount_minor ELSE 0 END), 0)
            OR COUNT(e.id) < 2
      `;
      const transactionCount = await tx.ledgerTransaction.count();
      return json({
        balanced:
          totalDebitMinor === totalCreditMinor && unbalancedRows.length === 0,
        transactionCount,
        entryCount,
        totalDebitMinor: totalDebitMinor.toString(),
        totalCreditMinor: totalCreditMinor.toString(),
        unbalancedTransactionIds: unbalancedRows.map((r) => r.transaction_id),
      });
    });
  }

  private async validatePolicyEvidenceFile(
    tx: Tx,
    farmerId: string,
    animalId: string,
    evidenceFileId?: string,
  ) {
    if (!evidenceFileId) return null;
    const file = await tx.privateFile.findFirst({
      where: {
        id: evidenceFileId,
        animalId,
        ownerAtUploadId: farmerId,
        status: "READY",
      },
    });
    if (!file) {
      throw new BadRequestException(
        "Policy evidenceFileId must be a READY private file owned by the farmer for this animal",
      );
    }
    return file.id;
  }

  async applyPolicy(
    p: AccountPrincipal,
    key: string | undefined,
    d: CreatePolicyDto,
  ) {
    return this.command(p, key, "policy.apply", d, async (tx) => {
      await this.lockAnimal(tx, d.animalId);
      const animal = await this.requireActiveFarmerOwner(tx, p, d.animalId);
      if (animal.status !== "ACTIVE") {
        throw new ConflictException(
          "Only ACTIVE animals can enroll in an insurance policy",
        );
      }
      const insurer = await tx.organization.findFirst({
        where: {
          id: d.insurerOrganizationId,
          kind: "INSURER",
          status: "ACTIVE",
        },
      });
      if (!insurer) {
        throw new NotFoundException("Active insurer organization not found");
      }
      const coverageMinor = parseMinorUnits(d.coverageMinor);
      const premiumMinor = parseMinorUnits(d.premiumMinor);
      if (premiumMinor > coverageMinor) {
        throw new BadRequestException(
          "premiumMinor cannot exceed coverageMinor",
        );
      }
      const evidenceFileId = await this.validatePolicyEvidenceFile(
        tx,
        p.userId,
        animal.id,
        d.evidenceFileId,
      );
      const liveExisting = await tx.insurancePolicy.findFirst({
        where: {
          animalId: animal.id,
          status: {
            in: ["SUBMITTED", "APPROVED_AWAITING_PREMIUM", "ACTIVE"],
          },
        },
      });
      if (liveExisting) {
        throw new ConflictException(
          "Animal already has a submitted, awaiting-premium, or active insurance policy",
        );
      }
      const lastPolicy = await tx.insurancePolicy.findFirst({
        where: { animalId: animal.id },
        orderBy: { policyVersion: "desc" },
      });
      const policyVersion = (lastPolicy?.policyVersion ?? 0) + 1;
      let policy;
      try {
        policy = await tx.insurancePolicy.create({
          data: {
            animalId: animal.id,
            farmerId: p.userId,
            insurerOrganizationId: insurer.id,
            evidenceFileId,
            policyVersion,
            termVersion: "ins-sandbox-v1",
            consentVersion: d.consentVersion,
            coverageMinor,
            premiumMinor,
            termMonths: d.termMonths,
            waitingDays: 0,
            currency: "BDT",
            status: "SUBMITTED",
          },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002"
        ) {
          throw new ConflictException(
            "Animal already has a live insurance policy",
          );
        }
        throw err;
      }
      await OutboxWorkerService.enqueue(tx, {
        topic: "POLICY_SUBMITTED",
        dedupeKey: `policy-submitted:${policy.id}`,
        aggregateKind: "insurance_policy",
        aggregateId: policy.id,
        payload: {
          recipientId: p.userId,
          linkKind: "policy",
          linkId: policy.id,
        },
      });
      await tx.auditEvent.create({
        data: {
          actorId: p.userId,
          actorKind: "USER",
          action: "POLICY_APPLIED",
          targetKind: "insurance_policy",
          targetId: policy.id,
          metadata: {
            animalId: animal.id,
            insurerOrganizationId: insurer.id,
            coverageMinor: coverageMinor.toString(),
            premiumMinor: premiumMinor.toString(),
            policyVersion,
          },
        },
      });
      return policy;
    });
  }

  async listPolicies(p: AccountPrincipal, q: PoliciesPageDto = {}) {
    this.requireSandboxEnabled();
    const limit = q.limit ?? 25;
    let after: { createdAt: Date; id: string } | undefined;
    if (q.cursor) {
      try {
        const parsed = JSON.parse(
          Buffer.from(q.cursor, "base64url").toString("utf8"),
        );
        if (
          !Array.isArray(parsed) ||
          parsed.length !== 2 ||
          typeof parsed[0] !== "string" ||
          typeof parsed[1] !== "string"
        ) {
          throw new Error("Bad cursor");
        }
        after = { createdAt: instant(parsed[0]), id: parsed[1] };
      } catch {
        throw new BadRequestException("Invalid cursor");
      }
    }
    const insurerOrgIds = p.memberships
      .filter((m) => m.role === "INSURER_STAFF")
      .map((m) => m.organizationId);

    const rows = await this.db.prisma.insurancePolicy.findMany({
      where: {
        OR: [
          { farmerId: p.userId },
          ...(insurerOrgIds.length > 0
            ? [{ insurerOrganizationId: { in: insurerOrgIds } }]
            : []),
        ],
        ...(q.status ? { status: q.status } : {}),
        ...(after
          ? {
              AND: [
                {
                  OR: [
                    { createdAt: { lt: after.createdAt } },
                    { createdAt: after.createdAt, id: { lt: after.id } },
                  ],
                },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
    });
    const more = rows.length > limit;
    const items = rows.slice(0, limit);
    const last = items.at(-1);
    return json({
      items,
      nextCursor:
        more && last
          ? Buffer.from(
              JSON.stringify([last.createdAt.toISOString(), last.id]),
            ).toString("base64url")
          : null,
      sandboxMode: true,
    });
  }

  async policyDetail(p: AccountPrincipal, id: string) {
    this.requireSandboxEnabled();
    return this.db.prisma.$transaction(async (tx) => {
      const policy = await tx.insurancePolicy.findUnique({
        where: { id },
        include: { claims: true },
      });
      if (!policy) throw new NotFoundException();
      const isFarmer = policy.farmerId === p.userId;
      const isInsurer = p.memberships.some(
        (m) =>
          m.role === "INSURER_STAFF" &&
          m.organizationId === policy.insurerOrganizationId,
      );
      if (!isFarmer && !isInsurer) {
        throw new NotFoundException();
      }
      return json(policy);
    });
  }

  async decidePolicy(
    p: AccountPrincipal,
    id: string,
    key: string | undefined,
    version: number,
    d: PolicyDecisionDto,
  ) {
    return this.command(
      p,
      key,
      `policy.decide:${id}`,
      { version, d },
      async (tx) => {
        const before = await tx.insurancePolicy.findUnique({ where: { id } });
        if (!before) throw new NotFoundException();
        await this.lockAnimal(tx, before.animalId);
        await this.requireInsurerStaff(tx, p, before.insurerOrganizationId);
        if (before.farmerId === p.userId) {
          throw new ForbiddenException(
            "Insurer staff cannot decide their own policy application",
          );
        }
        if (before.status !== "SUBMITTED") {
          throw new ConflictException("Policy is not in SUBMITTED status");
        }
        const animal = await tx.animal.findUnique({
          where: { id: before.animalId },
        });
        if (!animal || animal.status !== "ACTIVE") {
          throw new ConflictException("Insured animal is not ACTIVE");
        }
        const nextStatus =
          d.decision === "approve" ? "APPROVED_AWAITING_PREMIUM" : "REJECTED";
        const updated = await tx.insurancePolicy.updateMany({
          where: { id, version, status: "SUBMITTED" },
          data: {
            status: nextStatus,
            decisionNote: d.note.trim(),
            decidedById: p.userId,
            decidedAt: new Date(),
            version: { increment: 1 },
          },
        });
        if (!updated.count) throw new ConflictException();
        const row = await tx.insurancePolicy.findUniqueOrThrow({
          where: { id },
        });
        await OutboxWorkerService.enqueue(tx, {
          topic: "POLICY_DECIDED",
          dedupeKey: `policy-decided:${id}:${row.version}`,
          aggregateKind: "insurance_policy",
          aggregateId: id,
          payload: {
            recipientId: row.farmerId,
            linkKind: "policy",
            linkId: id,
          },
        });
        await tx.auditEvent.create({
          data: {
            actorId: p.userId,
            actorKind: "USER",
            action:
              d.decision === "approve"
                ? "POLICY_APPROVED_AWAITING_PREMIUM"
                : "POLICY_REJECTED",
            targetKind: "insurance_policy",
            targetId: id,
            metadata: {
              insurerOrganizationId: row.insurerOrganizationId,
              animalId: row.animalId,
              status: row.status,
            },
          },
        });
        return row;
      },
    );
  }

  private async applyPolicyPremiumConfirmation(
    tx: Tx,
    policyId: string,
    paymentIntentId: string,
    amountMinor: bigint,
    debitSource: "USER_WALLET" | "PROVIDER_CLEARING",
    now: Date,
  ) {
    await tx.$queryRaw`SELECT id FROM palito.insurance_policies WHERE id = ${policyId}::uuid FOR UPDATE`;
    const policy = await tx.insurancePolicy.findUniqueOrThrow({
      where: { id: policyId },
    });
    await this.lockAnimal(tx, policy.animalId);
    if (policy.status !== "APPROVED_AWAITING_PREMIUM") {
      throw new ConflictException(
        "Policy is not awaiting premium confirmation",
      );
    }
    if (amountMinor !== policy.premiumMinor) {
      throw new ConflictException(
        "Premium amount does not match policy premiumMinor",
      );
    }
    const animal = await tx.animal.findUniqueOrThrow({
      where: { id: policy.animalId },
    });
    if (animal.status !== "ACTIVE") {
      throw new ConflictException(
        "Cannot activate coverage on a non-ACTIVE animal",
      );
    }
    const debitAccount =
      debitSource === "USER_WALLET"
        ? await this.ensureAccount(tx, "USER_WALLET", {
            ownerUserId: policy.farmerId,
          })
        : await this.ensureAccount(tx, "PROVIDER_CLEARING");
    const insurerAccount = await this.ensureAccount(tx, "INSURER_POOL", {
      organizationId: policy.insurerOrganizationId,
    });
    const ledgerTx = await this.postBalancedTransaction(tx, {
      idempotencyKey: `payment-intent:${paymentIntentId}`,
      referenceKind: "POLICY_PREMIUM",
      referenceId: paymentIntentId,
      description: `Sandbox insurance premium for policy ${policy.id}`,
      debitAccountId: debitAccount.id,
      creditAccountId: insurerAccount.id,
      amountMinor: policy.premiumMinor,
    });
    const startsAt = new Date(
      now.getTime() + policy.waitingDays * 86_400_000,
    );
    const endsAt = addCalendarMonthsUtc(startsAt, policy.termMonths);
    const updatedPolicy = await tx.insurancePolicy.update({
      where: { id: policy.id },
      data: {
        status: "ACTIVE",
        premiumPaymentIntentId: paymentIntentId,
        premiumConfirmedAt: now,
        startsAt,
        endsAt,
        version: { increment: 1 },
      },
    });
    await OutboxWorkerService.enqueue(tx, {
      topic: "POLICY_ACTIVATED",
      dedupeKey: `policy-activated:${policy.id}`,
      aggregateKind: "insurance_policy",
      aggregateId: policy.id,
      payload: {
        recipientId: policy.farmerId,
        linkKind: "policy",
        linkId: policy.id,
      },
    });
    await tx.auditEvent.create({
      data: {
        actorId: policy.farmerId,
        actorKind: "USER",
        action: "POLICY_ACTIVATED",
        targetKind: "insurance_policy",
        targetId: policy.id,
        metadata: {
          paymentIntentId,
          ledgerTxId: ledgerTx.id,
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
        },
      },
    });
    return { updatedPolicy, ledgerTxId: ledgerTx.id };
  }

  async createPolicyPremiumIntent(
    p: AccountPrincipal,
    policyId: string,
    key: string | undefined,
    version: number,
    d: PolicyPremiumIntentDto,
  ) {
    return this.command(
      p,
      key,
      `policy.premium:${policyId}`,
      { version, d },
      async (tx) => {
        const before = await tx.insurancePolicy.findUnique({
          where: { id: policyId },
        });
        if (!before || before.farmerId !== p.userId) {
          throw new NotFoundException();
        }
        await this.lockAnimal(tx, before.animalId);
        await tx.$queryRaw`SELECT id FROM palito.insurance_policies WHERE id = ${policyId}::uuid FOR UPDATE`;
        const policy = await tx.insurancePolicy.findUniqueOrThrow({
          where: { id: policyId },
        });
        if (policy.version !== version) {
          throw new ConflictException();
        }
        if (policy.status !== "APPROVED_AWAITING_PREMIUM") {
          throw new ConflictException(
            "Policy must be APPROVED_AWAITING_PREMIUM before paying premium",
          );
        }
        const provider = d.provider ?? "SANDBOX_SIMULATOR";
        const now = new Date();
        if (provider === "WALLET") {
          const walletAccount = await this.ensureAccount(tx, "USER_WALLET", {
            ownerUserId: p.userId,
          });
          await lockWalletSpend(tx, walletAccount.id);
          const balance = await this.computeAccountBalanceMinor(
            tx,
            walletAccount.id,
          );
          if (balance < policy.premiumMinor) {
            throw new ConflictException("Insufficient sandbox wallet balance");
          }
          const intent = await tx.paymentIntent.create({
            data: {
              actorId: p.userId,
              kind: "POLICY_PREMIUM",
              targetKind: "policy",
              targetId: policy.id,
              provider: "WALLET",
              status: "CONFIRMED",
              amountMinor: policy.premiumMinor,
              currency: "BDT",
              idempotencyKey: `policy-premium-wallet:${p.userId}:${key}`,
              confirmedAt: now,
            },
          });
          const { updatedPolicy, ledgerTxId } =
            await this.applyPolicyPremiumConfirmation(
              tx,
              policy.id,
              intent.id,
              policy.premiumMinor,
              "USER_WALLET",
              now,
            );
          await tx.paymentIntent.update({
            where: { id: intent.id },
            data: { ledgerTxId },
          });
          return {
            paymentIntent: { ...intent, ledgerTxId },
            policy: updatedPolicy,
          };
        }

        const intent = await tx.paymentIntent.create({
          data: {
            actorId: p.userId,
            kind: "POLICY_PREMIUM",
            targetKind: "policy",
            targetId: policy.id,
            provider,
            status: "PROVIDER_ACCEPTED",
            amountMinor: policy.premiumMinor,
            currency: "BDT",
            idempotencyKey: `policy-premium:${p.userId}:${key}`,
          },
        });
        const updatedPolicy = await tx.insurancePolicy.update({
          where: { id: policy.id },
          data: {
            premiumPaymentIntentId: intent.id,
            version: { increment: 1 },
          },
        });
        return {
          paymentIntent: intent,
          policy: updatedPolicy,
        };
      },
    );
  }

  async renewPolicy(
    p: AccountPrincipal,
    policyId: string,
    key: string | undefined,
    d: RenewPolicyDto,
  ) {
    return this.command(
      p,
      key,
      `policy.renew:${policyId}`,
      d,
      async (tx) => {
        const previous = await tx.insurancePolicy.findUnique({
          where: { id: policyId },
        });
        if (!previous || previous.farmerId !== p.userId) {
          throw new NotFoundException();
        }
        await this.lockAnimal(tx, previous.animalId);
        const animal = await this.requireActiveFarmerOwner(
          tx,
          p,
          previous.animalId,
        );
        if (animal.status !== "ACTIVE") {
          throw new ConflictException(
            "Only ACTIVE animals can renew insurance coverage",
          );
        }
        const now = new Date();
        if (
          previous.status === "ACTIVE" &&
          previous.endsAt &&
          previous.endsAt.getTime() <= now.getTime()
        ) {
          await tx.insurancePolicy.update({
            where: { id: previous.id },
            data: { status: "EXPIRED", version: { increment: 1 } },
          });
        } else if (previous.status !== "EXPIRED") {
          throw new ConflictException(
            "Only EXPIRED policies (or policies past their endsAt window) can be renewed without overlapping coverage",
          );
        }
        const coverageMinor = parseMinorUnits(d.coverageMinor);
        const premiumMinor = parseMinorUnits(d.premiumMinor);
        if (premiumMinor > coverageMinor) {
          throw new BadRequestException(
            "premiumMinor cannot exceed coverageMinor",
          );
        }
        const evidenceFileId = await this.validatePolicyEvidenceFile(
          tx,
          p.userId,
          animal.id,
          d.evidenceFileId,
        );
        const lastPolicy = await tx.insurancePolicy.findFirst({
          where: { animalId: animal.id },
          orderBy: { policyVersion: "desc" },
        });
        const nextPolicyVersion = (lastPolicy?.policyVersion ?? 0) + 1;
        let renewed;
        try {
          renewed = await tx.insurancePolicy.create({
            data: {
              animalId: animal.id,
              farmerId: p.userId,
              insurerOrganizationId: previous.insurerOrganizationId,
              evidenceFileId,
              renewedFromPolicyId: previous.id,
              policyVersion: nextPolicyVersion,
              termVersion: "ins-sandbox-v1",
              consentVersion: d.consentVersion,
              coverageMinor,
              premiumMinor,
              termMonths: d.termMonths,
              waitingDays: 0,
              currency: "BDT",
              status: "SUBMITTED",
            },
          });
        } catch (err) {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002"
          ) {
            throw new ConflictException(
              "Policy was already renewed or animal already has a live policy",
            );
          }
          throw err;
        }
        await tx.auditEvent.create({
          data: {
            actorId: p.userId,
            actorKind: "USER",
            action: "POLICY_RENEWED",
            targetKind: "insurance_policy",
            targetId: renewed.id,
            metadata: {
              renewedFromPolicyId: previous.id,
              animalId: animal.id,
              policyVersion: nextPolicyVersion,
            },
          },
        });
        return renewed;
      },
    );
  }

  async submitClaim(
    p: AccountPrincipal,
    key: string | undefined,
    d: CreateClaimDto,
  ) {
    return this.command(p, key, "claim.submit", d, async (tx) => {
      if (d.incidentKind !== "DEATH") {
        throw new ConflictException(
          "Illness and repeat illness claims are disabled in ins-sandbox-v1 until insurer repeat/partial policy is approved (SRS-GAP-09)",
        );
      }
      const policy = await tx.insurancePolicy.findUnique({
        where: { id: d.policyId },
      });
      if (!policy || policy.farmerId !== p.userId) {
        throw new NotFoundException();
      }
      await this.lockAnimal(tx, policy.animalId);
      const animal = await this.requireActiveFarmerOwner(
        tx,
        p,
        policy.animalId,
      );
      const incidentAt = instant(d.incidentAt);
      const now = new Date();
      if (incidentAt.getTime() > now.getTime()) {
        throw new BadRequestException("incidentAt cannot be in the future");
      }
      if (
        !policy.premiumConfirmedAt ||
        !policy.startsAt ||
        !policy.endsAt ||
        !["ACTIVE", "EXPIRED"].includes(policy.status) ||
        incidentAt.getTime() < policy.startsAt.getTime() ||
        incidentAt.getTime() > policy.endsAt.getTime()
      ) {
        throw new ConflictException(
          "Policy did not have active confirmed coverage at incidentAt",
        );
      }
      const claimedAmountMinor = parseMinorUnits(d.claimedAmountMinor);
      if (claimedAmountMinor > policy.coverageMinor) {
        throw new BadRequestException(
          "claimedAmountMinor cannot exceed policy coverageMinor",
        );
      }
      const uniqueFileIds = [...new Set(d.evidenceFileIds)];
      const readyFiles = await tx.privateFile.findMany({
        where: {
          id: { in: uniqueFileIds },
          animalId: animal.id,
          ownerAtUploadId: p.userId,
          status: "READY",
        },
      });
      if (readyFiles.length !== uniqueFileIds.length) {
        throw new BadRequestException(
          "All claim evidenceFileIds must be READY private files owned by the farmer for this animal",
        );
      }
      const reviewTargetAt = new Date(now.getTime() + 7 * 86_400_000);
      let claim;
      try {
        claim = await tx.insuranceClaim.create({
          data: {
            policyId: policy.id,
            animalId: animal.id,
            farmerId: p.userId,
            insurerOrganizationId: policy.insurerOrganizationId,
            incidentKind: "DEATH",
            incidentAt,
            description: d.description.trim(),
            claimedAmountMinor,
            currency: "BDT",
            status: "SUBMITTED",
            reviewTargetAt,
          },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002"
        ) {
          throw new ConflictException(
            "Policy already has an active or settled claim",
          );
        }
        throw err;
      }
      await tx.claimEvidenceLink.createMany({
        data: uniqueFileIds.map((fileId) => ({
          claimId: claim.id,
          fileId,
        })),
      });
      await OutboxWorkerService.enqueue(tx, {
        topic: "CLAIM_SUBMITTED",
        dedupeKey: `claim-submitted:${claim.id}`,
        aggregateKind: "insurance_claim",
        aggregateId: claim.id,
        payload: {
          recipientId: p.userId,
          linkKind: "claim",
          linkId: claim.id,
        },
      });
      await tx.auditEvent.create({
        data: {
          actorId: p.userId,
          actorKind: "USER",
          action: "CLAIM_SUBMITTED",
          targetKind: "insurance_claim",
          targetId: claim.id,
          metadata: {
            policyId: policy.id,
            animalId: animal.id,
            incidentKind: "DEATH",
            claimedAmountMinor: claimedAmountMinor.toString(),
            evidenceCount: uniqueFileIds.length,
          },
        },
      });
      return tx.insuranceClaim.findUniqueOrThrow({
        where: { id: claim.id },
        include: { evidenceLinks: true, reviews: true, referralGrants: true },
      });
    });
  }

  async listClaims(p: AccountPrincipal, q: ClaimsPageDto = {}) {
    this.requireSandboxEnabled();
    const limit = q.limit ?? 25;
    let after: { createdAt: Date; id: string } | undefined;
    if (q.cursor) {
      try {
        const parsed = JSON.parse(
          Buffer.from(q.cursor, "base64url").toString("utf8"),
        );
        if (
          !Array.isArray(parsed) ||
          parsed.length !== 2 ||
          typeof parsed[0] !== "string" ||
          typeof parsed[1] !== "string"
        ) {
          throw new Error("Bad cursor");
        }
        after = { createdAt: instant(parsed[0]), id: parsed[1] };
      } catch {
        throw new BadRequestException("Invalid cursor");
      }
    }
    const insurerOrgIds = p.memberships
      .filter((m) => m.role === "INSURER_STAFF")
      .map((m) => m.organizationId);
    const isVet = p.memberships.some((m) => m.role === "VET");

    const rows = await this.db.prisma.insuranceClaim.findMany({
      where: {
        OR: [
          { farmerId: p.userId },
          ...(insurerOrgIds.length > 0
            ? [{ insurerOrganizationId: { in: insurerOrgIds } }]
            : []),
          ...(isVet
            ? [
                {
                  referralGrants: {
                    some: {
                      vetId: p.userId,
                      status: { in: ["ACTIVE", "COMPLETED"] },
                    },
                  },
                },
              ]
            : []),
        ],
        ...(q.status ? { status: q.status } : {}),
        ...(after
          ? {
              AND: [
                {
                  OR: [
                    { createdAt: { lt: after.createdAt } },
                    { createdAt: after.createdAt, id: { lt: after.id } },
                  ],
                },
              ],
            }
          : {}),
      },
      include: {
        evidenceLinks: true,
        reviews: { orderBy: { createdAt: "asc" } },
        referralGrants: { orderBy: { createdAt: "desc" } },
        settlementAllocation: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
    });
    const more = rows.length > limit;
    const items = rows.slice(0, limit);
    const last = items.at(-1);
    return json({
      items,
      nextCursor:
        more && last
          ? Buffer.from(
              JSON.stringify([last.createdAt.toISOString(), last.id]),
            ).toString("base64url")
          : null,
      sandboxMode: true,
    });
  }

  async claimDetail(p: AccountPrincipal, id: string) {
    this.requireSandboxEnabled();
    return this.db.prisma.$transaction(async (tx) => {
      const claim = await tx.insuranceClaim.findUnique({
        where: { id },
        include: {
          policy: true,
          evidenceLinks: true,
          reviews: { orderBy: { createdAt: "asc" } },
          referralGrants: { orderBy: { createdAt: "desc" } },
          settlementAllocation: true,
        },
      });
      if (!claim) throw new NotFoundException();
      const isFarmer = claim.farmerId === p.userId;
      const isInsurer = p.memberships.some(
        (m) =>
          m.role === "INSURER_STAFF" &&
          m.organizationId === claim.insurerOrganizationId,
      );
      const isReferredVet =
        p.memberships.some((m) => m.role === "VET") &&
        claim.referralGrants.some(
          (g) =>
            g.vetId === p.userId &&
            (g.status === "COMPLETED" ||
              (g.status === "ACTIVE" && g.expiresAt.getTime() > Date.now())),
        );
      if (!isFarmer && !isInsurer && !isReferredVet) {
        throw new NotFoundException();
      }
      return json(claim);
    });
  }

  async requestClaimReview(
    p: AccountPrincipal,
    id: string,
    key: string | undefined,
    version: number,
  ) {
    return this.command(
      p,
      key,
      `claim.review-request:${id}`,
      { version },
      async (tx) => {
        const claim = await tx.insuranceClaim.findUnique({
          where: { id },
          include: { policy: true, evidenceLinks: true },
        });
        if (!claim) throw new NotFoundException();
        await this.requireInsurerStaff(tx, p, claim.insurerOrganizationId);
        if (!["SUBMITTED", "UNDER_REVIEW"].includes(claim.status)) {
          throw new ConflictException(
            "Advisory review check is only valid on SUBMITTED or UNDER_REVIEW claims",
          );
        }
        const vetRecordsCount = await tx.healthRecord.count({
          where: { animalId: claim.animalId, source: "VET" },
        });
        const updated = await tx.insuranceClaim.updateMany({
          where: { id, version, status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
          data: {
            status: "UNDER_REVIEW",
            version: { increment: 1 },
          },
        });
        if (!updated.count) throw new ConflictException();
        const review = await tx.claimReview.create({
          data: {
            claimId: claim.id,
            authorId: p.userId,
            authorRole: "INSURER_STAFF",
            kind: "ADVISORY_CHECK",
            recommendation:
              vetRecordsCount > 0 ? "PROCEED_TO_REVIEW" : "REFER_TO_VET",
            notes:
              "Advisory coverage & evidence check only; IoT/weather providers pending M8a/b and no autonomous payout is permitted.",
            metadata: {
              incidentWithinCoverageWindow: true,
              evidenceFileCount: claim.evidenceLinks.length,
              verifiedVetRecordCount: vetRecordsCount,
              autonomousApprovalAllowed: false,
            },
          },
        });
        return {
          claimId: claim.id,
          insurerOrganizationId: claim.insurerOrganizationId,
          status: "UNDER_REVIEW",
          version: version + 1,
          review,
        };
      },
    );
  }

  async referClaimToVet(
    p: AccountPrincipal,
    id: string,
    key: string | undefined,
    version: number,
    d: ClaimReferralDto,
  ) {
    return this.command(
      p,
      key,
      `claim.refer:${id}`,
      { version, d },
      async (tx) => {
        const claim = await tx.insuranceClaim.findUnique({ where: { id } });
        if (!claim) throw new NotFoundException();
        await this.requireInsurerStaff(tx, p, claim.insurerOrganizationId);
        if (
          !["SUBMITTED", "UNDER_REVIEW", "REFERRED_TO_VET"].includes(
            claim.status,
          )
        ) {
          throw new ConflictException(
            "Claim cannot be referred in its current status",
          );
        }
        const verifiedVet = await tx.vetCredential.findFirst({
          where: {
            userId: d.vetId,
            status: "VERIFIED",
            user: {
              status: "ACTIVE",
              memberships: {
                some: {
                  role: "VET",
                  status: "ACTIVE",
                  organization: { kind: "CLINIC", status: "ACTIVE" },
                },
              },
            },
          },
        });
        if (!verifiedVet) {
          throw new BadRequestException(
            "Target vetId must be an active VERIFIED veterinarian in an active clinic",
          );
        }
        if (d.vetId === claim.farmerId) {
          throw new ForbiddenException(
            "Claim claimant cannot be referred as reviewing veterinarian",
          );
        }
        const updated = await tx.insuranceClaim.updateMany({
          where: {
            id,
            version,
            status: { in: ["SUBMITTED", "UNDER_REVIEW", "REFERRED_TO_VET"] },
          },
          data: {
            status: "REFERRED_TO_VET",
            version: { increment: 1 },
          },
        });
        if (!updated.count) throw new ConflictException();
        await tx.claimReferralGrant.updateMany({
          where: { claimId: claim.id, status: "ACTIVE" },
          data: { status: "REVOKED" },
        });
        const hours = d.expiresInHours ?? 72;
        const expiresAt = new Date(Date.now() + hours * 3_600_000);
        const grant = await tx.claimReferralGrant.create({
          data: {
            claimId: claim.id,
            animalId: claim.animalId,
            vetId: d.vetId,
            referredById: p.userId,
            note: d.note.trim(),
            status: "ACTIVE",
            expiresAt,
          },
        });
        await OutboxWorkerService.enqueue(tx, {
          topic: "CLAIM_REFERRED_TO_VET",
          dedupeKey: `claim-referred:${grant.id}`,
          aggregateKind: "insurance_claim",
          aggregateId: claim.id,
          payload: {
            recipientId: d.vetId,
            linkKind: "claim",
            linkId: claim.id,
          },
        });
        await tx.auditEvent.create({
          data: {
            actorId: p.userId,
            actorKind: "USER",
            action: "CLAIM_REFERRED_TO_VET",
            targetKind: "insurance_claim",
            targetId: claim.id,
            metadata: {
              vetId: d.vetId,
              grantId: grant.id,
              expiresAt: expiresAt.toISOString(),
            },
          },
        });
        return {
          claimId: claim.id,
          insurerOrganizationId: claim.insurerOrganizationId,
          status: "REFERRED_TO_VET",
          version: version + 1,
          referralGrant: grant,
        };
      },
    );
  }

  async submitClaimVetOpinion(
    p: AccountPrincipal,
    id: string,
    key: string | undefined,
    version: number,
    d: ClaimVetOpinionDto,
  ) {
    return this.command(
      p,
      key,
      `claim.opinion:${id}`,
      { version, d },
      async (tx) => {
        await this.requireVerifiedVet(tx, p);
        const claim = await tx.insuranceClaim.findUnique({ where: { id } });
        if (!claim) throw new NotFoundException();
        const grant = await tx.claimReferralGrant.findFirst({
          where: {
            claimId: claim.id,
            vetId: p.userId,
            status: "ACTIVE",
            expiresAt: { gt: new Date() },
          },
        });
        if (!grant) {
          throw new ForbiddenException(
            "An active, non-expired claim referral grant is required to submit a clinical opinion",
          );
        }
        if (claim.status !== "REFERRED_TO_VET") {
          throw new ConflictException("Claim is not awaiting vet referral review");
        }
        const updated = await tx.insuranceClaim.updateMany({
          where: { id, version, status: "REFERRED_TO_VET" },
          data: {
            status: "VET_REVIEWED",
            version: { increment: 1 },
          },
        });
        if (!updated.count) throw new ConflictException();
        const now = new Date();
        await tx.claimReferralGrant.update({
          where: { id: grant.id },
          data: { status: "COMPLETED", completedAt: now },
        });
        const review = await tx.claimReview.create({
          data: {
            claimId: claim.id,
            authorId: p.userId,
            authorRole: "VET",
            kind: "VET_OPINION",
            recommendation: d.recommendation,
            notes: d.clinicalOpinion.trim(),
            metadata: { referralGrantId: grant.id },
          },
        });
        await OutboxWorkerService.enqueue(tx, {
          topic: "CLAIM_VET_REVIEWED",
          dedupeKey: `claim-vet-reviewed:${review.id}`,
          aggregateKind: "insurance_claim",
          aggregateId: claim.id,
          payload: {
            recipientId: grant.referredById,
            linkKind: "claim",
            linkId: claim.id,
          },
        });
        await tx.auditEvent.create({
          data: {
            actorId: p.userId,
            actorKind: "USER",
            action: "CLAIM_VET_OPINION_SIGNED",
            targetKind: "insurance_claim",
            targetId: claim.id,
            metadata: {
              reviewId: review.id,
              recommendation: d.recommendation,
            },
          },
        });
        return {
          claimId: claim.id,
          status: "VET_REVIEWED",
          version: version + 1,
          review,
        };
      },
    );
  }

  async decideClaim(
    p: AccountPrincipal,
    id: string,
    key: string | undefined,
    version: number,
    d: ClaimDecisionDto,
  ) {
    return this.command(
      p,
      key,
      `claim.decide:${id}`,
      { version, d },
      async (tx) => {
        const claim = await tx.insuranceClaim.findUnique({
          where: { id },
          include: {
            policy: true,
            reviews: true,
            referralGrants: true,
            evidenceLinks: true,
          },
        });
        if (!claim) throw new NotFoundException();
        await this.lockAnimal(tx, claim.animalId);
        await this.requireInsurerStaff(tx, p, claim.insurerOrganizationId);
        if (claim.farmerId === p.userId) {
          throw new ForbiddenException(
            "Insurer staff cannot decide their own insurance claim",
          );
        }
        if (
          !["UNDER_REVIEW", "VET_REVIEWED", "SUBMITTED"].includes(claim.status)
        ) {
          throw new ConflictException(
            "Claim cannot be decided in its current status",
          );
        }
        if (d.decision === "approve") {
          if (claim.evidenceLinks.length === 0 || claim.reviews.length === 0) {
            throw new ConflictException(
              "Claim approval requires linked private evidence and at least one recorded review or vet opinion",
            );
          }
          const priorInsurerActorIds = new Set<string>([
            ...claim.reviews
              .filter((r) => r.authorRole === "INSURER_STAFF")
              .map((r) => r.authorId),
            ...claim.referralGrants.map((g) => g.referredById),
          ]);
          if (priorInsurerActorIds.has(p.userId)) {
            throw new ForbiddenException(
              "Maker/checker separation: insurer staff who initiated review or vet referral cannot approve the final claim payout decision",
            );
          }
        }
        const approvedAmountMinor =
          d.decision === "approve"
            ? d.approvedAmountMinor
              ? parseMinorUnits(d.approvedAmountMinor)
              : claim.claimedAmountMinor
            : null;
        if (
          approvedAmountMinor !== null &&
          (approvedAmountMinor <= 0n ||
            approvedAmountMinor > claim.claimedAmountMinor ||
            approvedAmountMinor > claim.policy.coverageMinor)
        ) {
          throw new BadRequestException(
            "approvedAmountMinor must be positive and cannot exceed claimedAmountMinor or policy coverageMinor",
          );
        }
        const nextStatus = d.decision === "approve" ? "APPROVED" : "REJECTED";
        const now = new Date();
        const updated = await tx.insuranceClaim.updateMany({
          where: {
            id,
            version,
            status: { in: ["SUBMITTED", "UNDER_REVIEW", "VET_REVIEWED"] },
          },
          data: {
            status: nextStatus,
            approvedAmountMinor,
            decisionNote: d.reason.trim(),
            decidedById: p.userId,
            decidedAt: now,
            version: { increment: 1 },
          },
        });
        if (!updated.count) throw new ConflictException();
        await tx.claimReview.create({
          data: {
            claimId: claim.id,
            authorId: p.userId,
            authorRole: "INSURER_STAFF",
            kind: "DECISION_REVIEW",
            recommendation: d.decision === "approve" ? "APPROVE" : "REJECT",
            notes: d.reason.trim(),
            metadata: {
              approvedAmountMinor: approvedAmountMinor?.toString() ?? null,
            },
          },
        });
        if (d.decision === "approve" && claim.incidentKind === "DEATH") {
          await tx.animal.update({
            where: { id: claim.animalId },
            data: { status: "DECEASED", version: { increment: 1 } },
          });
        }
        const row = await tx.insuranceClaim.findUniqueOrThrow({
          where: { id },
          include: { evidenceLinks: true, reviews: true, referralGrants: true },
        });
        await OutboxWorkerService.enqueue(tx, {
          topic: "CLAIM_DECIDED",
          dedupeKey: `claim-decided:${id}:${row.version}`,
          aggregateKind: "insurance_claim",
          aggregateId: id,
          payload: {
            recipientId: row.farmerId,
            linkKind: "claim",
            linkId: id,
          },
        });
        await tx.auditEvent.create({
          data: {
            actorId: p.userId,
            actorKind: "USER",
            action:
              d.decision === "approve" ? "CLAIM_APPROVED" : "CLAIM_REJECTED",
            targetKind: "insurance_claim",
            targetId: id,
            metadata: {
              animalId: row.animalId,
              insurerOrganizationId: row.insurerOrganizationId,
              approvedAmountMinor: approvedAmountMinor?.toString() ?? null,
            },
          },
        });
        return row;
      },
    );
  }

  private async applyClaimSettlementConfirmation(
    tx: Tx,
    claimId: string,
    paymentIntentId: string,
    settledAmountMinor: bigint,
    now: Date,
  ) {
    const targetClaim = await tx.insuranceClaim.findUniqueOrThrow({
      where: { id: claimId },
    });
    await this.lockAnimal(tx, targetClaim.animalId);
    await tx.$queryRaw`SELECT id FROM palito.insurance_claims WHERE id = ${claimId}::uuid FOR UPDATE`;
    const claim = await tx.insuranceClaim.findUniqueOrThrow({
      where: { id: claimId },
    });
    if (!["APPROVED", "SETTLING"].includes(claim.status)) {
      throw new ConflictException("Claim is not in APPROVED or SETTLING state");
    }
    if (
      !claim.approvedAmountMinor ||
      claim.approvedAmountMinor !== settledAmountMinor
    ) {
      throw new ConflictException(
        "Settlement amount does not match claim approvedAmountMinor",
      );
    }

    const activeLoanRow = await tx.loan.findFirst({
      where: { animalId: claim.animalId, status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
    });
    let activeLoan = activeLoanRow;
    if (activeLoanRow) {
      await tx.$queryRaw`SELECT id FROM palito.loans WHERE id = ${activeLoanRow.id}::uuid FOR UPDATE`;
      activeLoan = await tx.loan.findUniqueOrThrow({
        where: { id: activeLoanRow.id },
      });
    }
    const currentDebtMinor =
      activeLoan && activeLoan.status === "ACTIVE"
        ? activeLoan.outstandingMinor
        : 0n;
    const split = allocateClaimSettlement(
      claim.approvedAmountMinor,
      currentDebtMinor,
    );

    const insurerAccount = await this.ensureAccount(tx, "INSURER_POOL", {
      organizationId: claim.insurerOrganizationId,
    });
    const legs: Array<{
      accountId: string;
      direction: "DEBIT" | "CREDIT";
      amountMinor: bigint;
    }> = [
      {
        accountId: insurerAccount.id,
        direction: "DEBIT",
        amountMinor: split.totalSettledMinor,
      },
    ];

    if (split.debtPayoffMinor > 0n && activeLoan) {
      const bankAccount = await this.ensureAccount(tx, "BANK_POOL", {
        organizationId: activeLoan.bankOrganizationId,
      });
      legs.push({
        accountId: bankAccount.id,
        direction: "CREDIT",
        amountMinor: split.debtPayoffMinor,
      });
    }
    if (split.farmerRemainderMinor > 0n) {
      const farmerWallet = await this.ensureAccount(tx, "USER_WALLET", {
        ownerUserId: claim.farmerId,
      });
      legs.push({
        accountId: farmerWallet.id,
        direction: "CREDIT",
        amountMinor: split.farmerRemainderMinor,
      });
    }

    const ledgerTx = await this.postMultiLegBalancedTransaction(tx, {
      idempotencyKey: `payment-intent:${paymentIntentId}`,
      referenceKind: "CLAIM_SETTLEMENT",
      referenceId: paymentIntentId,
      description: `Sandbox debt-first insurance claim settlement for claim ${claim.id}`,
      legs,
    });

    if (split.debtPayoffMinor > 0n && activeLoan) {
      await this.applyLoanRepaymentSettlement(
        tx,
        activeLoan,
        paymentIntentId,
        split.debtPayoffMinor,
      );
    }

    const allocation = await tx.claimSettlementAllocation.create({
      data: {
        claimId: claim.id,
        paymentIntentId,
        ledgerTxId: ledgerTx.id,
        loanId:
          split.debtPayoffMinor > 0n && activeLoan ? activeLoan.id : null,
        bankOrganizationId:
          split.debtPayoffMinor > 0n && activeLoan
            ? activeLoan.bankOrganizationId
            : null,
        debtAllocatedMinor: split.debtPayoffMinor,
        farmerAllocatedMinor: split.farmerRemainderMinor,
        totalSettledMinor: split.totalSettledMinor,
        currency: "BDT",
      },
    });

    const updatedClaim = await tx.insuranceClaim.update({
      where: { id: claim.id },
      data: {
        status: "SETTLED",
        settledAt: now,
        version: { increment: 1 },
      },
    });
    await tx.insurancePolicy.update({
      where: { id: claim.policyId },
      data: {
        status: "CLAIMED",
        version: { increment: 1 },
      },
    });
    await tx.animal.updateMany({
      where: { id: claim.animalId, status: { not: "DECEASED" } },
      data: { status: "DECEASED", version: { increment: 1 } },
    });
    await OutboxWorkerService.enqueue(tx, {
      topic: "CLAIM_SETTLED",
      dedupeKey: `claim-settled:${claim.id}`,
      aggregateKind: "insurance_claim",
      aggregateId: claim.id,
      payload: {
        recipientId: claim.farmerId,
        linkKind: "claim",
        linkId: claim.id,
      },
    });
    await tx.auditEvent.create({
      data: {
        actorId: claim.decidedById ?? claim.farmerId,
        actorKind: "USER",
        action: "CLAIM_SETTLED",
        targetKind: "insurance_claim",
        targetId: claim.id,
        metadata: {
          paymentIntentId,
          ledgerTxId: ledgerTx.id,
          loanId: allocation.loanId,
          debtAllocatedMinor: split.debtPayoffMinor.toString(),
          farmerAllocatedMinor: split.farmerRemainderMinor.toString(),
          totalSettledMinor: split.totalSettledMinor.toString(),
        },
      },
    });

    return {
      updatedClaim,
      allocation,
      ledgerTxId: ledgerTx.id,
    };
  }

  async settleClaim(
    p: AccountPrincipal,
    id: string,
    key: string | undefined,
    version: number,
    d: ClaimSettlementDto,
  ) {
    return this.command(
      p,
      key,
      `claim.settle:${id}`,
      { version, d },
      async (tx) => {
        const before = await tx.insuranceClaim.findUnique({ where: { id } });
        if (!before) throw new NotFoundException();
        await this.lockAnimal(tx, before.animalId);
        await tx.$queryRaw`SELECT id FROM palito.insurance_claims WHERE id = ${id}::uuid FOR UPDATE`;
        await this.requireInsurerStaff(tx, p, before.insurerOrganizationId);
        const claim = await tx.insuranceClaim.findUniqueOrThrow({
          where: { id },
        });
        if (claim.version !== version) {
          throw new ConflictException();
        }
        if (claim.status !== "APPROVED" || !claim.approvedAmountMinor) {
          throw new ConflictException(
            "Only APPROVED claims with an approvedAmountMinor can be settled",
          );
        }
        const provider = d.provider ?? "SANDBOX_SIMULATOR";
        const now = new Date();
        if (provider === "WALLET") {
          const intent = await tx.paymentIntent.create({
            data: {
              actorId: p.userId,
              kind: "CLAIM_PAYOUT",
              targetKind: "claim",
              targetId: claim.id,
              provider: "WALLET",
              status: "CONFIRMED",
              amountMinor: claim.approvedAmountMinor,
              currency: "BDT",
              idempotencyKey: `claim-settle-wallet:${p.userId}:${key}`,
              confirmedAt: now,
            },
          });
          const { updatedClaim, allocation, ledgerTxId } =
            await this.applyClaimSettlementConfirmation(
              tx,
              claim.id,
              intent.id,
              claim.approvedAmountMinor,
              now,
            );
          await tx.paymentIntent.update({
            where: { id: intent.id },
            data: { ledgerTxId },
          });
          return {
            insurerOrganizationId: claim.insurerOrganizationId,
            paymentIntent: { ...intent, ledgerTxId },
            claim: updatedClaim,
            allocation,
          };
        }

        const intent = await tx.paymentIntent.create({
          data: {
            actorId: p.userId,
            kind: "CLAIM_PAYOUT",
            targetKind: "claim",
            targetId: claim.id,
            provider,
            status: "PROVIDER_ACCEPTED",
            amountMinor: claim.approvedAmountMinor,
            currency: "BDT",
            idempotencyKey: `claim-settle:${p.userId}:${key}`,
          },
        });
        const updatedClaim = await tx.insuranceClaim.update({
          where: { id: claim.id },
          data: {
            status: "SETTLING",
            version: { increment: 1 },
          },
        });
        return {
          insurerOrganizationId: claim.insurerOrganizationId,
          paymentIntent: intent,
          claim: updatedClaim,
          allocation: null,
        };
      },
    );
  }

  async listLoanSettlements(p: AccountPrincipal, loanId: string) {
    this.requireSandboxEnabled();
    return this.db.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id: loanId },
        include: {
          claimSettlementAllocations: {
            orderBy: { createdAt: "asc" },
          },
        },
      });
      if (!loan) throw new NotFoundException();
      const isFarmer = loan.farmerId === p.userId;
      const isBankStaff = p.memberships.some(
        (m) =>
          m.role === "BANK_STAFF" &&
          m.organizationId === loan.bankOrganizationId,
      );
      let isLinkedInsurer = false;
      const insurerOrgIds = p.memberships
        .filter((m) => m.role === "INSURER_STAFF")
        .map((m) => m.organizationId);
      if (
        insurerOrgIds.length > 0 &&
        loan.claimSettlementAllocations.length > 0
      ) {
        const linkedClaim = await tx.insuranceClaim.findFirst({
          where: {
            id: {
              in: loan.claimSettlementAllocations.map((a) => a.claimId),
            },
            insurerOrganizationId: { in: insurerOrgIds },
          },
        });
        if (linkedClaim) isLinkedInsurer = true;
      }
      if (!isFarmer && !isBankStaff && !isLinkedInsurer) {
        throw new NotFoundException();
      }
      return json({
        loanId: loan.id,
        status: loan.status,
        outstandingMinor: loan.outstandingMinor.toString(),
        items: loan.claimSettlementAllocations,
      });
    });
  }
}
