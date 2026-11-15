# Backend M1 checkpoint

Updated 2026-11-15. **M0 reviewed; M1 foundation implemented for user review. Stop before M2.** Branch/PR: `codex/palito-m0-assessment`, [PR #2](https://github.com/adnan-borshon/palito-new/pull/2). M0 commit: `bca35e33363654c211e8d8a6e8541c51c740f247`. The live PR head identifies the current code/document commit.

Read [M1 implementation report](progress-m1.md) for behavior, security boundaries and limitations; [backend setup](../../backend/README.md) for runnable commands. The [M0 report](milestone-0-report.md) preserves the original source assessment and earlier checks. All 65 PAL IDs and 53 commands remain mapped; infrastructure checks do not complete a domain requirement.

## Delivered foundation

M1 adds the NestJS ESM workspace, validated configuration, random ignored local credentials, PostgreSQL Compose setup, safe Pino logging/error envelopes, generated request IDs, security headers/CORS/body/DTO limits and rate limiting. Liveness/readiness, development OpenAPI and graceful shutdown work. A reusable global identity guard denies all non-public requests; Firebase and real memberships are M3.

CI runs actual lint/types/tests/builds and PostgreSQL integration with a high/critical dependency gate; a separate workflow configures CodeQL and Gitleaks. Web lint is genuine Next.js ESLint, existing findings are corrected and route types generated on clean checkouts. All 495 generated `.next` files are untracked/ignored. Application source/assets and local demo workflows remain, with small lint-related web corrections. No Prisma schema, migrations, business endpoints or provider integrations were added.

## Actual local checks

Linux, Node **24.22.1**, npm **11.9.0**; CI/repo pin **24.22.3**. Real disposable PostgreSQL binary **18.6** was used locally; Compose/CI target official **18.7-alpine**. Docker is unavailable here, so local Compose execution is unverified.

| Command / evidence | Result |
|---|---|
| Fresh `npm ci --ignore-scripts --no-audit --no-fund` | Exit 0; 1,542 locked packages installed; install scripts deliberately disabled |
| `npm run lint:all` after clean install | Exit 0; mobile, genuine web and backend lint; no disabled rules or placeholder check. Shared has no lint script |
| `npm run typecheck` after clean install | Exit 0; all four workspaces; web route types generated without tracked build artifacts |
| `npm test` after clean install | Exit 0: mobile 11, web Node 2, shared 18, backend 8 = **39 passed, 0 failed** |
| `npm run test:backend:integration` with TEST_DATABASE_URL | **3 passed, 0 failed, 0 skipped**, real PostgreSQL readiness/closed pool, bounded unavailable DB and real listener/SIGTERM shutdown |
| `npm run build:backend` after clean install | Exit 0; runnable ESM TypeScript build |
| `npm run build:web`; `npm run export:web` | Exit 0; Next.js build and Expo browser export; no native/device/E2E claim |
| `npm run setup:backend`; backend OpenAPI export | Exit 0; random ignored .env generated, repeated setup preserves it; health spec generated without database dependency |
| Gitleaks 8.30.1 staged source-tree scan | Exit 0; no leaks found; release checksum verified. Not a full history audit |
| `npm audit --omit=dev --audit-level=high` | Exit 0; 0 high/critical, 1 low + 20 moderate findings remain. Backend-scoped audit reported one moderate advisory |
| Workflow YAML/action refs, workspace/lock consistency, one React version, documentation/scope/whitespace | Validated before push; no generated output, .env credentials, schema or migration staged |

**42 tests passed locally** across default and PostgreSQL integration suites. The original 31 frontend/shared tests remain intact. Foundation tests cover compiled startup rejection without secret disclosure, production config guards, readiness/liveness/draining, forged credentials, DTO allowlisting, malformed/oversized JSON, safe errors, request correlation, CORS/headers, rate limits, log redaction and real database/lifecycle/shutdown.

## Hosted CI and limits

Workflows are configured; hosted run status must be read from the PR rather than inferred from local passes. At this document checkpoint no hosted run has yet been observed. Available runs will be inspected after push and before handoff. Exact Node 24.22.3 and PostgreSQL 18.7 verification depends on hosted CI or a Docker-capable environment.

M1 is a development foundation. Default auth remains disabled/fail-closed. Per-instance rate limits and `trust proxy=false` require reviewed proxy/shared-storage policy before replication or internet deployment. No Firebase/MFA/SMS, native hardware, browser E2E, real provider/payment, domain constraints/concurrency, load/restore or full audit evidence is claimed. Lower-severity dependency findings need targeted triage before M9/pilot; no breaking forced Expo/Jest changes were applied.

Initial tests exposed a malformed-URL refinement error; guarded URL parsing and a compiled-startup regression fixed it. Real web lint findings were corrected without lowering checks. Earlier PostgreSQL attempts across isolated command-network sessions were corrected by running PostgreSQL/tests together; only successful actual integration results count.

## Resume exactly here

1. Inspect current branch/PR checks and user feedback. Read AGENTS, this checkpoint, M1 report, architecture/decisions and traceability. Preserve M0 evidence as history.
2. **Wait for the user's M1 review and next instruction; do not start M2 automatically.** Neither PR #1 nor PR #2 has been merged by this work.
3. On authorization, M2 verifies/pins supported Prisma, reviews PostgreSQL guidance, introduces core schema/reviewed migrations, separates runtime/migration roles and tests clean/upgrade constraints on real PostgreSQL. Firebase implementation stays M3.
