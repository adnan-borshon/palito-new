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
import { createHash, randomBytes } from "node:crypto";
import { Prisma } from "../generated/prisma/client.js";
import type { AccountPrincipal } from "../identity/accounts.js";
import { OutboxWorkerService } from "../ops/outbox.worker.js";
import { APP_CONFIG, type AppConfig } from "../platform/config.js";
import { lockWalletSpend } from "../platform/wallet-lock.js";
import { parseMinorUnits } from "../platform/data-contracts.js";
import { DatabaseService } from "../platform/database.js";
import type {
  AdminUsersPageDto,
  AdvanceFulfillmentDto,
  AiRequestDto,
  AlertsPageDto,
  BindDeviceDto,
  CancelOrderDto,
  ContentPageDto,
  CreateExportDto,
  CreateOrderDto,
  CreateProductDto,
  EmergencyRequestDto,
  IngestTelemetryDto,
  OrdersPageDto,
  ProductsPageDto,
  ProvisionDeviceDto,
  SaveContentDto,
  SetCartItemDto,
} from "./dto.js";
import {
  buildBoundedAiGuidance,
  evaluateTelemetryRules,
  validateTelemetryWindow,
} from "./extensions-math.js";

type Tx = Prisma.TransactionClient;

const IMMEDIATE_VET_COVERAGE_MS = 15 * 60_000;

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

function sha256Hex(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

function instant(value: string): Date {
  const date = new Date(value);
  if (!value.endsWith("Z") || !Number.isFinite(date.getTime())) {
    throw new BadRequestException("Invalid UTC timestamp");
  }
  return date;
}

function parseCursor(cursor?: string): { createdAt: Date; id: string } | undefined {
  if (!cursor) return undefined;
  try {
    const parsed = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    );
    if (
      !Array.isArray(parsed) ||
      parsed.length !== 2 ||
      typeof parsed[0] !== "string" ||
      typeof parsed[1] !== "string"
    ) {
      throw new Error("Bad cursor");
    }
    return { createdAt: instant(parsed[0]), id: parsed[1] };
  } catch {
    throw new BadRequestException("Invalid cursor");
  }
}

function encodeCursor(row: { createdAt: Date; id: string } | undefined): string | null {
  return row
    ? Buffer.from(
        JSON.stringify([row.createdAt.toISOString(), row.id]),
      ).toString("base64url")
    : null;
}

@Injectable()
export class ExtensionsService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  private requireExtensionsEnabled() {
    if (!this.config.EXTENSIONS_SANDBOX_ENABLED) {
      throw new ServiceUnavailableException(
        "M8 extensions are disabled unless EXTENSIONS_SANDBOX_ENABLED=true",
      );
    }
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

