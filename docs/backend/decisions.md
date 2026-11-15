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
| B20 | Mobile phase approval recorded in existing plan (2026-11-15), web exists; historical demo decisions remain history | Reconciled; engineering | This user authorized only M0 now; M1 requires subsequent instruction |

Native SDK choice is a design decision, not a compatibility result. If B04 cannot support staff MFA and secure lifecycle on target devices, privileged native API access stays disabled while the design is revisited; phone-only access must not gain privileged capabilities.

## Verified provider references (2026-11-15)

- [Firebase SMS MFA](https://firebase.google.com/docs/auth/web/multi-factor): Identity Platform, supported primary provider and verified email prerequisites; phone-primary is excluded.
- [Firebase session cookies](https://firebase.google.com/docs/auth/admin/manage-cookies): server session exchange, recent authentication and revocation verification.
- [Expo Firebase guide](https://docs.expo.dev/guides/using-firebase/): native React Native Firebase requires a development build and native configuration. This does not establish this repo's compatibility.
- [Firebase web TOTP](https://firebase.google.com/docs/auth/web/totp-mfa): alternative for later evaluation, not selected or asserted cross-platform compatible.

No Firebase project was inspected or modified. No service account, paid upgrade, live SMS or provider account was configured.
