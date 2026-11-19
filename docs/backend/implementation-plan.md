# Backend implementation backlog

Derived from the uploaded [source plan](source-plan.md), reconciled to source `b31b165bc92f2734776b608aeba241a6b9dd291e` on 2026-11-15. Engineering owns implementation/test evidence; product, clinical and partner policy owners are assigned in decisions. Read traceability for individual PAL IDs and planned acceptance tests. M0–M9 (through extensions M8a–M8e and security QA M9) are implemented for review; M10 (deployment preparation & controlled pilot) remains stopped awaiting review and live-provider/partner gates. See `progress.md`, `extensions-m8.md`, and `qa-security-m9.md` for actual evidence/limits.

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
**Current status:** implemented for review; actual contract in [ops M5](ops-m5.md), checks in [progress](progress.md).
**Depends on:** M4 domain events; job interfaces introduced earlier.
**Work:** outbox and worker (`OutboxWorkerService`, `worker.ts`), delivery deduplication, retries/backoff, dead-letter triage/retry, due & four-hour overdue escalation sweeps with adherence suppression, Asia/Dhaka daily adherence, notification preferences (`notify-v1`) and minimal message contents, expired non-READY upload cleanup, ops health/audit endpoints, and backup/restore rehearsal (`rehearse-backup-restore.mjs`).
**Tests:** unit/math/DTO/HTTP auth checks (`ops.test.ts`), shared M5 care tests, and PostgreSQL integration suite (`ops.scenario.ts`, requires CI/PostgreSQL).
**Exit:** committed events are durable; repeat processing is safe; simulated adapter (`in-app-only`/`sandbox`) does not send real telecom SMS/push.

### M6 — Financial foundation and lending sandbox
**Current status:** implemented for review behind explicit `FINANCE_SANDBOX_ENABLED=true` gate; actual contract in [lending M6](lending-m6.md), checks in [progress](progress.md).
**Depends on:** M3–5; explicit sandbox policy (`sandbox-v1`).
**Submilestones:** M6a money/ledger/intents; M6b approved valuation/quotes/collateral; M6c application/decision/schedule; M6d disbursement/repayment/grace/reconciliation.
**Work:** maker/checker valuations, redacted bank risk projection, 70% LTV cap, expiring `sandbox-v1` quotes, single live collateral lock (`one_live_collateral_per_animal`), application/decision/disbursement, calendar-month schedule with remainder on final installment, FIFO allocation, manual reviewed grace, wallet & simulated provider intents, HMAC-SHA256 webhook deduplication, immutable balanced double-entry ledger, admin reconciliation, and separate `/finance` web/mobile sandbox screens.
**Tests:** unit/math/DTO/HTTP gate/signature checks (`finance.test.ts`), shared `FinanceWorkspace` & mobile component tests, and PostgreSQL integration suite (`finance.scenario.ts`, requires CI/PostgreSQL).
**Exit:** ledger, schedules and allocations reconcile (`balanced: true`); production forbids `FINANCE_SANDBOX_ENABLED`, `PAYMENT_PROVIDER=sandbox`, and `SANDBOX_WEBHOOK_SECRET`; B08–B10 partner terms remain required before real-money launch.

### M7 — Insurance and claim settlement sandbox
**Current status:** implemented for review behind `FINANCE_SANDBOX_ENABLED=true` (`ins-sandbox-v1`); actual contract in [insurance M7](insurance-m7.md), checks in [progress](progress.md).
**Depends on:** M6 ledger/loan contracts.
**Submilestones:** enrollment/premium/coverage; private claim evidence; referral/review/appeal; settlement.
**Work:** incident-time eligibility, `ins-sandbox-v1` coverage version, confirmed-premium activation (`APPROVED_AWAITING_PREMIUM -> ACTIVE`), policy renewal, READY private evidence linkage, 7-day review target tracking, advisory review, verified vet referral & signed clinical opinion, maker/checker claim decision, deceased animal status transition blocking new borrowing/insurance, and atomic debt-first claim settlement (`allocateClaimSettlement`) across `INSURER_POOL`, `BANK_POOL`, and `USER_WALLET`.
**Tests:** unit/math/DTO/HTTP tests (`finance.test.ts`), shared `FinanceWorkspace` insurance tests (`finance-workspace.test.ts`), and PostgreSQL integration suite (`insurance.scenario.ts`, requires CI/PostgreSQL).
**Exit:** approvals require authorized evidence review and maker/checker separation; allocations never exceed claim/debt; deceased animal cannot secure new borrowing; existing policy and debt history preserved.

