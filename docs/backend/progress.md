# M8, M9 and M10 implementation and pilot readiness checkpoint

## Release verification

- A fresh npm installation, empty PostgreSQL database and Firebase Auth emulator exercised the README setup. After creating a farm through the API, a PostgreSQL restart preserved the record. A second farmer could see only their own farm.
- The browser regression exercises the verified entry and staff MFA, bank and insurer landing pages, administrator-only access, content publication and retry after an API outage. It checks keyboard focus and layout at a 375 px viewport. Native tests check named controls and account access.
- Native sign-in and assistive-technology use on physical devices require a configured development build. The local startup rehearsal used a standalone PostgreSQL server.

## Verified bank, insurer and administration dashboards — 2026-11-21

| Workspace | API and permission |
|---|---|
| Bank loan queues, collateral review, decisions and settlements | `/loans`, `/animals/:id/valuations`, `/animals/:id/collateral-risk`, loan commands and `/loans/:id/settlements`. Bank memberships and organization scope are checked on the API. |
| Insurer applications, policies and claims | `/policies`, `/claims` and underwriting, referral and settlement commands. The API checks insurer organization and review permissions. |
| Administration | `/admin/system-health`, `/admin/outbox/dead-letter`, `/admin/users`, `/staff/organizations`, staff and recovery commands, `/admin/content`, `/admin/audit-events`, `/admin/reports`, and audited summary exports. Administration requires recent MFA. |
| Account and notifications | Verified profile and account security use `/me` and the identity endpoints. User-scoped notifications remain available in **Farm & care**. |

Web and native use the same API and PostgreSQL database. The main entry takes users to verified sign-in. The demo is available from **Try the demo**. Finance and extensions keep their existing sandbox gates.

## Shared farmer and veterinarian dashboard — 2026-11-21

Verified web and native care now share the same API for farms, animal registration, bookings, visits and signed prescriptions. Lists refresh on foreground and every 30 seconds while visible, with manual refresh available. Local demo home screens link to verified care. The API filters the signed prescription list by current ownership or verified veterinary authorship with active patient consent.

## Database setup and verification — 2026-11-21

- The database-first local walkthrough is in the [root README](../../README.md). `npm run db:migrate` loads the ignored backend environment, and `npm run db:seed:local` pairs two sample farms and four sample staff memberships with local Firebase Auth emulator accounts.
- M5 retry preserves attempt history and prevents a reclaimed attempt from overwriting the new lease's result. Lending, insurance and commerce share the wallet spend lock under the restricted database role. M8 immediate coverage uses the next 15 minutes.
- Lint, typecheck, 98 default tests and 24 PostgreSQL plus Firebase emulator integration tests passed locally. The standalone Chromium launch was blocked by the environment's socket policy. No migration changes were needed.
- PostgreSQL is the source of truth for verified care and finance. Role demo previews keep their local stores.

Updated 2026-11-19. Following verified review of Milestones 4–7, Milestones **8 (M8a–M8e extensions)**, **9 (system QA and security remediation)**, and **10 (deployment preparation and controlled pilot readiness)** are implemented and verified locally. All M0–M10 software deliverables in the implementation plan are complete for review. No production deployment/migration, merge, paid activation, real-money transfer, or live OTP/SMS/provider campaign has been executed.

Read [deployment & pilot M10](deployment-pilot-m10.md), [QA & security M9](qa-security-m9.md), and [extensions M8](extensions-m8.md) for actual routes, state machines, SQL invariants, extension sandbox gates, M9 security findings, M10 deployment preflight checks, and the pilot readiness matrix. Prior milestones remain active foundations: [M3 identity](milestone-3-completion-checkpoint.md), [M4 healthcare](healthcare.md), [M5 ops](ops-m5.md), [M6 lending](lending-m6.md), and [M7 insurance](insurance-m7.md).

## Implemented M8, M9 and M10 scope

