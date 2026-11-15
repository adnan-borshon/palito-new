# Backend M3 checkpoint — in progress

Updated 2026-11-15. User reviewed M2 and authorized M3. Branch `codex/palito-m0-assessment`, [PR #2](https://github.com/adnan-borshon/palito-new/pull/2). M2 base `bf50ffc1f5c4806bdab23fe94552dafa4f65e52f`. Stop for user review before M4; **M3's full exit gate is not complete**.

Read [identity setup and limits](identity.md) for endpoints, credential boundaries, client routes, official references and exact remaining work. [M2 checkpoint](milestone-2-checkpoint.md) preserves the database milestone evidence. All 65 PAL requirements and 53 commands remain in traceability/inventory; auth command journeys are not marked complete merely because prerequisites compile.

Implemented official Firebase Admin 14.5.1 verification/revocation; strict UID-only verified phone onboarding; per-request current account/membership/organization checks; MFA/verified-vet context policy; minimal `/me`; same-origin web session exchange; exact-origin double-submit CSRF; hashed session registry with immediate current-session logout; explicit all-device Firebase revocation. One additive transactional migration adds web_sessions; prior published migrations are unchanged.

Web Firebase 13.3.0 uses memory-only persistence and SDK sign-out after cookie exchange. Native app/auth 27.1.1 have matching peer metadata and a native phone screen using SDK-managed credentials, foreground identity refresh and sign-out. Both use opt-in `/identity`; existing role/demo repositories remain demo-only until care APIs are integrated in M4. Native defaults disabled, provider files are absent, and no native build/device result is claimed.

## Actual local evidence

- 51 default tests passed: 31 existing frontend/shared plus 20 backend (eight additional auth policy/registry tests).
- 17 integration tests passed, zero failed/skipped, with official Firebase Auth emulator CLI 15.36.0 and real disposable PostgreSQL 18.6. This includes the existing 16 database/API tests and one full provider/API scenario covering two identities, onboarding, self isolation, strict DTO, CSRF, secure cookies, mixed credentials, suspension, current logout, disabled Firebase account and valid-since revocation.
- Total: **68 tests**. No real SMS was sent. Emulator-generated codes are synthetic, not a live provider/SMS result.
- Clean migration, upgrade with retained user, repeat deploy and official Prisma schema drift diff passed with the added session migration and FK.
- Lint, all workspace types, backend build, Next production build and Expo browser export passed. Native route is excluded from browser output. These do not verify a real browser login or native device.
- Auth integration exposed test CORS configuration and health-child emulator environment isolation; tests now configure the exact allowed origin and explicitly isolate the unrelated disabled-auth shutdown child. Prisma FK was represented in the model so drift checks remain genuine.

Fresh manifest resolution and clean `npm ci --ignore-scripts` succeeded (1,861 packages). The selected Expo 58.0.25, RN 0.88.1, Next 16.4.6, Prisma 7.10.1 and Firebase SDK versions were retained. Root gRPC override 1.14.7 clears six high findings from the unused Firestore branches of client SDK distributions; audit now has zero high/critical, with the existing 1 low + 20 moderate findings. A direct gRPC runtime import succeeds. npm ls reports the deliberate override outside upstream Firestore's ~1.9 range as invalid; it is not recorded as a passing dependency-tree check. One React version remains 19.3.0. Earlier incomplete local install attempts were discarded before the clean manifest/lock resolution; the final source is verified again against this fresh tree.

Session cookies include a random per-exchange nonce in addition to the signed Firebase JWT, preventing same-second JWT reuse from reviving a logged-out session. The real emulator scenario re-exchanges a session, checks old-cookie denial, and exercises malformed, wrong-project and expired emulator-token rejection. Production signature verification is delegated to the official Admin SDK; unsigned emulator tokens are not proof of live signature security.

Source secret scan and hosted checks are recorded in the PR once completed; no pending hosted check is asserted passed here.

## Remaining M3 work / external gates

M3c invitation/approval audit, initial-admin process, staff MFA enrollment/sign-in/recovery UI, phone-change/recovery reconciliation and full permission-matrix journeys are unfinished. No public administrator bootstrap or privileged seed is supplied. Firebase project/authorized domains/region policy/ADC, native service configuration/signing/development builds, Android/iOS lifecycle/storage/MFA/deep links and browser E2E are not configured or verified. Native storage guarantees and process restart are not proven by lint/types/export. Review B03/B05 before claiming privileged production access.

The API grants only own-profile read capability. No care, clinical, financial or admin mutation endpoint is enabled. No production migration, paid activation, live OTP, deployment or merge occurred. M4 has not started. The remaining M3 work must continue after review/provider setup; this checkpoint is not a claim that the entire requested milestone has passed its exit criteria.
