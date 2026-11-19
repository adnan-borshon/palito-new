import { Inject, Injectable, type OnApplicationShutdown } from "@nestjs/common";
import type { Logger } from "pino";
import { Prisma } from "../generated/prisma/client.js";
import { APP_CONFIG, type AppConfig } from "../platform/config.js";
import { DatabaseService } from "../platform/database.js";
import { APP_LOGGER } from "../platform/logger.js";
import {
  computeBackoffMs,
  dhakaDateString,
  minimalNotificationCopy,
} from "./ops-math.js";

type Tx = Prisma.TransactionClient;

export interface OutboxEnqueueInput {
  topic: string;
  dedupeKey: string;
  aggregateKind: string;
  aggregateId: string;
  payload: Prisma.InputJsonObject;
  nextAttemptAt?: Date;
}

export interface ProcessBatchOptions {
  now?: Date;
  batchSize?: number;
  faultHook?: (ctx: {
    eventId: string;
    topic: string;
    dedupeKey: string;
    stage: "before_send" | "after_send";
  }) => Promise<void> | void;
}

@Injectable()
export class OutboxWorkerService implements OnApplicationShutdown {
  private timer?: ReturnType<typeof setInterval>;
  private stopped = false;

  constructor(
    private readonly db: DatabaseService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    @Inject(APP_LOGGER) private readonly logger: Logger,
  ) {}

  startBackgroundLoop(workerId = "palito-worker-loop"): void {
    if (!this.config.WORKER_ENABLED || this.timer) return;
    this.timer = setInterval(() => {
      if (this.stopped) return;
      void this.runCycle(workerId).catch(() => {
        this.logger.error({ event: "outbox_worker_cycle_failed" });
      });
    }, this.config.WORKER_POLL_MS);
    this.timer.unref?.();
  }

