# Palito

Bangla-first livestock care frontend for farmers, veterinarians, banks, insurers and administrators. Built with Expo SDK 58, React Native, Expo Router and TypeScript. All authentication, AI, IoT, calls, financial transactions and delivery are simulations stored on this device.

**Mobile is in implementation.** Complete and test all mobile workflows, obtain the user's review, address feedback, and wait for explicit approval before starting the web application. The Expo browser output is only a mobile preview.

## Run locally

Use Node 24 LTS (verified installation: 24.22.3) and npm. From the repository root:

```sh
npm install
npm start
```

The Expo terminal offers a QR code for a compatible Expo Go/development client. Use `npm run android` with a configured Android device, or `npm run ios` on macOS with a configured simulator. Native builds have not yet been verified in this Windows environment.

```sh
npm run web          # mobile UI browser preview
npm run typecheck
npm run lint
npm run test:shared
npm run test:mobile
npm run doctor
npm run export:web   # static mobile preview bundle
```

Choose a demo role on the sign-in screen, request the simulated code, and enter **123456**. No SMS is sent. Related workflows share the same local data when switching accounts. Full demo controls and walkthroughs will be documented with the completed mobile review package.

## Repository

- `frontend/mobile/`: native app, route files under `src/app`, features outside routes.
- `frontend/shared/`: types, fixtures, repository, validation and tests.
- `frontend/web/`: reserved until explicit mobile approval.
- `backend/`: intentionally empty.
- `docs/`: SRS, implementation plan, requirements/design records and test evidence.

Start with [the implementation plan](docs/implementation-plan.md), [shared contract](docs/shared-contract.md), [design system](docs/design-system.md) and [foundation verification](docs/testing/foundation.md). Project files are local on this PC. Downloading dependencies does not upload this project.
