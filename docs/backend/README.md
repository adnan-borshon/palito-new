# Palito backend review

M4 healthcare is implemented for review after verified M3. **Stop before M5.** Read [current progress](progress.md), [healthcare](healthcare.md), [identity](identity.md) and [runnable setup](../../backend/README.md). No production deployment/migration, merge, paid activation or real OTP campaign is included.

The real `/care` workspace is separate from preserved local demo routes. Booking defaults off; an explicit `HEALTHCARE_NO_CHARGE_PILOT=true` development/staging choice enables only BDT 0 care. Reminder delivery remains M5; paid care M6; actual video provider M8c.

| Document | Purpose |
|---|---|
| [Progress](progress.md) | Current implementation, checks and limits |
| [Healthcare](healthcare.md) | Actual M4 routes, consent, state/time rules and private file protocol |
| [Identity](identity.md) / [M3 operator runbook](m3-operator-runbook.md) | Firebase, current memberships, staff MFA, sessions and live setup gates |
| [Database](database.md) | Relational foundation and restricted roles; M4 adds the fifth migration |
| [Architecture](architecture.md) / [API contracts](api-contracts.md) | Baseline direction; healthcare.md overrides planned M4 routes |
| [Traceability](requirements-traceability.md) / [Command inventory](command-inventory.md) | Preserved 65 PAL requirements and 53 demo command mappings |
| [Decisions](decisions.md) / [Security](security.md) | Policy ownership and trust boundaries |
| [Milestones](implementation-plan.md) / [Runbook](runbook.md) | Delivery gates and verification |
| [Source plan](source-plan.md) | Historical uploaded baseline |

M0–M3 checkpoints remain historical evidence, not current feature status. Live Firebase/ADC/native identities, real SMS and physical-device checks remain explicit release gates. M4 uses bounded private PostgreSQL image objects as a small-pilot adapter pending managed storage, quotas and retention review. Emulator, native SDK mocks, hosted Chrome and actual Android compilation are distinct kinds of evidence; none substitutes for live device/project acceptance.
