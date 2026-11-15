import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { createHash } from "node:crypto";
import { Prisma } from "../generated/prisma/client.js";
import type { AccountPrincipal } from "../identity/accounts.js";
import { administrator } from "../identity/staff.js";
import { APP_CONFIG, type AppConfig } from "../platform/config.js";
import { DatabaseService } from "../platform/database.js";
import type { PageDto } from "../care/dto.js";
import type {
  AdherenceDto,
  AuditEventsPageDto,
  MarkNotificationsReadDto,
  NotificationPrefsDto,
  NotificationsPageDto,
} from "./dto.js";
import { validateAdherenceDate } from "./ops-math.js";

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
    throw new BadRequestException();
  }
  return date;
}

function pageInput(query: PageDto) {
  let after: { createdAt: Date; id: string } | undefined;
  if (query.cursor) {
    try {
      const parsed = JSON.parse(
        Buffer.from(query.cursor, "base64url").toString(),
      );
      if (
        !Array.isArray(parsed) ||
        parsed.length !== 2 ||
        typeof parsed[0] !== "string" ||
        typeof parsed[1] !== "string" ||
        !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(
          parsed[1],
        )
      ) {
        throw new Error("Invalid cursor");
      }
      after = { createdAt: instant(parsed[0]), id: parsed[1] };
    } catch {
      throw new BadRequestException();
    }
  }
  return {
    limit: query.limit ?? 25,
    where: after
      ? {
          OR: [
            { createdAt: { gt: after.createdAt } },
            { createdAt: after.createdAt, id: { gt: after.id } },
          ],
        }
      : {},
  };
}

function page<T extends { id: string; createdAt: Date }>(
  rows: T[],
  limit: number,
) {
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
  });
}

