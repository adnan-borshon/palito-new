# Palito — Backend implementation plan
**Planning document · 15 November 2026 · No implementation authorized by this document**

## 1. Executive decision

Build one NestJS application with clear domain modules, PostgreSQL and Prisma, Firebase Authentication, and private object storage. Preserve the Expo mobile and Next.js web applications and progressively connect their workflows to the same API. Keep the existing shared domain tests as a starting point, while moving authoritative permissions and mutations to the server.

The first deliverable is a complete farmer-to-vet workflow. Financial features follow after identity, permissions, transactions, files and reliable jobs are established. Production financial services remain conditional on partner policies and provider integration evidence.

This plan describes future work only. No application code, migrations, tests, infrastructure, plugin installation, branch changes or deployments were executed for this planning request. Reading source files and preparing this document do not constitute milestone completion.

## 2. Evidence and current baseline

| Source | Observation | Planning consequence |
|---|---|---|
| Attached Palito_Master_Implementation_Prompt.md | Firebase Auth; NestJS; PostgreSQL; Prisma; milestones 0–10; one verified milestone per response | Preserve that order and its completion gates |
| GitHub main at b31b165bc92f2734776b608aeba241a6b9dd291e | backend contains only .gitkeep; Expo, Next.js and shared packages exist | Backend implementation starts from a foundation, not an assumed existing API |
| docs/implementation-plan.md | Mobile approval and web completion recorded | Old mobile-only phase restrictions need reconciliation |
| docs/requirements-matrix.md | Existing PAL-* requirements and UC-001/002/003; outdated web gate still present | Retain requirement identifiers; distinguish demo acceptance from production acceptance |
| docs/progress.md | Historical reports of shared/mobile verification and complete frontend roles | Historical evidence only; no checks rerun for this plan |
| PR #1, head 859a3445b9adc59edd66b8c88e021d67fabf5d8c | Open and unmerged; adds .agents/skills/backend/SKILL.md and modifies AGENTS.md | Skill is proposed on a branch, not active on main |
| Repository tree | Generated .next files remain tracked; no .github workflow files observed | Plan cleanup and CI setup in milestone 1 |

The SRS PDF was not extracted again for this plan. Requirement coverage below is based on the repository's SRS-derived matrix. Direct comparison with the original PDF is a milestone-0 task before freezing acceptance criteria. This is not a new exhaustive line-by-line code review; earlier defect findings must be rechecked against the current code.

