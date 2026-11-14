# `@palito/web` — Palito Responsive Web Application

Next.js 16 (App Router) + React 19.3 + TypeScript + Tailwind CSS v4 desktop and responsive web application for Palito.

## Role Workbenches & Mobile Feature Parity

- **Bank (`/bank/home`, `/bank/applications`, `/bank/loans`):** Master-detail underwriting workbench, 70% LTV collateral compliance (`maximumLoanAmount` / `demoLoanQuote`), Animal Health Passport & IoT telemetry inspection, loan approval/disbursement, grace period extensions, and `UC-002` collateral insurance debt-first settlement ledger.
- **Veterinarian (`/vet/home`, `/vet/appointments`, `/vet/animals`, `/vet/reviews`):** Clinical triage & 4-hour escalated alert desk (`UC-001`), 7-day daily aggregated vitals with reference ranges (`৩৮.০–৩৯.০°সে`, `৬০–৮০ /মিনিট`, `৭০%+`), digital prescription composer, patient registry & record entry, and complex insurance claim forensic review.
- **Administrator (`/admin/home`, `/admin/users`, `/admin/content`, `/admin/reports`):** User & role access management (`admin.userRole`, `admin.userStatus`), bilingual (`bn`/`en`) educational content CMS, system clock/SLA progression controls, and chronological audit log reports.
- **Insurer (`/insurer/home`, `/insurer/claims`, `/insurer/applications`, `/insurer/policies`):** Policy underwriting queue, claim evidence & IoT verification (`hasIoTEvidence`), 1-click vet referral, and atomic debt-first claim payouts (`UC-002`).
- **Farmer (`/farmer/home`, `/farmer/animals`, `/farmer/devices`, `/farmer/care`, `/farmer/ai`, `/farmer/wallet`, `/farmer/market`, `/farmer/education`):** Full 100% mobile workflow parity in-browser plus a **Web-to-Mobile Companion Bridge (`palito://` deep link & QR modal)**.

## Backend-Agnostic Client Architecture

All web screens interact strictly with `useWebApp()` (`src/providers/web-provider.tsx`) backed by `createPalitoWebClient()` (`src/lib/client.ts`) and `browserStorage` (`src/lib/storage.ts`). No UI component reads `localStorage` directly, and every mutation automatically attaches an idempotency `requestId` so a future REST/tRPC/GraphQL backend, PostgreSQL database, and SMS OTP/cookie auth adapter can be swapped in without rewriting React screens.

## Commands

```bash
npm run dev:web     # Start Next.js web server on http://localhost:3000
npm run build:web   # Build production Next.js bundle
npm run typecheck   # Typecheck shared, mobile, and web workspaces
```
