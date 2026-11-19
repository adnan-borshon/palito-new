# Database foundation (M2)

Prisma ORM/client/pg adapter are pinned together at **7.10.1**, using the ESM TypeScript client generator. PostgreSQL is authoritative; no Firestore, SQLite or client demo data is substituted. Application objects live in `palito`; `public` contains the administrator-provisioned `btree_gist` extension only. The API's Prisma-backed database service uses a bounded pg pool and explicit `palito` schema; M1 health and shutdown behavior remain.

## Implemented tables and boundaries

| Table | Core invariant / query index |
|---|---|
| users | UUID identity, unique Firebase UID/optional normalized phone/email, explicit account status and locale; no client-selected role |
| organizations | Platform/bank/insurer/clinic kind and status; composite identity/kind key |
| memberships | One user/org row; FK binds actual org kind; role must fit kind; user/status and org/status indexes |
| vet_credentials | Unique registration; verified/rejected review needs another reviewer and timestamp; pending is not verified |
| farms | Owner FK, required profile, positive exact area in acres; owner + createdAt/id index |
| farm_memberships | Unique farm/user pair; explicit collaboration role and membership status; no implicit owner/admin grant |
| animals | Farm/owner composite FK; unique normalized tag; date-only birth; finite positive weight; exact nonnegative BDT estimate; version and scoped indexes |
| ownership_history | Append-only owner-change events, referenced users/animal, distinct from/to owner; animal/time index |
| valuations | Separate from farmer estimate; unique animal/version; owner snapshot; positive window and exact money; independent approval and immutable approved versions |
| appointments | Existing animal/farm/farmer/vet; current owner/farm verified on insert; immutable participant snapshot; positive time window; GiST prevents active vet-slot overlap |
| health_records | Observation versus signed verified-vet source; same-animal appointment/amendment references; append-only rows and indexed history |
| prescriptions | Prescriber/animal must match signed clinical record; draft -> signed; signed parent immutable |
| prescription_items | Existing prescription, required medicine/dose/frequency and positive days; signed parent prevents insert/update/delete of items |

Membership/care permissions are still server responsibilities in M3/M4. There is **no RLS claim**: a trusted API database role can read its granted application tables. No domain data routes are exposed yet, and the global identity verifier continues to reject protected requests. These constraints establish valid relationships, not the full request-level permission matrix.

Appointment and valuation ownership fields are snapshots. An animal's later move does not rewrite or invalidate prior appointment/clinical/valuation history. New appointments/observations validate against the current owner/farm. The low-level transactional transfer test proves history retention; an actual transfer endpoint, consent/grant revocation, active-visit policy and financial encumbrance checks remain M4/M6.

Signed health records are amended through new same-animal rows. Approved valuation versions cannot be updated/deleted; reassessment needs another version. Prescription items lock their parent row before mutation, so signing serializes against item changes. These are database controls against ordinary DML, not cryptographic immutability or a restriction on an authorized migration owner dropping a trigger.

## Migration history

1. `20261115000100_core`: Prisma-derived enums/tables/indexes/FKs. The administrator pre-provisions the schema; the migration deliberately omits database-wide CREATE SCHEMA. SQL is wrapped in a transaction.
2. `20261115000200_integrity`: reviewed checks, append-only/signature/ownership triggers, active appointment exclusion, and explicit runtime grants. SQL is wrapped in a transaction.

`schema.prisma` describes supported model structure; custom SQL migrations own PostgreSQL-only constraints/triggers/privileges. `prisma migrate deploy` is the supported deployment path. Do not replace it with `db push`, edit a published migration, or infer that Prisma's model diff checks trigger/check semantics. Integration tests exercise those semantics separately. The test suite also runs official Prisma model drift comparison.

The upgrade test deploys the first migration alone into a new database, inserts a synthetic user, applies the second migration using the real CLI, verifies preservation and the new checks, then repeats deploy with no pending work. These test databases are disposable; no production/database reset is authorized. A failed real migration needs reviewed diagnosis/forward repair, not an automatic reset.

## Database roles