- **M8 — Controlled feature extensions (`20261115000900_extensions_iot_ai_commerce_content`, `backend/src/extensions/`)**:
  - Explicit opt-in gate (`EXTENSIONS_SANDBOX_ENABLED=true`, default `false` failing closed with `503`; forbidden when `DEPLOYMENT_TIER=production` in [config.ts](../../backend/src/platform/config.ts)).
  - **M8a Telemetry & Alerts**: Device provisioning (`SHA-256` device secret), exclusive active device/animal bindings (`one_active_binding_per_device`, `one_active_binding_per_animal`), unbinding, `@Public()` `X-Palito-Device-Secret` ingestion with `sessionEpoch`/sequence anti-replay and `validateTelemetryWindow` (`+5m`/`-24h`), 7-day summaries, farm dashboard counts, reviewed alerts (`HIGH_TEMPERATURE` `CRITICAL`, `LOW_BATTERY` `WARNING`), and 4-hour worker alert escalation (`sweepAlerts` in [outbox.worker.ts](../../backend/src/ops/outbox.worker.ts)).
  - **M8b Bounded AI**: `POST/GET /ai/requests` (`TEXT`/`VOICE`/`PHOTO`), explicit voice `transcriptConfirmed=true`, `PHOTO` `READY` file ownership check, 20/day budget, hostile override refusal (`sanitizeAiPrompt`), outage fallback (`PROVIDER_OUTAGE_FALLBACK`), uncertainty notice, and `suggestVetHandoff=true`.
  - **M8c Call Tokens & Emergency**: Participant-only `POST /consultations/:id/call-token` (active window + `CareGrant` verification) and `POST/GET /emergency-requests` checked against live verified vet slot availability.
  - **M8d Commerce & Fulfillment**: `POST /admin/products`, `GET /products/:id?`, `GET /me/cart`, `PUT /me/cart/items/:productId`, `POST/GET /orders/:id?`, `POST /orders/:id/cancellation` (stock restore + balanced `ORDER_REFUND` ledger credit), `POST /orders/:id/fulfillment-events` (`ADMIN` only; `403` for farmers), signed-prescription medicine validation & cumulative `maxPerPrescriptionQty` enforcement, and `ORDER_PAYMENT` webhook settlement in [finance.service.ts](../../backend/src/finance/finance.service.ts).
  - **M8e Admin, Content & Exports**: `GET /admin/users`, last-admin suspension prevention in [staff.controller.ts](../../backend/src/identity/staff.controller.ts), `POST/PATCH/publish` `educational_contents` with strict `DRAFT` isolation, `GET /admin/reports`, and audited `SHA-256` expiring exports (`POST /admin/exports`, `GET /admin/exports/:id/download`).
  - **Worker & client surfaces**: Added 6 M8 topics in [ops-math.ts](../../backend/src/ops/ops-math.ts) and M8 `publishedContent`, `aiTriageForm`, and `pharmacyCatalog` panels in `CareWorkspace` ([care.ts](../../frontend/shared/src/care.ts)) without importing `DemoState`.
- **M9 — System QA and security remediation**:
  - Added automated security matrix ([security-matrix.test.ts](../../backend/test/security-matrix.test.ts)), M8 unit/HTTP suite ([extensions.test.ts](../../backend/test/extensions.test.ts)), and M8/M9 PostgreSQL integration scenario ([extensions.scenario.ts](../../backend/test/integration/extensions.scenario.ts) + 9-migration check in [schema.test.ts](../../backend/test/integration/schema.test.ts)).
  - **Remediated `SEC-LOG` finding**: `security-matrix.test.ts` caught that `logger.ts` did not redact M3–M8 `idToken`, `invitationToken`, and `provisioningSecret` fields; expanded `REDACT_PATHS` in [logger.ts](../../backend/src/platform/logger.ts) across sensitive token/secret fields and headers.
