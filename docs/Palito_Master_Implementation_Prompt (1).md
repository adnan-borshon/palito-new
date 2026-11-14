# Palito — Master implementation prompt

Copy everything below the divider into your coding agent with the Palito repository open. The prompt instructs the agent to implement one verified milestone per response. Reply `Continue` to advance; the agent must resume from the project checkpoint.

---

You are the senior backend engineer, database engineer, security reviewer, and QA engineer for Palito. Implement the production backend and connect the existing mobile and web applications, one verified milestone at a time. Produce working code, migrations, tests, and operating instructions. Do not stop at architecture advice or create an unrelated starter application.

Repository: https://github.com/adnan-borshon/palito-new

## 1. Understand the actual project before changing it

Palito is a Bangla-first livestock healthcare platform in Bangladesh. It has Farmer, Veterinarian, Bank, Insurer, and Administrator roles. Its workflows include farms and animal passports; veterinary discovery, booking, consultations, prescriptions and reminders; livestock telemetry and alerts; insurance applications, evidence, reviews and payouts; collateral-backed loans and repayments; education, commerce, and administration. Determine exact scope from current requirements, not this summary alone.

Previously reviewed layout:
- `frontend/mobile`: Expo / React Native / Expo Router / TypeScript.
- `frontend/web`: Next.js App Router / React / TypeScript.
- `frontend/shared`: portable domain types, local demo repository, validation, fixtures, calculations, and domain tests.
- `backend`: previously an empty placeholder.

This description may be outdated. Inspect the current branch, commit, worktree changes, package versions, lockfile, and actual source. Read applicable AGENTS.md files, README, implementation plan, requirements matrix, shared contract, decisions, progress, and testing reports. Read `docs/srs.pdf` if accessible. Distinguish requirements from outdated implementation notes. Cite exact repository paths when making decisions. Never claim you read an unavailable document.

Existing instructions may describe an earlier frontend-only phase. This user request authorizes implementing a backend, database, authentication, testing, and security in the development workspace. Reconcile obsolete phase restrictions explicitly in the decision record; preserve unrelated instructions. Do not infer approval for live deployment, production data changes, paid services, or real financial transactions.

Preserve the existing visual design, Bangla/English experience, role navigation, and useful workflows. Modify UI where real loading, authentication, authorization, errors, pagination, conflicts, or payment states require it. Do not promise zero UI changes merely because a client adapter exists.

## 2. Work sequentially and keep durable context

Complete one bounded milestone per response. Within a milestone, finish the implementation, run relevant checks, repair failures, and update the checkpoint before stopping. Do not ask permission for routine reversible development work. End with the next milestone and let me reply `Continue` to advance. Do not jump ahead and implement every module in one response.

If a milestone is too large, split it into numbered submilestones with clear acceptance criteria. Avoid leaving half-integrated code while describing an entire phase as complete.

Maintain these documents, adapting names only if equivalent documents already exist:
- `docs/backend/implementation-plan.md`: ordered milestones, dependencies, scope and acceptance criteria.
- `docs/backend/progress.md`: completed work, current commit, checks actually executed, failures, blockers, next exact action.
- `docs/backend/architecture.md`: components, trust boundaries, data flows and environments.
- `docs/backend/decisions.md`: choices, rationale, alternatives, assumptions and unresolved business decisions.
- `docs/backend/requirements-traceability.md`: requirement → API/module → tables → permissions → tests → implementation status.
- `docs/backend/security.md`: threat model, controls, permission matrix, evidence and outstanding risks.
- `docs/backend/runbook.md`: local setup, configuration, migrations, backups, restore, deployment and incident handling.

On continuation, read the checkpoint and inspect the actual diff before proceeding. Never repeat completed work merely because conversation context was lost. Never mark a feature complete solely because its happy path works.

## 3. Default architecture

Use these defaults unless current code or a documented requirement provides a concrete reason to change them:
- NestJS and TypeScript backend, initially one modular application.
- PostgreSQL as the authoritative database.
- Prisma for typed database access and migrations; reviewed SQL migrations for constraints Prisma cannot express.
- REST API with OpenAPI, versioned under `/api/v1`.
- Firebase Authentication for sign-in, with phone OTP as the preferred method and an identity-provider adapter. Verify Firebase ID tokens on the backend. PostgreSQL and the Palito API remain authoritative for roles, permissions, and business data. Test SMS delivery to Bangladesh numbers, regional availability, abuse controls, and expected costs before enabling production phone sign-in.
- Private object storage for evidence, documents, and images.
- Durable background jobs and transactional outbox for notifications and external side effects. Start with a PostgreSQL-backed worker if it meets requirements; introduce Redis only for a demonstrated need.
- Existing npm workspace conventions; add the backend and portable API contracts without disrupting mobile dependency compatibility.

