# M5, M6 and M7 implementation and review checkpoint

Updated 2026-11-19. The user authorized Milestones 5 (jobs, reminders & recovery), 6 (financial foundation & lending sandbox), and 7 (insurance & claim settlement sandbox) after verified M4. **Stop for review before M8.** No production deployment/migration, merge, paid activation, real-money transfer, or live OTP/SMS campaign is included.

Read [ops M5](ops-m5.md), [lending M6](lending-m6.md), and [insurance M7](insurance-m7.md) for actual routes, state machines, SQL invariants, and sandbox boundaries. [M4 healthcare](healthcare.md) and [M3 identity](milestone-3-completion-checkpoint.md) remain active foundations.

## Implemented M5, M6 and M7 scope

- **M5 — Jobs, reminders and recovery (`20261115000600_jobs_notifications_ops`, `backend/src/ops/`, `backend/src/worker.ts`)**:
  - Transactional PostgreSQL `outbox_events` enqueue (`createMany({ skipDuplicates: true })` on unique `dedupeKey`), `FOR UPDATE SKIP LOCKED` worker batch claiming, `job_attempts` tracking, expired `PROCESSING` lease reclamation (`reclaimExpiredLeases`), exponential retry backoff (`computeBackoffMs`), and `DEAD_LETTER` triage/retry (`GET /admin/outbox/dead-letter`, `POST /admin/outbox/:id/retry`).
  - Care reminder due sweep (`CARE_REMINDER_DUE`) and 4-hour overdue escalation sweep (`CARE_REMINDER_ESCALATION`) with same-day `Asia/Dhaka` (`UTC+6`) adherence suppression (`POST /reminders/:id/adherence-events`, `taken | skipped`).
  - Privacy-minimized bilingual notification templates (`minimalNotificationCopy`, zero clinical diagnosis/prescription/phone leakage), recipient-scoped inbox (`GET /notifications`, `POST /notifications/read`), and versioned `notify-v1` preferences (`GET/PATCH /me/notification-preferences`).
  - Expired non-`READY` (`PENDING`, `QUARANTINED`) `private_files` cleanup (`cleanupExpiredFiles`), preserving `READY` evidence/photos.
  - Admin operational endpoints (`GET /admin/system-health`, `GET /admin/audit-events`), immutable `audit_events` / `notifications` database triggers, and local loopback backup/restore rehearsal script (`backend/scripts/rehearse-backup-restore.mjs`).
- **M6 — Financial foundation and lending sandbox (`20261115000700_lending_ledger_sandbox`, `backend/src/finance/`)**:
  - Explicit opt-in gate (`FINANCE_SANDBOX_ENABLED=true`, default `false` returning `503`; forbidden in `NODE_ENV=production` along with `PAYMENT_PROVIDER=sandbox`, `NOTIFICATION_CHANNEL_MODE=sandbox`, and `SANDBOX_WEBHOOK_SECRET`).
  - Immutable double-entry ledger (`ledger_accounts`, `ledger_transactions`, `ledger_entries`) enforced by a `DEFERRABLE INITIALLY DEFERRED` PostgreSQL constraint trigger verifying `SUM(DEBIT) = SUM(CREDIT)` with at least two legs per transaction, plus admin reconciliation (`GET /admin/ledger/reconciliation`).
  - Maker/checker bank collateral valuations (`POST /valuations`, `POST /valuations/:id/approve` requiring `assessorId !== approvedById` in the same active `BANK` org), collateral eligibility (`GET /animals/:id/collateral-eligibility`), and redacted bank risk projection (`GET /animals/:id/collateral-risk` with `clinicalDetailsRedacted: true`).
  - Exact 70% LTV cap (`maxLoanCap70`), expiring `sandbox-v1` quotes (`POST /loans/quotes`), loan submission (`POST /loans`) guarded by `one_live_collateral_per_animal`, bank decision (`POST /loans/:id/decision` releasing collateral on reject), disbursement (`POST /loans/:id/disburse`), calendar-month installment schedule (`buildInstallmentSchedule`), FIFO repayment allocation (`allocateRepayment`), manual reviewed grace (`POST /loans/:id/grace`), care fee intents (`POST /payments/care-fee-intents`), non-withdrawable sandbox wallet (`GET /me/wallet`), and timing-safe HMAC-SHA256 webhook verification & deduplication (`POST /webhooks/payments/sandbox`).
