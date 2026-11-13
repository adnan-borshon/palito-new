This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Mandatory delivery order and durable context

Complete all five mobile roles, test and fix them, deliver mobile for user review, address feedback, then wait for explicit user approval before implementing any web application. No Next.js screens or web-specific designs during the mobile phase. Expo React Native Web output is a mobile preview only. All integrations remain frontend simulations; no production API, database, real payment or paid infrastructure.

At every continuation read this file, `docs/implementation-plan.md`, current requirements/design/progress/test documents and the latest user feedback; inspect the real repository state. Retrieve relevant Claude-Mem history when available. Files remain authoritative. Record meaningful decisions and verification results without secrets. Never infer approval from silence or a finished milestone.

The Expo app is in `frontend/mobile`; run Expo commands there. Shared portable code is in `frontend/shared`. Root npm scripts forward to workspaces. Read the Expo major version from `frontend/mobile/package.json`. Routes are in `frontend/mobile/src/app`. `frontend/web` is reserved and `backend` is intentionally empty. Use native dependencies only in the mobile package and one version of React. Follow the shared command contract in `docs/shared-contract.md`.

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