  onApplicationShutdown(): void {
    this.stopped = true;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  static async enqueue(
    tx: Tx,
    input: OutboxEnqueueInput,
  ): Promise<{ id: string }> {
    await tx.outboxEvent.createMany({
      data: [
        {
          topic: input.topic,
          dedupeKey: input.dedupeKey,
          aggregateKind: input.aggregateKind,
          aggregateId: input.aggregateId,
          payload: input.payload,
          nextAttemptAt: input.nextAttemptAt ?? new Date(),
        },
      ],
      skipDuplicates: true,
    });
    return tx.outboxEvent.findUniqueOrThrow({
      where: { dedupeKey: input.dedupeKey },
      select: { id: true },
    });
  }

  async enqueue(tx: Tx, input: OutboxEnqueueInput): Promise<{ id: string }> {
    return OutboxWorkerService.enqueue(tx, input);
  }

  /** Reclaims crashed/stalled PROCESSING leases whose locked_until has passed. */
  async reclaimExpiredLeases(
    workerId: string,
    now: Date = new Date(),
  ): Promise<number> {
    return this.db.prisma.$transaction(async (tx) => {
      const expired = await tx.$queryRaw<
        { id: string; attempts: number; max_attempts: number }[]
      >`
        SELECT id, attempts, max_attempts
        FROM palito.outbox_events
        WHERE status = 'PROCESSING' AND locked_until IS NOT NULL AND locked_until < ${now}
        ORDER BY locked_until ASC, id ASC
        LIMIT 50
        FOR UPDATE SKIP LOCKED
      `;
      for (const row of expired) {
        await tx.jobAttempt.updateMany({
          where: { outboxEventId: row.id, outcome: "STARTED" },
          data: {
            outcome: "RECONCILED",
            errorCode: "LEASE_EXPIRED_RECONCILED",
            finishedAt: now,
          },
        });
        const dead = row.attempts >= row.max_attempts;
        await tx.outboxEvent.update({
          where: { id: row.id },
          data: {
            status: dead ? "DEAD_LETTER" : "PENDING",
            lockedUntil: null,
            lockOwner: null,
            lastErrorCode: "LEASE_EXPIRED_RECONCILED",
            nextAttemptAt: dead
              ? now
              : new Date(now.getTime() + computeBackoffMs(row.attempts)),
          },
        });
        if (dead) {
          await tx.auditEvent.create({
            data: {
              actorKind: "WORKER",
              action: "OUTBOX_DEAD_LETTER",
              targetKind: "outbox_event",
              targetId: row.id,
              metadata: { workerId, reason: "LEASE_EXPIRED_MAX_ATTEMPTS" },
            },
          });
        }
      }
      return expired.length;
    });
  }

  /**
   * Sweeps due reminders and 4-hour overdue unacknowledged reminders into the transactional outbox.
   */
  async sweepReminders(
    workerId: string,
    now: Date = new Date(),
  ): Promise<{ dueDispatched: number; escalated: number }> {
    const dueDispatched = await this.db.prisma.$transaction(async (tx) => {
      const due = await tx.$queryRaw<
        {
          id: string;
          animal_id: string;
          owner_id: string;
          due_at: Date;
        }[]
      >`
        SELECT id, animal_id, owner_id, due_at
        FROM palito.care_reminders
        WHERE enabled = true AND dispatched_at IS NULL AND due_at <= ${now}
        ORDER BY due_at ASC, id ASC
        LIMIT 50
        FOR UPDATE SKIP LOCKED
      `;
      for (const r of due) {
        await tx.careReminder.update({
          where: { id: r.id },
          data: { dispatchedAt: now },
        });
        await this.enqueue(tx, {
          topic: "CARE_REMINDER_DUE",
          dedupeKey: `reminder-due:${r.id}`,
          aggregateKind: "care_reminder",
          aggregateId: r.id,
          payload: {
            recipientId: r.owner_id,
            reminderId: r.id,
            animalId: r.animal_id,
            linkKind: "reminder",
            linkId: r.id,
          },
          nextAttemptAt: now,
        });
      }
      return due.length;
    });

    const fourHoursAgo = new Date(now.getTime() - 4 * 3_600_000);
    const escalated = await this.db.prisma.$transaction(async (tx) => {
      const overdue = await tx.$queryRaw<
        {
          id: string;
          animal_id: string;
          owner_id: string;
          due_at: Date;
        }[]
      >`
        SELECT r.id, r.animal_id, r.owner_id, r.due_at
        FROM palito.care_reminders r
        WHERE r.enabled = true
          AND r.escalated_at IS NULL
          AND r.due_at <= ${fourHoursAgo}
        ORDER BY r.due_at ASC, r.id ASC
        LIMIT 50
        FOR UPDATE SKIP LOCKED
      `;
      let count = 0;
      for (const r of overdue) {
        const dueLocalDate = new Date(
          `${dhakaDateString(r.due_at)}T00:00:00.000Z`,
        );
        const takenOrSkipped = await tx.reminderAdherenceEvent.findFirst({
          where: {
            reminderId: r.id,
            localDate: { gte: dueLocalDate },
          },
          select: { id: true },
        });
        await tx.careReminder.update({
          where: { id: r.id },
          data: { escalatedAt: now },
        });
        if (!takenOrSkipped) {
          count += 1;
          await this.enqueue(tx, {
            topic: "CARE_REMINDER_ESCALATION",
            dedupeKey: `reminder-escalation:${r.id}`,
            aggregateKind: "care_reminder",
            aggregateId: r.id,
            payload: {
              recipientId: r.owner_id,
              reminderId: r.id,
              animalId: r.animal_id,
              linkKind: "reminder",
              linkId: r.id,
            },
            nextAttemptAt: now,
          });
          await tx.auditEvent.create({
            data: {
              actorKind: "WORKER",
              action: "REMINDER_ESCALATED_4H",
              targetKind: "care_reminder",
              targetId: r.id,
              metadata: { workerId, animalId: r.animal_id },
            },
          });
        }
      }
      return count;
    });

    return { dueDispatched, escalated };
  }

  /** Deletes abandoned PENDING or QUARANTINED private files past their expiry window; READY files are never touched. */
  async cleanupExpiredFiles(
    workerId = "palito-worker",
    now: Date = new Date(),
  ): Promise<number> {
    return this.db.prisma.$transaction(async (tx) => {
      const deleted = await tx.privateFile.deleteMany({
        where: {
          status: { in: ["PENDING", "QUARANTINED"] },
          expiresAt: { lt: now },
        },
      });
      if (deleted.count > 0) {
        await tx.auditEvent.create({
          data: {
            actorKind: "WORKER",
            action: "EXPIRED_UPLOAD_CLEANUP",
            targetKind: "private_file",
            metadata: { workerId, removedCount: deleted.count },
          },
        });
      }
      return deleted.count;
    });
  }

  /** Claims and processes a batch of pending outbox events with deduplicated notification delivery. */
  async processBatch(
    workerId = "palito-worker",
    options: ProcessBatchOptions = {},
  ): Promise<{
    reclaimed: number;
    processed: number;
    succeeded: number;
    failed: number;
  }> {
    const now = options.now ?? new Date();
    const batchSize = options.batchSize ?? this.config.WORKER_BATCH_SIZE;
    const reclaimed = await this.reclaimExpiredLeases(workerId, now);

    const claimed = await this.db.prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<
        {
          id: string;
          topic: string;
          dedupe_key: string;
          payload: Record<string, unknown>;
          attempts: number;
          max_attempts: number;
        }[]
      >`
        SELECT id, topic, dedupe_key, payload, attempts, max_attempts
        FROM palito.outbox_events
        WHERE status = 'PENDING' AND next_attempt_at <= ${now}
        ORDER BY next_attempt_at ASC, id ASC
        LIMIT ${batchSize}
        FOR UPDATE SKIP LOCKED
      `;
      const leaseUntil = new Date(now.getTime() + 60_000);
      const result: {
        id: string;
        topic: string;
        dedupeKey: string;
        payload: Record<string, unknown>;
        attemptNumber: number;
        attemptBudgetUsed: number;
        maxAttempts: number;
      }[] = [];
      for (const row of rows) {
        const attemptBudgetUsed = row.attempts + 1;
        const history = await tx.jobAttempt.aggregate({
          where: { outboxEventId: row.id },
          _max: { attemptNumber: true },
        });
        const attemptNumber = (history._max.attemptNumber ?? 0) + 1;
        await tx.outboxEvent.update({
          where: { id: row.id },
          data: {
            status: "PROCESSING",
            attempts: attemptBudgetUsed,
            lockedUntil: leaseUntil,
            lockOwner: workerId,
          },
        });
        await tx.jobAttempt.create({
          data: {
            outboxEventId: row.id,
            attemptNumber,
            workerId,
            outcome: "STARTED",
            startedAt: now,
          },
        });
        result.push({
          id: row.id,
          topic: row.topic,
          dedupeKey: row.dedupe_key,
          payload: row.payload ?? {},
          attemptNumber,
          attemptBudgetUsed,
          maxAttempts: row.max_attempts,
        });
      }
      return result;
    });

