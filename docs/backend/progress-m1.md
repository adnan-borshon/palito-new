# Milestone 1 implementation and verification

Prepared 2026-11-15 from M0 commit `bca35e33363654c211e8d8a6e8541c51c740f247`. The user authorized M1 after reviewing M0. This report covers the backend/configuration/CI foundation only. M2 schema/migrations and M3 Firebase authentication remain unimplemented.

## Delivered behavior

- `@palito/backend` joins the root npm workspaces. NestJS 12.5.0, Express 5.3.0 and TypeScript 6.0.3 build an ESM application; dependencies are locked. Prisma remains the chosen ORM, with stable 7.10.1 reviewed as an M2 candidate but not installed or scaffolded in M1.
- Typed, bounded runtime configuration rejects missing/invalid PostgreSQL URLs, ports, body/rate/time limits, wildcard/credentialed CORS origins, demo mode and unsupported auth mode. Production additionally rejects development OpenAPI exposure, Firebase emulator configuration, sandbox payment selection, HTTP origins and database TLS below `verify-full`. Errors name invalid fields without printing values.
- Private local setup generates random credentials into ignored `backend/.env` without overwriting existing configuration. Compose defines loopback-only PostgreSQL 18.7, health checking and a durable development volume. No application tables, Prisma schema, seeds or migrations were added. The development database role is intentionally not a production runtime role; M2 separates roles.
- Actual endpoints: `GET /api/v1/health/live` (process liveness), `GET /api/v1/health/ready` (bounded real PostgreSQL `SELECT 1`, safe 503 on failure/draining). The API can start without a database and honestly remain unready. Shutdown hooks drain readiness, close the pool and listener, and respond to SIGTERM/SIGINT.
- A global default-deny identity boundary permits only explicitly public controllers. Its disabled verifier accepts no token. It cannot authenticate via seeded OTP, client roles or arbitrary bearer strings. There are no farmer/vet/finance endpoints yet.
- Helmet, generated request IDs, no-store responses, safe error envelopes, JSON body limits, DTO field allowlists, exact-origin CORS, request/header timeouts and per-instance rate limits are configured centrally. `trust proxy` stays false. Liveness/readiness probes are exempt from the limiter.
- Structured Pino events omit URLs/query strings, request headers/bodies/IPs, raw exception messages and configuration values. Standard credential fields also have redaction. Framework logs emit categories rather than arbitrary sensitive messages. These controls are tested, not a claim that arbitrary future logging code is automatically safe.
- Generated OpenAPI documents actual health routes/status responses, with explicit M1-only scope. `/api/openapi.json` exists only with development documentation enabled; `npm run openapi` exports ignored JSON without requiring a live database. No Swagger bypass exposes a business route.
- GitHub CI installs from the lockfile, runs genuine lint/typechecks/tests/builds, exercises PostgreSQL integration and gates high/critical dependency advisories. CodeQL and Gitleaks are configured in a separate workflow. Action revisions were verified and pinned; workflow permissions are limited and PR comments disabled. Hosted execution evidence is recorded in the current checkpoint, not assumed from the YAML.
- All **495 tracked `.next` files** were removed from Git's index; the local build output remains usable and ignored. Environment files, backend output and generated OpenAPI are ignored. Source/assets were preserved.
- Web lint now runs the official Next.js ESLint configuration with zero warnings allowed. Existing memo dependencies, unused bindings and image-element findings were fixed without disabling lint rules. Local image delivery stays unoptimized, with explicit dimensions and existing CSS; no image service was introduced. Web typechecking generates route types so a clean checkout does not depend on tracked `.next` files.

## Local verification

Environment: Linux, Node **24.22.1**, npm **11.9.0**. Repo/CI still pin Node **24.22.3**; hosted execution must verify that exact patch. Local Docker CLI/daemon are absent, so Compose was inspected/parsed but not executed here. Real PostgreSQL **18.6** binaries were downloaded into scratch for disposable loopback-only testing; they are not repository dependencies or production tooling. The Compose/CI target is the current official **18.7** image. Both minor-version differences remain explicit.

| Check | Evidence / interpretation |
|---|---|
| Fresh `npm ci --ignore-scripts --no-audit --no-fund` | Exit 0, 1,542 packages; reinstalls exact lockfile dependencies. Install scripts deliberately disabled, not a fake successful install |
| `npm run lint:all` | Mobile Expo ESLint, genuine web ESLint and backend ESLint; shared has no lint script and is checked by TypeScript/tests |
| `npm run typecheck` | All four workspaces; web route generation makes this independent of tracked build output |
| `npm test` | Existing 31 frontend/shared tests plus 8 backend foundation tests; 39 tests passed, exit 0 |
| `npm run build:backend` | TypeScript -> runnable ESM, without Prisma generation or cloud configuration |
| `npm run build:web`; `npm run export:web` | Next.js build and Expo browser export; no native/device or browser journey claim |
| PostgreSQL integration | 3 tests: real SELECT readiness + unavailable/closed pool, bounded unreachable DB + development docs gate, real listener/SIGTERM/pool shutdown; no silent skips |
| Setup / OpenAPI | Generated ignored `.env` with random credentials; OpenAPI export; no secrets printed or committed |
| Gitleaks 8.30.1 | Verified release checksum; staged source-tree scan reported no leaks. This local scan is not a complete remote history scan; workflow fetches full history |
| `npm audit --omit=dev --audit-level=high` | Exit 0, **0 high/critical**, **1 low + 20 moderate** findings across the resolved workspace graph. Backend-scoped audit reported one moderate minimatch advisory; it is not evidence of zero vulnerabilities |
| Scope / whitespace | `git diff --check`, lockfile/workspace consistency, workflow structure, ignored outputs/secrets, and generated-output removal reviewed before push |

Initial tests found a configuration-refinement bug: malformed URL input threw before it could become a safe configuration error. The refinements now guard URL parsing and a compiled-process regression checks nonzero startup plus field-only diagnostics. Initial genuine web lint findings were corrected rather than suppressed. The local sandbox isolates networking between command sessions; PostgreSQL and integration tests therefore ran together in one process group. Earlier isolated-session connection failures were environment setup failures, not passing integration evidence.

## Limits and next review boundary

No production deployment, paid services, live OTP, Firebase project changes, database migrations, clinical/financial endpoints, real-money activity, worker/outbox implementation or frontend API cutover occurred. PostgreSQL tests establish foundation connectivity/lifecycle only, not tenant constraints, transactions or finance. No native hardware/phone delivery, browser E2E, load/restore evidence or complete security audit is claimed.

Existing lower-severity dependency advisories remain for targeted triage; no forced downgrade/upgrade of Expo or Jest was applied. Trusted proxy/shared rate-limit design is required before multiple API replicas or internet deployment. User-facing error details remain deliberately minimal. Original SRS provider/policy gates still apply.

Review the backend setup, public operations endpoints, security/config defaults and CI results. After the user's next instruction, M2 introduces PostgreSQL/Prisma schema, migration tests and least-privilege database roles. **Do not start M2 at the end of M1.**