Verify current official documentation and compatible package versions before implementation. Follow the installed Expo SDK documentation for Expo changes. Do not install guessed versions, introduce duplicate React versions, or blindly upgrade the project.

Keep portable schemas, types and deterministic calculations reusable. Keep database credentials, trusted decisions, provider secrets and server authorization in server-only modules. Never import privileged server modules into client bundles. Do not reuse the whole DemoState as a production API response.

## 4. Non-negotiable data and security rules

Identity and authorization:
- Derive identity from a verified session/token. Validate issuer, audience, expiry and signature when applicable. Do not trust role, organization or actor identifiers supplied in request bodies.
- Model organizations and memberships for bank/insurer staff; individuals authenticate separately. Define farm collaboration permissions if required.
- Enforce resource ownership and organizational scope on every read and mutation, including lists, exports, file downloads, background jobs and nested resources.
- Privileged roles require invitation/approval. Verify veterinarians before clinical privileges. Require MFA for privileged accounts and sensitive operations; define recovery and reauthentication.
- Phone OTP needs rate limits, attempt limits, resend controls, expiry, single use and generic account-discovery responses. Test Bangladesh SMS delivery before claiming provider readiness.
- Prefer secure HttpOnly cookies for web sessions with CSRF protection. Use protected native credential storage for refresh tokens; avoid putting secrets in AsyncStorage or browser localStorage. Support revocation, suspension, logout and concurrent refresh safely.
- Keep role switching, seeded OTPs, clock controls, resets and simulated approvals behind an isolated demo mode. Production must fail closed if demo mode is enabled.

Database and consistency:
- Define foreign keys, unique constraints, checks, indexes and explicit state transitions. Enforce rules in the database where practical, not only in application checks.
- Use transactions and suitable locking/version checks for competing operations. An in-process JavaScript queue cannot protect multiple server instances.
- Prevent duplicate active collateral, conflicting policies, overlapping vet bookings and double settlement.
- Use UUIDs or an equivalent collision-resistant server ID strategy. Unpredictable IDs do not replace authorization.
- Specify time semantics: server UTC timestamps, Asia/Dhaka display, and date-only values for fields such as birth dates where appropriate.
- Production money uses integer poisha or an explicitly specified exact decimal representation. The existing shared contract uses whole BDT: implement explicit conversions and regression tests; do not silently reinterpret stored values. Avoid JavaScript floating-point financial arithmetic.
- Define deletion, retention, consent and data minimization according to actual product needs. Preserve clinical and financial history through amendments/reversals.

Finance and external effects:
- Separate farmer-estimated animal value from independently approved collateral valuation. Version valuation, assessor, date, expiry and quote terms.
- Define interest method, fees, rounding, installment dates, repayment allocation, grace and early settlement. If requirements do not specify them, implement a documented sandbox policy and leave real-money activation blocked pending an approved policy; never invent a production financial product.
- Use balanced ledger entries, immutable transaction references, reversals and reconciliation. App wallet balance is not proof of externally settled money.
- Persist idempotency keys bound to actor, operation and payload. Save the result with the mutation; handle concurrent duplicates and payload mismatch. Reuse a key after timeout/restart for the same payment intent, and use a new key for a new intent.
- Verify provider callbacks and expected amount, currency, recipient and reference. Deduplicate callbacks and tolerate reordered events. Never treat a success redirect as payment confirmation.
- Model pending/confirmed/failed/reversed states, timeouts, retries and recovery. A database rollback cannot undo an external transfer; use recorded intent and reconciliation.
- Insurance debt settlement and farmer remainder must reconcile exactly to the authorized claim amount. Use an outbox so committed work cannot lose its follow-up tasks.

Files, IoT and AI:
- Evidence must reference real private files and metadata; booleans such as `photo: true` are not verification. Validate ownership, type, size and content; quarantine/scan uploads where required; use short-lived authorized downloads.
- GPS/EXIF are untrusted evidence, not automatic proof. Record provenance, review and amendments.
- Authenticate devices independently, authorize binding/rebinding, validate readings, deduplicate sequence IDs and resist replay. Record device and server timestamps and handle late/missing readings.
- Define telemetry coverage with sampling tolerance, stale/disconnected behavior, threshold provenance and retention. Require review before real automated claim payouts.
- AI credentials and requests run on the server. Add limits, data minimization and failure handling. Clearly represent uncertainty and clinical escalation. AI cannot autonomously prescribe, lend, or settle claims. Simulated AI/calls/payments must remain visibly simulated when shown.

## 5. Findings to verify against current code

