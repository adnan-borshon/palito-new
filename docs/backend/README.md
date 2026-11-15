# Backend milestone 0 review

Prepared 2026-11-15 against main `b31b165bc92f2734776b608aeba241a6b9dd291e`. Only M0 is authorized in this change. No backend runtime, migrations, provider configuration, frontend behavior changes or deployments are included.

Start with [progress](progress.md) for executed checks and remaining limitations. Review these decisions before authorizing M1:

1. Keep NestJS + PostgreSQL + Prisma + Firebase Auth, one API and one PostgreSQL-backed worker.
2. Farmer phone OTP; invited privileged staff use verified email/password plus SMS MFA through Identity Platform. Native Firebase development-build compatibility must pass M3 before rollout; no phone-primary MFA bypass.
3. Healthcare pilot first; propose no-charge appointments until payment integration. Finance and automatic clinical/financial decisions remain disabled pending reviewed policies.
4. Keep every existing PAL requirement. Additional SRS gaps are recorded without promising blockchain, accuracy or payout timings.

| Document | Review purpose |
|---|---|
| [Architecture](architecture.md) | Components, domain ownership, data model and migration boundaries |
| [API contracts](api-contracts.md) | Proposed methods, DTOs, read projections and error/idempotency rules |
| [Traceability](requirements-traceability.md) | One row for each of the 65 PAL IDs, plus SRS gaps and use cases |
| [Command inventory](command-inventory.md) | All 53 current commands classified and mapped |
| [Decisions](decisions.md) | Proposed auth choice, policy owners and blocking deadlines |
| [Security](security.md) | Permission matrix, trust boundaries and adversarial test plan |
| [Tooling](tooling.md) | Reviewed/adopted versus installed/proposed tooling |
| [Milestones](implementation-plan.md) | M0 checkpoint and M1–M10 acceptance gates |
| [Runbook](runbook.md) | Current checks and future operational verification |
| [Source plan](source-plan.md) | Uploaded planning baseline (trailing blank lines normalized); historical statements remain historical |

These are design contracts, not implemented endpoints or evidence of production readiness. Test IDs in traceability are planned acceptance tests unless progress explicitly records execution. Engineering owner means the next implementer; product/partner decisions require the named decision owner. M1 starts only after the user's review and instruction.
