# M3 identity implementation

The M3 software now includes Firebase verification, farmer onboarding, web/native staff sign-in and MFA enrollment, organization approval, expiring invitations, vet credential review, membership/account suspension, assisted recovery, verified contact changes, logout/revocation, an audited offline first-admin bootstrap and native build configuration. M4 healthcare/financial domain integration is not enabled.

Use the [operator runbook](m3-operator-runbook.md) for exact setup, roles, recovery support procedure and live-device acceptance. Actual test evidence is in [progress](progress.md). The initial incomplete M3 checkpoint is preserved separately and is historical.

## Authority and account boundaries

Only Firebase's verified UID maps to a Palito account. Client roles, organization claims, phone/email matches and demo controls never grant authority or merge identities. Every protected request checks current account and active organization/membership state. Staff/admin authority requires verified email, password primary, recent SMS MFA and, for vet context, separately verified professional credentials. Phone-primary login cannot acquire staff authority. Initial administrator creation is an offline, default-dry-run, one-time advisory-locked operator command; no public bootstrap or privileged seed exists.

Invitations are random, hash-only, verified-email-bound, 48-hour grants from an approved platform administrator into a matching active organization. Acceptance rechecks issuer, target, expiry, organization and current UID status, consumes atomically and audits the result. Vets remain pending until reviewed by another administrator. Admin operations and recovery decisions produce append-only audit rows. Recovery self-review and repeated review are denied. No clinical or financial capability follows from a staff role in M3.

## Sessions and sensitive actions

The backend verifies Firebase ID/session tokens through the official Admin SDK with revocation/project/issuer/expiry/subject checks. Auth defaults disabled. Emulator mode requires a loopback demo-* project and nonproduction configuration; live mode rejects emulator configuration. Public auth endpoints have additional per-IP abuse limits; provider-side SMS quotas/region/budget controls remain mandatory before live activation.

Web uses 8-hour Secure/HttpOnly/SameSite Strict __Host cookies, a random per-login nonce and a PostgreSQL hash registry. Same-second Firebase JWT reuse cannot revive an old session. Unsafe cookie actions require exact origin and unpredictable double-submit CSRF. Duplicate cookies and simultaneous bearer/cookie credentials are rejected. Firebase web persistence is memory-only and the transient SDK session is cleared after exchange. Browser reload restores only the server session.

Current logout revokes its session hash. All-device logout and verified contact changes accept fresh proof bound to the current principal, enforce staff MFA for staff accounts, update an immediate database auth-time cutoff, revoke web sessions and Firebase refresh tokens, and audit the action. Status changes invalidate earlier sessions/tokens; reactivation requires fresh sign-in. UID ownership is preserved through phone changes. A conflict requires support reconciliation, never automatic phone-based reassignment.

## Implemented methods

| Family | Methods |
|---|---|
| Identity | POST /onboarding; GET /me; GET /me/memberships |
| Sessions | GET /sessions/csrf; POST /sessions; DELETE /sessions/current; POST /sessions/revoke-all (fresh idToken body) |
| Organizations | GET/POST /staff/organizations; GET /staff/organizations/:id/memberships |
| Invitations | POST /staff/invitations; POST /staff/invitations/accept; POST /staff/invitations/:id/revoke |
| Approval | POST /staff/memberships/:id/status; POST /staff/users/:id/status; POST /staff/vets/:id/credential |
| Recovery/contact | POST /recovery-requests (generic response); POST /me/recovery-requests; GET /staff/recovery-requests; POST /staff/recovery-requests/:id/decision; POST /me/verified-contact |
| Audit | GET /staff/audit (bounded platform-admin projection) |

All paths use /api/v1. DTOs reject unknown fields. Read projections are bounded; administration requires platform membership and recent MFA. These methods supersede the earlier proposed M0 identity list. M4+ methods remain absent. Recovery approval records a reviewed support case; it does not remove a Firebase factor automatically. The operator runbook describes independent identity verification and provider-side factor replacement before restored access.

## Client paths

Web `/identity` handles farmer sign-in/session restore, `/identity/staff` handles staff signup/email verification/MFA enrollment/sign-in/invitation acceptance, `/identity/admin` handles organizations/invitations/status/credential/recovery review, and `/identity/account` handles verified phone changes, revocation and assisted recovery. Existing demo role workspaces stay labeled demo until M4 replaces domain repositories.

Native `/identity`, `/staff-identity` and `/account-security` implement the corresponding Firebase SDK paths. Disabled routes do not eagerly initialize native Firebase modules. Enabled builds require actual Android/iOS identifiers, ignored provider files and HTTPS API via app.config.js, app/auth Expo plugins and static iOS frameworks. Expo Go auth stays disabled. SDK-adapter tests cover restoration after remount and sign-out; those tests do not establish physical-device persistence/storage/app verification.

## Validation scope

The official Firebase Auth emulator and real PostgreSQL exercise actual MFA enrollment/challenge/finalization, first-admin concurrency, invitation consumption, wrong organization/recipient, expiry, stale membership, account suspension, recovery review, immutable audit and immediate token/session invalidation. No real SMS is sent. Browser E2E runs actual Chrome/Playwright against Next, Firebase emulator and the API, including cookie restore, cross-browser isolation, CSRF, staff MFA and administration. Native mocks are explicitly distinguished from hardware tests.

The project owner still needs to supply Firebase project/ADC/native service configuration and run authorized real SMS plus Android/iOS process-kill/deep-link/app-verification/storage tests. This workspace has no adb/Android SDK/Xcode/device. Local Chromium cannot create its required IPC socket, so browser execution is required on the hosted Chrome runner; local failure is not called a pass. No live deployment, real OTP campaign, paid activation or production migration occurred.

References: [Firebase MFA](https://firebase.google.com/docs/auth/web/multi-factor), [session cookies](https://firebase.google.com/docs/auth/admin/manage-cookies), [Auth emulator](https://firebase.google.com/docs/emulator-suite/connect_auth), [native MFA](https://rnfirebase.io/auth/multi-factor-auth), [Expo Firebase](https://docs.expo.dev/guides/using-firebase/), [Expo 58 app configuration](https://docs.expo.dev/versions/v58.0.0/config/app/), [Playwright browsers](https://playwright.dev/docs/browsers).
