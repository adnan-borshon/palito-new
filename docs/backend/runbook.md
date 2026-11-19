> Current M3 update (2026-11-15): Firebase identity/session paths and opt-in `/identity` client screens are implemented. M3 software now includes staff invitation/approval, MFA/recovery, verified contact changes, revocation and native configuration; live-provider/device acceptance remains separate. Read [identity checkpoint](identity.md) for exact endpoints, setup, actual tests and provider/device release gates and completed staff/recovery implementation. Earlier milestone descriptions below remain historical or proposed unless superseded there.

# Baseline and future operations

M2 is implemented for review. Follow [backend setup](../../backend/README.md) for the executable local workflow and [current progress](progress.md) for actual results. Core Prisma migrations and database roles now exist. No provider credentials or deployment exist. Historical M0 results are in [M0 report](milestone-0-report.md).

## Reproduce current checks

Use repository-pinned Node 24.22.3 where available (M0 environment used compatible 24.22.1), then from repo root:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run typecheck
npm run lint
npm run lint:web
npm test
npm run build:web
npm run export:web
```

`lint:web` now runs genuine Next.js ESLint with zero warnings allowed; web typecheck generates route types before tsc. Tests are demo/domain and component tests. Static Expo export and Next.js build do not verify native hardware, real SMS, calls, payments, API authorization or database constraints. M1 removed 495 tracked `.next` outputs and ignores regenerated files. Do not commit generated output or local `.env` credentials.

The original SRS can be extracted with `pdftotext -layout docs/srs.pdf <scratch-path>` and rendered with Poppler. Use physical PDF pages, since contents numbering differs. Do not commit extracted personal/title-page data or page images as application assets.

## Baseline check plan

| Stage | Commands/evidence | Interpretation |
|---|---|---|
| M0 source | Clean git status, source SHA, original SRS + PAL/command set equality, diff/links | Documentary baseline, not API implementation |
| M0 automated | Commands above; Node/web/shared/component counts; actual exit status | Record in progress; never replace failure with historical report |
| M1 clean setup | Backend config invalid/missing checks, real lint/types/unit/build, health/readiness/shutdown; fresh CI install | New API foundation only after approval |
| M2 database | Clean and upgrade migrations on real PostgreSQL; FK/check/unique/runtime-role tests | No SQLite/memory substitute for concurrency/constraints |
| M3 identity | Emulator tokens plus live operator/native SDK checks separately | Emulator pass never proves SMS/cost/delivery or secure device persistence |
| M4–8 features | Scoped API/database tests, separate-process races, web journeys and physical devices | Include policy versions, fault injection and pending provider states |
| M9–10 operations | Approved workload/load shape, secret/scanner triage, restore/rollout rehearsal | Report exact environment and residual risks; no production activation by implication |

## Implemented foundation operations

- `npm run setup:backend` creates random ignored development configuration. Existing files are preserved. `backend/.env.example` lists supported configuration keys.
- From backend, `npm run db:up` starts the current PostgreSQL development image; `npm run db:bootstrap` prepares local roles/schema/extension, `npm run migrate:deploy` applies reviewed migrations, and `npm run dev` compiles/serves the API on loopback. After editing TS, rebuild to trigger the compiled-output watcher. `npm run db:down` stops without dropping the named volume.
- Monitor `/api/v1/health/live` separately from `/api/v1/health/ready`. Database unavailability gives safe 503; process remains alive. SIGTERM/SIGINT trigger graceful listener/pool closure. No real business jobs exist yet.
- M1 defaults: max JSON 256KiB, rate 120/minute/IP excluding probes, pool size 5, DB timeout 2s, server request/header timeout 15s/10s, exact-origin CORS, proxy trust disabled. Tune only with tests and measured workload.
- Domain mutations remain unavailable. All protected controllers are denied until M3 integrates a real verifier and server-owned account/membership checks. Do not enable fixture auth or expose provider secrets to clients.
- CI has real install/lint/type/test/build/PostgreSQL/audit steps. Security workflow adds CodeQL and full-history Gitleaks; report its actual status. It neither deploys nor sends PR comments.

## Later operational controls

Configuration: separate dev/staging/production projects, database roles, buckets, callback keys and secrets. Production rejects emulators, fixture users/OTP, demo flags and test providers. Secrets stay outside Git and frontend bundles. Document exact required variables when M1/M3 introduces them.

Migrations: reviewed Prisma history plus explicit SQL for unsupported constraints; expand/backfill/contract; test old app compatibility and upgrade path. Database runtime cannot migrate. Review irreversible changes and use forward repair instead of promising destructive rollback.

Outages: return explicit dependency failure/pending state, preserve financial intent ID, show actual stale reads, avoid silent demo fallback. Worker jobs have owner, attempt bounds/backoff, deduplication and failed-job triage. Ambiguous external success goes to reconciliation before retrying transfer.

Backups/restore: owner and hosting budget unresolved. Candidate RPO <=1h/RTO <=4h requires encrypted backups, access controls, retention policy and timed restore into an isolated database with ledger/outbox reconciliation before release. No backup has been created or restored in M0.

Incident handling: identify on-call owner, freeze affected capability where needed, preserve redacted audit/evidence, rotate relevant secrets, reconcile provider states, repair through audited amendments/reversals and document recovery. Define escalation contacts before pilot.

Deployment: M10 prepares staging rollout/rollback and feature gates for user review. Enabling paid services, production migrations, SMS campaigns, real finance or live deployment needs explicit authorization. Current M0 review does not authorize M1.

## M2 migration/role procedure

Keep admin, migration and runtime URLs separate. Existing M1 environments must retain the current Docker volume administrator password while moving the API URL to the restricted runtime role; see backend README. Bootstrap refuses nonlocal/non-development targets. New database objects are not automatically granted to runtime. Do not grant access to `_prisma_migrations`, use runtime for DDL, or seed during install/startup/migrate.

Before applying a future migration, review its SQL and locking/data effect, run clean and prior-version upgrade tests on disposable PostgreSQL, verify runtime denial and model drift, and retain the immutable published history. If a migration fails, inspect status and affected state with the migration/administrator owner; do not automatically reset or delete real data. Production migration rollout/restore rehearsal remains M10.

## M4–M10 review, worker, sandbox and deployment preflight setup

See [healthcare](healthcare.md), [ops M5](ops-m5.md), [lending M6](lending-m6.md), [insurance M7](insurance-m7.md), [extensions M8](extensions-m8.md), [QA & security M9](qa-security-m9.md), and [deployment & pilot M10](deployment-pilot-m10.md) for implemented DTOs, worker operations, ledger & extension invariants, security matrix verification, deployment preflight checks, and client lifecycles; [progress](progress.md) records actual checks.
- Enable `HEALTHCARE_NO_CHARGE_PILOT=true` only for an explicit no-charge development/staging pilot.
- Configure `NOTIFICATION_CHANNEL_MODE=in-app-only` (default) or `sandbox`; run the M5/M8 worker with `npm run worker --workspace @palito/backend` or `WORKER_ENABLED=true`.
- Enable `FINANCE_SANDBOX_ENABLED=true`, `PAYMENT_PROVIDER=sandbox`, and a >=16-char `SANDBOX_WEBHOOK_SECRET` **only** in `development` or `DEPLOYMENT_TIER=staging` to exercise `/finance` lending and insurance sandbox workflows.
- Enable `EXTENSIONS_SANDBOX_ENABLED=true` **only** in `development` or `DEPLOYMENT_TIER=staging` to exercise M8 telemetry, AI, call tokens, commerce, and admin content/export routes; `DEPLOYMENT_TIER=production` fails closed if any sandbox, emulator, or Swagger option is set.
- Run `npm run preflight:deploy --workspace @palito/backend` (optionally with `-- --require-migration-url`) before staging/production release to validate `DEPLOYMENT_TIER`, `palito_runtime`/`palito_migrator` credential separation, `sslmode=verify-full`, and the immutable `SHA-256` manifest across all 9 migrations.
- Local backup/restore rehearsal (`npm run rehearse:backup-restore --workspace @palito/backend`) requires loopback PostgreSQL with `pg_dump`/`pg_restore`, `DATABASE_ADMIN_URL`, and `DATABASE_URL` in development/test.
