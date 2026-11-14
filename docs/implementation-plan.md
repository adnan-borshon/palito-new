# Palito mobile-first implementation

## Mandatory review gate

Complete all five mobile roles → test and fix → present runnable mobile preview and evidence → user review → address feedback → explicit user approval → begin web. No silence, elapsed session, milestone completion or agent judgment substitutes for approval. No Next.js screens or desktop-specific UI before approval. All backend-dependent operations are identified simulations.

## Current architecture

- `frontend/mobile`: Expo SDK 58, React 19.3, React Native 0.88, Expo Router, TypeScript. React Native Web is a mobile preview only.
- `frontend/shared`: domain types, fixtures, command repository, validation, localization and portable utilities; no React/native dependencies.
- `frontend/web`: reserved until review gate passes.
- `backend`: intentionally empty.
- Node 24 LTS; npm workspaces. Existing compatibility fixes are retained.

## Implementation order and acceptance

1. Requirements and Figma mobile inventory; extract brand assets and tokens.
2. Foundation: workspace migration, shared domain contract, local persisted demo repository, Bangla/English, role navigation, native controls, auth and onboarding.
3. Farm/animal/device foundation; health anomaly → booking → vet consultation → prescription → health record, including disconnect, escalation and emergency.
4. Insurance application → evidence → automatic/manual/vet review → decision → payout with secured-debt settlement.
5. Loan collateral → max 70% valuation offer → acceptance → review → disbursement → repayments/grace.
6. Supporting AI simulations, medication reminders, marketplace, wallet, notifications, professional queues, administration, profile and settings.
7. TypeScript, lint, Expo Doctor/compatibility, native bundles; shared transition tests, mobile component/navigation tests and cross-role walkthroughs. Test invalid/duplicate/offline/persistence/reset states and bilingual layouts.
8. Deliver mobile launch instructions, accounts, coverage, actual results and limitations; wait for explicit approval.

## Continuation protocol

Read root and mobile AGENTS, this plan, requirements/design/progress/testing documents, latest user feedback and actual repository state. Retrieve relevant Claude-Mem context when available. Files are authoritative; recheck volatile status. Record decisions, errors, tests and incomplete work without secrets. No production services, real payments, paid infrastructure, deployment, commits or pushes by implication.

## Current phase

Phase A foundation implemented 2026-11-14. Source migration, workspaces, shared contract, persisted provider, fonts, bilingual controls, onboarding/auth and role shell are present. Feature integration and complete mobile coverage remain in progress. The temporary registry fallback is not a completed workflow. See `docs/testing/foundation.md` for actual check results. No mobile readiness claim until complete coverage and verification.