@Injectable()
export class OpsService {
  constructor(
    private readonly db: DatabaseService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  private async verifyAdmin(tx: Tx, p: AccountPrincipal): Promise<void> {
    administrator(p);
    const active = await tx.membership.findFirst({
      where: {
        userId: p.userId,
        role: "ADMIN",
        status: "ACTIVE",
        user: { status: "ACTIVE" },
        organization: { status: "ACTIVE", kind: "PLATFORM" },
      },
      select: { id: true },
    });
    if (!active) throw new ForbiddenException();
  }

  private async command<T>(
    p: AccountPrincipal,
    key: string | undefined,
    operation: string,
    payload: unknown,
    run: (tx: Tx) => Promise<T>,
    recheck?: (tx: Tx) => Promise<void>,
  ): Promise<T> {
    if (!key || !/^[A-Za-z0-9_-]{8,100}$/.test(key)) {
      throw new BadRequestException();
    }
    const hash = createHash("sha256")
      .update(JSON.stringify(canonical(payload)))
      .digest("hex");
    try {
      return await this.db.prisma.$transaction(
        async (tx) => {
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${p.userId + ":" + key}, 0))`;
          const current = await tx.user.findUnique({
            where: { id: p.userId },
            select: { status: true },
          });
          if (current?.status !== "ACTIVE") throw new ForbiddenException();
          const previous = await tx.careCommand.findUnique({
            where: { actorId_key: { actorId: p.userId, key } },
          });
          if (previous) {
            if (recheck) await recheck(tx);
            if (
              previous.operation !== operation ||
              previous.payloadHash !== hash
            ) {
              throw new ConflictException();
            }
            return previous.result as unknown as T;
          }
          const result = json(await run(tx));
          await tx.careCommand.create({
            data: {
              actorId: p.userId,
              key,
              operation,
              payloadHash: hash,
              result: result as Prisma.InputJsonValue,
            },
          });
          return result;
        },
        { maxWait: 5000, timeout: 10000 },
      );
    } catch (error) {
      const e = error as { code?: string };
      if (["P2002", "P2034"].includes(e.code ?? "")) {
        throw new ConflictException();
      }
      throw error;
    }
  }

  async getPreferences(p: AccountPrincipal) {
    const row = await this.db.prisma.notificationPreference.findUnique({
      where: { userId: p.userId },
    });
    return json({
      userId: p.userId,
      inAppEnabled: row?.inAppEnabled ?? true,
      smsEnabled: row?.smsEnabled ?? false,
      pushEnabled: row?.pushEnabled ?? false,
      consentVersion: row?.consentVersion ?? "notify-v1",
      version: row?.version ?? 0,
      channelMode: this.config.NOTIFICATION_CHANNEL_MODE,
    });
  }

  updatePreferences(
    p: AccountPrincipal,
    key: string | undefined,
    version: number,
    dto: NotificationPrefsDto,
  ) {
    return this.command(
      p,
      key,
      "notification.preferences",
      { version, dto },
      async (tx) => {
        const existing = await tx.notificationPreference.findUnique({
          where: { userId: p.userId },
        });
        if (!existing) {
          if (version !== 0) throw new ConflictException();
          const created = await tx.notificationPreference.create({
            data: {
              userId: p.userId,
              inAppEnabled: dto.inAppEnabled,
              smsEnabled: dto.smsEnabled,
              pushEnabled: dto.pushEnabled,
              consentVersion: dto.consentVersion,
              version: 1,
              updatedAt: new Date(),
            },
          });
          return {
            userId: p.userId,
            inAppEnabled: created.inAppEnabled,
            smsEnabled: created.smsEnabled,
            pushEnabled: created.pushEnabled,
            consentVersion: created.consentVersion,
            version: created.version,
          };
        }
        const updated = await tx.notificationPreference.updateMany({
          where: { userId: p.userId, version },
          data: {
            inAppEnabled: dto.inAppEnabled,
            smsEnabled: dto.smsEnabled,
            pushEnabled: dto.pushEnabled,
            consentVersion: dto.consentVersion,
            version: { increment: 1 },
            updatedAt: new Date(),
          },
        });
        if (updated.count !== 1) throw new ConflictException();
        return {
          userId: p.userId,
          inAppEnabled: dto.inAppEnabled,
          smsEnabled: dto.smsEnabled,
          pushEnabled: dto.pushEnabled,
          consentVersion: dto.consentVersion,
          version: version + 1,
        };
      },
    );
  }

  async listNotifications(p: AccountPrincipal, q: NotificationsPageDto) {
    const paging = pageInput(q);
    const unreadFilter = q.unreadOnly === "true" ? { readAt: null } : {};
    const [rows, unreadCount] = await Promise.all([
      this.db.prisma.notification.findMany({
        where: {
          recipientId: p.userId,
          ...unreadFilter,
          ...paging.where,
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: paging.limit + 1,
      }),
      this.db.prisma.notification.count({
        where: { recipientId: p.userId, readAt: null },
      }),
    ]);
    const paged = page(rows, paging.limit);
    return {
      ...paged,
      unreadCount,
      channelMode: this.config.NOTIFICATION_CHANNEL_MODE,
    };
  }

  markRead(
    p: AccountPrincipal,
    key: string | undefined,
    dto: MarkNotificationsReadDto,
  ) {
    if ((!dto.ids || dto.ids.length === 0) && !dto.readBefore) {
      throw new BadRequestException();
    }
    const cutoff = dto.readBefore ? instant(dto.readBefore) : undefined;
    return this.command(
      p,
      key,
      "notifications.read",
      dto,
      async (tx) => {
        const now = new Date();
        const where: Prisma.NotificationWhereInput = {
          recipientId: p.userId,
          readAt: null,
          ...(dto.ids ? { id: { in: dto.ids } } : {}),
          ...(cutoff ? { createdAt: { lte: cutoff } } : {}),
        };
        const updated = await tx.notification.updateMany({
          where,
          data: { readAt: now },
        });
        const unreadCount = await tx.notification.count({
          where: { recipientId: p.userId, readAt: null },
        });
        return { markedCount: updated.count, unreadCount };
      },
    );
  }

  recordAdherence(
    p: AccountPrincipal,
    reminderId: string,
    key: string | undefined,
    dto: AdherenceDto,
  ) {
    const localDate = validateAdherenceDate(dto.localDate);
    return this.command(
      p,
      key,
      `reminder.adherence:${reminderId}`,
      dto,
      async (tx) => {
        const reminder = await tx.careReminder.findFirst({
          where: {
            id: reminderId,
            ownerId: p.userId,
            animal: { ownerId: p.userId },
          },
        });
        if (!reminder) throw new NotFoundException();
        const existing = await tx.reminderAdherenceEvent.findUnique({
          where: {
            reminderId_localDate: { reminderId, localDate },
          },
        });
        if (existing) throw new ConflictException();
        const created = await tx.reminderAdherenceEvent.create({
          data: {
            reminderId,
            ownerId: p.userId,
            localDate,
            status: dto.status,
          },
        });
        return {
          id: created.id,
          reminderId,
          localDate: dto.localDate,
          status: created.status,
          recordedAt: created.recordedAt,
        };
      },
      async (tx) => {
        const reminder = await tx.careReminder.findFirst({
          where: {
            id: reminderId,
            ownerId: p.userId,
            animal: { ownerId: p.userId },
          },
        });
        if (!reminder) throw new NotFoundException();
      },
    );
  }

  async systemHealth(p: AccountPrincipal) {
    return this.db.prisma.$transaction(async (tx) => {
      await this.verifyAdmin(tx, p);
      const now = new Date();
      const [pending, processing, completed, deadLetter, staleLeases] =
        await Promise.all([
          tx.outboxEvent.count({ where: { status: "PENDING" } }),
          tx.outboxEvent.count({ where: { status: "PROCESSING" } }),
          tx.outboxEvent.count({ where: { status: "COMPLETED" } }),
          tx.outboxEvent.count({ where: { status: "DEAD_LETTER" } }),
          tx.outboxEvent.count({
            where: { status: "PROCESSING", lockedUntil: { lt: now } },
          }),
        ]);
      return {
        status: "ok",
        measuredAt: now.toISOString(),
        workerEnabled: this.config.WORKER_ENABLED,
        notificationChannelMode: this.config.NOTIFICATION_CHANNEL_MODE,
        financeSandboxEnabled: this.config.FINANCE_SANDBOX_ENABLED,
        outbox: {
          pending,
          processing,
          completed,
          deadLetter,
          staleLeases,
        },
      };
    });
  }

  async deadLetters(p: AccountPrincipal, q: PageDto) {
    const paging = pageInput(q);
    return this.db.prisma.$transaction(async (tx) => {
      await this.verifyAdmin(tx, p);
      const rows = await tx.outboxEvent.findMany({
        where: { status: "DEAD_LETTER", ...paging.where },
        include: {
          jobAttempts: {
            orderBy: { attemptNumber: "desc" },
            take: 3,
          },
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: paging.limit + 1,
      });
      return page(rows, paging.limit);
    });
  }

  retryDeadLetter(
    p: AccountPrincipal,
    id: string,
    key: string | undefined,
  ) {
    administrator(p);
    return this.command(
      p,
      key,
      `outbox.retry:${id}`,
      {},
      async (tx) => {
        await this.verifyAdmin(tx, p);
        const event = await tx.outboxEvent.findUnique({ where: { id } });
        if (!event) throw new NotFoundException();
        if (event.status !== "DEAD_LETTER") throw new ConflictException();
        const now = new Date();
        await tx.outboxEvent.update({
          where: { id },
          data: {
            status: "PENDING",
            attempts: 0,
            lockedUntil: null,
            lockOwner: null,
            lastErrorCode: null,
            nextAttemptAt: now,
          },
        });
        await tx.auditEvent.create({
          data: {
            actorId: p.userId,
            actorKind: "USER",
            action: "OUTBOX_DEAD_LETTER_RETRIED",
            targetKind: "outbox_event",
            targetId: id,
            metadata: { topic: event.topic },
          },
        });
        return { id, status: "PENDING" };
      },
      (tx) => this.verifyAdmin(tx, p),
    );
  }

  async auditEvents(p: AccountPrincipal, q: AuditEventsPageDto) {
    const paging = pageInput(q);
    return this.db.prisma.$transaction(async (tx) => {
      await this.verifyAdmin(tx, p);
      const rows = await tx.auditEvent.findMany({
        where: {
          ...(q.targetKind ? { targetKind: q.targetKind } : {}),
          ...(q.targetId ? { targetId: q.targetId } : {}),
          ...paging.where,
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: paging.limit + 1,
      });
      return page(rows, paging.limit);
    });
  }
}
