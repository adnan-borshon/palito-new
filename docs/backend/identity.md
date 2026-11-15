# Milestone 3 identity checkpoint and setup

M3 is **in progress**, with backend verification/session paths and opt-in client sign-in screens implemented. It has not met the complete M3 exit gate. M4 has not started. No project credentials, native provider files, live SMS, paid activation or production change was supplied or performed.

## Implemented boundary

Firebase Admin 14.5.1 verifies ID tokens and session cookies with revocation checks, expected project/issuer/subject/expiry, and recent-auth checks on exchanges and onboarding. Firebase proves UID identity only. Every protected request reads current PostgreSQL account and approved active-organization memberships; custom claims cannot assign roles. Suspended/archived/pending/unknown accounts are denied. Privileged membership context additionally needs verified email, password primary, SMS second-factor claim and auth within five minutes; vet context also requires verified credentials. This grants no clinical or financial capabilities. Current capability list is only `profile:read`.

Public farmer onboarding accepts only recently authenticated Bangladesh phone identities, UID links, display name and locale. Existing suspended accounts cannot re-onboard. It creates no organization, privileged membership, farm or clinical record. Phone/email are not account linking keys. Duplicate phone conflicts fail safely; recovery and provider contact changes are not automatically reconciled.

`AUTH_MODE=disabled` remains the startup default. `firebase` requires a real project ID and server Application Default Credentials. `emulator` requires a demo-* project, nonproduction mode and loopback host. Unexpected emulator environment variables are rejected. Emulator identities can never be enabled by production configuration.

Web sessions use Firebase 8-hour Secure/HttpOnly/SameSite=Strict `__Host-` cookies carrying the Firebase session JWT plus a random per-exchange nonce (Firebase may issue identical JWTs within one second). A PostgreSQL SHA256 registry binds cookies to UID, expiry and current-session revocation; raw cookies are not persisted. Exchange checks recent authentication, exact WEB_ORIGIN, unpredictable double-submit CSRF and fresh account status; old current session is revoked before replacement. Every cookie-authenticated unsafe request requires CSRF. Cookie plus bearer is rejected. Logout clears cookies and revokes the registered session; logout-all requires a fresh bearer identity and revokes Firebase refresh tokens. Session cleanup/retention automation remains M5.

## Actual endpoints

| Endpoint | Behavior |
|---|---|
| GET /api/v1/sessions/csrf | Issue HttpOnly CSRF cookie and return token; no-store |
| POST /api/v1/onboarding | Strict idToken/displayName/locale DTO; verified phone UID only |
| POST /api/v1/sessions | Exact origin + CSRF + recent verified idToken; issue cookie |
| DELETE /api/v1/sessions/current | Origin + CSRF; revoke current cookie, even if Firebase account is unavailable |
| POST /api/v1/sessions/revoke-all | Fresh bearer identity and active account; revoke Firebase refresh tokens |
| GET /api/v1/me | Minimal own profile/status/context; no Firebase UID or other user's data |
| GET /api/v1/me/memberships | First 100 eligible own active contexts; no arbitrary user/org parameter |

No invitations, account-status administration, profile mutation, provider contact-change or recovery endpoints are exposed. Existing proposed API contracts remain future requirements unless listed above.

## Local emulator verification

Use a disposable local PostgreSQL administrator in TEST_DATABASE_URL, with no production credentials. Install repository dependencies and build the backend, then run from root:

```sh
npm run build:backend
npm exec --yes --ignore-scripts --package firebase-tools@15.36.0 -- firebase emulators:exec --config backend/firebase.json --project demo-palito --only auth "npm run test:backend:integration"
```

This uses the official Firebase Auth emulator, synthetic Bangladesh-format phone fixtures and real PostgreSQL. It sends no real SMS. The explicit emulator environment registers one additional provider/API test; ordinary database runs do not report that test as passed or skipped. CI executes the emulator command. Provider tests cover real SDK decoding/revocation, two UID identities, strict onboarding, self projection, exact-origin CSRF, secure cookie flags, cookie/bearer ambiguity, immediate suspension, current-session logout, disabled Firebase identity and token valid-since revocation. Separate unit tests exercise expiry/project/MFA policies; they are not signed live-provider results.

