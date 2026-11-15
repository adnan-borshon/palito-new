> Current M3 update (2026-11-15): Firebase identity/session paths and opt-in `/identity` client screens are implemented. M3 software now includes staff invitation/approval, MFA/recovery, verified contact changes, revocation and native configuration; live-provider/device acceptance remains separate. Read [identity checkpoint](identity.md) for exact endpoints, setup, actual tests and provider/device release gates and completed staff/recovery implementation. Earlier milestone descriptions below remain historical or proposed unless superseded there.

# Architecture and migration design

Status: M0 target design plus M1/M2 foundations, 2026-11-15. Source snapshot: `b31b165bc92f2734776b608aeba241a6b9dd291e`.

## Historical M0 boundaries

Expo SDK 58 mobile and Next.js 16 web both consume `frontend/shared`. `createDemoRepository` stores the entire domain snapshot on clients, uses an in-process serial queue, and permits public demo/auth controls. This is useful demo behavior, not a server authorization boundary. `backend/.gitkeep` is the only backend file. Root workspaces do not include a backend. There are 495 tracked files under `frontend/web/.next`; no `.github` workflows exist at this snapshot.

The web adapter `frontend/web/src/lib/client.ts` preserves an explicitly supplied request ID but generates a new one on every other execution. A transport adapter alone cannot provide safe retry semantics, scoped queries, pagination or real identity. Mobile's confirmation dialog retains an ID during retry; process restart persistence still needs design and verification.

## Implemented M1 boundary

`backend` now contains an ESM NestJS API with configuration validation, safe logging/errors, global disabled identity verifier, exact-origin CORS, body/DTO limits, security headers, rate limiting, generated OpenAPI and liveness/readiness. `pg` performs only bounded SELECT 1 connectivity checks and closes on shutdown; Prisma schema/domain persistence remain M2. Development Compose targets PostgreSQL 18.7. CI and static/secret/dependency checks are configured; current execution evidence is in progress. Generated `.next` artifacts are no longer tracked. Neither client has switched to the API.

## Implemented M2 boundary

Prisma/client/pg adapter 7.10.1, two reviewed PostgreSQL migrations and separate local administrator/migrator/runtime credentials are implemented. M1 SELECT readiness now uses the typed Prisma-backed database service; it remains a connectivity probe, not a migration-version or domain-readiness claim. Core relationships, clinical/signature history, valuation independence and scheduling integrity are tested against real PostgreSQL. No RLS, Firebase or request-level domain authorization is claimed. Existing clients stay on demo data.

## Target deployment and trust

- Mobile -> Firebase native identity SDK -> HTTPS NestJS API with ID token. SDK compatibility and credential-at-rest protection are release gates.
- Web -> Firebase browser sign-in with in-memory persistence -> same-origin `/api/v1/sessions` exchange -> Secure/HttpOnly/SameSite session cookie. API verifies cookie, CSRF and origin; browser auth state is then cleared.
- API -> PostgreSQL through Prisma with a least-privilege runtime role. Migration role is separate. Business ownership and organization scope are server-owned and rechecked on protected requests.
- API -> private storage via short-lived authorized upload/download grants. Quarantine precedes trusted clinical/claim attachment status.
- API transaction -> domain mutation + audit + idempotency result + outbox. Worker -> provider adapters with deduplication, bounded retries and reconciliation.
- Firebase owns identity only. PostgreSQL owns roles, memberships, clinical records, finance, jobs and permissions. No Firestore or Supabase substitution.

Start with one modular API deployment and worker sharing code/database. Do not add microservices or Redis without measured need. Providers and hosting are unselected; no cloud resources are created in M0.

## Domain ownership and conceptual schema

All IDs are server-generated UUIDs. M2 implements the 13 core tables documented in [database foundation](database.md); other tables below remain target design. Prisma migrations and SQL-only integrity controls now exist, while domain endpoints are still unimplemented.