- **M10 — Deployment preparation and controlled pilot readiness**:
  - Added `DEPLOYMENT_TIER` separation (`development | test | staging | production`) in [config.ts](../../backend/src/platform/config.ts) with non-secret templates [.env.staging.example](../../backend/.env.staging.example) and [.env.production.example](../../backend/.env.production.example).
  - Implemented [deployment-preflight.ts](../../backend/src/platform/deployment-preflight.ts) and CLI verifier [verify-deployment-preflight.mjs](../../backend/scripts/verify-deployment-preflight.mjs) (`npm run preflight:deploy --workspace @palito/backend`):
    - Enforces least-privilege role separation (`palito_runtime` vs `palito_migrator` with distinct `>=16`-char passwords, `sslmode=verify-full`, non-loopback DB hosts, `HTTPS` origins, `AUTH_MODE=firebase`, and zero `SEED_SYNTHETIC` or leaked `DATABASE_ADMIN_URL` in hosted runtime tiers).
    - Verifies the immutable `SHA-256` manifest (`EXPECTED_MIGRATION_MANIFEST`, `verifyMigrationHistory`) across all 9 migrations and blocks destructive DDL or `_prisma_migrations` grants to `palito_runtime`.
    - Evaluates live operational rollback triggers (`evaluatePilotOperationalHealth` in `GET /api/v1/admin/system-health` via [ops.service.ts](../../backend/src/ops/ops.service.ts)): `UNBALANCED_LEDGER_DETECTED`, `OUTBOX_DEAD_LETTER_NONZERO`, `OUTBOX_STALE_LEASES_DETECTED`, `OUTBOX_BACKLOG_HIGH`, and `WORKER_DISABLED_WITH_PENDING_OUTBOX`.
  - Authored the concrete pilot readiness report in [deployment-pilot-m10.md](deployment-pilot-m10.md) and unit test suite [deployment-preflight.test.ts](../../backend/test/deployment-preflight.test.ts).

## Verification evidence (executed locally on Node v24.22.3)

- **98 executed unit, HTTP, security matrix, deployment preflight, shared domain, web workflow, and native component tests passed (0 failed, 0 skipped)**:
  - `@palito/backend`: **50 passed** across 13 compiled test suites (`care.test.js`, `config.test.js`, `data-contracts.test.js`, `deployment-preflight.test.js` [4], `extensions.test.js`, `finance.test.js`, `http.test.js`, `identity.test.js`, `logger.test.js`, `native-config.test.js`, `ops.test.js`, `security-matrix.test.js`, `setup.test.js`).
  - `@palito/shared`: **27 passed** (`care.test.ts` [5], `finance-workspace.test.ts` [4], `invariants.test.ts` [11], `journeys.test.ts` [7]).
  - `@palito/web`: **3 passed** (`src/__tests__/web-workflows.test.ts`).
  - `@palito/mobile`: **18 passed across 6 Jest test suites** (`finance.test.tsx`, `care.test.tsx`, `farmer.test.tsx`, `roles-and-journeys.test.tsx`, `lifecycle.test.tsx`, `navigation.test.ts`; pre-existing React `act(...)` console warnings remain on `finance.test.tsx` and `care.test.tsx`, with all assertions passing).
- **Schema, lint, typecheck, deployment preflight CLI, and production builds passed (exit 0)**:
  - `npm run prisma:validate --workspace @palito/backend`, `npm run lint:all` (`@palito/mobile`, `@palito/web`, `@palito/backend` with `--max-warnings=0`), and `npm run typecheck` (`@palito/mobile`, `@palito/web`, `@palito/shared`, `@palito/backend`) passed, with `@palito/backend` `build:test`, `lint`, and `typecheck` re-verified after the final `deployment-preflight.ts` regex refinement.
  - `npm run build:backend` and `node backend/scripts/verify-deployment-preflight.mjs --require-migration-url` passed (`"ready":true,"tier":"staging","migrationCount":9`).
  - `npm run build:web` (Next.js 16.4.6, 11 routes) and `npm run export:web` (`expo export --platform web`, 936 modules) exited `0`.

## Environment & release boundaries

- **Local PostgreSQL/Docker boundary**: PostgreSQL and Docker are not installed on this local Windows host. All 9 migrations and PostgreSQL integration scenarios (`schema.test.ts`, including `extensions.scenario.ts`, `insurance.scenario.ts`, `finance.scenario.ts`, and `ops.scenario.ts`) plus `backend/scripts/rehearse-backup-restore.mjs` are compiled and typechecked locally against Prisma Client `7.10.1` and execute against `postgres:18.7-alpine` in GitHub Actions CI (`.github/workflows/ci.yml`); they are not claimed as executed locally.
- **Live provider, partner policy & physical-device gates**: See the [M10 pilot readiness matrix](deployment-pilot-m10.md) for the exact separation between implemented/verified software and external prerequisites (`B03`–`B13` partner policies, Bangladesh telecom OTP delivery, live S3/payment/LLM/STT/WebRTC credentials, and physical Android/iOS accessibility testing).