## Web

Route `/identity` is the real-auth entry point; the existing `/login` and role workspaces remain local demos until M4 integrates domain repositories. The identity screen never imports DemoState or writes a demo session. Use frontend/web/.env.example with your public Firebase web config and server-only PALITO_API_ORIGIN. Next proxies `/api/v1/*` to the backend so the browser uses same-origin cookies. WEB_ORIGIN must exactly match the browser origin and be allowed by backend CORS. Production proxy origin requires HTTPS; use a trusted TLS reverse proxy. Local localhost is a browser trustworthy origin for Secure cookies; do not remove Secure to support arbitrary insecure hosts.

Firebase browser persistence is memory-only. After phone verification/onboarding/session exchange, SDK signOut clears the transient browser Firebase session. Reload uses HttpOnly session `/me`; no ID/refresh credentials are written to localStorage, sessionStorage or IndexedDB. SMS requires consent and reCAPTCHA. Codes/passwords/provider errors are not logged or echoed. No default/fixed OTP exists in this screen. Real SMS provider limits, region allowlists, consent policy, budgets and abuse controls require project configuration before live use.

## Native

Expo 58/RN 0.88 package versions were inspected. React Native Firebase app/auth 27.1.1 are pinned with matching peer metadata. `/identity` resolves to a native phone sign-in component and a browser fallback; the native module is excluded from Expo browser export. Native enable flag defaults false. A real configured development build is required; Expo Go is not a supported auth test environment.

Before enabling EXPO_PUBLIC_FIREBASE_NATIVE_ENABLED, configure Firebase Android/iOS app identifiers, ignored google-services.json/GoogleService-Info.plist, the official app/auth Expo config plugins and platform build requirements from the references below. Configure EXPO_PUBLIC_PALITO_API_ORIGIN as an HTTPS origin. No invented bundle IDs, signing SHA fingerprints, APNs credentials or provider files are committed. Native SDK handles credential persistence/refresh; application code never copies refresh credentials into AsyncStorage. Native `getIdToken(true)` refreshes before API use, app background clears visible profile, foreground rechecks `/me`, and signOut clears profile/input/challenge state. Persistence/process-kill, SMS/deep-link/app verification, secure storage guarantees, logout-all UX and Android/iOS compatibility are **unverified**, not passed by a browser export.

Privileged native workspaces remain disconnected from the API. Phone-only native authentication cannot acquire staff context. Staff invitation approval, verified-email/password+SMS MFA enrollment/sign-in UI, controlled audited first-admin setup, recovery and phone-change handling are unfinished M3c work. Do not substitute a public admin bootstrap or seeded privileged account.

## Remaining M3 acceptance gates

1. Configure the selected Firebase project, authorized web domains, Bangladesh SMS policy and server ADC via secret management (never chat or committed env files).
2. Complete staff invitation/approval audit model and enrollment/recovery UI after B03/B05 review, including controlled initial admin. Current tests prove denial policy, not a completed invitation workflow.
3. Configure and build Android/iOS apps, verify native MFA/storage/lifecycle/deep links on actual supported devices, and wire the final auth entry points after review. Do not claim live SMS delivery without a separately authorized, bounded test.
4. Run browser E2E for cookie/session restoration and reCAPTCHA, plus native process restart/logout/revocation tests. Current UI builds are compile/export evidence only.
5. Finish phone-change/recovery reconciliation and account-scoped cache behavior before M3 exit. M4 domain endpoints stay absent.

Official references reviewed on 2026-11-15: [ID tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens), [session cookies](https://firebase.google.com/docs/auth/admin/manage-cookies), [Auth emulator](https://firebase.google.com/docs/emulator-suite/connect_auth), [web phone auth](https://firebase.google.com/docs/auth/web/phone-auth), [web MFA](https://firebase.google.com/docs/auth/web/multi-factor), [Expo Firebase](https://docs.expo.dev/guides/using-firebase/), [Expo 58](https://docs.expo.dev/versions/v58.0.0/), [native phone](https://rnfirebase.io/auth/phone-auth), [native setup](https://rnfirebase.io/).