| Module / first delivery | Authoritative tables | Integrity and access boundary |
|---|---|---|
| Identity, organizations / M2–3 | users, organizations, memberships, invitations, vet_credentials | Unique Firebase UID; unique org/user membership; explicit account and membership status; reviewed vet credential before signing |
| Farms, animals / M2–4 | farms, farm_memberships, animals, ownership_history | Farm membership scope; stable tag; date-only birth date; ownership transfer revokes old grants and checks encumbrances |
| Valuations / M6 | valuations, loan_quotes, collateral_reservations | Approved independent version distinct from farmer estimate; expiry; one live reservation per animal; accepted quote immutable |
| Appointments, clinical / M2–4 | vet_slots, appointments, consultations, health_records, prescriptions, prescription_items, care_grants | Prevent overlap using PostgreSQL exclusion/reservation constraints; assigned verified vet; signed clinical entries amended, never silently replaced |
| Files / M4 | file_objects, evidence_links, file_review_events | Owner, purpose, content hash/version, quarantine status; authorization on every download, including nested links |
| Notifications / M5 | notification_preferences, notifications, reminders, reminder_events, outbox_events, job_attempts | Per-recipient read state; unique logical delivery key; opt-outs; server clock; durable retries |
| Money, loans / M6 | ledger_accounts, ledger_transactions, ledger_entries, payment_intents, provider_events, loans, installments, repayment_allocations | BIGINT minor units; balanced posted transactions; append-only/reversal; unique provider event and intent; locked allocation under concurrency |
| Insurance / M7 | policies, policy_versions, claims, claim_reviews, settlement_allocations | Incident-time coverage; claim evidence; no overlapping coverage unless policy permits; authorized decision and one settlement identity |
| Devices / M8a | devices, device_bindings, telemetry, alerts | Per-device credentials; unique session/sequence; event and receipt time; replay/stale checks; no device-authorized financial mutation |
| AI/calls / M8b–c | ai_requests, consent_events, consultation_sessions | Minimal context, prompt/provider version, budget, expiry; participant-only call tokens; no autonomous prescription/payment |
| Commerce / M8d | products, carts, orders, order_items, stock_reservations, fulfillment_events | Atomic stock reservation; medicine-specific dispensing permission; trusted fulfillment actor; verified refunds |
| Content/admin / M3, M8e | content, audit_events, export_jobs | Published-only farmer content; explicit admin capabilities; aggregate minimization; audited support scope |

Use application authorization plus constrained DB runtime privileges initially. Optional RLS requires a separate tenant-context/pool design and runtime-role tests. A global role label never substitutes for resource ownership or organization membership.

## State and transaction design

- Appointment: requested -> accepted/rejected/cancelled; accepted -> in_progress/cancelled; in_progress -> completed. Rescheduling atomically releases/reserves a slot, checks version and does not rewrite completed clinical history.
- Clinical: draft -> signed -> amended by a referenced new version. Farmer observations use a separate kind and cannot become signed diagnoses.
- Loan: quote -> accepted/submitted -> approved/rejected -> disbursement_pending -> active -> paid/settled. Provider failure leaves a recoverable intent. Due dates/interest/grace require versioned policy.
- Claim: submitted -> manual/vet review -> approved/rejected -> settlement_pending -> paid. Review approval does not prove external transfer. Partial/failure states and appeal depend on insurer policy.
- Payment: pending -> confirmed/failed; confirmed -> reversed through a separate compensating transaction. Out-of-order webhooks cannot downgrade a confirmed transfer blindly.
- Archive is soft status; deceased animals cannot secure new loans. Preserve existing debt and policies for settlement and audit.

## Client migration

Keep explicitly selected `demo` and `api` environments. No automatic fallback to seed data after API errors. Replace a complete feature workflow at a time, with one authoritative source per feature. Move portable contract types into a small package if shared's index cannot avoid exporting fixtures/demo machinery; no server dependencies in client bundles.

Replace whole-state snapshots with scoped query hooks; account-aware cache keys, bounded lists, stable sorting, cancellation, error/empty/loading states and conflict handling. Clear private caches/drafts on logout or account switch. Persist financial intent identifiers across retries/restarts; never queue payments automatically offline.

Do not import `palito.demo.v1` snapshots or seeded identities into PostgreSQL. Synthetic seeds are test/dev-only. If legitimate data appears, require a separately verified import plan with reconciliation. Introduce DTO versions compatibly for already released mobile clients; do not assume synchronous app upgrades.

## Data contracts

Money: JSON `{ currency: "BDT", amountMinor: "12345" }` means BDT 123.45. Whole-BDT demo amounts convert explicitly by multiplying by 100 with exact integer validation. Use decimal strings for BIGINT; reject floats/exponents/negative money where forbidden. Product policy specifies rounding, interest and allocation before M6.

Time: date-only `YYYY-MM-DD` for births; UTC RFC3339 instants for events; display `Asia/Dhaka`. Server clock controls eligibility and expiry. Telemetry retains observed and received timestamps. Historical signed records and accepted financial terms are versioned and retained under a policy still to be approved.

## M4 implementation

See [healthcare](healthcare.md) for implemented DTOs, per-record consent, state/time rules, private-image protocol, client lifecycle and exact pilot limitations; [progress](progress.md) records actual checks. Existing proposals above remain future contracts where not implemented there. Enable `HEALTHCARE_NO_CHARGE_PILOT=true` only for an explicit no-charge development/staging pilot; default booking is off. Apply the fifth additive migration only to an authorized development/test database with the migration role. Native uses a configured development build, not Expo Go; web uses same-origin API rewrites/cookies. No provider deployment or real SMS is implied. Stop for review before M5.