    let succeeded = 0;
    let failed = 0;

    for (const item of claimed) {
      try {
        if (options.faultHook) {
          await options.faultHook({
            eventId: item.id,
            topic: item.topic,
            dedupeKey: item.dedupeKey,
            stage: "before_send",
          });
        }
        const providerRef = await this.deliverNotification(item, now);
        if (options.faultHook) {
          await options.faultHook({
            eventId: item.id,
            topic: item.topic,
            dedupeKey: item.dedupeKey,
            stage: "after_send",
          });
        }
        await this.db.prisma.$transaction(async (tx) => {
          await tx.$queryRaw`SELECT id FROM palito.outbox_events WHERE id = ${item.id}::uuid FOR UPDATE`;
          const attempt = await tx.jobAttempt.updateMany({
            where: {
              outboxEventId: item.id,
              attemptNumber: item.attemptNumber,
              outcome: "STARTED",
            },
            data: {
              outcome: "SUCCEEDED",
              providerRef,
              finishedAt: new Date(),
            },
          });
          if (!attempt.count) return;
          await tx.outboxEvent.update({
            where: { id: item.id },
            data: {
              status: "COMPLETED",
              lockedUntil: null,
              lockOwner: null,
              lastErrorCode: null,
              processedAt: new Date(),
            },
          });
        });
        succeeded += 1;
      } catch (err) {
        failed += 1;
        const code =
          err instanceof Error && /^[A-Z0-9_]{3,64}$/.test(err.message)
            ? err.message
            : "DELIVERY_FAILURE";
        const dead = item.attemptBudgetUsed >= item.maxAttempts;
        await this.db.prisma.$transaction(async (tx) => {
          await tx.$queryRaw`SELECT id FROM palito.outbox_events WHERE id = ${item.id}::uuid FOR UPDATE`;
          const attempt = await tx.jobAttempt.updateMany({
            where: {
              outboxEventId: item.id,
              attemptNumber: item.attemptNumber,
              outcome: "STARTED",
            },
            data: {
              outcome: "FAILED",
              errorCode: code,
              finishedAt: new Date(),
            },
          });
          if (!attempt.count) return;
          await tx.outboxEvent.update({
            where: { id: item.id },
            data: {
              status: dead ? "DEAD_LETTER" : "PENDING",
              lockedUntil: null,
              lockOwner: null,
              lastErrorCode: code,
              nextAttemptAt: dead
                ? now
                : new Date(
                    now.getTime() + computeBackoffMs(item.attemptBudgetUsed),
                  ),
            },
          });
          if (dead) {
            await tx.auditEvent.create({
              data: {
                actorKind: "WORKER",
                action: "OUTBOX_DEAD_LETTER",
                targetKind: "outbox_event",
                targetId: item.id,
                metadata: { workerId, errorCode: code },
              },
            });
          }
        });
      }
    }

