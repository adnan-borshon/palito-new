# Shared domain verification

Verified 2026-11-14 on Windows with Node 24.22.3. This report covers the portable TypeScript demo engine, not native UI behavior or a complete mobile review.

## Commands and results

Run from the repository root with Node 24 on PATH:

```powershell
node --test frontend/shared/tests/*.test.ts
node node_modules/typescript/bin/tsc -p frontend/shared/tsconfig.json --noEmit
node node_modules/eslint/bin/eslint.js --config frontend/mobile/eslint.config.js frontend/shared/src/*.ts frontend/shared/tests/*.ts
```

- Node tests: **18 passed, 0 failed**, exit 0; last run 1.49 seconds.
- TypeScript: **passed**, exit 0, including test source. Node types are explicit and the shared lib is ES2022 with no DOM APIs.
- ESLint: **passed**, exit 0, no warnings or errors.

## Covered behavior

- UC-001 alert, priority booking, veterinarian decision/start/completion, prescription, linked health record and medication reminder. Four-hour escalation, disconnected/reconnected devices and emergency dispatch/medical-support loan offer alternatives.
- UC-002 active enhanced coverage, timestamp/sample GPS evidence, 48-hour IoT eligibility, automatic versus manual/veterinary review, rejection, payout and exact secured-debt/farmer split. Concurrent payout retries create one transfer.
- UC-003 illustrative health-adjusted valuation, maximum 70% cap, locked collateral, acceptance, bank review/disbursement, production-drop grace period and repayments. Same-key concurrent retries debit once; separate keys permit later payments.
- Insurance enrollment/premium, order checkout/cancellation/refund, content publication, account suspension and cross-role linked state.
- NaN/Infinity/unsafe integers/invalid money; impossible calendar dates/future birth dates/invalid weight; unauthorized ownership and role actions; blocked accounts; actor-bound retry keys; missing evidence/expired coverage; veterinary time-slot collisions; invalid transitions; insufficient funds.
- Immutable stable snapshots, one notification per committed transaction, persisted restore and retry records, corrupt/version-mismatched/broken-reference storage, storage-write rollback/retry, reset, offline recovery, simulated one-shot network failures and OTP expiry.
- All five seeded scenarios initialize with valid relationships.

## Defects found and fixed

The first run passed 17/18. It found floating-point flooring of 70% of 88,000 yielding 61,599 instead of 61,600. The cap now uses integer quotient/remainder arithmetic; the 80% sample valuation adjustment and 3% sample premium also use integer arithmetic. A regression check covers the exact cap and maximum safe integer boundary.

## Integration contract

`createDemoRepository` serializes mutations, validates permissions and transitions on a cloned draft, persists before publishing, and preserves the previous snapshot on failures. `requestId` is optional on commands; financial confirmation/retry UI must keep the same ID for retries and issue a new ID for a separate transaction. IDs are bound to actor and payload and persisted in `processedRequests`.

Whole integer BDT amounts are used everywhere. `demoLoanQuote` is an illustrative policy (80% sample adjustment below health score 75; example rate 15% versus 10%), never a real valuation or rate. `hasIoTEvidence` checks a connected device and regularly sampled 48-hour window. Evidence timestamps and coordinates are explicit sample data; no sensor or camera processing occurs.

## Limits

The engine is a local demonstration, not a security boundary or production ledger. Tests use injected in-memory storage; AsyncStorage on real devices, native navigation, keyboard, accessibility, screen rendering and app lifecycle remain part of mobile verification. The three journeys are domain integration tests, not device end-to-end tests. Full mobile readiness and the explicit web review gate remain open work.
