# Backend M2 checkpoint

Updated 2026-11-15. **M1 reviewed; M2 database foundation implemented for user review. Stop before M3.** Branch/PR: `codex/palito-m0-assessment`, [PR #2](https://github.com/adnan-borshon/palito-new/pull/2). M1 base: `db0cea1ddd325e67d21cc1704a52e6727e503a3d`. The live PR head identifies this implementation commit.

Read [database design](database.md), [backend setup](../../backend/README.md), architecture/decisions and traceability. Earlier [M0 report](milestone-0-report.md) and [M1 checkpoint](milestone-1-checkpoint.md) remain history. M1 hosted CI/security runs passed before M2 began; the final PR description records that evidence. All 65 PAL requirements and 53 commands remain mapped; no user workflow is marked complete merely because its prerequisite tables exist.

## Implemented

- Pin Prisma CLI/client/pg adapter **7.10.1**; generate an ignored ESM TypeScript client explicitly during build/typecheck/test compilation. The existing database service now uses Prisma/pg for bounded readiness and graceful close.
- Add **13 core tables** in private schema `palito`: users, organizations, memberships, vet_credentials, farms, farm_memberships, animals, ownership_history, valuations, appointments, health_records, prescriptions and prescription_items.
- Two versioned transactional migrations implement model structure, unique/FK/check/exclusion constraints, immutable signed/approved history and explicit runtime grants. No database-wide CREATE permission is needed by the migration role.
- Add local-only role/schema/extension bootstrap. Distinct random administrator/migrator/runtime secrets are generated into ignored configuration. Existing configuration and role passwords are preserved; unexpected privileges/inherited roles are refused. API development/production configuration requires runtime username; CLI migration configuration requires migrator username and never falls back to the runtime URL.
- Add guarded, atomic, idempotent synthetic fixtures. No default admin membership, working Firebase identity, verified vet or approved valuation is seeded. No seed runs on install/startup/migrate and no frontend demo snapshot is imported.
- Exact BIGINT BDT minor-unit JSON helpers, safe whole-BDT conversion, strict date-only parsing, UTC instants and exact acres/kg decimals. Farm acres match the existing mobile form. Approved valuations are distinct from editable estimates.
- Preserve old appointment/clinical/valuation snapshots when current animal ownership changes. Signed prescriptions and their items reject later edits/additions. The actual owner-transfer workflow and permission/consent/encumbrance rules are later milestones.

No Firebase, membership/session APIs, care/finance endpoints, provider integration, paid activation, deployment or production database change occurred. Both clients remain on their demo repository and M1 default-deny identity guard remains in place.

## Actual checks

Local Linux/Node **24.22.1**/npm **11.9.0**, real disposable PostgreSQL **18.6** binaries. CI pins Node **24.22.3** and PostgreSQL **18.7-alpine**. Docker is unavailable locally; no local Compose-start claim. Test databases are uniquely named, local-only, removed afterward and never the development application database. Existing local role credentials are reused rather than rotated.

| Check | Actual evidence |
|---|---|
| Fresh npm ci with install scripts disabled and generated client removed | Exit 0; **1,661 packages** installed; explicit Prisma generation rebuilt the client |
| Prisma validate/generate | Valid schema/client at 7.10.1; no database credentials needed for generation/validation |
| npm run lint:all | Exit 0: real mobile/web/backend lint, no disabled rules; shared has no lint script |
| npm run typecheck | Exit 0: all four workspaces, including generated Prisma types and Next route types |
| npm test | **43 passed, 0 failed**: existing 31 frontend/shared + 12 backend foundation/contract/setup tests |
| npm run build:backend | Exit 0: generated client plus runnable ESM backend |
| Real PostgreSQL integration | **16 passed, 0 failed, 0 skipped**, using real Prisma migrate deploy, restricted runtime connections and two independent reservation connections |
| Clean/upgrade/idempotent migrations | Both migrations applied cleanly; first-version synthetic user survives second migration; repeated deploy has no work; official Prisma model drift diff exits 0 |
| Runtime role denial | DDL, migration-history access, TRUNCATE, temp tables, role creation and SET ROLE denied; superuser/createdb/createrole/bypass-RLS flags false |
| Data integrity/history | Duplicate identity/membership, wrong org/owner/farm, invalid dates/money/weight, pending-vet signatures, mismatched clinical links and immutable history rejected; rollback, BIGINT precision, signed-item protection and ownership snapshot retention verified |
| Synthetic seed/setup | Repeated seed creates no duplicates; production/nonlocal/admin seed targets rejected; fresh credentials distinct/private; existing .env is not overwritten |
| Gitleaks / dependency audit | Staged source scan: exit 0, no leaks found. Audit gate: exit 0, zero high/critical, 1 low + 20 moderate findings retained. Backend-scoped audit: one moderate advisory |
| Workflow/source/scope checks | 65 requirements, 53 commands, 13 models, exact Prisma pins, one React, unchanged frontend source, links/tables and staged whitespace validated |

The first integration attempt exposed Prisma's redundant CREATE SCHEMA requiring database-wide privileges. The unpublished initial migration now relies on administrator pre-provisioning; privileges were not widened. An ownership FK test was corrected to assert PostgreSQL's specific RESTRICT violation code rather than generic FK code. Tests then passed. Historical relationships use snapshots so later ownership changes retain evidence. These are schema integrity controls, not a completed security audit.

**59 tests passed locally** (43 default + 16 PostgreSQL integration). Runtime tests also verify that newly created tables receive no automatic grants and trigger functions are not publicly executable.

## Limits / review boundary

No RLS or request-level tenant authorization is claimed. The runtime database role is a trusted API role; M3/M4 must enforce active accounts, memberships, assignment and consent on each scoped request. Valuation authority and financial terms remain partner policy gates. Role/bootstrap tests are local development work, not production migrations. Existing lower-severity dependency findings remain for targeted triage; the dependency gate rejects high/critical issues.

At this code checkpoint hosted M2 runs have not yet been observed; available runs are inspected after push and the PR description records their subsequent status. Local PostgreSQL 18.6 results must not be mislabeled as hosted 18.7 evidence. No native/provider/load/restore or production-readiness claim is made.

## Resume exactly here

1. Read AGENTS, this checkpoint, database design, current PR checks and user feedback; inspect the actual branch/diff.
2. **Wait for the user's M2 review and explicit next instruction. Do not start M3 automatically or merge either PR.**
3. Once authorized, M3 integrates Firebase token/session verification, active server-owned accounts/memberships, suspension/recovery and approved staff MFA, with emulator/provider/native evidence separated. Never use synthetic UIDs or database fixtures as a production auth bypass. M4/M6 workflows remain later scope.
