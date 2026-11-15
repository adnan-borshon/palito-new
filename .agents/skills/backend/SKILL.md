---
name: backend
description: Implement and review Palito backend services, Firebase authentication, PostgreSQL migrations, scoped permissions, financial integrity, and milestone verification.
---

# Backend, authentication, database, security and testing workflow for Palito

Use this skill when implementing or reviewing Palito backend services, Firebase Authentication, PostgreSQL schema/migrations, permissions, security controls, or tests.

## Ground work in this repository

Before changing code, inspect the current branch and worktree, relevant AGENTS.md files, README, requirements/SRS, implementation plan, shared contracts, decisions and test reports. Treat source files as current truth when old reports conflict; record meaningful discrepancies. Never expose secrets in logs, docs, fixtures, or responses.

Palito serves farmers, veterinarians, banks, insurers and administrators in a Bangla-first livestock platform. Its workflows include animal passports and health history, appointments and prescriptions, alerts/IoT, insurance claims and payouts, collateral loans and repayments, education and commerce. Preserve existing Expo mobile and Next.js web workflows and shared portable domain rules. Do not return the complete local DemoState to production clients.

The backend was intentionally empty in earlier project stages. The repository now permits backend implementation. Older frontend-only phase restrictions are superseded by the user's explicit backend request; update outdated planning docs coherently rather than treating them as a blocker.

## Default technology choices

- Firebase Authentication for user identity and phone OTP sign-in.
- TypeScript backend (NestJS modular monolith by default).
- PostgreSQL for authoritative relational business data.
- Prisma migrations and typed queries, with reviewed SQL for database constraints Prisma cannot represent.
- Versioned REST endpoints with OpenAPI.
- Private object storage for evidence and documents.
- Durable background jobs and transactional outbox for notifications and external effects.

Verify current Firebase, Expo, NestJS, PostgreSQL and Prisma documentation and package compatibility before implementation. Test Firebase phone SMS delivery, rate limits, abuse controls, regional availability and expected costs for Bangladesh before claiming production readiness. Do not require or introduce Supabase unless the user changes the stack decision.

## Authentication and authorization

Firebase Auth proves identity; it does not decide Palito roles or resource access. Verify Firebase ID tokens server-side using the official Admin SDK and expected project/audience. Map verified Firebase UID to Palito's server-owned account and memberships. Never trust role, user ID, organization ID, or farmer ID asserted by a client. Do not expose Admin SDK credentials to mobile/web bundles.

Model institutional organizations and staff memberships. Verify veterinarians and invite/approve privileged users. Require appropriate MFA or step-up confirmation for privileged accounts and sensitive actions. Define token expiry, refresh, revocation, suspension and account recovery.

Use secure HttpOnly cookies and CSRF protections for web sessions where the architecture supports them. Store native refresh credentials only in platform-secure storage; do not put tokens in AsyncStorage or browser localStorage. Keep seeded accounts, fixed OTPs, role switching and demo controls isolated to a development/demo environment. Production must fail closed when demo configuration is detected.

Every endpoint must scope each record read and mutation to the authenticated principal's role, organization and ownership. Test object-level access for detail endpoints, lists, search, exports, uploads, downloads, nested records and jobs. Hiding a UI control does not authorize a request.

## PostgreSQL and domain integrity

Use foreign keys, unique/check constraints, indexes, explicit state transitions and transactions. Use database transactions and row locks or version checks for concurrent decisions; a process-local queue is not sufficient across server instances.

Prevent duplicate active collateral, conflicting active policies, overlapping vet appointments, duplicate settlements and invalid ownership changes. Store exact money in integer poisha or a clearly specified exact decimal representation. The existing demo contract uses whole BDT; implement explicit conversions and tests. Specify rounding, dates, time zones, valuation versioning, retention and audit amendments.

Separate farmer-entered animal estimates from independently approved collateral valuations. Lending rules (interest, fees, schedule, repayment allocation, grace and settlement) require a written approved policy. If unspecified, implement sandbox behavior and block real finance activation.

Use a balanced append-only financial ledger with reversals and reconciliation. Persist idempotency keys bound to actor, operation and payload in the same transaction as results. Payment callbacks must be authenticated, validated, deduplicated and safe under retries and reordering. External side effects require durable intents/outbox and reconciliation; a database rollback cannot reverse a provider transfer.

## Security and privacy

Validate all external input at the API boundary; use parameterized database access, output minimization, safe error responses, request/body limits, CORS allowlists, secure headers, rate limits and secret management. Redact OTPs, tokens, phone numbers and health/financial details from logs. Collect only required data and document consent, retention and deletion behavior.

Keep claim evidence and user documents private. Validate ownership, content type, file size and actual content; do not trust EXIF/GPS or booleans as proof. Use expiring authorized downloads. Authenticate and bind IoT devices independently; validate timestamps, sequence IDs, replay and stale/missing readings. AI runs server-side with limits, privacy controls and clinical escalation. Never let AI make a final diagnosis, prescription, lending decision or claim payout.

Do not claim a security audit based on lint, unit tests or one scanner. Prioritize adversarial access tests and document remaining risks.

## Testing and delivery

Add meaningful tests alongside implementation:
- Unit tests for domain rules, money, boundaries and state transitions.
- API tests using real PostgreSQL for constraints, permissions, rollback, migrations and concurrent requests.
- Cross-role and cross-tenant denial tests.
- Web end-to-end tests (Playwright) and native mobile tests/device checks appropriate to the change.
- Security tests for BOLA/IDOR, privilege escalation, OTP abuse, upload validation, CSRF/session behavior and callback replay.
- Failure/recovery tests for timeouts, duplicate jobs, provider outages, app restarts and backup restoration.

Run the relevant lint, typecheck, tests, migrations and builds for changed workspaces. Report commands and results that were actually run. Keep CI checks real; never weaken or delete a failing test to make a pipeline green. Distinguish mock/provider simulation from a live integration and browser emulation from physical-device verification.

## Milestone discipline

Implement one bounded milestone at a time. Maintain docs/backend/implementation-plan.md, progress.md, architecture.md, decisions.md, requirements-traceability.md, security.md and runbook.md (or update existing equivalents). On continuation, inspect the latest checkpoint and repository diff.

Recommended order: grounded assessment; backend/CI/config foundation; schema/migrations; Firebase identity and scoped authorization; farmer-to-vet workflow; durable notifications; lending sandbox; insurance sandbox; telemetry/AI/commerce; full security and system QA; deployment preparation.

Complete all independent work when external credentials or policy decisions are missing, and identify precisely what remains unverified. Never deploy, change production data, activate paid services, send real OTP campaigns or transfer real money without explicit authorization.
