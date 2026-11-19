# M10 deployment preparation and controlled pilot readiness report

Updated 2026-11-19. Milestone 10 prepares Palito for controlled staging/pilot rehearsal and production deployment governance without activating paid infrastructure, running production database migrations, launching real SMS/OTP campaigns, or transferring real funds.

## 1. Environment separation & least-privilege credential matrix

Configuration is validated at startup by [config.ts](file:///c:/Users/Borshon/Desktop/Palito/backend/src/platform/config.ts) and before release by [deployment-preflight.ts](file:///c:/Users/Borshon/Desktop/Palito/backend/src/platform/deployment-preflight.ts) (`npm run preflight:deploy --workspace @palito/backend`).

| Tier (`DEPLOYMENT_TIER`) | `NODE_ENV` | Templates & TLS | Authentication (`AUTH_MODE`) | Allowed pilot/sandbox switches |
|---|---|---|---|---|
| `development` | `development` | [.env.example](file:///c:/Users/Borshon/Desktop/Palito/backend/.env.example), loopback PostgreSQL | `disabled`, `emulator` (`demo-*` project), or `firebase` | All opt-in sandboxes allowed for local developer iteration |
| `test` | `test` | Ephemeral test DB (`TEST_DATABASE_URL`) | `disabled` or `emulator` (`demo-palito`) | Used by unit, HTTP, security matrix, and CI PostgreSQL suites |
| `staging` | `production` | [.env.staging.example](file:///c:/Users/Borshon/Desktop/Palito/backend/.env.staging.example), `HTTPS` origins, `sslmode=verify-full` | `firebase` (non-`demo-` project ID; emulator & Swagger forbidden) | Explicit opt-in staged pilot slices (`HEALTHCARE_NO_CHARGE_PILOT`, `FINANCE_SANDBOX_ENABLED`, `EXTENSIONS_SANDBOX_ENABLED`) |
| `production` | `production` | [.env.production.example](file:///c:/Users/Borshon/Desktop/Palito/backend/.env.production.example), `HTTPS` origins, `sslmode=verify-full` | `firebase` (non-`demo-` project ID) | **None** — fails closed if any sandbox, emulator, Swagger, or demo switch is enabled |

### Least-privilege database role separation

- **Cluster administrator (`DATABASE_ADMIN_URL`)**: Used **only** during initial database provisioning or local disposable backup/restore drills ([rehearse-backup-restore.mjs](file:///c:/Users/Borshon/Desktop/Palito/backend/scripts/rehearse-backup-restore.mjs)). Preflight rejects any `staging` or `production` API/worker runtime environment that contains `DATABASE_ADMIN_URL`.
- **Schema migrator (`MIGRATION_DATABASE_URL`, role `palito_migrator`)**: Used **only** in the one-off release migration job (`npm run migrate:deploy --workspace @palito/backend`). Owns the `palito` schema and `_prisma_migrations`; requires a distinct `>=16`-character password from `palito_runtime` and `sslmode=verify-full` on hosted tiers.
- **Application & worker runtime (`DATABASE_URL`, role `palito_runtime`)**: Used by the NestJS API (`dist/main.js`) and outbox worker (`dist/worker.js`). Has `NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS NOINHERIT`, zero DDL rights, no access to `_prisma_migrations`, and append-only trigger constraints on `audit_events`, `notifications`, `ledger_transactions`, `ledger_entries`, `clinical_amendments`, `device_telemetry_readings`, and `order_fulfillment_events`.

## 2. Reproducible build, migration release & forward-repair procedure

### Immutable 9-migration manifest (`verifyMigrationHistory`)

[deployment-preflight.ts](file:///c:/Users/Borshon/Desktop/Palito/backend/src/platform/deployment-preflight.ts) verifies the exact `SHA-256` digest of all 9 reviewed migrations before any release:

1. `20261115000100_core` (`a85d31e37053b6d1e73a104d7d761e0eaa5cad8c6ebd9b6fe59fa6aee4041c72`)
2. `20261115000200_integrity` (`32a52d22a25bbc40f0f7029e1e779184ef88a3ae34ef0a1ffe4dc3d51a48ef41`)
3. `20261115000300_sessions` (`d95e11ff5e74a7b8e803c7ea14785e188d02c6978ed7db5512ee9e6dc02a90dc`)
4. `20261115000400_identity_administration` (`66f09fe0ee59c7e22d9788fc4634894c2156810f7e8b4fe283341475e4e60b5e`)
5. `20261115000500_healthcare` (`e74325d9bbcd10d236b38999508015f5ec98c53a34e4c98fc4ffb108a56bd9c5`)
6. `20261115000600_jobs_notifications_ops` (`b61209e5378f8891978a591c299ba43a0b69c84946d2fe56b639792fca62ac9c`)
7. `20261115000700_lending_ledger_sandbox` (`c4b6bc85361f0a9149aca04b307f4cb3c8c6e56e3b8bf3c41839488223c79309`)
8. `20261115000800_insurance_claim_settlement_sandbox` (`208866db3c9d12fadfb294a27e6b6d2b01ee1d95f8fbf118483627300c984930`)
9. `20261115000900_extensions_iot_ai_commerce_content` (`dedd9b12299678b0b7a8600418ac8ad3b2231147f977ddf29f26693bfb497cb1`)

### Release & forward-repair steps

1. **Preflight & Build**:
   ```bash
   npm ci --ignore-scripts --no-audit --no-fund
   npm run prisma:validate --workspace @palito/backend
   npm run lint:all
   npm run typecheck
   npm test
   npm run preflight:deploy --workspace @palito/backend -- --require-migration-url
   npm run build:web
   npm run export:web
   ```
2. **Backup Snapshot**: Take an encrypted PostgreSQL backup before applying migrations and verify restore capability into an isolated target database (`npm run rehearse:backup-restore --workspace @palito/backend` on loopback dev/test).
3. **Expand / Backfill / Contract Migration**:
   - Future schema changes must follow **expand** (nullable/additive columns or tables compatible with existing running API/mobile clients) -> **deploy new code & backfill** -> **contract** (enforce `NOT NULL` or retire unused columns only after older mobile/web clients are retired).
   - Run `npm run migrate:deploy --workspace @palito/backend` using `MIGRATION_DATABASE_URL` (`palito_migrator`).
   - **Forward-repair policy**: Never run `prisma migrate reset`, `DROP SCHEMA`, or destructive down-migrations against staging/production data. If a migration or data backfill requires correction, halt new writes by disabling the affected feature gate, inspect `_prisma_migrations`, and apply a reviewed forward-repair migration + ledger reversal or clinical amendment.

## 3. Monitoring, SLO targets, alert ownership & rollback triggers

| Probe / Endpoint | Purpose | Target / Threshold | Owner |
|---|---|---|---|
| `GET /api/v1/health/live` | Process liveness (independent of PostgreSQL) | `200 { status: "ok" }` | `platform-operations-owner` |
| `GET /api/v1/health/ready` | Bounded `SELECT 1` DB readiness & shutdown drain status | `200 { status: "ready" }` (`503` during drain/DB outage) | `platform-operations-owner` |
| `GET /api/v1/admin/system-health` | Outbox queue counters, feature flags, and `pilotEvaluation` (`evaluatePilotOperationalHealth`) | Read `p95 <= 500ms`, write `p95 <= 800ms`, queue start `<= 60s` | `platform-operations-owner` & `backend-engineering-owner` |
| `GET /api/v1/admin/ledger/reconciliation` | Double-entry ledger balance & account totals | `balanced: true`, `unbalancedTransactionCount: 0` | `product-owner` & `backend-engineering-owner` |
| Backup / Restore RPO & RTO | Candidate recovery targets (pending hosting budget confirmation) | Candidate `RPO <= 1h`, `RTO <= 4h` | `platform-operations-owner` |

### Automated rollback triggers (`evaluatePilotOperationalHealth`)

- `UNBALANCED_LEDGER_DETECTED` (`ROLLBACK_REQUIRED`): Immediately set `FINANCE_SANDBOX_ENABLED=false` and `EXTENSIONS_SANDBOX_ENABLED=false`, restart API/worker instances, and audit ledger transactions via `GET /api/v1/admin/ledger/reconciliation`.
- `OUTBOX_DEAD_LETTER_NONZERO` (`ROLLBACK_REQUIRED`): Inspect failed job attempts via `GET /api/v1/admin/outbox/dead-letter`, remediate downstream adapter/data fault, and replay via `POST /api/v1/admin/outbox/:id/retry`.
- `READINESS_PROBE_503_SUSTAINED` (`ROLLBACK_REQUIRED`): Route load balancer traffic away from draining/unhealthy replicas and verify PostgreSQL pool/TLS connectivity.
- `MIGRATION_PREFLIGHT_MISMATCH` (`ROLLBACK_REQUIRED`): Abort release deployment immediately before starting new API/worker containers.
- `UNAUTHORIZED_CROSS_SCOPE_ALERT` (`ROLLBACK_REQUIRED`): Suspend compromised session/account via `PATCH /api/v1/admin/accounts/:id/suspension`, rotate secrets, and preserve immutable `audit_events`.

## 4. Concrete pilot readiness matrix

| Capability / Requirement Group | Implementation Status | Verification Evidence | Remaining External / Policy Gate Before Live Production |
|---|---|---|---|
| **M1–M2 Foundation & PostgreSQL Schema (9 migrations)** | **Implemented** | Local unit/config/preflight tests (`config.test.ts`, `deployment-preflight.test.ts`); CI PostgreSQL (`schema.test.ts` on `postgres:18.7-alpine`) | Hosted PostgreSQL 18.7 provisioning, encrypted backup storage budget (`RPO <= 1h` / `RTO <= 4h`) |
| **M3 Firebase Identity, Sessions, CSRF & Staff MFA** | **Implemented** | Local token/session/CSRF/MFA tests (`identity.test.ts`); CI Auth Emulator suite | Live Firebase project (`AUTH_MODE=firebase`), Identity Platform SMS MFA billing, Bangladesh telecom OTP delivery/cost test (`B03`–`B06`) |
| **M4 Healthcare Pilot (`/care`: farms, animals, files, slots, bookings, consults, Rx)** | **Implemented** | Local care/shared/mobile/web tests; CI PostgreSQL concurrency & scope suite | `HEALTHCARE_NO_CHARGE_PILOT=true` sign-off (`B07`) and private S3/GCS bucket credentials (`B13`) |
| **M5 Outbox Worker, Reminders, Adherence & Recovery** | **Implemented** | Local worker/math/DTO tests (`ops.test.ts`); CI PostgreSQL crash/retry suite (`ops.scenario.ts`) | Live SMS/push notification gateway credentials (`B13`); defaults safely to `NOTIFICATION_CHANNEL_MODE=in-app-only` |
| **M6 Lending & Double-Entry Ledger Sandbox (`/finance`)** | **Implemented (Sandbox)** | Local math/webhook/DTO tests (`finance.test.ts`); CI PostgreSQL ledger/concurrency suite (`finance.scenario.ts`) | Partner bank lending terms (`B08`–`B10`) and regulated payment gateway (`B13`); blocked in `DEPLOYMENT_TIER=production` |
| **M7 Insurance & Debt-First Claim Settlement Sandbox (`/finance`)** | **Implemented (Sandbox)** | Local/shared workspace tests (`finance-workspace.test.ts`); CI PostgreSQL claim/referral suite (`insurance.scenario.ts`) | Partner insurer policy terms (`B08`, `B11`, `SRS-GAP-09`); blocked in `DEPLOYMENT_TIER=production` |
| **M8a–M8e Telemetry, Bounded AI, Calls, Rx Commerce & Content** | **Implemented (Sandbox)** | Local math/DTO/HTTP tests (`extensions.test.ts`); CI PostgreSQL scenario (`extensions.scenario.ts`) | Physical IoT collar protocol (`B12`), live LLM/STT & WebRTC TURN/SFU providers (`B13`); blocked in `DEPLOYMENT_TIER=production` |
| **M9–M10 System QA, Security Matrix & Deployment Preflight** | **Implemented** | 98 local unit/HTTP/security/preflight/shared/web/mobile tests + CI PostgreSQL/CodeQL/Gitleaks/Android compile | Physical lower-end Android & iOS device accessibility (`TalkBack`/`VoiceOver`) and live staging load test execution |
