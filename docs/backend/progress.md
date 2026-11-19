# M8 and M9 implementation and review checkpoint

Updated 2026-11-19. Following verified review of Milestones 4–7, Milestones **8 (M8a–M8e extensions)** and **9 (system QA and security remediation)** are implemented and verified locally. **Stop for review before Milestone 10 (deployment preparation and controlled pilot).** No production deployment/migration, merge, paid activation, real-money transfer, or live OTP/SMS/provider campaign is included.

Read [extensions M8](extensions-m8.md) and [QA & security M9](qa-security-m9.md) for actual routes, state machines, SQL invariants, extension sandbox gates, and M9 security findings. Prior milestones remain active foundations: [M3 identity](milestone-3-completion-checkpoint.md), [M4 healthcare](healthcare.md), [M5 ops](ops-m5.md), [M6 lending](lending-m6.md), and [M7 insurance](insurance-m7.md).

## Implemented M8 and M9 scope

- **M8 — Controlled feature extensions (`20261115000900_extensions_iot_ai_commerce_content`, `backend/src/extensions/`)**:
  - Explicit opt-in gate (`EXTENSIONS_SANDBOX_ENABLED=true`, default `false` failing closed with `503`; forbidden when `NODE_ENV=production` in [config.ts](../../backend/src/platform/config.ts)).
  - **M8a Telemetry & Alerts**: Device provisioning (`SHA-256` device secret), exclusive active device/animal bindings (`one_active_binding_per_device`, `one_active_binding_per_animal`), unbinding, `@Public()` `X-Palito-Device-Secret` ingestion with `sessionEpoch`/sequence anti-replay and `validateTelemetryWindow` (`+5m`/`-24h`), 7-day summaries, farm dashboard counts, reviewed alerts (`HIGH_TEMPERATURE` `CRITICAL`, `LOW_BATTERY` `WARNING`), and 4-hour worker alert escalation (`sweepAlerts` in [outbox.worker.ts](../../backend/src/ops/outbox.worker.ts)).
  - **M8b Bounded AI**: `POST/GET /ai/requests` (`TEXT`/`VOICE`/`PHOTO`), explicit voice `transcriptConfirmed=true`, `PHOTO` `READY` file ownership check, 20/day budget, hostile override refusal (`sanitizeAiPrompt`), outage fallback (`PROVIDER_OUTAGE_FALLBACK`), uncertainty notice, and `suggestVetHandoff=true`.
  - **M8c Call Tokens & Emergency**: Participant-only `POST /consultations/:id/call-token` (active window + `CareGrant` verification) and `POST/GET /emergency-requests` checked against live verified vet slot availability.
  - **M8d Commerce & Fulfillment**: `POST /admin/products`, `GET /products/:id?`, `GET /me/cart`, `PUT /me/cart/items/:productId`, `POST/GET /orders/:id?`, `POST /orders/:id/cancellation` (stock restore + balanced `ORDER_REFUND` ledger credit), `POST /orders/:id/fulfillment-events` (`ADMIN` only; `403` for farmers), signed-prescription medicine validation & cumulative `maxPerPrescriptionQty` enforcement, and `ORDER_PAYMENT` webhook settlement in [finance.service.ts](../../backend/src/finance/finance.service.ts).
  - **M8e Admin, Content & Exports**: `GET /admin/users`, last-admin suspension prevention in [staff.controller.ts](../../backend/src/identity/staff.controller.ts), `POST/PATCH/publish` `educational_contents` with strict `DRAFT` isolation, `GET /admin/reports`, and audited `SHA-256` expiring exports (`POST /admin/exports`, `GET /admin/exports/:id/download`).
  - **Worker & client surfaces**: Added 6 M8 topics in [ops-math.ts](../../backend/src/ops/ops-math.ts) and M8 `publishedContent`, `aiTriageForm`, and `pharmacyCatalog` panels in `CareWorkspace` ([care.ts](../../frontend/shared/src/care.ts)) without importing `DemoState`.
- **M9 — System QA and security remediation**:
  - Added automated security matrix (`backend/test/security-matrix.test.ts`), M8 unit/HTTP suite (`backend/test/extensions.test.ts`), and M8/M9 PostgreSQL integration scenario (`backend/test/integration/extensions.scenario.ts` + 9-migration check in `schema.test.ts`).
  - **Remediated `SEC-LOG` finding**: `security-matrix.test.ts` caught that `logger.ts` did not redact M3–M8 `idToken`, `invitationToken`, and `provisioningSecret` fields; expanded `REDACT_PATHS` in [logger.ts](../../backend/src/platform/logger.ts) across sensitive token/secret fields and headers.

## Verification evidence (executed locally on Node v24.22.3)

- **94 executed unit, HTTP, security matrix, shared domain, web workflow, and native component tests passed (0 failed, 0 skipped)**:
  - `@palito/backend`: **46 passed** across 12 compiled test suites (`care.test.js`, `config.test.js`, `data-contracts.test.js`, `extensions.test.js`, `finance.test.js`, `http.test.js`, `identity.test.js`, `logger.test.js`, `native-config.test.js`, `ops.test.js`, `security-matrix.test.js`, `setup.test.js`).
  - `@palito/shared`: **27 passed** (`care.test.ts` [5], `finance-workspace.test.ts` [4], `invariants.test.ts` [11], `journeys.test.ts` [7]).
  - `@palito/web`: **3 passed** (`src/__tests__/web-workflows.test.ts`).
  - `@palito/mobile`: **18 passed across 6 Jest test suites** (`finance.test.tsx`, `care.test.tsx`, `farmer.test.tsx`, `roles-and-journeys.test.tsx`, `lifecycle.test.tsx`, `navigation.test.ts`; pre-existing React `act(...)` console warnings remain on `finance.test.tsx` and `care.test.tsx`, with all assertions passing).
- **Schema, lint, typecheck, and production builds passed (exit 0)**:
  - `npm run lint --workspace @palito/backend` and `npm run typecheck --workspace @palito/backend` passed after the final `logger.ts` / `security-matrix.test.ts` edit (with `@palito/mobile` `expo lint`, `@palito/web` `eslint src --max-warnings=0`, `@palito/mobile`/`@palito/web`/`@palito/shared` `typecheck`, `npm run prisma:validate`, and `npm run build:test --workspace @palito/backend` passing across all 9 migrations prior to the `logger.ts` edit).
  - `npm run build:backend`, `npm run build:web` (Next.js 16.4.6, 11 routes), and `npm run export:web` (`expo export --platform web`, 936 modules) all exited `0` after the final code edit.

## Environment & rollout boundaries (Stop before M10)

- **Local PostgreSQL/Docker boundary**: PostgreSQL and Docker are not installed on this local Windows host. All 9 migrations and PostgreSQL integration scenarios (`schema.test.ts`, including `extensions.scenario.ts`, `insurance.scenario.ts`, `finance.scenario.ts`, and `ops.scenario.ts`) plus `backend/scripts/rehearse-backup-restore.mjs` are compiled and typechecked locally against Prisma Client `7.10.1` and execute against `postgres:18.7-alpine` in GitHub Actions CI (`.github/workflows/ci.yml`); they are not claimed as executed locally.
- **M10 & production prerequisites**: Physical IoT collar hardware, live AI/STT and WebRTC TURN/SFU providers, production payment/SMS gateways, physical Android/iOS device accessibility testing, production environment secrets, and release deployment readiness remain gated for **Milestone 10** after user review.
