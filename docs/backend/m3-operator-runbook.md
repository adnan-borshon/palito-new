# M3 operator setup and recovery

The code implements the identity workflow. Live configuration and physical-device acceptance still require the project owner and actual devices; emulator/build tests must not be described as successful live SMS or hardware tests. M4 is not enabled.

## Firebase and clients

1. Select the Firebase project and configure Phone and Email/Password authentication, authorized web domains, email enumeration protection, Bangladesh SMS region restrictions, quotas/budget alerts and the selected SMS MFA/Identity Platform prerequisites. Review provider pricing before activating anything. No command in this PR activates a paid plan or sends a live message during setup/tests.
2. Supply backend AUTH_MODE=firebase, FIREBASE_PROJECT_ID, exact WEB_ORIGIN/CORS origins and server Application Default Credentials through secret management. Production rejects emulators, demo projects and insecure origins/database TLS. Never place Admin credentials in either frontend.
3. Set the public Firebase web values in frontend/web/.env.local and server-only PALITO_API_ORIGIN. Both production origins use HTTPS; the browser calls the same-origin Next proxy. Start at `/identity` for farmers and `/identity/staff` for staff.
4. Native development builds use frontend/mobile/.env.example: actual Android package/iOS bundle identifiers, ignored provider files and HTTPS API origin. app.config.js checks prerequisites and installs the app/auth/static-framework config only when enabled. Expo Go keeps auth disabled and lazily excludes native module initialization. Do not invent production app identifiers or service files.
5. Apply reviewed migrations with the migration role before starting the API. Four migrations include identity administration/audit and a token revocation cutoff; published older migrations are unchanged. Use only disposable local/CI databases for the provided tests.

## One-time initial administrator

No HTTP administrator bootstrap exists and no administrator identity/password is seeded.

- The operator creates the candidate Firebase email/password identity, verifies its email and enrolls SMS MFA (the staff sign-in screen supports these steps before Palito membership exists).
- Set BOOTSTRAP_ADMIN_UID to that exact Firebase UID in the backend operator environment. Use server credentials with only the required Firebase Auth/DB permissions; do not send secrets in chat.
- Run `npm run admin:bootstrap --workspace @palito/backend` for a dry run. The script checks the verified email/password and enrolled SMS factor. It does not create or email a Firebase user.
- The authorized operator may run `npm run admin:bootstrap --workspace @palito/backend -- --execute` to provision the initial platform organization/membership. A PostgreSQL transaction/advisory lock refuses concurrent/repeated initialization; an append-only audit event records it. This action is not run against production by this implementation task.
- Sign in through password + SMS MFA, open the staff session, and use `/identity/admin`. API administration always requires current active account/platform membership and recent MFA; UI visibility is not authority.

## Organizations, invitations and vet review

An administrator approves a clinic/bank/insurer organization and creates a role matching its kind. PLATFORM invitations are ADMIN; no partner may invite themselves or acquire platform authority. Invitation secrets are random, returned once, hashed in PostgreSQL, bound to verified email and expire after 48 hours. Share them through an approved private channel; the application does not send an email automatically or put secrets into URL queries/logs.

The invitee creates or signs into a Firebase email/password account, verifies email, enrolls SMS MFA, then signs in again with MFA. Accept the invitation token with their display name and vet registration if applicable. UID is the only linking key; an email cannot silently merge another Palito account. Acceptance consumes the invitation atomically and rechecks issuer/organization approval, target email and expiry. Suspended/revoked issuers cannot grant authority through older invitations.

Vets remain pending until a different authorized administrator reviews the actual professional registration and records verification. A self review is denied. Bank/insurer contexts grant no clinical disclosure, loan or insurance mutation API in M3. Membership suspension/revocation and account suspension are audited and applied on subsequent requests. Account status changes invalidate previous tokens/sessions, so reactivation requires fresh authentication.

## Phone changes, logout and recovery

- Farmer phone sign-in/onboarding accepts verified +880 Bangladesh identities. The server never accepts an arbitrary phone field as proof or links accounts by phone/email.
- Account security screens reauthenticate the existing account, verify the new phone through Firebase, update that same Firebase UID, and submit the fresh ID token to `/me/verified-contact`. The API checks current-account UID, recent auth, supported phone and staff MFA when the account has active staff memberships. It updates the verified contact, revokes sessions/tokens and audits the change. A duplicate historical contact returns conflict and requires support review; it never transfers another account's data.
- Current web logout revokes only its hashed, nonce-bound session. All-device logout accepts fresh ID-token proof bound to the current principal, with CSRF for web, and revokes the DB cutoff/session registry plus Firebase refresh tokens. A same-second token remains denied until a new authentication event occurs after the cutoff; retry sign-in after the next second if necessary.
- Password resets and email verification use the Firebase SDK/provider action flow, with generic user-facing feedback. Email reset alone never grants a Palito membership or removes MFA.
- Lost-factor requests accept an email and return the same generic response whether the account exists. Requests cannot reset a password, change a UID or remove a factor. Active users can request assisted phone recovery from account security.
- An MFA-authenticated platform administrator reviews queued recovery requests. The requester cannot approve their own case and a reviewed request cannot be approved twice. Approval records the review only; a provider-level lost-factor reset remains a deliberate operator/support operation after independent identity verification. Use a second operator for privileged-account recovery, verify UID and evidence, revoke Firebase tokens/remove only the lost factor through the Firebase console, require enrollment of a replacement factor and fresh sign-in, then restore only the reviewed Palito membership/status. Do not disable the API's MFA check as a workaround. Record the support case reference privately; audit entries intentionally omit identity documents and recovery secrets.

## Validation and release gate

The official Auth emulator exercises actual MFA enrollment/challenge/finalization and revocation with synthetic accounts; it sends no real SMS. Browser E2E uses real Chrome/Playwright with the Next proxy, not mocked API responses. Native Jest tests validate SDK-adapter hydration/remount/sign-out and disabled-module behavior; they do not prove Keychain/Android storage, process kill or device app verification.

Before live rollout, the owner must supply the real project/app configuration and verify Android/iOS cold start, process kill, background/foreground, deep-link/email actions, app verification, secure platform persistence, logout/revocation and real operator SMS delivery under an explicitly bounded budget. This workspace has no Android SDK/adb or Xcode/device access. Hosted CI has browser/runtime coverage, not a claim of physical-device validation. Keep rollout disabled until those checks are recorded.
