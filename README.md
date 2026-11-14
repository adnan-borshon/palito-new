# Palito

Bangla-first livestock care, veterinary, insurance, lending, and administration frontend for **Farmer**, **Veterinarian**, **Bank**, **Insurer**, and **Administrator** roles.

- `frontend/mobile`: Complete Expo SDK 58 + React Native 0.88 + Expo Router + TypeScript mobile application across all five roles.
- `frontend/shared`: Portable TypeScript domain engine, validation, Bangla/English localization, deterministic fixtures, and versioned local storage repository.
- `frontend/web`: Reserved for the Next.js App Router web application (gated until mobile review approval).
- `backend`: Intentionally empty placeholder. All authentication, AI, IoT, calls, payments, insurance, loans, and deliveries are clearly labeled local demonstrations.

## Run locally

Use **Node 24 LTS** (`24.22.3` pinned in `.nvmrc` and `.node-version`). On Windows PowerShell with `nvm-windows`:

```powershell
$env:Path = "$env:NVM_HOME\v24.22.3;" + $env:Path
npm install
npm start
```

| Root command | Purpose |
|---|---|
| `npm start` | Start the Expo development server (`frontend/mobile`) |
| `npm run web` | Open the Expo mobile preview in the browser |
| `npm run android` | Launch on a connected Android device or configured emulator |
| `npm run ios` | Launch on an iOS simulator (requires macOS) |
| `npm run typecheck` | Run TypeScript `--noEmit` across `@palito/mobile` and `@palito/shared` |
| `npm run lint` | Run `expo lint` on the mobile workspace |
| `npm run test` | Run all shared and mobile automated test suites |
| `npm run test:shared` | Run the 18 shared domain & journey tests (`node --test`) |
| `npm run test:mobile` | Run the 11 Jest + React Native Testing Library mobile tests |
| `npm run doctor` | Run `npx expo-doctor` diagnostics (`20/20` checks) |
| `npm run export:web` | Build the static mobile preview bundle in `frontend/mobile/dist/` |

## Seeded demo accounts & OTP

On the sign-in screen (`/login`), tap any role row (or enter its phone number), tap **Get verification code**, and enter the demo OTP **`123456`**. Once signed in, you can switch roles at any time via **Profile → Demo controls (`/[role]/demo`)** while keeping the same local records.

| Role | Name (BN / EN) | Phone | Default ID |
|---|---|---|---|
| **Farmer** | রহিম উদ্দিন / Rahim Uddin | `+8801712345678` | `farmer-rahim` |
| **Farmer (2nd)** | সালমা বেগম / Salma Begum | `+8801812345678` | `farmer-salma` |
| **Veterinarian** | ডা. ফারহানা আহমেদ / Dr. Farhana Ahmed | `+8801912345678` | `vet-farhana` |
| **Bank** | পদ্মা ব্যাংক ডেমো / Padma Bank Demo | `+8801612345678` | `bank-padma` |
| **Insurer** | সুরক্ষা বীমা ডেমো / Suraksha Insurance Demo | `+8801512345678` | `insurer-suraksha` |
| **Administrator** | পালিত অ্যাডমিন / Palito Admin | `+8801312345678` | `admin-palito` |

## Cross-role walkthroughs

1. **UC-001 (Health anomaly → Priority vet care → Prescription & reminder):**
   - Sign in as **Farmer** → open **Review alert** on Home (`alert-temperature` for Moti, `PL-1002`) → tap **Book priority visit** (or advance the demo clock by 4 hours in Demo Controls to trigger escalation).
   - Switch to **Veterinarian** → open the appointment from **Visits** → review Moti's 7-day vitals and health history → tap **Accept appointment** → **Start consultation** → complete the diagnosis and medicine prescription.
   - Switch to **Farmer** → check **Prescriptions** and **Medication reminders** to mark today's dose taken; switch to **Insurer** → check **Notifications** for the preventive care record.
2. **UC-002 (Insurance enrollment → Claim evidence → Review → Debt-first payout):**
   - As **Farmer**, open **Wallet → Submit an insurance claim** on Shyamoli (`PL-1003`, insured for `90,000 BDT` and securing `loan-active` with `32,000 BDT` outstanding debt). Attach the sample photo and sample GPS/time evidence and submit.
   - Switch to **Insurer** → open the claim in **Claims** → run **Demo automatic review** (or refer to the **Veterinarian** for clinical assessment) → tap **Simulate payout**.
   - Verify that `32,000 BDT` settles the bank loan (`loan-active` becomes `settled`), `58,000 BDT` credits the farmer's wallet, and Shyamoli's passport records the settled death claim.
3. **UC-003 (Collateral selection → 70% LTV cap → Bank review & disbursement → Repayment & grace):**
   - As **Farmer**, open **Wallet → Apply for a farm loan** → select Lali (`PL-1001`, value `140,000 BDT`, 70% cap `98,000 BDT`) or Moti (`PL-1002`, health score `66`, adjusted valuation `88,000 BDT`, 70% cap `61,600 BDT` at `15%` sample rate) → generate the offer and accept terms.
   - Switch to **Bank** → open **Applications** → inspect the linked health passport, approve the loan, and tap **Simulate disbursement**.
   - Switch to **Farmer** to make a partial or full repayment, or inspect **Bank → Loan portfolio (Production drop / Grace)** to grant a repayment grace period.