### M8 — Remaining functional scope
**Current status:** implemented for review behind `EXTENSIONS_SANDBOX_ENABLED=true`; actual contract in [extensions M8](extensions-m8.md).
**Depends on:** relevant M3–7 contracts. Delivered across M8a–M8e:
- M8a telemetry: device provisioning with SHA-256 secret verification, secret-authenticated telemetry ingestion, event-time window & replay checks, 7-day sample/missingness summary, farm dashboard counts, reviewed threshold alerts (`HIGH_TEMPERATURE`, `LOW_BATTERY`), and 4h worker escalation (`sweepAlerts`). Automated claim decisions remain disabled.
- M8b AI/voice/photo: bounded AI triage (`ai-sandbox-v1`, 20/day budget), Bangla/English uncertainty & vet handoff, `VOICE` confirmed-transcript requirement, `PHOTO` `READY` private file validation, hostile override refusal (`sanitizeAiPrompt`), and provider outage fallback. Zero autonomous clinical or financial authority.
- M8c calls/emergencies: participant-only call session tokens limited to accepted/in-progress consultations with active `CareGrant`, and emergency triage requests with honest real-time vet slot coverage reporting.
- M8d commerce: versioned catalog, stock locking (`FOR UPDATE`), signed prescription medicine matching and cumulative dispensing cap, wallet/provider order settlement, paid cancellation refunds in ledger, and `ADMIN`-only fulfillment progression.
- M8e administration/education/reporting: admin user directory, last-admin self-suspension guard, draft vs published educational content isolation, safe system aggregates, and audited SHA-256 expiring exports.

### M9 — System QA and security remediation
**Current status:** implemented for review in [QA & security M9](qa-security-m9.md), `backend/test/security-matrix.test.ts`, `backend/test/extensions.test.ts`, and `backend/test/integration/extensions.scenario.ts`.
**Work:** automated security matrix (`SEC-DEMO`, `SEC-AUTH`, `SEC-INPUT`, `SEC-SCOPE`, `SEC-IOT`, `SEC-AI`, `SEC-LOG`), cross-tenant denial verification, strict mass-assignment refusal, and secret redaction checks. Unsupported physical-device and live-provider checks remain explicitly documented before M10.

### M10 — Deployment preparation and controlled pilot
**Depends on:** M9 release evidence and business/provider readiness.
**Work:** environment separation, least-privilege credentials, repeatable build, migration expansion/backfill/contraction strategy, health checks, monitoring, alert ownership, restore drill and incident runbook. Rehearse staging rollout/rollback; irreversible schema changes need forward-repair strategy.
**Exit:** concrete release checklist, support owner, verified backups, budget and provider configuration, staged feature enablement and documented rollback triggers.
**Boundary:** preparing a deployment is not permission to activate production or transfer real funds.


## Immediate next step after M2 review

Historical M3 boundary: M3 integrates Firebase verification and server-owned account/membership permissions, then real client session lifecycle and approved staff MFA. Review current provider prerequisites, emulator/project configuration, native SDK/device compatibility and the original B03–B06 gates. Do not treat synthetic UIDs, pending vet fixtures or database access as real identity verification. M3 must not silently implement all M4 care or M6 finance workflows.

Current stop: user review after M8 and M9. Do not implement M10 deployment preparation until authorized.
