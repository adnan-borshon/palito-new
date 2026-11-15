# Backend implementation backlog

Derived from the uploaded [source plan](source-plan.md), reconciled to source `b31b165bc92f2734776b608aeba241a6b9dd291e` on 2026-11-15. Engineering owns implementation/test evidence; product, clinical and partner policy owners are assigned in decisions. Read traceability for individual PAL IDs and planned acceptance tests. M0–M3 were delivered and reviewed; M4 healthcare is authorized and implemented for review. See progress.md and healthcare.md for actual evidence/limits. M5+ remain unimplemented.

Release A: identity + healthcare + reliable jobs; finance disabled or explicit sandbox. Release B: finance sandbox after approved terms/ledger/contracts. Release C: independently gated telemetry/AI/calls/commerce/reporting/provider pilot. These groups sequence all requirements; they do not remove any SRS/PAL scope. Initial API and conceptual tables are in architecture/API contracts; schema migrations are M2, not M0.

### M0 — Requirements, tools and technical decisions
**Status:** completed at `bca35e3`; user reviewed and authorized M1 on 2026-11-15.
**Completed outputs:** original SRS/source reconciliation; 65-row traceability; 53-command migration inventory; architecture/schema/API/permissions design; auth/SDK decisions and provider/policy gaps; reviewed backend guidance; baseline checks and limitations in progress.
**Exit evidence:** exact requirement/command set equality, no invented test claims, accurate tooling statuses, source/provenance and current check results recorded. See progress for any unavailable checks. Live providers/native hardware remain unverified and explicitly gated rather than claimed complete.
**Review:** B03–05 staff/native auth, B07 no-charge pilot, financial/clinical policy ownership, SRS gap dispositions. User instruction to proceed with M1 received; unresolved product/provider policies still gate their dependent milestones.

### M1 — Backend and CI foundation
**Status:** complete at `db0cea1`; user reviewed and authorized M2. See [M1 report](progress-m1.md) and [archived checkpoint](milestone-1-checkpoint.md).
**Depends on:** M0 architecture.
**Work:** backend workspace, configuration validation, PostgreSQL development setup, logging/redaction, errors, OpenAPI, request limits, CORS/security headers, health/readiness and shutdown. Establish reusable authentication guard boundary, even before Firebase integration. Untrack generated build output and make web lint genuine.
**Tests planned:** clean setup, invalid config, safe errors and readiness behavior; CI install/lint/typecheck/unit/build.
**Exit:** fresh checkout setup reproducible; secrets absent; no placeholder always-green checks.
**Skills:** Palito backend; GitHub CI tooling.

### M2 — Database foundation
**Status:** reviewed; user authorized M3. See [database design](database.md) and [M2 checkpoint](milestone-2-checkpoint.md).
**Depends on:** M1.
**Work:** identity, membership, farm, animal and clinical prerequisites; migrations; constraints; database roles; synthetic seeds; monetary/date contracts. Document later financial schema without building unused modules.
**Tests planned:** clean migration, upgrade from prior version, foreign keys, duplicate identity/membership and invalid ownership.
**Exit:** actual PostgreSQL enforces intended rules; migration role separated from runtime role; schema and API contracts agree.
**Skills:** Palito backend; relevant PostgreSQL skills.

### M3 — Firebase identity and authorization
**Status:** software implementation delivered for review, including staff/MFA/invitations/recovery/native configuration. [Identity implementation](identity.md) and [operator runbook](m3-operator-runbook.md) distinguish automated evidence from outstanding live-provider/physical-device acceptance.
**Depends on:** M2; SDK/MFA decisions from M0.
**Submilestones:** M3a emulator/token verification and /me; M3b mobile/web session lifecycle; M3c privileged invitation/MFA and permission matrix.
**Work:** signup/onboarding, verified identity mapping, account suspension, role/membership approval, phone change/recovery, logout/revocation, CSRF and abuse controls.
**Tests planned:** invalid/expired/wrong-project token, unverified MFA, stale membership, suspension, cross-account read/write, session fixation/CSRF, auth deep links and process restart.
**Exit:** both clients use real auth paths; protected endpoints deny unauthorized callers; emulator credentials impossible in production; real SMS and hardware results explicitly recorded or unverified.
**Skills:** Firebase tooling; Palito backend; device/browser tools.

### M4 — Healthcare workflow end to end
**Current status:** implemented for review; actual contract in [healthcare](healthcare.md), checks in [progress](progress.md).
**Depends on:** M3.
**Submilestones:** M4a farms/animals/passports and private files; M4b discovery/slots/appointments; M4c consultation/prescription/history; M4d mobile/web integration and parity.
**Work:** availability/time-zone rules, cancellation/rescheduling, clinical amendments, vet verification, scoped patient access, consent and expiry. Define booking-payment dependency: use an explicit no-charge pilot or disable paid booking until M6; never fake a completed payment.
**Tests planned:** farmer A versus B isolation, simultaneous slot reservation, invalid state changes, prescription author/animal linkage, file access and clinical amendments.
**Exit:** farmer registration → appointment → vet consultation → prescription works through API/PostgreSQL in both apps; reminders are recorded, with reliable delivery completed in M5.
**Skills:** Palito backend, PostgreSQL, Playwright and native tooling.

