# Mobile verification report — 2026-11-14

Verified on Windows with Node `v24.22.3` (`$env:NVM_HOME\v24.22.3`). All five mobile roles (`farmer`, `vet`, `bank`, `insurer`, `admin`) and the three connected journeys (`UC-001`, `UC-002`, `UC-003`) are implemented and verified in the mobile codebase.

## Commands executed and actual results

```powershell
$env:Path = "$env:NVM_HOME\v24.22.3;" + $env:Path
npm run typecheck
npm run lint
npm run test:shared
npm run test:mobile
Push-Location frontend/mobile
npx expo install --check
npx expo-doctor
Pop-Location
npm run export:web
```

| Check | Command | Observed result |
|---|---|---|
| TypeScript (`@palito/mobile`, `@palito/shared`) | `npm run typecheck` | **Passed** (`exit 0`, 0 errors) |
| ESLint (`expo lint`) | `npm run lint` | **Passed** (`exit 0`, 0 warnings/errors) |
| Shared domain tests | `npm run test:shared` | **Passed** (`18/18 tests passed`, `exit 0`, 908 ms) |
| Mobile component & journey tests | `npm run test:mobile` | **Passed** (`3/3 suites, 11/11 tests passed`, `exit 0`, 7.08 s) |
| Expo SDK dependency compatibility | `npx expo install --check` | **Passed** (`Dependencies are up to date`) |
| Expo Doctor diagnostics | `npx expo-doctor` | **Passed** (`20/20 checks passed. No issues detected!`) |
| Mobile preview bundle export | `npm run export:web` | **Passed** (`Web Bundled 924 modules`, 42 assets, 10 bundles exported to `frontend/mobile/dist`) |

## Test suites and covered scenarios

1. `frontend/shared/tests/invariants.test.ts` & `frontend/shared/tests/journeys.test.ts` (18 tests):
   - `UC-001`: device anomaly alert, priority booking, 4-hour unacknowledged alert escalation, device disconnect/reconnect, emergency dispatch, veterinary consultation completion, prescription, health record, and medication reminder.
   - `UC-002`: active policy prerequisite, timestamp & sample GPS evidence, 48-hour IoT check, automatic vs manual/veterinary review, payout, and atomic secured-debt-first settlement + farmer wallet credit.
   - `UC-003`: 70% LTV cap enforcement (exact integer arithmetic), health-adjusted sample offer (`<75` health score), bank review/decision, simulated disbursement, partial/full repayments, and milk-production drop grace period.
   - Validation, authorization, blocked accounts, idempotent `requestId` replay protection, offline mode, one-shot simulated network failure (`demo.failNext`), corrupt storage fallback, and deterministic reset across all 5 scenarios (`normal`, `health`, `insurance`, `lending`, `empty`).
2. `frontend/mobile/src/__tests__/navigation.test.ts` (2 tests):
   - Role validation (`isRole`), prototype-property rejection, and typed Expo Router href generation (`routeFor`).
3. `frontend/mobile/src/features/farmer/__tests__/farmer.test.tsx` (4 tests):
   - Animal registration validation, Bangla numeral parsing (`৮০` kg, `৩০০০০` BDT), linked passport creation, farmer-scoped animal search, priority alert booking with 7-day trend sharing, and idempotent emergency dispatch.
4. `frontend/mobile/src/features/__tests__/roles-and-journeys.test.tsx` (5 tests):
   - Cross-role `UC-001` walkthrough across `vet` and `farmer` mobile screens (`VetAppointmentDetail` -> `RemindersScreen`).
   - Cross-role `UC-002` walkthrough across `farmer` and `insurer` mobile screens (`ClaimApplication` -> `ClaimDetail` auto-review & payout settling `32,000 BDT` bank debt and crediting `58,000 BDT` to farmer).
   - Cross-role `UC-003` walkthrough across `farmer` and `bank` mobile screens (`LoanApplication` 70% cap validation -> `LoanDetail` offer acceptance -> bank approval & disbursement -> farmer repayment).
   - Farmer AI companion (`text`, `photo`, and `voice` demo modes) and Medicine/Feed marketplace cart, checkout, and simulated delivery progression (`OrdersScreen`).
   - Admin bilingual educational content authoring/publication (`AdminContentScreen`) and Bangla (`bn`) default locale rendering.

## Remaining limitations and unverified items

- **Physical Android / iOS device & emulator testing (`Unverified`):** This Windows environment has no connected Android device/emulator or macOS iOS simulator. Native keyboard avoidance, hardware back gestures, safe-area insets on physical cutouts, screen-reader voice announcements (TalkBack/VoiceOver), and AsyncStorage persistence across native OS process kills remain unverified on hardware.
- **Figma MCP Starter-plan call limit (`Partially verified`):** Canonical Figma contexts and screenshots were captured for Welcome (`24466:64177`), Farmer Home (`24466:64665`), Animal Vitals (`24466:65272`), Loan Collateral (`24466:65462`), Vet Profile Heading (`24466:67236`), and Vet Category (`24466:68193`). Remaining frames and operator roles (`vet`, `bank`, `insurer`, `admin`) use the extracted Palito design tokens, local Anek Bangla / Plus Jakarta Sans fonts, and 16 bundled assets.
- **Simulated external dependencies:** All OTP verification (`123456`), IoT collar readings, AI symptom/photo/voice guidance, video calls, bKash/Nagad/wallet transfers, loan valuations, insurance payouts, and order deliveries are local frontend demonstrations with no production backend.
