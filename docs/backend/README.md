# Backend foundation review

Updated 2026-11-15. The user reviewed M0 and authorized M1. The NestJS/config/operations/CI foundation is implemented; review [current progress](progress.md), [M1 report](progress-m1.md) and [runnable setup](../../backend/README.md). M2 and later work require another instruction. No domain migrations, Firebase integration or deployment is included.

Start with [progress](progress.md) for executed checks and remaining limitations. M0 architectural direction remains the baseline; dependent provider/policy gates remain:

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

Domain documents remain design contracts. Only the M1 operations/configuration/security foundation listed in the checkpoint is implemented; this is not production readiness. Test IDs in traceability are planned acceptance tests unless progress explicitly records execution. Engineering owner means the next implementer; product/partner decisions require the named decision owner. M1 is now authorized and delivered for review; M2 waits for the user's next instruction.