### M5 — Jobs, reminders and recovery
**Depends on:** M4 domain events; job interfaces introduced earlier.
**Work:** outbox and worker, delivery deduplication, retries/backoff, failed-job triage, reminders, four-hour escalation where confirmed, notification preferences and minimal message contents. Add backups, monitoring and account-scoped cache cleanup.
**Tests planned:** crash before/after delivery, duplicate processing, timezone/date changes, disabled preferences, inaccessible file links and restore.
**Exit:** committed events are durable; repeat processing is safe; external delivery ambiguity is reconciled. Do not promise exactly-once SMS delivery where the provider cannot guarantee it.
**Skills:** Palito backend, PostgreSQL operations and provider docs.

### M6 — Financial foundation and lending sandbox
**Depends on:** M3–5; approved sandbox policy.
**Submilestones:** M6a money/ledger/intents; M6b approved valuation/quotes/collateral; M6c application/decision/schedule; M6d disbursement/repayment/grace/reconciliation.
**Work:** capture accepted term version, independent valuation, 70% cap from confirmed requirements, reservation expiry/release, supported repayment schedule, ledger entries and provider adapter. Scope bank staff to organization/case.
**Tests planned:** two API instances reserve one animal; expiry between quote and acceptance; farmer estimate changes; rounding; repayment and payout races; response lost after provider success; duplicate/out-of-order callbacks; debt below claim amount and above claim amount.
**Exit:** ledger, schedules and allocations reconcile; no double debit/disbursement; unsettled provider transactions are visible and recoverable; frontend shows verified pending/confirmed states.
**Skills:** Palito backend, PostgreSQL, OWASP guidance, Playwright.

### M7 — Insurance and claim settlement sandbox
**Depends on:** M6 ledger/loan contracts.
**Submilestones:** enrollment/premium/coverage; private claim evidence; referral/review/appeal; settlement.
**Work:** incident-time eligibility, coverage version, reviewer permissions, seven-day review target and notification rules. Distinguish policy decision from confirmed premium. Approve/settle with audit trails. Atomically allocate approved funds to eligible debt and remainder, then perform external effects durably.
**Tests planned:** expired/renewed policy boundary, repeat illness claim policy, unauthorized vet review, simultaneous repayment and claim settlement, partial settlement, callback duplication and unsupported evidence.
**Exit:** approvals require authorized evidence review; allocations never exceed claim/debt; deceased animal cannot secure new borrowing; existing policy and debt history preserved.
**Skills:** Palito backend, PostgreSQL, security guidance and browser tests.

### M8 — Remaining functional scope
**Depends on:** relevant M3–7 contracts. Deliver each as its own milestone.
- M8a telemetry: secure provisioning/binding, readings, event-time validation, replay resistance, retention, trends and tolerance-aware coverage. Handle stale data and device transfer. Automated claim decisions remain disabled pending validated policy.
- M8b AI/voice/photo: server adapters, budgets, privacy, prompt/version tracking, vetted guidance and handoff; test Bangla/English, hostile inputs and provider outage. No autonomous clinical or financial authority.
- M8c calls/emergencies: provider tokens limited to assigned appointment participants, reconnection, consent and expiry. Confirm actual emergency coverage before promising dispatch.
- M8d commerce: catalog/stock, prescription item matching and dispensing limits, order/payment/fulfillment/refund lifecycle; trusted staff/provider advances delivery.
- M8e administration/education/reporting: least-privilege user management, published-only content, audited exports, aggregates and real service metrics.
**Exit:** each requirement has a real implementation or explicit deferral; mocks stay labeled; do not invent UC-004 because the matrix states it has no defined use case.
**Skills:** relevant domain skill, provider docs, security and platform test tools.

### M9 — System QA and security remediation
**Depends on:** intended pilot scope implemented.
**Work:** execute full API/database security matrix, cross-platform journeys, scanner triage, device accessibility and load/recovery tests. Fix actual defects and add regressions.
**Exit:** UC-001/002/003 pass for enabled scope; no unresolved critical/high exploitable issue; residual risks have owner and release decision; unsupported hardware/provider checks are clearly listed.
**Skills:** Palito backend; OWASP guidance; Playwright; Maestro; selected scanner; PostgreSQL performance skills.

### M10 — Deployment preparation and controlled pilot
**Depends on:** M9 release evidence and business/provider readiness.
**Work:** environment separation, least-privilege credentials, repeatable build, migration expansion/backfill/contraction strategy, health checks, monitoring, alert ownership, restore drill and incident runbook. Rehearse staging rollout/rollback; irreversible schema changes need forward-repair strategy.
**Exit:** concrete release checklist, support owner, verified backups, budget and provider configuration, staged feature enablement and documented rollback triggers.
**Boundary:** preparing a deployment is not permission to activate production or transfer real funds.


## Immediate next step after M2 review

Historical M3 boundary: M3 integrates Firebase verification and server-owned account/membership permissions, then real client session lifecycle and approved staff MFA. Review current provider prerequisites, emulator/project configuration, native SDK/device compatibility and the original B03–B06 gates. Do not treat synthetic UIDs, pending vet fixtures or database access as real identity verification. M3 must not silently implement all M4 care or M6 finance workflows.

Current stop: user review after M4. Do not implement M5 delivery/jobs until separately authorized.
