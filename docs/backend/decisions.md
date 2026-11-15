# M0 decisions and policy register

Status: engineering design prepared for user review, 2026-11-15. A proposed product/partner policy is not approved by inclusion here. All affected production capabilities stay blocked until their gates pass.

| ID | Choice / gap | Status and owner | Gate |
|---|---|---|---|
| B01 | NestJS modular monolith, PostgreSQL, Prisma, Firebase Auth, private storage, PostgreSQL outbox worker; preserve Expo/Next.js | Selected from authorized source plan; engineering | M1; pin supported versions only after official compatibility review |
| B02 | Farmer phone OTP with normalized Bangladesh numbers and consent | Selected direction; engineering + product | M3; test real operators, abuse/cost/region controls; emulator proves no SMS delivery |
| B03 | Invite vet/bank/insurer/admin individually; verified email/password primary + SMS MFA via Identity Platform; phone remains contact/second factor | Proposed concrete staff flow for user review; product + security | M3c; verified email, factor enrollment and second-factor evidence; no phone-primary MFA bypass; no paid plan activation in M0 |
| B04 | React Native Firebase auth in Expo development builds, Firebase JS SDK for web | Selected implementation approach; exact package versions and storage guarantees unverified; engineering | M3b–c; Expo 58/RN 0.88 compatibility, native app verification, credential persistence/process-kill/logout/revocation, native MFA and recovery must pass before privileged mobile access |
| B05 | Same-origin cookie sessions for web, ID tokens for mobile; recent auth <=5 minutes for session exchange/sensitive actions; proposed 8-hour staff cookie | Proposed security defaults; engineering + product | M3; verify Firebase expiry bounds, revocation and CSRF; cookie expiry requires sign-in, never pretend it is an ID token |
| B06 | Palito account/membership status checked per protected request; revocation checks for sensitive actions; no public admin bootstrap | Selected security boundary; engineering | M3; controlled one-time audited initial admin; stale claims do not retain access |
| B07 | No-charge healthcare pilot until verified payments exist | Proposed product default; product owner | M4; if declined, paid booking remains disabled until M6 |
| B08 | Bank/insurer org boundaries, staff invitation/approval, case assignment and maker/checker separation | Unresolved; product + each partner | Before M6/M7 approval paths; roles alone cannot grant cross-org access |
| B09 | Independent valuation authority, expiry and reassessment policy; 70% cap confirmed in SRS pp.33–34 | Cap confirmed; valuation process unresolved; bank + product | M6; farmer estimate cannot set approved value |
| B10 | Interest method/rate/fees, installment dates, rounding, allocation, grace/default/early settlement | Unresolved; bank + product | M6 sandbox can use explicit zero-interest/zero-fee synthetic terms, calendar-month schedules with final exact remainder, principal-only allocation and manual reviewed grace; draft defaults require approval before M6, never production terms |
| B11 | Coverage at incident date, waiting periods, renewals, illness limits, appeals, partial payout and eligible debt | Unresolved; insurer + product | M7; use synthetic policies, manual review and simulated payout only; no inferred real eligibility |
| B12 | Auto-approval, 89%/60-second claim decision, 48-hour settlement, 24-hour loan disbursement, 87% AI accuracy | SRS aspirations, not achieved promises; insurer/bank/clinical owner | M7–M10; no automated real-money decision without validated evidence and approved policy |
| B13 | Private storage, payment, SMS/push, video, AI/weather provider; region, budget and retention | Unselected; product + engineering + partners | Before dependent M4–8 adapter; no invented successful integrations |
| B14 | Clinical data disclosure to banks/insurers, care relationship duration, consent withdrawal/ownership transfer | Minimum projections selected; exact fields/retention unresolved; product + vets + partners | Before clinical sharing in M4; deny unapproved fields. No insurer clinical notification without permitted relationship/consent |
| B15 | Device protocol, species thresholds, sampling tolerance, provenance, transfer and alert recipient coverage | Unresolved; device + veterinary owner | M8a; proposed event-time ingestion and tolerance-aware coverage; no guessed clinical threshold |
| B16 | Blockchain health records, external credit score, regulatory reports, milk-source repayment and weather evidence | Explicitly retained as SRS gaps; product/partners choose evidence and scope | See traceability SRS-GAP rows; PostgreSQL audit history must not be called blockchain verification |
| B17 | Lower-end Android target, supported iOS scope, expected workload, recovery budget | Proposed workload: 100 farms x 5 animals, 10 staff + 20 farmer concurrent sessions; not a capacity claim; product | Confirm before M9 load/device plan. 500-device telemetry assumes 5-minute samples only as a sizing placeholder, not a clinical requirement |
| B18 | Read p95 <=500ms, write p95 <=800ms excluding provider time; queue start <=60s; candidate RPO 1h/RTO 4h | Proposed targets at B17 workload; engineering/product | M9/M10; measure realistic fixtures and restore; budget may change recovery target |
| B19 | PR #1 backend guidance reviewed at head 859a3445b9adc59edd66b8c88e021d67fabf5d8c; adopt on M0 branch with YAML metadata | Adopted repository guidance; original PR remains unmerged | No external tools installed by this file. Direct AGENTS link is fallback; client auto-discovery not claimed |
| B20 | Mobile phase approval recorded in existing plan (2026-11-15), web exists; historical demo decisions remain history | Reconciled; engineering | M0 reviewed; user authorized M1 on 2026-11-15. M1 reviewed; user authorized M2. M3 requires another instruction |