  private async command<T>(
    p: AccountPrincipal,
    key: string | undefined,
    operation: string,
    payload: unknown,
    work: (tx: Tx) => Promise<T>,
  ): Promise<T> {
    this.requireExtensionsEnabled();
    if (!key || !/^[A-Za-z0-9_-]{8,100}$/.test(key)) {
      throw new BadRequestException("Valid Idempotency-Key header is required");
    }
    const payloadHash = sha256Hex(`${operation}:${JSON.stringify(canonical(payload))}`);
    return this.db.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${p.userId}), hashtext(${key}))`;
      const actor = await tx.user.findUnique({
        where: { id: p.userId },
        select: { status: true },
      });
      if (actor?.status !== "ACTIVE") throw new ForbiddenException();
      const saved = await tx.extensionCommand.findUnique({
        where: { actorId_key: { actorId: p.userId, key } },
      });
      if (saved) {
        if (saved.operation !== operation || saved.payloadHash !== payloadHash) {
          throw new ConflictException("Idempotency key payload mismatch");
        }
        return saved.result as T;
      }
      const result = json(await work(tx));
      await tx.extensionCommand.create({
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
    accountKind: "USER_WALLET" | "PLATFORM_ESCROW" | "PROVIDER_CLEARING",
    ownerUserId?: string,
  ) {
    const existing = await tx.ledgerAccount.findFirst({
      where: {
        accountKind,
        ownerUserId: ownerUserId ?? null,
        organizationId: null,
        currency: "BDT",
      },
    });
    if (existing) return existing;
    return tx.ledgerAccount.create({
      data: {
        accountKind,
        ownerUserId: ownerUserId ?? null,
        organizationId: null,
        currency: "BDT",
      },
    });
  }

  private async computeBalanceMinor(tx: Tx, accountId: string): Promise<bigint> {
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

  private async postBalancedLedger(
    tx: Tx,
    input: {
      idempotencyKey: string;
      referenceKind: "ORDER_PAYMENT" | "ORDER_REFUND";
      referenceId: string;
      description: string;
      debitAccountId: string;
      creditAccountId: string;
      amountMinor: bigint;
    },
  ) {
    if (input.amountMinor <= 0n || input.debitAccountId === input.creditAccountId) {
      throw new BadRequestException("Invalid balanced ledger posting");
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

  // ==================== M8a: Telemetry, Devices, Alerts & Farm Summary ====================

  async provisionDevice(
    p: AccountPrincipal,
    key: string | undefined,
    d: ProvisionDeviceDto,
  ) {
    return this.command(p, key, "device.provision", d, async (tx) => {
      await this.requireAdmin(tx, p);
      const rawSecret = randomBytes(24).toString("hex");
      const serialNumber = d.serialNumber.trim();
      const existing = await tx.device.findUnique({ where: { serialNumber } });
      if (existing) {
        throw new ConflictException("Device serialNumber is already provisioned");
      }
      const device = await tx.device.create({
        data: {
          serialNumber,
          secretHash: sha256Hex(rawSecret),
          firmwareVersion: d.firmwareVersion?.trim() || "iot-sandbox-v1",
          status: "ACTIVE",
        },
      });
      await tx.auditEvent.create({
        data: {
          actorId: p.userId,
          actorKind: "USER",
          action: "DEVICE_PROVISIONED",
          targetKind: "device",
          targetId: device.id,
          metadata: { serialNumber },
        },
      });
      return {
        id: device.id,
        serialNumber: device.serialNumber,
        firmwareVersion: device.firmwareVersion,
        status: device.status,
        provisioningSecret: rawSecret,
      };
    });
  }

  async bindDevice(
    p: AccountPrincipal,
    animalId: string,
    key: string | undefined,
    d: BindDeviceDto,
  ) {
    return this.command(
      p,
      key,
      `device.bind:${animalId}`,
      d,
      async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('animal'), hashtext(${animalId}))`;
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('device'), hashtext(${d.deviceId}))`;
        const animal = await this.requireActiveFarmerOwner(tx, p, animalId);
        if (animal.status !== "ACTIVE") {
          throw new ConflictException("Only ACTIVE animals can bind telemetry devices");
        }
        const device = await tx.device.findUnique({ where: { id: d.deviceId } });
        if (!device || device.status !== "ACTIVE") {
          throw new NotFoundException("Active device not found");
        }
        if (device.secretHash !== sha256Hex(d.provisioningSecret.trim())) {
          throw new ForbiddenException("Invalid device provisioning proof");
        }
        const lastBinding = await tx.deviceBinding.findFirst({
          where: { deviceId: device.id },
          orderBy: { sessionEpoch: "desc" },
        });
        const sessionEpoch = (lastBinding?.sessionEpoch ?? 0) + 1;
        try {
          const binding = await tx.deviceBinding.create({
            data: {
              deviceId: device.id,
              animalId: animal.id,
              farmerId: p.userId,
              sessionEpoch,
              status: "ACTIVE",
              lastSequence: 0,
            },
          });
          await tx.auditEvent.create({
            data: {
              actorId: p.userId,
              actorKind: "USER",
              action: "DEVICE_BOUND",
              targetKind: "device_binding",
              targetId: binding.id,
              metadata: { deviceId: device.id, animalId: animal.id, sessionEpoch },
            },
          });
          return binding;
        } catch (err) {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002"
          ) {
            throw new ConflictException(
              "Device or animal already has an ACTIVE telemetry binding",
            );
          }
          throw err;
        }
      },
    );
  }

  async unbindDevice(
    p: AccountPrincipal,
    bindingId: string,
    key: string | undefined,
  ) {
    return this.command(p, key, `device.unbind:${bindingId}`, {}, async (tx) => {
      const binding = await tx.deviceBinding.findUnique({
        where: { id: bindingId },
      });
      if (!binding || binding.farmerId !== p.userId) {
        throw new NotFoundException();
      }
      if (binding.status !== "ACTIVE") {
        throw new ConflictException("Device binding is already UNBOUND");
      }
      const updated = await tx.deviceBinding.update({
        where: { id: binding.id },
        data: {
          status: "UNBOUND",
          unboundAt: new Date(),
          version: { increment: 1 },
        },
      });
      await tx.auditEvent.create({
        data: {
          actorId: p.userId,
          actorKind: "USER",
          action: "DEVICE_UNBOUND",
          targetKind: "device_binding",
          targetId: binding.id,
          metadata: { deviceId: binding.deviceId, animalId: binding.animalId },
        },
      });
      return updated;
    });
  }

  async ingestTelemetry(
    deviceId: string,
    deviceSecret: string | undefined,
    d: IngestTelemetryDto,
  ) {
    this.requireExtensionsEnabled();
    if (!deviceSecret || !deviceSecret.trim()) {
      throw new UnauthorizedException("Missing X-Palito-Device-Secret header");
    }
    const observedAt = instant(d.observedAt);
    const now = new Date();
    validateTelemetryWindow(observedAt, now);

    return this.db.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('device'), hashtext(${deviceId}))`;
      const device = await tx.device.findUnique({ where: { id: deviceId } });
      if (!device || device.status !== "ACTIVE") {
        throw new NotFoundException("Active device not found");
      }
      if (device.secretHash !== sha256Hex(deviceSecret.trim())) {
        throw new UnauthorizedException("Invalid device credential");
      }
      const binding = await tx.deviceBinding.findFirst({
        where: { deviceId: device.id, status: "ACTIVE" },
        include: { animal: true },
      });
      if (!binding || binding.animal.status !== "ACTIVE") {
        throw new ConflictException("Device has no ACTIVE livestock binding");
      }
      if (binding.farmerId !== binding.animal.ownerId) {
        throw new ConflictException(
          "Animal ownership changed; rebind device with current owner",
        );
      }
      if (d.sessionEpoch !== binding.sessionEpoch) {
        throw new ConflictException(
          `Stale or mismatched sessionEpoch (expected ${binding.sessionEpoch})`,
        );
      }
      if (d.sequenceNumber <= binding.lastSequence) {
        throw new ConflictException(
          "Replay or out-of-order sequenceNumber rejected",
        );
      }
      const reading = await tx.telemetryReading.create({
        data: {
          bindingId: binding.id,
          deviceId: device.id,
          animalId: binding.animalId,
          sessionEpoch: d.sessionEpoch,
          sequenceNumber: d.sequenceNumber,
          temperatureC: new Prisma.Decimal(d.temperatureC.toFixed(2)),
          heartRateBpm: d.heartRateBpm,
          activityIndex: d.activityIndex,
          batteryPct: d.batteryPct,
          observedAt,
          receivedAt: now,
        },
      });
      await tx.deviceBinding.update({
        where: { id: binding.id },
        data: {
          lastSequence: d.sequenceNumber,
          lastObservedAt: observedAt,
          lastBatteryPct: d.batteryPct,
          version: { increment: 1 },
        },
      });

      const triggered = evaluateTelemetryRules({
        temperatureC: d.temperatureC,
        heartRateBpm: d.heartRateBpm,
        batteryPct: d.batteryPct,
      });
      const alerts = [];
      for (const candidate of triggered) {
        const alert = await tx.deviceAlert.create({
          data: {
            animalId: binding.animalId,
            farmerId: binding.farmerId,
            bindingId: binding.id,
            readingId: reading.id,
            ruleVersion: candidate.ruleVersion,
            kind: candidate.kind,
            severity: candidate.severity,
            title: candidate.title,
            summary: candidate.summary,
            status: "OPEN",
          },
        });
        alerts.push(alert);
        await OutboxWorkerService.enqueue(tx, {
          topic: "DEVICE_ALERT_RAISED",
          dedupeKey: `device-alert:${alert.id}`,
          aggregateKind: "device_alert",
          aggregateId: alert.id,
          payload: {
            recipientId: binding.farmerId,
            animalId: binding.animalId,
            alertId: alert.id,
            linkKind: "device_alert",
            linkId: alert.id,
          },
        });
      }

      return json({
        reading,
        alertsCreated: alerts.length,
        alerts,
      });
    });
  }

  async animalTelemetry(p: AccountPrincipal, animalId: string) {
    this.requireExtensionsEnabled();
    return this.db.prisma.$transaction(async (tx) => {
      const animal = await tx.animal.findUnique({ where: { id: animalId } });
      if (!animal) throw new NotFoundException();
      const isOwner = animal.ownerId === p.userId;
      let isConsentedVet = false;
      if (!isOwner && p.memberships.some((m) => m.role === "VET")) {
        const grant = await tx.careGrant.findFirst({
          where: {
            farmerId: animal.ownerId,
            revokedAt: null,
            expiresAt: { gt: new Date() },
            appointment: {
              animalId: animal.id,
              vetId: p.userId,
              status: { notIn: ["CANCELLED", "REJECTED"] },
            },
          },
        });
        if (grant) isConsentedVet = true;
      }
      if (!isOwner && !isConsentedVet) {
        throw new NotFoundException();
      }

      const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000);
      const [activeBinding, readings] = await Promise.all([
        tx.deviceBinding.findFirst({
          where: { animalId: animal.id, status: "ACTIVE" },
          include: { device: { select: { id: true, serialNumber: true, firmwareVersion: true } } },
        }),
        tx.telemetryReading.findMany({
          where: { animalId: animal.id, observedAt: { gte: sevenDaysAgo } },
          orderBy: [{ observedAt: "desc" }, { id: "desc" }],
          take: 50,
        }),
      ]);
      const latest = readings[0] ?? null;
      const stale =
        !latest || Date.now() - latest.observedAt.getTime() > 3_600_000;
      const expected7dSamples = 7 * 24 * 12;
      const missingSampleRatio = Number(
        Math.max(0, 1 - readings.length / expected7dSamples).toFixed(3),
      );
      return json({
        animalId: animal.id,
        activeBinding,
        stale,
        windowDays: 7,
        sampleCount: readings.length,
        missingSampleRatio,
        latestReading: latest,
        items: readings,
      });
    });
  }

  async farmSummary(p: AccountPrincipal, farmId: string) {
    this.requireExtensionsEnabled();
    return this.db.prisma.$transaction(async (tx) => {
      const farm = await tx.farm.findFirst({
        where: { id: farmId, ownerId: p.userId },
      });
      if (!farm) throw new NotFoundException();
      const staleCutoff = new Date(Date.now() - 3_600_000);
      const [animalCount, activeBindingCount, staleBindingCount, openAlertCount] =
        await Promise.all([
          tx.animal.count({ where: { farmId: farm.id, status: "ACTIVE" } }),
          tx.deviceBinding.count({
            where: { animal: { farmId: farm.id }, status: "ACTIVE" },
          }),
          tx.deviceBinding.count({
            where: {
              animal: { farmId: farm.id },
              status: "ACTIVE",
              OR: [
                { lastObservedAt: null },
                { lastObservedAt: { lt: staleCutoff } },
              ],
            },
          }),
          tx.deviceAlert.count({
            where: {
              animal: { farmId: farm.id },
              status: { in: ["OPEN", "ESCALATED"] },
            },
          }),
        ]);
      return json({
        farmId: farm.id,
        name: farm.name,
        district: farm.district,
        animalCount,
        activeBindingCount,
        staleBindingCount,
        openAlertCount,
      });
    });
  }

  async listAlerts(p: AccountPrincipal, q: AlertsPageDto = {}) {
    this.requireExtensionsEnabled();
    const limit = q.limit ?? 25;
    const after = parseCursor(q.cursor);
    const rows = await this.db.prisma.deviceAlert.findMany({
      where: {
        farmerId: p.userId,
        ...(q.status ? { status: q.status } : {}),
        ...(after
          ? {
              OR: [
                { createdAt: { lt: after.createdAt } },
                { createdAt: after.createdAt, id: { lt: after.id } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
    });
    const more = rows.length > limit;
    const items = rows.slice(0, limit);
    return json({
      items,
      nextCursor: more ? encodeCursor(items.at(-1)) : null,
    });
  }

  async alertDetail(p: AccountPrincipal, alertId: string) {
    this.requireExtensionsEnabled();
    const alert = await this.db.prisma.deviceAlert.findUnique({
      where: { id: alertId },
      include: { reading: true },
    });
    if (!alert || alert.farmerId !== p.userId) throw new NotFoundException();
    return json(alert);
  }

  async acknowledgeAlert(
    p: AccountPrincipal,
    alertId: string,
    key: string | undefined,
    version: number,
  ) {
    return this.command(
      p,
      key,
      `alert.ack:${alertId}`,
      { version },
      async (tx) => {
        const before = await tx.deviceAlert.findUnique({
          where: { id: alertId },
        });
        if (!before || before.farmerId !== p.userId) {
          throw new NotFoundException();
        }
        if (before.status === "ACKNOWLEDGED") {
          return before;
        }
        const updated = await tx.deviceAlert.updateMany({
          where: { id: alertId, version, status: { in: ["OPEN", "ESCALATED"] } },
          data: {
            status: "ACKNOWLEDGED",
            acknowledgedById: p.userId,
            acknowledgedAt: new Date(),
            version: { increment: 1 },
          },
        });
        if (!updated.count) throw new ConflictException();
        return tx.deviceAlert.findUniqueOrThrow({ where: { id: alertId } });
      },
    );
  }

  // ==================== M8b: Bounded AI Support ====================

  async createAiRequest(
    p: AccountPrincipal,
    key: string | undefined,
    d: AiRequestDto,
  ) {
    return this.command(p, key, "ai.request", d, async (tx) => {
      const animal = await this.requireActiveFarmerOwner(tx, p, d.animalId);
      if (d.modality === "VOICE") {
        if (!d.transcriptConfirmed || !d.transcriptText?.trim()) {
          throw new BadRequestException(
            "VOICE modality requires non-empty transcriptText with transcriptConfirmed=true",
          );
        }
      }
      if (d.modality === "PHOTO") {
        if (!d.mediaFileId) {
          throw new BadRequestException("PHOTO modality requires mediaFileId");
        }
        const readyPhoto = await tx.privateFile.findFirst({
          where: {
            id: d.mediaFileId,
            animalId: animal.id,
            ownerAtUploadId: p.userId,
            status: "READY",
          },
        });
        if (!readyPhoto) {
          throw new BadRequestException(
            "mediaFileId must reference an owned READY private file for this animal",
          );
        }
      }
      const dayAgo = new Date(Date.now() - 86_400_000);
      const recentCount = await tx.aiRequest.count({
        where: { farmerId: p.userId, createdAt: { gte: dayAgo } },
      });
      if (recentCount >= 20) {
        throw new ConflictException("Daily AI guidance request budget (20/day) reached");
      }

      const locale = d.locale ?? "bn";
      const bounded = buildBoundedAiGuidance({
        promptText: d.transcriptText?.trim() || d.promptText,
        animalName: animal.name,
        species: animal.species,
        breed: animal.breed,
        locale,
        hasMedia: Boolean(d.mediaFileId),
      });

      const isOutage = Boolean(d.simulateOutage);
      const row = await tx.aiRequest.create({
        data: {
          farmerId: p.userId,
          animalId: animal.id,
          modality: d.modality,
          promptText: bounded.sanitizedPrompt,
          transcriptText: d.transcriptText?.trim() || null,
          transcriptConfirmed: Boolean(d.transcriptConfirmed),
          mediaFileId: d.mediaFileId ?? null,
          promptVersion: bounded.promptVersion,
          modelId: bounded.modelId,
          locale,
          status: isOutage ? "PROVIDER_OUTAGE_FALLBACK" : "COMPLETED",
          guidanceText: isOutage
            ? "AI provider temporarily unavailable. Please book or escalate directly to a verified veterinarian consultation."
            : bounded.guidanceText,
          uncertaintyNote: bounded.uncertaintyNote,
          suggestVetHandoff: true,
        },
      });
      return row;
    });
  }

  async listAiRequests(p: AccountPrincipal) {
    this.requireExtensionsEnabled();
    const items = await this.db.prisma.aiRequest.findMany({
      where: { farmerId: p.userId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 25,
    });
    return json({ items });
  }

  // ==================== M8c: Calls & Emergency Triage ====================

  async issueCallToken(
    p: AccountPrincipal,
    appointmentId: string,
    key: string | undefined,
  ) {
    return this.command(p, key, `call.token:${appointmentId}`, {}, async (tx) => {
      const appt = await tx.appointment.findUnique({
        where: { id: appointmentId },
      });
      if (!appt) throw new NotFoundException();
      if (appt.farmerId !== p.userId && appt.vetId !== p.userId) {
        throw new NotFoundException();
      }
      if (!["ACCEPTED", "IN_PROGRESS"].includes(appt.status)) {
        throw new ConflictException(
          "Call tokens are only issued for ACCEPTED or IN_PROGRESS consultations",
        );
      }
      const grant = await tx.careGrant.findFirst({
        where: {
          appointmentId: appt.id,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
      });
      if (!grant) {
        throw new ForbiddenException("Active care consent is required for call access");
      }
      const now = Date.now();
      if (now > appt.endsAt.getTime() + 72 * 3_600_000) {
        throw new ConflictException("Consultation call window has expired");
      }
      const rawToken = randomBytes(24).toString("hex");
      const expiresAt = new Date(now + 15 * 60_000);
      const roomName = `palito-consult-${appt.id}`;
      const session = await tx.consultationCallSession.create({
        data: {
          appointmentId: appt.id,
          animalId: appt.animalId,
          farmerId: appt.farmerId,
          vetId: appt.vetId,
          issuedToUserId: p.userId,
          roomName,
          tokenHash: sha256Hex(rawToken),
          provider: "SANDBOX_WEBRTC",
          expiresAt,
        },
      });
      return {
        id: session.id,
        appointmentId: appt.id,
        roomName,
        provider: "SANDBOX_WEBRTC",
        participantToken: rawToken,
        expiresAt: expiresAt.toISOString(),
      };
    });
  }

  async createEmergencyRequest(
    p: AccountPrincipal,
    key: string | undefined,
    d: EmergencyRequestDto,
  ) {
    return this.command(p, key, "emergency.create", d, async (tx) => {
      const animal = await this.requireActiveFarmerOwner(tx, p, d.animalId);
      if (d.alertId) {
        const alert = await tx.deviceAlert.findFirst({
          where: { id: d.alertId, animalId: animal.id, farmerId: p.userId },
        });
        if (!alert) throw new NotFoundException("Referenced alert not found");
      }
      const now = new Date();
      const openSlot = await tx.vetSlot.findFirst({
        where: {
          status: "OPEN",
          startsAt: { gt: now, lte: new Date(now.getTime() + IMMEDIATE_VET_COVERAGE_MS) },
          vet: {
            status: "VERIFIED",
            user: { status: "ACTIVE" },
          },
        },
        orderBy: { startsAt: "asc" },
      });
      const coverageStatus = openSlot
        ? "VERIFIED_VET_COVERAGE_AVAILABLE"
        : "NO_IMMEDIATE_COVERAGE_FALLBACK";
      const emergency = await tx.emergencyRequest.create({
        data: {
          animalId: animal.id,
          farmerId: p.userId,
          alertId: d.alertId ?? null,
          assignedVetId: openSlot?.vetId ?? null,
          symptoms: d.symptoms.trim(),
          coverageStatus,
          status: openSlot ? "OPEN" : "NO_COVERAGE_FALLBACK",
        },
      });
      await OutboxWorkerService.enqueue(tx, {
        topic: "EMERGENCY_TRIAGE_LOGGED",
        dedupeKey: `emergency:${emergency.id}`,
        aggregateKind: "emergency_request",
        aggregateId: emergency.id,
        payload: {
          recipientId: p.userId,
          animalId: animal.id,
          linkKind: "emergency_request",
          linkId: emergency.id,
        },
      });
      return emergency;
    });
  }

  async listEmergencyRequests(p: AccountPrincipal) {
    this.requireExtensionsEnabled();
    const isVet = p.memberships.some((m) => m.role === "VET");
    const items = await this.db.prisma.emergencyRequest.findMany({
      where: {
        OR: [
          { farmerId: p.userId },
          ...(isVet ? [{ assignedVetId: p.userId }] : []),
        ],
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 25,
    });
    return json({ items });
  }

  // ==================== M8d: Prescription-Checked Commerce ====================

  async createProduct(
    p: AccountPrincipal,
    key: string | undefined,
    d: CreateProductDto,
  ) {
    return this.command(p, key, "product.create", d, async (tx) => {
      await this.requireAdmin(tx, p);
      if (d.requiresPrescription && !d.matchedMedicineName?.trim()) {
        throw new BadRequestException(
          "matchedMedicineName is required when requiresPrescription=true",
        );
      }
      const existing = await tx.product.findUnique({ where: { sku: d.sku.trim() } });
      if (existing) throw new ConflictException("Duplicate product SKU");
      return tx.product.create({
        data: {
          sku: d.sku.trim(),
          nameBn: d.nameBn.trim(),
          nameEn: d.nameEn.trim(),
          category: d.category,
          requiresPrescription: d.requiresPrescription,
          matchedMedicineName: d.matchedMedicineName?.trim() || null,
          maxPerPrescriptionQty: d.maxPerPrescriptionQty ?? 10,
          unitPriceMinor: parseMinorUnits(d.unitPriceMinor),
          stockQuantity: d.stockQuantity,
          currency: "BDT",
          status: "ACTIVE",
        },
      });
    });
  }

  async listProducts(q: ProductsPageDto = {}) {
    this.requireExtensionsEnabled();
    const limit = q.limit ?? 25;
    const after = parseCursor(q.cursor);
    const search = q.search?.trim();
    const rows = await this.db.prisma.product.findMany({
      where: {
        status: "ACTIVE",
        ...(q.category ? { category: q.category } : {}),
        ...(search
          ? {
              OR: [
                { nameEn: { contains: search, mode: "insensitive" } },
                { nameBn: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(after
          ? {
              OR: [
                { createdAt: { gt: after.createdAt } },
                { createdAt: after.createdAt, id: { gt: after.id } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      take: limit + 1,
    });
    const more = rows.length > limit;
    const items = rows.slice(0, limit);
    return json({ items, nextCursor: more ? encodeCursor(items.at(-1)) : null });
  }

  async productDetail(id: string) {
    this.requireExtensionsEnabled();
    const product = await this.db.prisma.product.findFirst({
      where: { id, status: "ACTIVE" },
    });
    if (!product) throw new NotFoundException();
    return json(product);
  }

  private async verifyPrescriptionForProduct(
    tx: Tx,
    farmerId: string,
    product: {
      id: string;
      requiresPrescription: boolean;
      matchedMedicineName: string | null;
      maxPerPrescriptionQty: number;
    },
    prescriptionId: string | undefined,
    requestedQty: number,
  ) {
    if (!product.requiresPrescription) return;
    if (!prescriptionId) {
      throw new BadRequestException(
        "This regulated medicine requires a valid prescriptionId",
      );
    }
    const rx = await tx.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        items: true,
        record: { include: { animal: true } },
      },
    });
    if (!rx || !rx.signedAt || rx.record.animal.ownerId !== farmerId) {
      throw new ForbiddenException(
        "Prescription must be signed and linked to an animal owned by the farmer",
      );
    }
    const targetMed = (product.matchedMedicineName ?? "").trim().toLowerCase();
    const matchesMedicine = rx.items.some(
      (item) => item.medicineName.trim().toLowerCase() === targetMed,
    );
    if (!matchesMedicine) {
      throw new ConflictException(
        "Prescription does not contain matching prescribed medicine",
      );
    }
    const priorAgg = await tx.orderItem.aggregate({
      where: {
        prescriptionId: rx.id,
        productId: product.id,
        reservedStatus: { in: ["RESERVED", "COMMITTED"] },
      },
      _sum: { quantity: true },
    });
    const alreadyUsed = priorAgg._sum.quantity ?? 0;
    if (alreadyUsed + requestedQty > product.maxPerPrescriptionQty) {
      throw new ConflictException(
        `Dispensing quantity (${alreadyUsed + requestedQty}) exceeds prescription limit (${product.maxPerPrescriptionQty})`,
      );
    }
  }

  async getCart(p: AccountPrincipal) {
    this.requireExtensionsEnabled();
    const items = await this.db.prisma.cartItem.findMany({
      where: { farmerId: p.userId },
      include: { product: true },
      orderBy: { updatedAt: "asc" },
    });
    return json({ items });
  }

  async setCartItem(
    p: AccountPrincipal,
    productId: string,
    key: string | undefined,
    d: SetCartItemDto,
  ) {
    return this.command(
      p,
      key,
      `cart.set:${productId}`,
      d,
      async (tx) => {
        if (d.quantity === 0) {
          await tx.cartItem.deleteMany({
            where: { farmerId: p.userId, productId },
          });
          return { removed: true };
        }
        const product = await tx.product.findFirst({
          where: { id: productId, status: "ACTIVE" },
        });
        if (!product) throw new NotFoundException();
        if (product.stockQuantity < d.quantity) {
          throw new ConflictException("Requested quantity exceeds available stock");
        }
        await this.verifyPrescriptionForProduct(
          tx,
          p.userId,
          product,
          d.prescriptionId,
          d.quantity,
        );
        return tx.cartItem.upsert({
          where: {
            farmerId_productId: { farmerId: p.userId, productId },
          },
          create: {
            farmerId: p.userId,
            productId,
            quantity: d.quantity,
            prescriptionId: d.prescriptionId ?? null,
          },
          update: {
            quantity: d.quantity,
            prescriptionId: d.prescriptionId ?? null,
            updatedAt: new Date(),
          },
        });
      },
    );
  }

  async createOrder(
    p: AccountPrincipal,
    key: string | undefined,
    d: CreateOrderDto,
  ) {
    return this.command(p, key, "order.create", d, async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: { farmerId: p.userId },
        orderBy: { productId: "asc" },
      });
      if (cartItems.length === 0) {
        throw new ConflictException("Cart is empty");
      }
      let totalMinor = 0n;
      const linePlans: Array<{
        productId: string;
        prescriptionId: string | null;
        quantity: number;
        unitPriceMinor: bigint;
        lineTotalMinor: bigint;
      }> = [];

      for (const item of cartItems) {
        await tx.$queryRaw`SELECT id FROM palito.products WHERE id = ${item.productId}::uuid FOR UPDATE`;
        const product = await tx.product.findUniqueOrThrow({
          where: { id: item.productId },
        });
        if (product.status !== "ACTIVE" || product.stockQuantity < item.quantity) {
          throw new ConflictException(`Insufficient stock for SKU ${product.sku}`);
        }
        await this.verifyPrescriptionForProduct(
          tx,
          p.userId,
          product,
          item.prescriptionId ?? undefined,
          item.quantity,
        );
        const lineTotalMinor = product.unitPriceMinor * BigInt(item.quantity);
        totalMinor += lineTotalMinor;
        linePlans.push({
          productId: product.id,
          prescriptionId: item.prescriptionId,
          quantity: item.quantity,
          unitPriceMinor: product.unitPriceMinor,
          lineTotalMinor,
        });
        await tx.product.update({
          where: { id: product.id },
          data: {
            stockQuantity: { decrement: item.quantity },
            version: { increment: 1 },
          },
        });
      }

      const provider = d.provider ?? "SANDBOX_SIMULATOR";
      const now = new Date();
      let paymentIntent;
      let orderStatus = "PAYMENT_PENDING";
      let reservedStatus = "RESERVED";
      let ledgerTxId: string | null = null;

      const order = await tx.order.create({
        data: {
          farmerId: p.userId,
          totalMinor,
          currency: "BDT",
          status: "PAYMENT_PENDING",
          shippingAddress: d.shippingAddress.trim(),
        },
      });

      if (provider === "WALLET") {
        const walletAccount = await this.ensureAccount(tx, "USER_WALLET", p.userId);
        await lockWalletSpend(tx, walletAccount.id);
        const balance = await this.computeBalanceMinor(tx, walletAccount.id);
        if (balance < totalMinor) {
          throw new ConflictException("Insufficient sandbox wallet balance for order");
        }
        const escrowAccount = await this.ensureAccount(tx, "PLATFORM_ESCROW");
        paymentIntent = await tx.paymentIntent.create({
          data: {
            actorId: p.userId,
            kind: "ORDER_PAYMENT",
            targetKind: "order",
            targetId: order.id,
            provider: "WALLET",
            status: "CONFIRMED",
            amountMinor: totalMinor,
            currency: "BDT",
            idempotencyKey: `order-wallet:${p.userId}:${key}`,
            confirmedAt: now,
          },
        });
        const ledgerTx = await this.postBalancedLedger(tx, {
          idempotencyKey: `payment-intent:${paymentIntent.id}`,
          referenceKind: "ORDER_PAYMENT",
          referenceId: paymentIntent.id,
          description: `Sandbox wallet pharmacy order payment ${order.id}`,
          debitAccountId: walletAccount.id,
          creditAccountId: escrowAccount.id,
          amountMinor: totalMinor,
        });
        ledgerTxId = ledgerTx.id;
        await tx.paymentIntent.update({
          where: { id: paymentIntent.id },
          data: { ledgerTxId },
        });
        orderStatus = "PAID";
        reservedStatus = "COMMITTED";
      } else {
        paymentIntent = await tx.paymentIntent.create({
          data: {
            actorId: p.userId,
            kind: "ORDER_PAYMENT",
            targetKind: "order",
            targetId: order.id,
            provider,
            status: "PROVIDER_ACCEPTED",
            amountMinor: totalMinor,
            currency: "BDT",
            idempotencyKey: `order-pay:${p.userId}:${key}`,
          },
        });
      }

      await tx.orderItem.createMany({
        data: linePlans.map((line) => ({
          orderId: order.id,
          productId: line.productId,
          prescriptionId: line.prescriptionId,
          quantity: line.quantity,
          unitPriceMinor: line.unitPriceMinor,
          lineTotalMinor: line.lineTotalMinor,
          reservedStatus,
        })),
      });
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: orderStatus,
          paymentIntentId: paymentIntent.id,
        },
      });
      await tx.cartItem.deleteMany({ where: { farmerId: p.userId } });

      if (orderStatus === "PAID") {
        await OutboxWorkerService.enqueue(tx, {
          topic: "ORDER_PAID",
          dedupeKey: `order-paid:${order.id}`,
          aggregateKind: "order",
          aggregateId: order.id,
          payload: {
            recipientId: p.userId,
            linkKind: "order",
            linkId: order.id,
          },
        });
      }
      return tx.order.findUniqueOrThrow({
        where: { id: order.id },
        include: { items: true, paymentIntent: true },
      });
    });
  }

  async listOrders(p: AccountPrincipal, q: OrdersPageDto = {}) {
    this.requireExtensionsEnabled();
    const limit = q.limit ?? 25;
    const after = parseCursor(q.cursor);
    const isAdmin = p.memberships.some((m) => m.role === "ADMIN");
    const rows = await this.db.prisma.order.findMany({
      where: {
        ...(isAdmin ? {} : { farmerId: p.userId }),
        ...(q.status ? { status: q.status } : {}),
        ...(after
          ? {
              OR: [
                { createdAt: { lt: after.createdAt } },
                { createdAt: after.createdAt, id: { lt: after.id } },
              ],
            }
          : {}),
      },
      include: { items: { include: { product: true } }, fulfillmentEvents: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
    });
    const more = rows.length > limit;
    const items = rows.slice(0, limit);
    return json({ items, nextCursor: more ? encodeCursor(items.at(-1)) : null });
  }

  async orderDetail(p: AccountPrincipal, orderId: string) {
    this.requireExtensionsEnabled();
    const order = await this.db.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } }, fulfillmentEvents: true },
    });
    const isAdmin = p.memberships.some((m) => m.role === "ADMIN");
    if (!order || (!isAdmin && order.farmerId !== p.userId)) {
      throw new NotFoundException();
    }
    return json(order);
  }

  async cancelOrder(
    p: AccountPrincipal,
    orderId: string,
    key: string | undefined,
    version: number,
    d: CancelOrderDto,
  ) {
    return this.command(
      p,
      key,
      `order.cancel:${orderId}`,
      { version, d },
      async (tx) => {
        await tx.$queryRaw`SELECT id FROM palito.orders WHERE id = ${orderId}::uuid FOR UPDATE`;
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });
        if (!order || order.farmerId !== p.userId) {
          throw new NotFoundException();
        }
        if (order.version !== version) throw new ConflictException();
        if (!["PAYMENT_PENDING", "PAID"].includes(order.status)) {
          throw new ConflictException(
            "Orders can only be cancelled before PACKED/SHIPPED/DELIVERED fulfillment",
          );
        }

        for (const item of order.items) {
          await tx.$queryRaw`SELECT id FROM palito.products WHERE id = ${item.productId}::uuid FOR UPDATE`;
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: { increment: item.quantity },
              version: { increment: 1 },
            },
          });
        }
        await tx.orderItem.updateMany({
          where: { orderId: order.id },
          data: { reservedStatus: "RELEASED" },
        });

        let refundIntentId: string | null = null;
        if (order.status === "PAID") {
          const escrowAccount = await this.ensureAccount(tx, "PLATFORM_ESCROW");
          const walletAccount = await this.ensureAccount(tx, "USER_WALLET", p.userId);
          const now = new Date();
          const refundIntent = await tx.paymentIntent.create({
            data: {
              actorId: p.userId,
              kind: "ORDER_REFUND",
              targetKind: "order",
              targetId: order.id,
              provider: "WALLET",
              status: "CONFIRMED",
              amountMinor: order.totalMinor,
              currency: "BDT",
              idempotencyKey: `order-refund:${order.id}`,
              confirmedAt: now,
            },
          });
          const ledgerTx = await this.postBalancedLedger(tx, {
            idempotencyKey: `payment-intent:${refundIntent.id}`,
            referenceKind: "ORDER_REFUND",
            referenceId: refundIntent.id,
            description: `Sandbox commerce refund for cancelled order ${order.id}`,
            debitAccountId: escrowAccount.id,
            creditAccountId: walletAccount.id,
            amountMinor: order.totalMinor,
          });
          await tx.paymentIntent.update({
            where: { id: refundIntent.id },
            data: { ledgerTxId: ledgerTx.id },
          });
          refundIntentId = refundIntent.id;
          await OutboxWorkerService.enqueue(tx, {
            topic: "ORDER_REFUNDED",
            dedupeKey: `order-refunded:${order.id}`,
            aggregateKind: "order",
            aggregateId: order.id,
            payload: {
              recipientId: order.farmerId,
              linkKind: "order",
              linkId: order.id,
            },
          });
        }

        const updated = await tx.order.update({
          where: { id: order.id },
          data: {
            status: "CANCELLED",
            cancelReason: d.reason.trim(),
            refundIntentId,
            version: { increment: 1 },
          },
          include: { items: true },
        });
        await tx.auditEvent.create({
          data: {
            actorId: p.userId,
            actorKind: "USER",
            action: "ORDER_CANCELLED",
            targetKind: "order",
            targetId: order.id,
            metadata: { refunded: Boolean(refundIntentId), reason: d.reason.trim() },
          },
        });
        return updated;
      },
    );
  }

  async advanceFulfillment(
    p: AccountPrincipal,
    orderId: string,
    key: string | undefined,
    version: number,
    d: AdvanceFulfillmentDto,
  ) {
    return this.command(
      p,
      key,
      `order.fulfillment:${orderId}`,
      { version, d },
      async (tx) => {
        await this.requireAdmin(tx, p);
        await tx.$queryRaw`SELECT id FROM palito.orders WHERE id = ${orderId}::uuid FOR UPDATE`;
        const order = await tx.order.findUnique({ where: { id: orderId } });
        if (!order) throw new NotFoundException();
        if (order.version !== version) throw new ConflictException();
        const allowedPrev: Record<string, string> = {
          PACKED: "PAID",
          SHIPPED: "PACKED",
          DELIVERED: "SHIPPED",
        };
        if (order.status !== allowedPrev[d.status]) {
          throw new ConflictException(
            `Order must be ${allowedPrev[d.status]} before advancing to ${d.status}`,
          );
        }
        const ev = await tx.fulfillmentEvent.create({
          data: {
            orderId: order.id,
            actorId: p.userId,
            status: d.status,
            note: d.note.trim(),
          },
        });
        const updated = await tx.order.update({
          where: { id: order.id },
          data: { status: d.status, version: { increment: 1 } },
          include: { fulfillmentEvents: true },
        });
        await OutboxWorkerService.enqueue(tx, {
          topic: "ORDER_FULFILLMENT_UPDATED",
          dedupeKey: `order-fulfillment:${ev.id}`,
          aggregateKind: "order",
          aggregateId: order.id,
          payload: {
            recipientId: order.farmerId,
            linkKind: "order",
            linkId: order.id,
          },
        });
        return updated;
      },
    );
  }

  // ==================== M8e: Admin Users, Published Content & Audited Exports ====================

  async listAdminUsers(p: AccountPrincipal, q: AdminUsersPageDto = {}) {
    this.requireExtensionsEnabled();
    return this.db.prisma.$transaction(async (tx) => {
      await this.requireAdmin(tx, p);
      const limit = q.limit ?? 25;
      const after = parseCursor(q.cursor);
      const rows = await tx.user.findMany({
        where: {
          ...(q.status ? { status: q.status } : {}),
          ...(after
            ? {
                OR: [
                  { createdAt: { gt: after.createdAt } },
                  { createdAt: after.createdAt, id: { gt: after.id } },
                ],
              }
            : {}),
        },
        select: {
          id: true,
          displayName: true,
          locale: true,
          status: true,
          createdAt: true,
          memberships: {
            select: { organizationId: true, role: true, status: true },
          },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limit + 1,
      });
      const more = rows.length > limit;
      const items = rows.slice(0, limit);
      return json({ items, nextCursor: more ? encodeCursor(items.at(-1)) : null });
    });
  }

  async createContent(
    p: AccountPrincipal,
    key: string | undefined,
    d: SaveContentDto,
  ) {
    return this.command(p, key, "content.create", d, async (tx) => {
      await this.requireAdmin(tx, p);
      const existing = await tx.educationalContent.findUnique({
        where: { slug: d.slug.trim() },
      });
      if (existing) throw new ConflictException("Duplicate content slug");
      const content = await tx.educationalContent.create({
        data: {
          slug: d.slug.trim(),
          titleBn: d.titleBn.trim(),
          titleEn: d.titleEn.trim(),
          bodyBn: d.bodyBn.trim(),
          bodyEn: d.bodyEn.trim(),
          category: d.category,
          status: "DRAFT",
          authorId: p.userId,
        },
      });
      await tx.auditEvent.create({
        data: {
          actorId: p.userId,
          actorKind: "USER",
          action: "CONTENT_DRAFT_CREATED",
          targetKind: "educational_content",
          targetId: content.id,
          metadata: { slug: content.slug, category: content.category },
        },
      });
      return content;
    });
  }

  async updateContent(
    p: AccountPrincipal,
    id: string,
    key: string | undefined,
    version: number,
    d: SaveContentDto,
  ) {
    return this.command(
      p,
      key,
      `content.update:${id}`,
      { version, d },
      async (tx) => {
        await this.requireAdmin(tx, p);
        const before = await tx.educationalContent.findUnique({ where: { id } });
        if (!before) throw new NotFoundException();
        const updated = await tx.educationalContent.updateMany({
          where: { id, version },
          data: {
            slug: d.slug.trim(),
            titleBn: d.titleBn.trim(),
            titleEn: d.titleEn.trim(),
            bodyBn: d.bodyBn.trim(),
            bodyEn: d.bodyEn.trim(),
            category: d.category,
            version: { increment: 1 },
          },
        });
        if (!updated.count) throw new ConflictException();
        return tx.educationalContent.findUniqueOrThrow({ where: { id } });
      },
    );
  }

  async publishContent(
    p: AccountPrincipal,
    id: string,
    key: string | undefined,
    version: number,
  ) {
    return this.command(
      p,
      key,
      `content.publish:${id}`,
      { version },
      async (tx) => {
        await this.requireAdmin(tx, p);
        const before = await tx.educationalContent.findUnique({ where: { id } });
        if (!before) throw new NotFoundException();
        const now = new Date();
        const updated = await tx.educationalContent.updateMany({
          where: { id, version, status: "DRAFT" },
          data: {
            status: "PUBLISHED",
            publishedById: p.userId,
            publishedAt: now,
            version: { increment: 1 },
          },
        });
        if (!updated.count) throw new ConflictException();
        await tx.auditEvent.create({
          data: {
            actorId: p.userId,
            actorKind: "USER",
            action: "CONTENT_PUBLISHED",
            targetKind: "educational_content",
            targetId: id,
            metadata: { slug: before.slug },
          },
        });
        return tx.educationalContent.findUniqueOrThrow({ where: { id } });
      },
    );
  }

  async listPublishedContent(q: ContentPageDto = {}) {
    this.requireExtensionsEnabled();
    return this.listContent(this.db.prisma, q, true);
  }

  async listAdminContent(p: AccountPrincipal, q: ContentPageDto = {}) {
    this.requireExtensionsEnabled();
    return this.db.prisma.$transaction(async (tx) => {
      await this.requireAdmin(tx, p);
      return this.listContent(tx, q, false);
    });
  }

  private async listContent(tx: Tx, q: ContentPageDto, publishedOnly: boolean) {
    const limit = q.limit ?? 25;
    const after = parseCursor(q.cursor);
    const rows = await tx.educationalContent.findMany({
      where: {
        ...(publishedOnly ? { status: "PUBLISHED" } : {}),
        ...(q.category ? { category: q.category } : {}),
        ...(after
          ? {
              OR: [
                { createdAt: { lt: after.createdAt } },
                { createdAt: after.createdAt, id: { lt: after.id } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
    });
    const more = rows.length > limit;
    const items = rows.slice(0, limit);
    return json({ items, nextCursor: more ? encodeCursor(items.at(-1)) : null });
  }

  async publishedContentDetail(id: string) {
    this.requireExtensionsEnabled();
    const content = await this.db.prisma.educationalContent.findFirst({
      where: { id, status: "PUBLISHED" },
    });
    if (!content) throw new NotFoundException();
    return json(content);
  }

  async systemReport(p: AccountPrincipal) {
    this.requireExtensionsEnabled();
    return this.db.prisma.$transaction(async (tx) => {
      await this.requireAdmin(tx, p);
      const [
        users,
        animals,
        loans,
        policies,
        claims,
        orders,
        openAlerts,
        outboxDeadLetter,
      ] = await Promise.all([
        tx.user.count(),
        tx.animal.count(),
        tx.loan.count(),
        tx.insurancePolicy.count(),
        tx.insuranceClaim.count(),
        tx.order.count(),
        tx.deviceAlert.count({ where: { status: { in: ["OPEN", "ESCALATED"] } } }),
        tx.outboxEvent.count({ where: { status: "DEAD_LETTER" } }),
      ]);
      return json({
        generatedAt: new Date().toISOString(),
        aggregates: {
          users,
          animals,
          loans,
          policies,
          claims,
          orders,
          openAlerts,
          outboxDeadLetter,
        },
      });
    });
  }

  async createExport(
    p: AccountPrincipal,
    key: string | undefined,
    d: CreateExportDto,
  ) {
    return this.command(p, key, "export.create", d, async (tx) => {
      await this.requireAdmin(tx, p);
      const summary = {
        reportKind: d.reportKind,
        fromDate: d.fromDate ?? null,
        toDate: d.toDate ?? null,
        generatedAt: new Date().toISOString(),
        usersCount: await tx.user.count(),
        animalsCount: await tx.animal.count(),
        loansCount: await tx.loan.count(),
        claimsCount: await tx.insuranceClaim.count(),
        ordersCount: await tx.order.count(),
      };
      const payloadJson = json(summary);
      const digest = sha256Hex(JSON.stringify(payloadJson));
      const expiresAt = new Date(Date.now() + 24 * 3_600_000);
      const job = await tx.exportJob.create({
        data: {
          actorId: p.userId,
          reportKind: d.reportKind,
          filters: { fromDate: d.fromDate ?? null, toDate: d.toDate ?? null },
          payloadJson: payloadJson as Prisma.InputJsonValue,
          sha256: digest,
          expiresAt,
        },
      });
      await tx.auditEvent.create({
        data: {
          actorId: p.userId,
          actorKind: "USER",
          action: "ADMIN_EXPORT_CREATED",
          targetKind: "export_job",
          targetId: job.id,
          metadata: { reportKind: d.reportKind, sha256: digest },
        },
      });
      return job;
    });
  }

  async downloadExport(p: AccountPrincipal, id: string) {
    this.requireExtensionsEnabled();
    return this.db.prisma.$transaction(async (tx) => {
      await this.requireAdmin(tx, p);
      const job = await tx.exportJob.findUnique({ where: { id } });
      if (!job || job.actorId !== p.userId) {
        throw new NotFoundException();
      }
      if (job.expiresAt.getTime() <= Date.now()) {
        throw new ConflictException("Export download link has expired");
      }
      await tx.auditEvent.create({
        data: {
          actorId: p.userId,
          actorKind: "USER",
          action: "ADMIN_EXPORT_DOWNLOADED",
          targetKind: "export_job",
          targetId: job.id,
          metadata: { reportKind: job.reportKind },
        },
      });
      return json({
        id: job.id,
        reportKind: job.reportKind,
        sha256: job.sha256,
        expiresAt: job.expiresAt,
        payload: job.payloadJson,
      });
    });
  }
}
