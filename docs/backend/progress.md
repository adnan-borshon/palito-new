# M3 software completion and review checkpoint

Updated 2026-11-15. User requested finishing M3 properly and fixing errors. The remaining independent M3 implementation is delivered for review on `codex/palito-m0-assessment`, [PR #2](https://github.com/adnan-borshon/palito-new/pull/2). Base: `10780776fba2d5aea36da699bab518c5662ab6c0`. M4 has not started. [Initial M3 checkpoint](milestone-3-initial-checkpoint.md) is historical.

Read [identity implementation](identity.md) and the [operator runbook](m3-operator-runbook.md) for actual endpoints, setup and manual recovery. Earlier M0–M2 reports remain unchanged; all 65 PAL requirements and 53 demo command mappings remain present.

## Completed software

- Organization approval, random/hashed/email-bound 48-hour invitations, atomic acceptance/revocation, verified-email/password+SMS MFA policy, current membership/organization checks and separately reviewed vet credentials.
- Staff signup/email verification, SMS MFA enrollment and challenge resolution on web/native. Browser administration for organizations, invitations, membership/account suspension, credential and recovery review.
- Controlled offline first-admin command, default dry-run, no identity creation or public bootstrap. PostgreSQL advisory lock prevents concurrent/repeated initialization. Append-only audits capture decisions; self review and replayed recovery decisions are denied.
- Assisted lost-factor recovery with non-enumerating public acknowledgement and an admin queue; provider factor removal stays an explicit independently verified support procedure. Password reset uses Firebase. No automatic factor deletion or UID reassignment.
- Verified-contact change screens and API, UID/fresh-proof binding, staff step-up, session invalidation and audit. Current and all-device logout are implemented in both client paths.
- Fixed web logout-all cookie/bearer incompatibility; web uses fresh proof in a CSRF-protected cookie request. Fixed same-second ID-token revocation using a database auth-time cutoff. Status changes require reauthentication after restoration. Fixed duplicate-cookie ambiguity and mapped database conflicts/missing records to safe HTTP responses.
- Native app/auth/static-framework config with mandatory actual identifiers/files/HTTPS origin; disabled auth routes lazily avoid native module initialization in Expo Go. Native SDK hydration/remount/sign-out behavior has focused adapter tests. Synthetic native configuration is used only for CI Android compilation and creates no live provider or signing identity.
- One additive migration adds staff invitations, immutable identity audit, recovery requests and a nullable user revocation cutoff. Four migrations total; prior published migrations are unchanged. Referential and state constraints, restricted runtime grants and existing domain integrity remain enforced.

## Actual local validation

- **54 default tests passed**: 33 frontend/shared (including two new native adapter cases) plus 21 backend (including native configuration gating).
- **18 real PostgreSQL + official Auth emulator integration tests passed**, zero failed/skipped, after the final revocation/invitation changes. Total local: **72 passed**.
- Actual emulator MFA enrollment, challenge and finalization; primary-only denial; concurrent first-admin initialization; matching organization role; wrong recipient/expiry/reuse; pending/verified vet; stale membership; account suspension; recovery self-review/replay/non-enumeration; immutable audit; immediate token invalidation and UID-bound revocation are exercised.
- Clean migration, retained-row upgrade, repeated deploy and official Prisma schema drift checks passed with all four migrations. Database role, history, concurrency and exact monetary/date tests remain genuine.
- Lint, all workspace types, backend build, Next production build and Expo browser export passed. Firebase, Expo 58/RN 0.88 and one React version are preserved. Added SDK-compatible expo-build-properties and pinned Playwright 1.65.1. Dependency audit has zero high/critical; the existing 1 low + 20 moderate findings remain for targeted triage.
- Local browser execution attempted and failed at Chromium IPC socket creation (`Operation not permitted`), before app UI execution; its alternative browser download was unavailable. This is not reported as a passed browser test. Hosted CI uses the runner's actual Chrome and requires the browser journey (phone login, secure cookies, reload restore, isolated context, CSRF, logout, staff MFA and administration).
- Hosted CI additionally builds a debug Android application using explicitly synthetic CI-only client configuration to validate the native dependency/config integration. This is compilation, not physical-device or live-project evidence.

Final source secret scan and subsequent hosted CI/Android/security outcomes are recorded in the PR after completion. No pending check is asserted successful here.

## Provider and hardware release acceptance

No Firebase project/ADC/native app files were supplied, no live SMS was sent and no paid service, production migration, deployment or merge was performed. This workspace has no Android SDK/adb, Xcode or physical devices. The owner must configure the real project/app identities and run bounded SMS, Android/iOS cold start/process kill, secure persistence, deep-link/email action and app verification checks before enabling a live rollout. These unavailable checks remain explicit release gates; emulator, Jest or Android compilation results do not replace them. No independent staff/MFA/recovery implementation is deferred to M4.
