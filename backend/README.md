# Palito API foundation (milestone 1)

NestJS 12 ESM API. M1 exposes operational endpoints only; every non-public controller is denied by a global identity guard. No token, demo OTP, client role or seeded account can authenticate. Firebase identity, Prisma schema and domain workflows arrive in later milestones.

## Local setup

Use repository-pinned Node 24.22.3 and Docker Compose v2. From the repository root:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run setup:backend
```

Then from `backend`:

```bash
npm run db:up
npm run dev
```

Setup creates an ignored `backend/.env` with random local credentials and never overwrites an existing file. PostgreSQL 18.7 is bound to loopback and persists in a named Docker volume. `npm run db:down` stops the service without removing data. Never use the development superuser, test database, example credentials or local trust configuration for a deployed API. M2 introduces reviewed migrations and separate runtime/migration roles.

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

Use only a disposable development/test database. The M1 tests run SELECT 1 and pool/lifecycle checks, not schema/migration tests. CI supplies a disposable PostgreSQL service automatically. See [current checkpoint](../docs/backend/progress.md) for exact commands/results and differences between local binary verification and Docker/hosted CI verification.
