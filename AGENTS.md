This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Mandatory delivery order and durable context

The user reviewed M4–M7 and authorized milestones 8 (M8a–M8e extensions: telemetry/alerts, bounded AI, call tokens/emergencies, prescription-checked commerce, admin content/exports) and 9 (system QA & security remediation). Preserve M3 identity/MFA/session safeguards, M4 `/care` healthcare pilot, M5 worker/notifications/recovery, M6–M7 `/finance` lending & insurance sandboxes, and existing demo clients. M8 extensions operate strictly behind opt-in `EXTENSIONS_SANDBOX_ENABLED=true` (forbidden in production) and `CareWorkspace` includes live `/content`, `/ai/requests`, `/products`, and `/orders` panels without importing `DemoState`. M9 delivers automated security matrix & regression suites (`security-matrix.test.ts`, `extensions.test.ts`, `extensions.scenario.ts`). Stop before M10. Provider/device limitations must be recorded honestly.

No production deployment, paid activation, real OTP campaign, production data change or real-money transfer is authorized. Firebase/login/session safeguards are implemented from M3. M4 adds `/care`; M6–M7 add `/finance`; M8 extends `/care` and `/api/v1` behind `EXTENSIONS_SANDBOX_ENABLED`; existing demo routes retain their local repository. Temporary local/CI database creation and tests are authorized development work; never migrate or seed production by implication.

On continuation read this file, `docs/backend/README.md`, `docs/backend/progress.md`, the implementation plan, traceability, decisions and latest user feedback; inspect the actual branch/diff. Historical frontend reports are not current runtime evidence. Retrieve relevant Claude-Mem history if available; files remain authoritative. Record real check results and blockers without secrets.

The Expo app is in `frontend/mobile`; run Expo commands there. Shared portable demo code is in `frontend/shared`; Next.js is in `frontend/web`; `backend` contains the M1–M9 NestJS API, outbox worker, and 9 Prisma/PostgreSQL migrations. Firebase identity/session paths are implemented behind explicit configuration; read the M3 checkpoint for incomplete client/staff/provider gates. M4–M9 are implemented for review; M10 remains gated. Read the installed Expo major from its package.json before changing native APIs. Use native dependencies only in mobile and preserve one React version. Follow `docs/shared-contract.md` for existing demo behavior and `docs/backend/api-contracts.md` for proposed API boundaries. For backend/auth/database/security work, follow [repository backend guidance](.agents/skills/backend/SKILL.md), with the current milestone boundary above taking priority.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
