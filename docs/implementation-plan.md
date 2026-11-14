# Palito mobile-first implementation

## Mandatory review gate

Complete all five mobile roles → test and fix → present runnable mobile preview and evidence → user review → address feedback → explicit user approval → begin web. No silence, elapsed session, milestone completion or agent judgment substitutes for approval. No Next.js screens or desktop-specific UI before approval. All backend-dependent operations are identified simulations.

## Current architecture

- `frontend/mobile`: Expo SDK 58, React 19.3, React Native 0.88, Expo Router, TypeScript. React Native Web is a mobile preview only.
- `frontend/shared`: domain types, fixtures, command repository, validation, localization and portable utilities; no React/native dependencies.
- `frontend/web`: reserved until review gate passes.
- `backend`: intentionally empty.
- Node 24 LTS (`v24.22.3`); npm workspaces. Existing compatibility fixes are retained.

## Implementation order and acceptance

1. Requirements and Figma mobile inventory; extract brand assets and tokens. (**Done**)
2. Foundation: workspace migration, shared domain contract, local persisted demo repository, Bangla/English, role navigation, native controls, auth and onboarding. (**Done**)
3. Farm/animal/device foundation; health anomaly → booking → vet consultation → prescription → health record, including disconnect, escalation and emergency (`UC-001`). (**Done**)
4. Insurance application → evidence → automatic/manual/vet review → decision → payout with secured-debt settlement (`UC-002`). (**Done**)
5. Loan collateral → max 70% valuation offer → acceptance → review → disbursement → repayments/grace (`UC-003`). (**Done**)
6. Supporting AI simulations, medication reminders, marketplace, wallet, notifications, professional queues, administration, profile and settings. (**Done**)
7. TypeScript, lint, Expo Doctor/compatibility, web preview bundle; shared transition tests, mobile component/navigation tests and cross-role walkthroughs. (**Done — see `docs/testing/mobile-verification.md`**)
8. Deliver mobile launch instructions, accounts, coverage, actual results and limitations; wait for explicit approval. (**Current step**)

## Current phase

All five mobile roles (`farmer`, `vet`, `bank`, `insurer`, `admin`) are implemented, integrated in `frontend/mobile/src/features/registry.tsx`, and verified (`docs/testing/mobile-verification.md`). Awaiting explicit user review and approval before starting Phase 5 (`frontend/web`).