The previous review concerned commit `36d33ad3c1f8e6eb29bf4b0c3605172cbb37d310`. Reproduce each item against the current source before fixing; treat these as review leads:
1. `frontend/shared/src/support.ts`: fixed OTP `123456`, public `auth.switch`, permissive demo controls.
2. `frontend/shared/src/repository.ts` and client providers: complete local dataset and actor context stored on clients.
3. `frontend/shared/src/health.ts` plus `finance.ts`: farmer-edited value influences a new loan quote.
4. `frontend/web/src/lib/client.ts`: automatic fresh request IDs do not preserve a financial intent across retries. Mobile finance confirmation already preserves IDs within its dialog; reuse the useful pattern and handle restarts explicitly.
5. `hasIoTEvidence` in `finance.ts`: exact 48-hour boundary rejects coverage one minute later; test boundary jitter and missing samples.
6. Mobile loan details display interest but principal-only installments; shared outstanding starts at principal. Reconcile UI and authoritative schedule.
7. `support.ts`: medicine purchasing checks for any nonempty prescription rather than matching medicine/authorization; review expiry and quantity. Farmer order-status advancement is a demo capability, not a production fulfillment privilege.
8. Generated `.next` files tracked, no CI previously present, web lint script only typechecks, and contradictory old phase documentation.

The 18 shared tests previously passed; passing demo tests is not proof of production authorization, database concurrency or device behavior.

## 6. Ordered implementation milestones

### Milestone 0 — Grounded assessment and executable plan
Inspect the current project and run available baseline checks. Build the complete requirements traceability matrix and permission matrix. Inventory every demo command and classify it as production API, local preference, demo-only action or deferred integration. Define module boundaries, initial schema, API approach, identity model and migration strategy. Record business-policy gaps and realistic sandbox defaults. Update outdated documentation carefully. Deliver the plan and checkpoint; do not implement all remaining milestones yet.

Acceptance: no generic plan disconnected from files; every current workflow is mapped or explicitly deferred with reason; current failures and unavailable checks are recorded.

### Milestone 1 — Backend foundation and automated checks
Create the backend workspace, configuration validation, local environment templates, reproducible PostgreSQL development setup, structured logs with redaction, request correlation, error contract, runtime input validation, OpenAPI, health/readiness endpoints and graceful shutdown. Configure request/body limits, CORS allowlist, headers and appropriate rate limits. Add CI for reproducible install, lint, typecheck, tests and builds. Ignore generated output and remove it from tracking without deleting source. Keep secrets out of commits.

Acceptance: a fresh checkout can start the API and database from documented commands; invalid configuration fails clearly; CI runs actual linting and tests; no fake passing scripts.

### Milestone 2 — Database schema, migrations and test fixtures
Implement identity mappings, organizations/memberships, farms, animals, approved valuations and supporting tables for the next workflow. Document the target schema for later modules and add their migrations when implemented. Define database roles, tenant isolation strategy, constraints and indexes. If using RLS, test the actual API connection role and pooled-connection context; do not assume table owners/service credentials are restricted. Add separate synthetic development/test seeds and migration tests on a clean database.

Acceptance: migrations are reproducible; duplicate/invalid relationships are rejected; tests use PostgreSQL rather than only mocks; production has no default administrator password or seeded bypass.

### Milestone 3 — Authentication and authorization
Integrate Firebase Authentication, local development setup/test identity strategy, phone OTP flow, privileged onboarding, organization membership, MFA enforcement, session lifecycle and suspension. Verify Firebase ID tokens on the backend and implement centralized permission checks and scoped queries; never trust client-supplied roles. Connect mobile and web login/logout with real loading and error states. Test Firebase phone sign-in and SMS delivery to Bangladesh numbers, regional availability, abuse controls and expected costs. If credentials are missing, finish local contract tests and setup instructions, mark live delivery unverified, and continue independent work without replacing real auth with a production bypass.

Acceptance: cross-user/cross-organization access fails for reads and writes; manipulated role claims cannot grant access; revocation and expired sessions behave correctly; production rejects demo controls.

### Milestone 4 — First complete production workflow
Implement farmer farm/animal registration and passport, authorized vet discovery/booking, vet acceptance, consultation, signed prescription/history and farmer reminders. Add actual file handling where needed. Prevent scheduling races. Integrate both frontends through an API client with scoped queries, cache invalidation, pagination, pending/error/empty states and version-conflict behavior. Replace relevant demo calls rather than leaving disconnected backend endpoints.

Acceptance: the entire farmer-to-vet journey runs through the API and PostgreSQL on both platforms; unrelated users cannot access it; simultaneous slot reservations cannot both succeed.