- **M7 — Insurance and claim settlement sandbox (`20261115000800_insurance_claim_settlement_sandbox`, `backend/src/finance/`)**:
  - Livestock policy enrollment (`POST /policies`, `ins-sandbox-v1`, guarded by `one_live_policy_per_animal`), insurer decision (`POST /policies/:id/decision` transitioning to `APPROVED_AWAITING_PREMIUM` without bypassing confirmed premium), premium payment confirmation (`POST /policies/:id/premium-intents` via `WALLET` or `SANDBOX_SIMULATOR` webhook activating `[startsAt, endsAt]`), and expired policy renewal (`POST /policies/:id/renewals`).
  - Mortality claim submission (`POST /claims` requiring incident-time active confirmed coverage, `READY` owned private `evidenceFileIds[]`, 7-day `reviewTargetAt`, and `one_live_claim_per_policy`; illness/repeat illness claims rejected per `SRS-GAP-09`).
  - Advisory review (`POST /claims/:id/review-requests` with `autonomousApprovalAllowed: false`), verified vet referral (`POST /claims/:id/referrals` issuing time-limited `ClaimReferralGrant` and scoped `CareService` private file download access), referred vet clinical opinion (`POST /claims/:id/opinions`), maker/checker claim decision (`POST /claims/:id/decision` marking approved mortality animals `DECEASED` so they cannot secure new valuations, quotes, loans, or policies), and atomic debt-first claim settlement (`POST /claims/:id/settlements`, `GET /loans/:id/settlements`, `allocateClaimSettlement`).
- **Clients (`frontend/shared`, `frontend/web`, `frontend/mobile`)**:
  - Extended `CareWorkspace` (`/care`) with M5 notifications inbox, `notify-v1` preferences form, and `Taken today` / `Skipped today` adherence actions.
  - Added `FinanceWorkspace` (`frontend/shared/src/finance-workspace.ts`, zero `DemoState` import) and `/finance` routes on Next.js web (`frontend/web/src/app/finance/page.tsx`) and Expo mobile (`frontend/mobile/src/app/finance.tsx`, `screen.native.tsx`, `screen-enabled.native.tsx`) covering both M6 lending/ledger and M7 insurance/claim settlement workflows.

## Verification evidence (executed locally on Node v24.22.3)

All local checks passed with **zero failures and zero warnings**:

- **83 executed unit, HTTP, shared domain, web workflow, and native component tests passed (0 failed, 0 skipped)**:
  - `@palito/backend`: **36 passed** (`care.test.js`, `config.test.js`, `data-contracts.test.js`, `finance.test.js`, `http.test.js`, `identity.test.js`, `logger.test.js`, `native-config.test.js`, `ops.test.js`, `setup.test.js`).
  - `@palito/shared`: **26 passed** (`care.test.ts` [4], `finance-workspace.test.ts` [4], `invariants.test.ts` [11], `journeys.test.ts` [7]).
  - `@palito/web`: **3 passed** (`src/__tests__/web-workflows.test.ts`).
  - `@palito/mobile`: **18 passed across 6 Jest test suites** (`finance.test.tsx`, `care.test.tsx`, `farmer.test.tsx`, `roles-and-journeys.test.tsx`, `lifecycle.test.tsx`, `navigation.test.ts`).
- **Schema, lint, typecheck, and production builds passed**:
  - `npm run prisma:validate --workspace @palito/backend` (valid schema across 8 migrations).
  - `npm run build:test --workspace @palito/backend` (compiles all unit and PostgreSQL integration scenarios including `ops.scenario.ts`, `finance.scenario.ts`, and `insurance.scenario.ts` against Prisma Client 7.10.1).
  - `npm run lint:all` (`@palito/mobile`, `@palito/web`, `@palito/backend` with `--max-warnings=0`).
  - `npm run typecheck` (`@palito/mobile`, `@palito/web`, `@palito/shared`, `@palito/backend`).
  - `npm run build:backend`, `npm run build:web` (11 routes including `/care` and `/finance`), and `npm run export:web`.

## Environment & rollout boundaries

- **Local PostgreSQL/Docker boundary**: PostgreSQL and Docker are not installed on this local Windows host. The PostgreSQL + Firebase Auth Emulator integration scenarios (`backend/test/integration/schema.test.ts`, including `ops.scenario.ts`, `finance.scenario.ts`, and `insurance.scenario.ts`) and `backend/scripts/rehearse-backup-restore.mjs` are compiled and typechecked locally (`npm run build:test --workspace @palito/backend`) and execute against `postgres:18.7-alpine` in GitHub Actions CI (`.github/workflows/ci.yml`); they are not claimed as executed locally.
- **Partner policy & live provider gates**: Production financial terms (B08–B11), automated SLA claims (B12), live SMS/push/payment/storage/video providers (B13), and physical Android/iOS device testing remain explicit release gates before any non-sandbox or production activation. Stop for user review before M8.