Links: [repository snapshot](https://github.com/adnan-borshon/palito-new/tree/b31b165bc92f2734776b608aeba241a6b9dd291e), [requirements matrix](https://github.com/adnan-borshon/palito-new/blob/b31b165bc92f2734776b608aeba241a6b9dd291e/docs/requirements-matrix.md), [skill PR](https://github.com/adnan-borshon/palito-new/pull/1).

## 3. Scope, releases and decision boundaries

**Release A — healthcare pilot:** real identity, verified vets, farms/animals, scoped passports, appointment scheduling, consultations, clinical records/prescriptions, private uploads, reminders, basic admin/content, monitoring and recovery. Financial functions are disabled or clearly sandboxed.

**Release B — finance sandbox:** versioned valuations, loan applications and terms, schedules, policies, claims, balanced ledger, provider simulation and sandbox integration. No suggestion that displayed balances are withdrawable funds.

**Release C — extended pilot:** trusted IoT, reviewed alert rules, bounded AI support, calls, commerce, reporting and approved provider integrations. Enable each capability only after its own gate; unresolved features remain explicitly pending.

All original features stay in the traceability backlog. Release grouping changes sequencing, not contractual scope. A feature may ship later without being silently dropped.

Decisions needed before dependent implementation:
- Bank/insurer organization boundaries, staff approval rules and valuation authority.
- Which clinical data each bank/insurer can see, for what purpose, and for how long.
- Interest method, fees, installments, rounding, repayment allocation, grace, default, early repayment and settlement.
- Insurance coverage at incident date versus submission date; waiting periods, renewals, repeated illness claims, partial payouts and appeal rules.
- Payment and video providers, object-storage provider, hosting region and operating budget.
- Actual device protocol, sampling frequency, species-specific alert thresholds, ownership transfer and evidence policy.
- Supported devices and minimum Android/iOS targets; accessibility and retention obligations.

Use documented sandbox policies while financial rules are unresolved. Product owner and relevant partner approve the policy; the coding agent must not invent production terms.

## 4. Architecture and responsibility boundaries

| Component | Responsibility | Explicit boundary |
|---|---|---|
| Expo mobile | Native UI, Firebase sign-in, protected credential handling, permitted cached reads | Cannot authorize loans, modify verified valuations or prove payments |
| Next.js web | Desktop workflows, session entry, responsive UI | UI role selection never grants server permissions |
| NestJS API | Authentication verification, authorization, validation, domain commands, scoped queries | Sole entry point for business mutations |
| PostgreSQL | Authoritative records, relationships, concurrency constraints, ledger, outbox | Not publicly accessible to mobile/web clients |
| Prisma | Typed persistence and migration history | Advanced constraints may require reviewed SQL |
| Worker | Outbox delivery, reminders, escalation, reconciliation and retries | Uses explicit service permissions and deduplication |
| Firebase Auth | Identity verification and supported sign-in/MFA flows | Palito roles/memberships remain server-owned |
| Private storage | Clinical photos, claims, documents | Downloads require authorized, expiring access |
| Provider adapters | Payments, SMS/push, calls, AI, telemetry transport | External states become trusted only after validation/reconciliation |

Start with one API deployment and a worker using the same codebase and PostgreSQL. Add Redis or additional services only after a demonstrated performance or operational need. Do not start with microservices.

Suggested repository structure:
- backend/src/modules/{identity,organizations,farms,animals,clinical,appointments,files,notifications,finance,loans,insurance,devices,commerce,content,admin}
- backend/src/platform/{config,database,logging,jobs,providers}
- backend/prisma/{schema.prisma,migrations}
- backend/test/{integration,security,concurrency}
- frontend/shared: portable types and pure calculations; clearly isolated demo fixtures/repository.
- A small portable API-contract/client package if the existing shared package cannot safely separate contracts from demo exports.
- docs/backend: architecture, decisions, traceability, security, progress and runbook.

Controllers validate and translate requests; application services enforce permissions and state transitions; persistence code handles transactions. Shared calculations may preview results on clients, but the server recalculates before committing.

## 5. Skills, plugins and testing tools

A repository skill provides instructions. A plugin/MCP connection provides capabilities. A test runner or scanner executes checks. These must be tracked separately.

| Tool or skill | Planned use | Milestones | Current status / integration rule |
|---|---|---|---|
| Palito backend skill in PR #1 | Project-specific backend, permissions, finance and QA rules | Every milestone | Exists on unmerged branch. Review and adopt before coding; does not install external tools |
| Official Firebase plugin/MCP | Inspect Firebase setup and assist auth configuration | 0, 3, 9, 10 | Previously discovered as available; installation in the user's coding environment is unverified. Use emulator/development project first |
| Microsoft postgres-skills | Vendor-neutral PostgreSQL schema, indexing, transactions and operations guidance | 2, 5–9 | Recommended external skill collection; not installed by PR #1. Select relevant portable skills, not Azure deployment assumptions |
| Playwright CLI/skills or MCP | Browser exploration, test authoring and failure diagnosis | 4, 6–9 | Use one primary browser automation route; commit repeatable Playwright tests for CI |
| GitHub integration | Repository reads, PR review and CI result inspection | Every milestone | Connected here; writes only within subsequently authorized work |
| OWASP ASVS/API Security guidance | Threat-model and security-review checklist | 0, 3–10 | Reference standards, not an installed Palito plugin or automatic audit |
| Jest or existing compatible runner + HTTP test library | Backend unit and API tests | 1 onward | Pick one compatible runner; reuse existing tooling where practical |
| PostgreSQL test service / Testcontainers if viable | Real transaction, migration and isolation tests | 2 onward | Real PostgreSQL required; choose CI services if local Docker is too heavy |
| Maestro and physical devices | Native end-to-end and lifecycle verification | 3, 4, 9 | Future test tooling; web emulation cannot replace this |
| CodeQL or Semgrep; dependency/secret scanning | Static analysis, dependency and credential checks | 1, 9, 10 | Choose supported CI configuration; review findings rather than stacking redundant scanners |

**Skill adoption tasks before implementation:** review PR #1 and reconcile contradictory AGENTS.md wording. The new SKILL.md currently lacks standard name/description YAML front matter; add it during a later authorized change if the target agent requires it, then verify discovery. Keep a direct AGENTS.md link as a fallback. Review external skill content, supported client, license and pinned version/commit; record them in a tooling manifest. Do not fabricate installer lock entries or imply that a README link means a tool is installed.

Load only the skill relevant to the current milestone. Palito's approved requirements override generic recommendations. Neither Firebase tooling nor a database skill is allowed to choose Firestore, Supabase Auth or Azure hosting automatically. If a skill conflicts with safe migrations, the approved database workflow wins.

References: [Firebase MCP](https://firebase.google.com/docs/ai-assistance/mcp-server), [PostgreSQL skills](https://github.com/microsoft/postgres-skills), [Playwright agent tools](https://playwright.dev/docs/getting-started-cli), [OWASP secure coding with AI](https://cheatsheetseries.owasp.org/cheatsheets/Secure_Coding_with_AI_Cheat_Sheet.html).

## 6. Firebase authentication design

### Farmer access
Phone OTP through Firebase with consent, normalized Bangladesh numbers, region restrictions, resend/abuse controls and delivery/cost monitoring. Test against multiple local operators before calling it ready. A second SMS to the same factor is not meaningful MFA.

### Privileged access
Propose an invited staff flow with a supported primary provider and MFA, while retaining phone contact details. Firebase's documented web MFA prerequisites exclude phone authentication as the primary provider and require Identity Platform for the documented SMS MFA capability. Confirm selected factors, account plan and native SDK support before implementation. This is an explicit design decision to approve in milestone 0; do not promise phone-only sign-in plus built-in MFA for every role.

### Web session
Prefer a same-origin API gateway/reverse proxy so cookies and CSRF handling are predictable. After Firebase client sign-in, exchange a recently issued ID token for a Firebase server session cookie. Disable persistent browser Firebase credentials for that flow, verify CSRF/origin and auth_time, set Secure/HttpOnly/SameSite and clear client auth state. The API verifies the session cookie; clients cannot use a cookie as an ID token. Expiry requires the documented refresh/reauthentication path.

### Mobile session
First prove the Expo SDK and Firebase library combination for phone authentication, app verification and credential persistence in a development build. Inspect how the chosen SDK stores credentials; do not assume every Firebase package can use SecureStore directly. Prefer SDK-managed lifecycle with verified OS protection. Do not manually extract or duplicate refresh tokens into AsyncStorage. API receives Firebase ID tokens, verifies them and maps UID to a unique Palito user.

### Authorization
Check Palito account status and membership on every protected request. Set an explicit revocation policy; sensitive operations should check revocation and recent authentication. Custom claims may be hints, but stale tokens must not preserve revoked membership. Bootstrap the first administrator through a controlled one-time process with an audit event and no public self-promotion endpoint.

Sources: [server session cookies](https://firebase.google.com/docs/auth/admin/manage-cookies), [MFA prerequisites](https://firebase.google.com/docs/auth/web/multi-factor). These provider details are verified references, not completed implementation.

## 7. Permission model

Default deny. A role identifies a capability set; ownership, relationship, organization, consent and record status determine actual access.

| Resource/action | Farmer | Veterinarian | Bank staff | Insurer staff | Administrator |
|---|---|---|---|---|---|
| Animal identity | Own/authorized farm | Assigned care relationship | Linked application collateral fields | Linked policy/claim fields | Audited support scope |
| Clinical records | Own animal; observations distinguished from clinical entries | Assigned care; create signed/versioned entries | Minimum approved risk summary | Necessary claim/coverage evidence | No unrestricted clinical editing |
| Appointment | Own animal booking/cancel rules | Own schedule and assigned visits | None | None unless explicitly required | Audited operational support |
| Verified valuation | Read; submit supporting estimate/evidence | Assess only if explicitly authorized | Approve/use under valuation policy | Read permitted insured value | Cannot silently overwrite approved value |
| Loan/repayment | Own applications and payment intents | No financial authority | Own organization and assigned cases | Linked settlement information only | Reconciliation/support privileges only |
| Claim/payout | Own submission/status | Referred review only | Linked debt settlement only | Own organization; approval rules | Audited exception process |
| Roles/content | Profile/preferences | Profile/availability | Organization-scoped staff rules | Organization-scoped staff rules | Explicit user-management/content permissions |

Define grant expiry after consultations/claims end, staff departure and ownership transfer. Test lists, exports, signed file links and nested routes as carefully as detail endpoints. Admin is not an automatic permission to rewrite clinical or financial history.

## 8. Database and API plan

| Domain | Core tables | Important constraints / indexes |
|---|---|---|
| Identity | users, organizations, memberships, invitations, vet_credentials | Unique Firebase UID; membership organization/user key; explicit status |
| Livestock | farms, farm_memberships, animals, ownership_history, valuations | Stable animal ID/tag; valid relationships; immutable approved valuation version |
| Clinical | appointments, consultations, health_records, prescriptions, prescription_items, reminder_events | Slot exclusion/unique reservation strategy; referenced prescriber; amendments instead of overwrites |
| Files | file_objects, evidence_links, review_events | Owner/purpose checks; quarantine state; immutable hash/version |
| Lending | loan_quotes, loans, collateral_reservations, installments, repayment_allocations | Unique live collateral reservation; quote expiry/version; nonnegative allocations |
| Insurance | policies, claims, claim_reviews, settlement_allocations | Valid coverage windows; approved decision version; single settlement identity |
| Money | ledger_accounts, ledger_transactions, ledger_entries, payment_intents, provider_events | Balanced transaction per currency; unique provider event; append-only posted entries |
| Operations | outbox_events, job_attempts, notifications, audit_events, idempotency_records | Unique logical event/delivery key; bounded retries; durable actor/operation key |
| Extension | devices, device_bindings, telemetry, alerts, products, stock_reservations, orders, content | Unique device sequence within session; event-time index; no negative stock; publication status |

Use BIGINT minor units with a documented JSON representation (decimal strings where necessary) and explicit BDT/poisha conversion at API boundaries. Store currency with money. Use date-only birth dates and UTC instants for events; display Asia/Dhaka. Add indexes from actual scoped query patterns and inspect plans with realistic data.

Use application-scoped authorization plus a least-privilege database role initially. RLS is an optional additional layer after a concrete tenant-context design; if adopted, test pooled connections and the actual runtime role. Do not assume service credentials enforce RLS.

Proposed endpoint families:
- /api/v1/me, /sessions, /organizations, /memberships
- /farms, /animals, /animals/{id}/passport, /valuations
- /vets, /appointments, /consultations, /prescriptions
- /files/uploads, /files/{id}/download, /notifications
- /loan-quotes, /loans, /payment-intents, /policies, /claims
- /provider-webhooks/{provider}, /devices, /telemetry, /orders, /content, /admin/reports

Define exact methods and DTOs in milestone 0/feature design. Use allowlisted runtime validation; bounded pagination; stable sorting; standard error codes; request correlation; version/conflict tokens; and sensitive mutation idempotency. No generic endpoint that accepts all demo commands. Responses contain only authorized projections.

Do not import local demo datasets into production. Development fixtures and emulators remain separate. Existing legitimate user data, if discovered later, requires its own validated import plan.

## 9. Milestones and acceptance gates

### M0 — Requirements, skills and technical decisions
**Inputs:** master prompt, source snapshot, original SRS, PAL matrix and PR #1.
**Work:** reconcile source/SRS; classify every demo command; define API/domain boundaries and permission matrix; resolve Firebase staff MFA and mobile SDK approach; identify provider/policy gaps; review/adopt tools in section 5.
**Outputs:** architecture, traceability, decision register, milestone backlog and baseline-check plan.
**Exit:** every PAL requirement mapped; unknown policies marked; tools accurately labeled installed/proposed; no false test claims.
**Scope now:** this document supplies a planning baseline. Future direct SRS review and runtime baseline checks remain pending.

### M1 — Backend and CI foundation
**Depends on:** M0 architecture.
**Work:** backend workspace, configuration validation, PostgreSQL development setup, logging/redaction, errors, OpenAPI, request limits, CORS/security headers, health/readiness and shutdown. Establish reusable authentication guard boundary, even before Firebase integration. Untrack generated build output and make web lint genuine.
**Tests planned:** clean setup, invalid config, safe errors and readiness behavior; CI install/lint/typecheck/unit/build.
**Exit:** fresh checkout setup reproducible; secrets absent; no placeholder always-green checks.
**Skills:** Palito backend; GitHub CI tooling.

### M2 — Database foundation
**Depends on:** M1.
**Work:** identity, membership, farm, animal and clinical prerequisites; migrations; constraints; database roles; synthetic seeds; monetary/date contracts. Document later financial schema without building unused modules.
**Tests planned:** clean migration, upgrade from prior version, foreign keys, duplicate identity/membership and invalid ownership.
**Exit:** actual PostgreSQL enforces intended rules; migration role separated from runtime role; schema and API contracts agree.
**Skills:** Palito backend; relevant PostgreSQL skills.

### M3 — Firebase identity and authorization
**Depends on:** M2; SDK/MFA decisions from M0.
**Submilestones:** M3a emulator/token verification and /me; M3b mobile/web session lifecycle; M3c privileged invitation/MFA and permission matrix.
**Work:** signup/onboarding, verified identity mapping, account suspension, role/membership approval, phone change/recovery, logout/revocation, CSRF and abuse controls.
**Tests planned:** invalid/expired/wrong-project token, unverified MFA, stale membership, suspension, cross-account read/write, session fixation/CSRF, auth deep links and process restart.
**Exit:** both clients use real auth paths; protected endpoints deny unauthorized callers; emulator credentials impossible in production; real SMS and hardware results explicitly recorded or unverified.
**Skills:** Firebase tooling; Palito backend; device/browser tools.

### M4 — Healthcare workflow end to end
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

## 10. Requirements coverage map

| Existing requirements | Planned delivery | Evidence required |
|---|---|---|
| PAL-ACC-01–06 | M3/M4; demo account/reset actions isolated | Session/onboarding/localization tests; production demo denial |
| PAL-FARM-01–04 | M4 | Scoped registration, dashboard, passport and history |
| PAL-FARM-05–07 | M8a | Device identity, timestamp/stale tests, telemetry provenance |
| PAL-HEALTH-01–05 / UC-001 | M4/M5/M8a/M8c | Alert → priority booking → intervention → reminders and allowed insurer notification |
| PAL-AI-01–03 | M8b | Animal context, provider faults, privacy and escalation |
| PAL-CARE-01–10 | M4/M5/M6/M8c | Booking, decisions, receipts, calls, prescription and schedule |
| PAL-SHOP-01–03 | M8d | Stock/reservation, prescription authorization, order/refund |
| PAL-INS-01–09 / UC-002 | M7/M8a | Policy/evidence/review; debt-first payout and reconciliation |
| PAL-LOAN-01–09 / UC-003 | M6/M7 | Verified quote, collateral, decision, disbursement, repayment/grace |
| PAL-WAL-01–02 | M6/M7 | Ledger-derived balance, safe financial retries |
| PAL-NOT-01 | M5 | Recipient scope, read state, durable delivery |
| PAL-ADM-01–04 | M3/M8e | Staff approval, content, audit, safe reports |
| PAL-QA-01–05 | Every milestone; M9 aggregate | Language/device/accessibility, failures, persistence and real evidence |
| PAL-GATE-01 | M0 reconciliation | Existing mobile approval recorded; outdated docs corrected in future work |

Expand these groups into one row per ID in the future traceability file, with endpoint, tables, rule, test ID, owner and status.

## 11. Frontend migration and consistency

Replace feature groups gradually. Preserve a named demo environment and introduce an API-backed environment; never silently fall back to demo after an API error. Each feature must have one authoritative source.

Replace whole-state selectors with scoped query hooks. Introduce loading/empty/error states, pagination, auth-aware cache keys, cancellation, stale-data labels and conflict handling. Invalidate related queries after changes. Clear private caches and offline drafts appropriately on logout/account switch.

Financial intents retain an identifier across retries and restarts. Disable duplicate submissions in UI, but enforce idempotency on the server. Do not automatically queue payments offline. Low-risk offline edits require an explicit draft/outbox/conflict policy.

Create API contract tests and a frontend parity checklist before retiring demo paths. Changes to DTOs must remain compatible with released mobile versions; deprecate/version intentionally rather than assuming everyone updates immediately.

## 12. QA, security and measurable release evidence

Proposed initial engineering targets, subject to workload sizing in M0:
- At the agreed pilot workload, ordinary non-provider API reads p95 <=500 ms and writes p95 <=800 ms in staging.
- Queue processing normally starts within 60 seconds; alert on sustained backlog. External SMS delivery has separate measurements.
- Zero accepted cross-user/cross-organization access in the defined permission test matrix.
- Zero duplicate financial posting in concurrency/retry tests; balance and allocation invariants always hold.
- Candidate recovery targets: RPO <=1 hour and RTO <=4 hours. Confirm hosting/backup cost before accepting them.
- Native smoke runs on at least a lower-end Android device and a representative supported iOS device if iOS is in pilot scope.

Select synthetic pilot volumes from expected farms, herd size, staff concurrency and device sampling rate. Record dataset and load shape with every performance result.

CI plan: reproducible install; lint/typecheck; domain tests; API tests with PostgreSQL and Firebase test environment; builds; focused web journeys; static/dependency/secret scans. Run broader browser/native/load/restore jobs on scheduled or release gates as appropriate.

Security review covers Firebase misuse, object-level authorization, unsafe role assignment, injection, mass assignment, file access, CSRF/XSS exposure, OTP abuse, SSRF through provider/media URLs, webhook forgery, device replay, log leakage and backup access. Scanners supplement these scenario tests.

Historical test counts are not release evidence. Every check records commit, environment, command, pass/fail, timestamp and artifact. Never list an unexecuted command as passed.

## 13. Risks and deliberate mitigations

| Risk | Mitigation / gate |
|---|---|
| Phone OTP + privileged MFA assumption | Resolve supported staff primary provider and Identity Platform requirements in M0/M3 |
| Native Firebase compatibility | Small development-build proof before committing the auth UI implementation |
| Client-wide demo state leaks | Scoped API projections and negative authorization tests |
| Finance rules remain vague | Approved policy versions; sandbox only until resolved |
| Multiple services double-charge | Durable intent/idempotency, concurrency constraints, callback deduplication, reconciliation |
| Skill/AGENTS conflict | Review PR #1; add discovery metadata; document precedence and pin external versions |
| Thin laptop resources | Prefer CI database/test services and selected local checks; avoid unnecessary infrastructure |
| SMS/provider outages or unexpected spend | Budgets, rate limits, monitored provider states and explicit degradation |
| “Verified” photos/IoT without proof | Evidence provenance and review, authenticated devices and conservative automation |
| Broad scope prevents a usable release | Ship healthcare slice first; keep all later requirements in the backlog |

## 14. Delivery governance and effort

Assign roles even if one person holds several: product owner (scope/policy), implementation owner (API/DB), frontend owner, QA/security reviewer, and operations owner. Changes to permissions, money and migrations need a reviewer who examines failure paths as well as happy paths.

Use small PRs per milestone/submilestone. Each includes problem, behavior, schema/API impact, evidence and rollback considerations. Keep the master prompt as workflow guidance; progress and decision files hold actual state.

Rough planning estimate for an experienced full-stack developer with review support:
- Foundations/auth (M0–3): 12–22 engineering days.
- Healthcare/reliability (M4–5): 12–22 days.
- Finance/insurance sandbox (M6–7): 18–32 days.
- Extensions (M8): 15–30 days, highly provider-dependent.
- Integrated QA and pilot preparation (M9–10): 12–22 days.
Total: approximately 69–128 engineering days, excluding partner approvals and waiting for providers/devices. This is an estimation range, not a delivery promise. A student team or limited weekly hours needs a separate calendar schedule. AI assistance does not remove review, integration and verification work.

The first future implementation task is M0 completion: reconcile the SRS and current source, finalize the auth/MFA decisions, formalize the skill setup, and create the durable backlog. No implementation should begin merely because this planning document has been generated.
