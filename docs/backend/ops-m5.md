# M5 jobs, notifications and recovery implementation

M5 adds reliable PostgreSQL-backed background processing (`OutboxWorkerService` and CLI entrypoint `backend/src/worker.ts`), reminder scheduling/escalation sweeps, Asia/Dhaka daily adherence recording, minimal-copy notification inbox/preferences, expired unfinalized upload cleanup, operational monitoring endpoints, and local backup/restore rehearsal.

## Runtime boundaries and configuration

- `NOTIFICATION_CHANNEL_MODE`: `'in-app-only'` (default) or `'sandbox'` (simulated SMS/push adapter records deliveries without sending live telecom SMS or FCM messages). Setting `'sandbox'` is forbidden in `NODE_ENV=production`.
- `WORKER_ENABLED`: `'false'` by default so HTTP API processes do not silently run background polling unless explicitly enabled, or the separate worker entrypoint (`npm run worker --workspace @palito/backend`) is invoked.
- `WORKER_POLL_MS` (default `5000`, `500..60000`) and `WORKER_BATCH_SIZE` (default `25`, `1..100`).
- Privacy-minimization (`minimalNotificationCopy` in `ops-math.ts`): generated in-app notifications never include clinical diagnoses, prescription medicines, phone numbers, or sensitive record contents; users inspect details inside authenticated scoped routes.
- No SMS gateway, WhatsApp Business API, or FCM live project credentials are activated. Delivery records in sandbox mode represent simulated adapter execution only.

## Transactional outbox and worker recovery

1. Domain mutations (`CareService`, `FinanceService`) enqueue events inside the same database transaction via `OutboxWorkerService.enqueue` (`createMany(..., skipDuplicates: true)` on unique `dedupeKey`), guaranteeing zero partial commits without triggering `BEFORE UPDATE` checks on duplicate enqueue calls.
2. `OutboxWorkerService.processBatch`:
   - First calls `reclaimExpiredLeases` to return stalled `PROCESSING` rows whose `lockedUntil <= now` back to `PENDING` (or `DEAD_LETTER` if `attempts >= maxAttempts`).
   - Claims eligible `PENDING` events (`nextAttemptAt <= now`) using `FOR UPDATE SKIP LOCKED`, recording a `JobAttempt` lease.
   - Delivers minimal notification rows using `dedupeKey` uniqueness (`skipDuplicates: true`), making crash-after-send recovery idempotent without duplicate inbox rows.
   - Failed deliveries schedule exponential backoff (`computeBackoffMs`) up to `maxAttempts`, moving terminal failures to `DEAD_LETTER` for manual `ADMIN` inspection and retry.
3. `OutboxWorkerService.sweepReminders`:
   - Dispatches due reminders (`CARE_REMINDER_DUE`) atomically setting `dispatchedAt`.
   - Escalates unaddressed overdue reminders 4 hours after `dueAt` (`CARE_REMINDER_ESCALATION`) unless the owner recorded `taken` or `skipped` adherence for `dhakaDateString(dueAt)`.
4. `OutboxWorkerService.cleanupExpiredFiles`:
   - Deletes abandoned `PENDING` and `QUARANTINED` `private_files` past `expiresAt` and logs `EXPIRED_UPLOAD_CLEANUP` in `audit_events`. `READY` files are never deleted.

## API contract (`/api/v1`)

| Method / path | Auth & validation | Behavior |
|---|---|---|
| `GET /me/notification-preferences` | Authenticated M3 identity | Returns `{ userId, inAppEnabled, smsEnabled, pushEnabled, consentVersion, version }` |
| `PATCH /me/notification-preferences` | Authenticated + `Idempotency-Key` + `If-Match` | Updates channel flags with `consentVersion: "notify-v1"`; stale version returns `409` |
| `GET /notifications` | Authenticated + `NotificationsPageDto` | Scoped to recipient; cursor pagination + `unreadOnly` filter; returns `{ items, nextCursor, unreadCount, channelMode }` |
| `POST /notifications/read` | Authenticated + `Idempotency-Key` | Marks owner's `ids[]` (1..100 UUIDs) or `readBefore` UTC cutoff read; foreign notification IDs are ignored (`markedCount: 0`) |
| `POST /reminders/:id/adherence-events` | Authenticated animal/reminder owner + `Idempotency-Key` | Records `taken` or `skipped` for validated `Asia/Dhaka` `localDate` (`YYYY-MM-DD`); rejects duplicate same-day records with `409` |
| `GET /admin/system-health` | Active `ADMIN` membership + MFA/recent auth context (`403` otherwise) | Reports live outbox queue counts (`pending`, `processing`, `completed`, `deadLetter`, `staleLeases`) and feature flags |
| `GET /admin/outbox/dead-letter` | `ADMIN` (`403` otherwise) | Lists dead-lettered outbox events with attempts and failure reason |
| `POST /admin/outbox/:id/retry` | `ADMIN` + `Idempotency-Key` (`403` otherwise) | Resets a `DEAD_LETTER` outbox event to `PENDING` and logs an immutable `audit_events` entry |
| `GET /admin/audit-events` | `ADMIN` (`403` otherwise) | Paginated immutable `audit_events` stream with optional `targetKind`/`targetId` filter |

## Backup and restore rehearsal

`backend/scripts/rehearse-backup-restore.mjs` (`npm run rehearse:backup-restore --workspace @palito/backend`) validates local-only loopback `pg_dump` / `pg_restore` round trips into a disposable database (`palito_restore_rehearsal_*`), checking `_prisma_migrations`, `outbox_events`, and zero unbalanced `ledger_transactions`, then drops the temporary restore database. It refuses non-development/test environments and non-loopback PostgreSQL hosts.