Native SDK choice is a design decision, not a compatibility result. If B04 cannot support staff MFA and secure lifecycle on target devices, privileged native API access stays disabled while the design is revisited; phone-only access must not gain privileged capabilities.

## Verified provider references (2026-11-15)

- [Firebase SMS MFA](https://firebase.google.com/docs/auth/web/multi-factor): Identity Platform, supported primary provider and verified email prerequisites; phone-primary is excluded.
- [Firebase session cookies](https://firebase.google.com/docs/auth/admin/manage-cookies): server session exchange, recent authentication and revocation verification.
- [Expo Firebase guide](https://docs.expo.dev/guides/using-firebase/): native React Native Firebase requires a development build and native configuration. This does not establish this repo's compatibility.
- [Firebase web TOTP](https://firebase.google.com/docs/auth/web/totp-mfa): alternative for later evaluation, not selected or asserted cross-platform compatible.

No Firebase project was inspected or modified. No service account, paid upgrade, live SMS or provider account was configured.

## M1 implementation decisions

B21: Use NestJS 12.5.0 ESM + existing TypeScript 6, the official Express adapter, Pino allowlisted logs and class-validator DTO boundary. `pg` provides a bounded connectivity probe in M1; Prisma/its schema remain M2. The global disabled identity verifier is a deliberate fail-closed boundary, with no mock principal or production bypass.

B22: Local development/CI use PostgreSQL 18.7 with loopback-only development exposure. Development superuser credentials are generated randomly, not committed; separate application/migration roles require M2. The current single-instance limiter is in memory and proxy trust stays false. Shared rate limiting/trusted proxy design precedes replication or internet deployment.

B23: Replace web typecheck-only lint with official Next.js ESLint; fix existing findings without disabling rules. Generate Next.js route types during typecheck and untrack `.next` output. Use existing Node test runner + Nest testing utilities and Supertest for the backend, preserving current frontend Jest/Node tests.

## M2 implementation decisions

B24: Pin Prisma CLI/client/pg adapter together at stable 7.10.1; generated ESM client is ignored and rebuilt explicitly. Use the private `palito` schema, administrator-provisioned btree_gist, and hand-reviewed SQL for constraints/triggers/grants. The migration role owns this schema but does not receive database-wide CREATE. Published migrations are immutable; later changes get a new migration.

B25: Keep appointment/valuation owner fields as historical snapshots validated at creation. Current animal farm/owner changes preserve prior clinical and financial evidence. Actual transfer authorization/consent/collateral checks remain future services. Clinical records and ownership events are append-only; prescriptions are editable only before signing. Role status/MFA/relationship authorization remains M3/M4 rather than a claimed RLS implementation.

B26: Preserve acres as the farm area unit because the existing mobile form explicitly labels acres. Store exact acres/weight decimals and date-only births; BDT money uses BIGINT minor units with canonical string JSON and explicit whole-BDT x100 conversion. No production financial terms or vaccination thresholds are inferred.

B27: Local bootstrap only, with separate distinct random administrator/migrator/runtime secrets; application development/production startup requires runtime username, while CLI migration URL requires migrator username. Synthetic seed is explicit, local-only, transaction/idempotency guarded and never runs on startup/install/migrate. It creates no administrator membership, working Firebase credential, verified vet or approved valuation.

## M3 engineering checkpoint

B28: User authorized M3 on 2026-11-15. Implement official Firebase Admin verification and database-owned identity mapping; default auth disabled, emulator loopback/demo-only, live project/ADC explicitly configured. UID is the only link key. Public phone onboarding creates a farmer account without privileged membership.

B29: Use an eight-hour HttpOnly Secure SameSite Strict Firebase cookie plus a database hash registry for immediate current-session revocation, exact origin and random double-submit CSRF. Firebase browser persistence is memory-only and SDK sign-out follows exchange. Native bearer calls refresh through the native SDK; no refresh token is copied to demo storage.

B30: Staff contexts require current approved organization/membership, verified email/password primary and recent SMS MFA; vet credentials must also be verified. No staff mutation capability is exposed. Invitation/approval audit, initial admin, MFA enrollment/recovery UI, phone recovery and native provider/device verification remain incomplete M3 gates. B03/B05 have not been represented as user-approved production policy. No live project or paid Identity Platform activation occurred.

## M3 completion update

The user explicitly requested completion of M3. B03/B05 are implemented as conservative engineering defaults: verified email/password plus recent SMS MFA, reviewed organization memberships, 48-hour single-use email-bound invitations, eight-hour secure web sessions, and assisted recovery with no automatic factor deletion. The one-time first administrator is an audited offline operator command; concurrent execution is locked. Physical-device and live-provider evidence remains a release gate, not a reason to omit independent software implementation.

B31: PostgreSQL stores an immediate auth-time revocation cutoff alongside nonce-bound web session hashes. All-device logout, verified phone changes and status changes invalidate older ID tokens, even if Firebase valid-since falls in the same second or provider revocation later fails. New sign-in must occur after the cutoff. No durable credential is copied into demo/browser persistence.
