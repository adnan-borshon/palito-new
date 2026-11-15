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
import { parseMinorUnits } from "../platform/data-contracts.js";
import { DatabaseService } from "../platform/database.js";
import { OutboxWorkerService } from "../ops/outbox.worker.js";
import type {
  CareFeeIntentDto,
  CreateLoanDto,
  CreateLoanQuoteDto,
  CreateValuationDto,
  DisburseLoanDto,
  GraceDecisionDto,
  LoanDecisionDto,
  LoansPageDto,
  ProviderWebhookDto,
  RepaymentIntentDto,
} from "./dto.js";
import {
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
    if (operation === "quote.create" || operation === "loan.create") {
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
        | "CLAIM_SETTLEMENT"
        | "REVERSAL"
        | "SANDBOX_TOPUP";
      referenceId: string;
      description: string;
      debitAccountId: string;
      creditAccountId: string;
      amountMinor: bigint;
    },
  ) {
    if (input.amountMinor <= 0n) {
      throw new BadRequestException("Ledger entry amount must be positive");
    }
    if (input.debitAccountId === input.creditAccountId) {
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
      data: [
        {
          transactionId: ledgerTx.id,
          accountId: input.debitAccountId,
          direction: "DEBIT",
          amountMinor: input.amountMinor,
          currency: "BDT",
        },
        {
          transactionId: ledgerTx.id,
          accountId: input.creditAccountId,
          direction: "CREDIT",
          amountMinor: input.amountMinor,
          currency: "BDT",
        },
      ],
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
        throw new BadRequestException(
          "Repayment amount cannot exceed loan outstandingMinor",
        );
      }
      const provider = d.provider ?? "SANDBOX_SIMULATOR";
      if (provider === "WALLET") {
        const walletAccount = await this.ensureAccount(tx, "USER_WALLET", {
          ownerUserId: p.userId,
        });
        await tx.$queryRaw`SELECT id FROM palito.ledger_accounts WHERE id = ${walletAccount.id}::uuid FOR UPDATE`;
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
        await tx.$queryRaw`SELECT id FROM palito.loans WHERE id = ${intent.targetId}::uuid FOR UPDATE`;
        const loan = await tx.loan.findUniqueOrThrow({
          where: { id: intent.targetId },
        });
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
}
