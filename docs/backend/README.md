# Palito backend review

M5 (jobs, reminders & recovery) and M6 (financial foundation & lending sandbox) are implemented for review after verified M4. **Stop before M7.** Read [current progress](progress.md), [ops M5](ops-m5.md), [lending M6](lending-m6.md), [healthcare](healthcare.md), [identity](identity.md) and [runnable setup](../../backend/README.md). No production deployment/migration, merge, paid activation, real money transfer, or real OTP campaign is included.

Real workspaces on web and Expo mobile are separate from preserved local demo routes:
- `/care` includes M4 care plus M5 notification inbox, `notify-v1` channel preferences, and daily `Asia/Dhaka` reminder adherence. Booking defaults off (`HEALTHCARE_NO_CHARGE_PILOT=true` enables BDT 0 pilot only).
- `/finance` exposes M6 opt-in lending & ledger sandbox workflows (`FINANCE_SANDBOX_ENABLED=true`, default off `503`), clearly displaying non-withdrawable sandbox disclosures. Insurance/claims (`M7`) and live telecom/payment/video providers (`M8+`) remain stopped for review.

| Document | Purpose |
|---|---|
| [Progress](progress.md) | Current implementation, executed checks, and environment boundaries |
| [Ops M5](ops-m5.md) | Outbox worker, reminder/escalation sweeps, adherence, file cleanup, ops admin endpoints, backup rehearsal |
| [Lending M6](lending-m6.md) | Opt-in sandbox gate, maker/checker valuations, 70% LTV cap, collateral locks, ledger triggers, HMAC webhooks |
| [Healthcare](healthcare.md) | Actual M4 routes, consent, state/time rules and private file protocol |
| [Identity](identity.md) / [M3 operator runbook](m3-operator-runbook.md) | Firebase, current memberships, staff MFA, sessions and live setup gates |
| [Database](database.md) | Relational foundation and restricted roles; 7 migrations through M6 |
| [Architecture](architecture.md) / [API contracts](api-contracts.md) | Baseline contracts superseded per milestone by `identity.md`, `healthcare.md`, `ops-m5.md`, `lending-m6.md` |
| [Traceability](requirements-traceability.md) / [Command inventory](command-inventory.md) | Preserved 65 PAL requirements and 53 demo command mappings |
| [Decisions](decisions.md) / [Security](security.md) | Policy ownership, sandbox gates, and trust boundaries |
| [Milestones](implementation-plan.md) / [Runbook](runbook.md) | Delivery gates, worker startup, and verification commands |
| [Source plan](source-plan.md) | Historical uploaded baseline |

M0–M4 checkpoints remain historical evidence. Live Firebase/ADC/native identities, real SMS/push/payment gateways, real-money terms (B08–B10), and physical-device checks remain explicit release gates. Local Windows host execution lacks PostgreSQL/Docker, so PostgreSQL + Firebase Emulator integration suites (`backend/test/integration/`) and `rehearse-backup-restore.mjs` require a configured PostgreSQL 18.7 / CI environment and are reported separately from local unit/HTTP/type/lint/build checks.