| Credential | Allowed work | Denied / isolated work |
|---|---|---|
| DATABASE_ADMIN_URL | Explicit local bootstrap: prepare extension/schema/roles and credentials | Never used by the API or production seed; bootstrap refuses nonlocal and non-development/test targets |
| MIGRATION_DATABASE_URL (`palito_migrator`) | Own `palito` schema, run reviewed DDL/migrations and grants | No superuser, CREATE DATABASE/ROLE, replication, bypass-RLS or inherited roles; separate from API credential |
| DATABASE_URL (`palito_runtime`) | Explicit application-table DML and type/schema usage; append-only tables restricted | No schema/DDL, migration-history read/write, TRUNCATE, role creation/SET ROLE, temp tables or migration ownership |

New objects receive no blanket runtime table privileges. Every future migration must grant only its required tables/operations and preserve `_prisma_migrations` isolation. Public database/schema privileges are revoked in the dedicated application database. Roles use UTC and bounded idle transactions. This is application-database hardening; cluster networking, other databases, credential rotation and deployment secrets are M10 concerns.

Development/production API configuration requires the `palito_runtime` username; the Prisma migration config requires `palito_migrator` when a migration URL is supplied and never falls back to DATABASE_URL. Tests may use an administrator URL solely to create/drop uniquely named temporary databases. The local setup generator emits distinct random passwords, never prints them, preserves an existing file and uses mode 0600 where supported. Bootstrap refuses inherited roles, unexpected role attributes, reused credentials and non-development/test database names. Existing role passwords are preserved; bootstrap is not a rotation command. Integration tests reuse matching existing local role credentials and never drop the application database.

## Data contracts

- Money: BDT minor units in PostgreSQL BIGINT; JSON `{currency:"BDT",amountMinor:"12345"}` is BDT 123.45. Canonical nonnegative decimal strings, maximum 9223372036854775807; no floating point/exponents/leading zeros. Existing whole-BDT demo values convert explicitly x100 after safe-integer validation. No demo snapshot import occurs.
- Dates: PostgreSQL DATE for births, strict YYYY-MM-DD parsing with impossible-date rejection; UTC timestamptz(3) for events; Asia/Dhaka is display context. Both helper and real database round trips are tested, including BIGINT above JavaScript's safe integer limit.
- Measurements: numeric(8,3) kilograms and numeric(12,3) acres; reject NaN and nonpositive values. Acres match the existing mobile farm form's explicit unit. No clinical species thresholds or financial policy is invented.
- Seed: explicit `SEED_SYNTHETIC=true`, development/test mode, dedicated local database, runtime role. Idempotent transactions insert synthetic UID/ID fixtures only; no passwords, valid Firebase credentials, administrator membership, verified vet or approved valuation are seeded. Nothing seeds on startup/install/migration.

## Explicitly later scope

**M5, M6, and M7 migrations added:**
6. `20261115000600_jobs_notifications_ops`: `outbox_events`, `job_attempts`, `notifications`, `notification_preferences`, `reminder_adherence_events`, and `audit_events` with `FOR UPDATE SKIP LOCKED` polling indexes, immutable `audit_events` / `notifications` triggers (allowing only `read_at` updates on notifications), and `palito_runtime` grants.
7. `20261115000700_lending_ledger_sandbox`: `finance_commands`, `ledger_accounts`, `ledger_transactions`, `ledger_entries`, `loan_quotes`, `loans`, `collateral_reservations` (`one_live_collateral_per_animal` partial unique index), `loan_installments`, `payment_intents`, `repayment_allocations`, and `provider_events` with `DEFERRABLE INITIALLY DEFERRED` double-entry balance trigger (`SUM(DEBIT) = SUM(CREDIT)`) and immutable ledger triggers.
8. `20261115000800_insurance_claim_settlement_sandbox`: extends `ledger_accounts` (`INSURER_POOL`) and `ledger_transactions` (`POLICY_PREMIUM`), and adds `insurance_policies` (`one_live_policy_per_animal` partial unique index), `insurance_claims` (`one_live_claim_per_policy` partial unique index), `claim_evidence_links`, `claim_referral_grants`, `claim_reviews`, and `claim_settlement_allocations` (`debt_allocated_minor + farmer_allocated_minor = total_settled_minor`) with immutability triggers and `palito_runtime` grants.

M8 (devices/telemetry/AI/calls/commerce/content) remains future schema work and is unimplemented.
