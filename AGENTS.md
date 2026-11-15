This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Mandatory delivery order and durable context

Mobile approval is recorded on 2026-11-15 and the Next.js web app exists. Preserve both clients. The user reviewed backend milestone 0 and explicitly authorized **milestone 1**: backend/configuration/PostgreSQL development setup, logging/errors/security boundaries, operations/OpenAPI, real CI, genuine lint and generated-output cleanup. Push the reviewable result and stop for user review before M2. Silence or a finished milestone does not authorize the next one.

No production deployment, paid service activation, real OTP campaign, production data changes or real-money transfer is authorized. Database domain schema/migrations and Firebase integration are M2/M3, not M1. Existing client workflows stay on their local demo repository until deliberately replaced and verified.

On continuation read this file, `docs/backend/README.md`, `docs/backend/progress.md`, the implementation plan, traceability, decisions and latest user feedback; inspect the actual branch/diff. Historical frontend reports are not current runtime evidence. Retrieve relevant Claude-Mem history if available; files remain authoritative. Record real check results and blockers without secrets.

The Expo app is in `frontend/mobile`; run Expo commands there. Shared portable demo code is in `frontend/shared`; Next.js is in `frontend/web`; `backend` contains the M1 NestJS foundation; Firebase identity and domain tables are not implemented. Read the installed Expo major from its package.json before changing native APIs. Use native dependencies only in mobile and preserve one React version. Follow `docs/shared-contract.md` for existing demo behavior and `docs/backend/api-contracts.md` for proposed API boundaries. For backend/auth/database/security work, follow [repository backend guidance](.agents/skills/backend/SKILL.md), with the current milestone boundary above taking priority.

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