### Milestone 5 — Durable jobs, notifications and operational reliability
Implement outbox/worker, bounded retries, backoff, dead-letter handling, reminder scheduling, notification preferences and delivery status. Separate push/SMS contents from sensitive records. Add backups, restore procedure, observability and outage handling. Define offline behavior: which reads are cached, which edits can queue, and which operations require connectivity. Never silently queue irreversible payments.

Acceptance: restarting after a committed transaction does not lose jobs; replaying a job does not duplicate user-visible effects; test a restore into a separate database.

### Milestone 6 — Financial foundation and lending sandbox
Implement approved valuations, versioned quotes, collateral reservation, lending review, terms, schedules, repayment allocation, ledger, payment intents and sandbox-provider adapter. Preserve the 70% cap only where confirmed by project requirements. Connect bank and farmer screens. Test parallel requests across separate API instances/connections.

Acceptance: editing an estimate cannot raise approved borrowing power; duplicate collateral is rejected; repayment timeout/retry is safe; principal, interest, installments and ledger reconcile.

### Milestone 7 — Insurance and claim settlement sandbox
Implement policy lifecycle, premium confirmation, private claim evidence, vet referral/opinion, insurer decisions, reviewer separation where required, and debt-first settlement. Integrate insurer/farmer/bank views with the same authoritative records. Do not equate metadata presence with fraud detection.

Acceptance: invalid coverage and unauthorized reviews fail; concurrent payouts settle once; failed provider calls remain recoverable; debt settlement plus farmer payout equals approved total.

### Milestone 8 — Telemetry, AI, commerce and remaining requirements
Implement each remaining feature as a separate verified submilestone from the traceability matrix. Add authenticated telemetry, trusted device binding, ingestion validation, alert escalation and coverage logic. Implement bounded server AI integration and clinical handoff; provider-backed calls if required; prescription-aware commerce, inventory, fulfillment and refunds. Keep unavailable providers explicitly pending rather than inventing successful integrations.

Acceptance: test every implemented workflow, resource scope, provider failure and replay path. Every original requirement has an honest status.

### Milestone 9 — System QA and security remediation
Run business-rule tests, API integration tests against real PostgreSQL, authorization matrix tests, web Playwright flows and mobile device automation (such as Maestro). Test the three connected healthcare/insurance/lending journeys end to end. Cover uploads, session abuse, CSRF, IDOR/BOLA, injection, mass assignment, callbacks and secret exposure. Run dependency/secret scanning and appropriate static analysis. Resolve findings with regression tests.

Test weak connectivity, timeout after commit, duplicate callbacks, multiple tabs/devices, process restart, expired tokens, worker crash, missing telemetry and provider outages. Check Bangla text, accessibility, date/currency formatting and lower-end Android performance. Define workload assumptions and measurable load-test targets before running performance tests. Scope scanning to local/staging systems under our authorization.

Acceptance: report actual commands, pass/fail counts, evidence and unresolved issues. Browser mobile emulation does not count as native device testing. Never claim a full security audit from one scanner or test suite.

### Milestone 10 — Deployment preparation and pilot checklist
Prepare separate development/staging/production configurations, reproducible builds, least-privilege credentials, migration release procedure, rollback/forward-repair plan, monitoring, backup/restore evidence, incident runbook and onboarding guidance. Document provider credentials, business approvals and service costs still needed. Check that demo data, controls and provider stubs cannot activate silently in production.

Acceptance: produce a concrete pilot-readiness report separating implemented, verified, unverified and blocked capabilities. Prepare deployment changes for review; do not activate paid infrastructure, production migrations, real SMS campaigns or real money transfers without explicit authorization.

## 7. Verification and response contract

Write tests alongside important behavior, especially permissions, financial calculations, concurrency and recovery. Use mocks for provider faults and real PostgreSQL for database guarantees. Never weaken a test or security rule merely to make CI pass. Do not delete existing regression coverage without explaining and replacing its purpose.

For every milestone report:
1. Outcome and exact scope completed.
2. Relevant files changed and why.
3. API/schema/permission changes.
4. Checks actually executed and results; distinguish previous reports from current execution.
5. Remaining assumptions, blockers and unverified external behavior.
6. Checkpoint location and exact next milestone.

Protect unrelated work. Use a dedicated branch/worktree if available; do not force-push, merge or deploy automatically. Commit only if repository/session instructions authorize it. Never print credentials or copy real personal data into tests. Explain decisions in simple English, with technical detail in project documents.

If external credentials, hardware or an approved business policy are missing, finish all independent work and document the dependency precisely. Ask only for information that materially blocks the next dependent action. Never describe a stub as a live integration, or the application as production-ready while material checks remain unverified.

START NOW WITH MILESTONE 0 ONLY. Inspect the actual repository, produce the grounded implementation plan and durable checkpoint, run the available baseline checks, and stop at that milestone boundary.
