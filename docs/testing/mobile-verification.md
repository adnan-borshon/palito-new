# Mobile verification report — 2026-11-14

Verified on Windows with Node `v24.22.3` (`$env:NVM_HOME\v24.22.3`). All five mobile roles (`farmer`, `vet`, `bank`, `insurer`, `admin`) and the three connected journeys (`UC-001`, `UC-002`, `UC-003`) are implemented and verified in the mobile codebase, with Figma visual refinements and production-ready UI copy (zero `"demo/simulation"` disclaimers in UI while preserving the quick-access login workflow).

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
| Shared domain tests | `npm run test:shared` | **Passed** (`18/18 tests passed`, `exit 0`, 530 ms) |
| Mobile component & journey tests | `npm run test:mobile` | **Passed** (`3/3 suites, 11/11 tests passed`, `exit 0`) |
| Expo SDK dependency compatibility | `npx expo install --check` | **Passed** (`Dependencies are up to date`) |
| Expo Doctor diagnostics | `npx expo-doctor` | **Passed** (`20/20 checks passed. No issues detected!`) |
| Mobile preview bundle export | `npm run export:web` | **Passed** (Exported cleanly to `frontend/mobile/dist`) |

## Key UI/UX & Functional Refinements Verified

1. **Production-Ready Copy & Preserved Quick-Access Login:**
   - Removed all `"Demo / ডেমো / Simulation / সিমুলেশন / নমুনা / Demonstration only"` disclaimers and suffixes from `@palito/shared` (`fixtures.ts`, `support.ts`, `health.ts`, `finance.ts`, `errors.ts`, `repository.ts`) and `@palito/mobile`.
   - Retained the exact quick-access login workflow (`Welcome` -> `Login` with 1-tap role account cards, phone input, and `123456` OTP verification) and in-app **Account & environment switcher** (`Profile`).
2. **Figma Visual Alignment (`ALL SCREENS`):**
   - **Bottom Tab Bar:** Styled the Farmer's center `ai` tab (`স্ক্যান / AI`) as Figma's elevated 48×48 circular `#15803D` button with white `scan-outline` icon and soft green shadow, and updated Farmer tab labels (`আমার প্রাণী`, `স্ক্যান`).
   - **Farmer Home (`24466:64665`):** Added verified farm subtitle, multi-vet portrait rail (`vetAvatar1`, `vetAvatar2`, `vetAvatar3`) with 3 active clinicians (`ডা. ফারহানা রহমান`, `ডা. কামরুল হাসান`, `ডা. নাসরিন আক্তার`), and `২৪/৭ সক্রিয় / 24/7 Active` AI badge.
   - **Animal Health Passport (`24466:65272`):** Added Figma's 3-tab underline bar (`স্বাস্থ্য তথ্য`, `রেকর্ড`, `আর্থিক`), purple AI health forecast card (`#F3E8FF` / `#D8B4FE`), weight/health-score/insured/pledged badges on `AnimalCard`, true 7-day daily vitals aggregation across all readings, normal reference ranges (`৩৮.০–৩৯.০°সে`, `৬০–৮০ /মিনিট`, `৭০%+`), and `Asia/Dhaka` timestamp formatting (`dateTime`).
   - **Vet Discovery & Booking (`24466:68193`, `24466:67236`):** Added working species filter (`গরু / Cattle`, `ছাগল ও ভেড়া / Goat & sheep`, `অনলাইন / Available now`), category selection cards, centered verified clinician header (`সার্টিফাইড সদস্য`, `★ 4.9 (২৪৩) · BVC #4821`), `Asia/Dhaka` time-slot labels, and payment method selection (`Palito Wallet`, `bKash`, `Nagad`, `Debit / Credit Card`) with digital payment receipt on `AppointmentDetail`.
   - **Loan Collateral & Schedule (`24466:65462`):** Added health-linked interest note banner, rich collateral eligibility cards with horizontal health-score progress bar, and a **Monthly Installment & Schedule** card on `LoanDetail`.
   - **Role-Specific Avatars & Admin Role Management:** Replaced shared vet avatar on `bank`, `insurer`, and `admin` profile headers with role-specific icon badges, and wired `admin.userRole` in `AdminUsersScreen`.

## Test suites and covered scenarios

1. `frontend/shared/tests/invariants.test.ts` & `frontend/shared/tests/journeys.test.ts` (18 tests)
2. `frontend/mobile/src/__tests__/navigation.test.ts` (2 tests)
3. `frontend/mobile/src/features/farmer/__tests__/farmer.test.tsx` (4 tests)
4. `frontend/mobile/src/features/__tests__/roles-and-journeys.test.tsx` (5 tests)

## Remaining limitations and unverified items

- **Physical Android / iOS device & emulator testing (`Unverified`):** This Windows environment has no connected Android device/emulator or macOS iOS simulator. Native keyboard avoidance, hardware back gestures, safe-area insets on physical cutouts, screen-reader voice announcements (TalkBack/VoiceOver), and AsyncStorage persistence across native OS process kills remain unverified on hardware.
- **Frontend-only architecture:** All OTP verification (`123456`), IoT collar telemetry, AI symptom/photo/voice guidance, consultations, bKash/Nagad/wallet payments, loan valuations, insurance payouts, and order deliveries operate against the local persistent repository with no production backend.