    return {
      reclaimed,
      processed: claimed.length,
      succeeded,
      failed,
    };
  }

  private async deliverNotification(
    item: {
      id: string;
      topic: string;
      dedupeKey: string;
      payload: Record<string, unknown>;
    },
    now: Date,
  ): Promise<string> {
    const recipientId =
      typeof item.payload.recipientId === "string"
        ? item.payload.recipientId
        : undefined;
    if (!recipientId) {
      return `noop:${item.dedupeKey}`;
    }

    const recipient = await this.db.prisma.user.findUnique({
      where: { id: recipientId },
      include: { notificationPreference: true },
    });
    if (!recipient || recipient.status !== "ACTIVE") {
      return `skipped-inactive:${item.dedupeKey}`;
    }

    const copy = minimalNotificationCopy(item.topic);
    const inAppAllowed =
      copy.urgent || (recipient.notificationPreference?.inAppEnabled ?? true);
    if (!inAppAllowed) {
      return `suppressed-preference:${item.dedupeKey}`;
    }

    const linkKind =
      typeof item.payload.linkKind === "string"
        ? item.payload.linkKind
        : undefined;
    const linkId =
      typeof item.payload.linkId === "string" &&
      /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(
        item.payload.linkId,
      )
        ? item.payload.linkId
        : undefined;

    await this.db.prisma.notification.createMany({
      data: [
        {
          recipientId,
          category: copy.category,
          title: copy.title,
          body: copy.body,
          linkKind: linkKind ?? null,
          linkId: linkId ?? null,
          dedupeKey: item.dedupeKey,
          createdAt: now,
        },
      ],
      skipDuplicates: true,
    });

    return `${this.config.NOTIFICATION_CHANNEL_MODE}:${item.dedupeKey}`;
  }

  /** Expire only unfunded, unsubmitted-to-provider loans. Keep ambiguous payments reserved. */
  async expireCollateral(now: Date) {
    if (!this.config.FINANCE_SANDBOX_ENABLED) return 0;
    return this.db.prisma.$executeRaw`
      WITH expired AS (
        SELECT l.id AS loan_id, r.id AS reservation_id
        FROM palito.loans l JOIN palito.collateral_reservations r ON r.loan_id = l.id
        WHERE l.status IN ('SUBMITTED', 'APPROVED') AND r.status = 'HELD' AND r.expires_at <= ${now}
        ORDER BY r.expires_at, r.id LIMIT 50 FOR UPDATE OF l SKIP LOCKED
      ), cancelled AS (
        UPDATE palito.loans l SET status = 'CANCELLED', version = version + 1
        FROM expired e WHERE l.id = e.loan_id RETURNING e.reservation_id
      )
      UPDATE palito.collateral_reservations r SET status = 'EXPIRED', released_at = ${now}
      FROM cancelled c WHERE r.id = c.reservation_id`;
  }

  async runCycle(
    workerId = "palito-worker",
    now: Date = new Date(),
  ): Promise<{
    dueDispatched: number;
    escalated: number;
    expiredFilesRemoved: number;
    expiredCollateral: number;
    batch: {
      reclaimed: number;
      processed: number;
      succeeded: number;
      failed: number;
    };
  }> {
    const reminders = await this.sweepReminders(workerId, now);
    const expiredFilesRemoved = await this.cleanupExpiredFiles(workerId, now);
    const expiredCollateral = await this.expireCollateral(now);
    const batch = await this.processBatch(workerId, { now });
    return {
      ...reminders,
      expiredFilesRemoved,
      expiredCollateral,
      batch,
    };
  }
}
