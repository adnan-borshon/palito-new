> Current M3 update (2026-11-15): Firebase identity/session paths and opt-in `/identity` client screens are implemented. M3 is **in progress**, not complete. Read [identity checkpoint](../docs/backend/identity.md) for exact endpoints, setup, actual tests and unfinished staff/native/provider gates. Earlier milestone descriptions below remain historical or proposed unless superseded there.

# Palito API and database foundation (milestone 2)

NestJS 12 ESM API. M1 exposes operational endpoints only; every non-public controller is denied by a global identity guard. No token, demo OTP, client role or seeded account can authenticate. M2 adds Prisma/core schema and migrations; Firebase and domain workflows arrive in later milestones.

## Local setup

Use repository-pinned Node 24.22.3 and Docker Compose v2. From the repository root:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run setup:backend
```

Then from `backend`:

```bash
npm run db:up
npm run db:bootstrap
npm run migrate:deploy
npm run dev
```

Setup creates an ignored `backend/.env` with random local credentials and never overwrites an existing file. PostgreSQL 18.7 is bound to loopback and persists in a named Docker volume. `npm run db:down` stops the service without removing data. Never use the development superuser, test database, example credentials or local trust configuration for a deployed API. M2 uses separate administrator, schema-owner migrator and restricted runtime credentials; only the runtime URL is used by the API.

If you already have an M1 `.env`, keep its existing POSTGRES_USER/POSTGRES_PASSWORD (they must still match the persisted Docker volume). Move the old administrator DATABASE_URL to DATABASE_ADMIN_URL, add a separate palito_migrator URL in MIGRATION_DATABASE_URL and a palito_runtime URL in DATABASE_URL, each with a distinct random password. Use `?schema=palito` for migration/runtime URLs. Existing files are intentionally not overwritten. Then bootstrap and deploy as above. Do not remove the data volume or reset a database to solve a configuration error.

`dev` compiles once and runs Node's watcher on compiled output; after editing TypeScript, run `npm run build` in another terminal to trigger restart. No native mobile or provider configuration is required for M1.

| Method / URL | Behavior |
|---|---|
| GET http://127.0.0.1:4000/api/v1/health/live | 200 `{status:"ok"}` while process is alive, independent of database |
| GET http://127.0.0.1:4000/api/v1/health/ready | 200 `{status:"ready"}` after bounded SELECT 1, otherwise safe 503 |
| GET http://127.0.0.1:4000/api/openapi.json | Generated OpenAPI metadata only when SWAGGER_ENABLED=true; forbidden in production |

The server intentionally starts with an unavailable database so liveness remains available and readiness reports 503. Errors expose only stable code, safe message and a generated request ID. Logs omit URLs/query strings, headers, bodies, IPs and raw exceptions. Helmet, exact-origin CORS, JSON body limits, DTO allowlists, request/header timeouts and a bounded per-instance rate limiter are enabled. Probe routes bypass the rate limit; all other routes, including development metadata, are limited.

`trust proxy` is false. Before deploying behind a proxy or adding API replicas, explicitly design trusted proxy boundaries and shared rate limiting; never enable blanket proxy trust. Authentication/CSRF/account-membership rules remain M3 work, with no business mutation endpoints exposed in M1.

## Checks

From root: `npm run lint:all`, `npm run typecheck`, `npm test`, `npm run build:backend`, `npm run build:web`, `npm run export:web`. From `backend`: `npm run openapi` writes ignored `openapi.json`.

Integration tests require a real PostgreSQL database and fail rather than skip when its URL is missing. With the local development database running:

```bash
cd backend
npm run test:integration:dev
```

Use only a disposable development/test database. M2 adds real schema/migration/role/constraint tests as described below. CI supplies a disposable PostgreSQL service automatically. See [current checkpoint](../docs/backend/progress.md) for exact commands/results and differences between local binary verification and Docker/hosted CI verification.

## Database commands and synthetic data

Prisma generation/validation do not need database credentials; build/typecheck/tests explicitly generate the ignored ESM client. `migrate:deploy` uses MIGRATION_DATABASE_URL only. Bootstrap is restricted to local development/test and prepares schema/extension/roles; it creates no users in the application. Production database changes are not authorized by these scripts or this milestone.

For a disposable local test/development database only, set `SEED_SYNTHETIC=true` in its ignored `.env`, then run `npm run db:seed`. The seed is not automatic; it creates synthetic records and a pending vet, with no admin membership, working identity credential or approved valuation. Remove the opt-in afterward. Never import the client demo snapshot.

Integration tests require TEST_DATABASE_URL for a **disposable local PostgreSQL administrator** with permission to create temporary databases/roles/extensions. They create uniquely named databases, bootstrap restricted roles, deploy both real migrations, test constraints/rollback/concurrency/upgrade using the runtime account and remove only those temporary databases. The existing `test:integration:dev` command uses DATABASE_ADMIN_URL; it does not drop your development application database. The runtime account is intentionally unable to perform this setup.

See [database design](../docs/backend/database.md) for the 13 tables, ownership/history rules, role grants and later schema scope. Do not use `db push` or edit an already-published migration. New changes need new reviewed migrations.
