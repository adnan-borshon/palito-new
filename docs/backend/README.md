# Palito backend review

M5 (jobs, reminders & recovery), M6 (financial foundation & lending sandbox), M7 (insurance & claim settlement sandbox), M8 (telemetry/AI/calls/commerce/admin extensions), M9 (system QA & security matrix), and M10 (deployment preparation & controlled pilot readiness) are implemented for review after verified M4. Read [current progress](progress.md), [deployment & pilot M10](deployment-pilot-m10.md), [QA & security M9](qa-security-m9.md), [extensions M8](extensions-m8.md), [insurance M7](insurance-m7.md), [lending M6](lending-m6.md), [ops M5](ops-m5.md), [healthcare](healthcare.md), [identity](identity.md) and [runnable setup](../../backend/README.md). No production deployment/migration, merge, paid activation, real money transfer, or real OTP campaign is included.

Real workspaces on web and Expo mobile are separate from preserved local demo routes:
- `/care` includes M4 care plus M5 notification inbox, `notify-v1` preferences, daily `Asia/Dhaka` adherence, and M8 published content, bounded AI triage, and pharmacy catalog/orders. Booking defaults off (`HEALTHCARE_NO_CHARGE_PILOT=true` enables BDT 0 pilot only).
- `/finance` exposes M6 lending & M7 insurance/claim settlement sandbox workflows (`FINANCE_SANDBOX_ENABLED=true`, default off `503`), clearly displaying non-withdrawable sandbox disclosures.
- M8 telemetry, AI, call tokens, commerce, and admin extensions fail closed (`503`) unless `EXTENSIONS_SANDBOX_ENABLED=true`.
- M10 adds `DEPLOYMENT_TIER` separation (`development | test | staging | production`), immutable 9-migration `SHA-256` preflight verification (`npm run preflight:deploy --workspace @palito/backend`), automated rollback trigger evaluation (`evaluatePilotOperationalHealth`), and the pilot readiness matrix ([deployment-pilot-m10.md](deployment-pilot-m10.md)).

| Document | Purpose |
|---|---|
| [Progress](progress.md) | Current M0–M10 implementation, executed checks, and environment boundaries |
| [Deployment & Pilot M10](deployment-pilot-m10.md) | Environment tiers, least-privilege roles, immutable migration preflight, SLO/rollback triggers, pilot readiness matrix |
| [QA & Security M9](qa-security-m9.md) | Automated security matrix (`SEC-DEMO`, `SEC-AUTH`, `SEC-INPUT`, `SEC-SCOPE`, `SEC-IOT`, `SEC-AI`, `SEC-LOG`) & residual boundaries |
| [Extensions M8](extensions-m8.md) | Telemetry/alerts (M8a), bounded AI (M8b), call tokens/emergencies (M8c), commerce (M8d), admin content/exports (M8e) |
| [Insurance M7](insurance-m7.md) | Policy enrollment, confirmed-premium activation, vet referral/opinion, maker/checker claim decision, debt-first settlement |
| [Lending M6](lending-m6.md) | Opt-in sandbox gate, maker/checker valuations, 70% LTV cap, collateral locks, ledger triggers, HMAC webhooks |
| [Ops M5](ops-m5.md) | Outbox worker, reminder/escalation sweeps, adherence, file cleanup, ops admin endpoints, backup rehearsal |
| [Healthcare](healthcare.md) | Actual M4 routes, consent, state/time rules and private file protocol |
| [Identity](identity.md) / [M3 operator runbook](m3-operator-runbook.md) | Firebase, current memberships, staff MFA, sessions and live setup gates |
| [Database](database.md) | Relational foundation and restricted roles; 9 migrations through M8 |
| [Architecture](architecture.md) / [API contracts](api-contracts.md) | Baseline contracts superseded per milestone by `identity.md`, `healthcare.md`, `ops-m5.md`, `lending-m6.md`, `insurance-m7.md`, `extensions-m8.md` |
| [Traceability](requirements-traceability.md) / [Command inventory](command-inventory.md) | Preserved 65 PAL requirements and 53 demo command mappings |
| [Decisions](decisions.md) / [Security](security.md) | Policy ownership, sandbox gates, and trust boundaries |
| [Milestones](implementation-plan.md) / [Runbook](runbook.md) | Delivery gates, worker startup, and verification commands |
| [Source plan](source-plan.md) | Historical uploaded baseline |

M0–M4 checkpoints remain historical evidence. Live Firebase/ADC/native identities, real SMS/push/payment gateways, real-money terms (B08–B10), and physical-device checks remain explicit release gates. Local Windows host execution lacks PostgreSQL/Docker, so PostgreSQL + Firebase Emulator integration suites (`backend/test/integration/`) and `rehearse-backup-restore.mjs` require a configured PostgreSQL 18.7 / CI environment and are reported separately from local unit/HTTP/type/lint/build checks.
