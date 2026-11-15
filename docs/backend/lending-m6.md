# M6 financial foundation and lending sandbox implementation

M6 delivers the explicitly opt-in livestock lending, collateral reservation, simulated payment intent, HMAC webhook verification, and immutable double-entry ledger sandbox (`20261115000700_lending_ledger_sandbox`), plus the separate `/finance` workspace (`FinanceWorkspace`) in Next.js web and Expo mobile.

## Explicit sandbox gate and policy boundary

- All M6 routes fail closed with `503 Service Unavailable` unless `FINANCE_SANDBOX_ENABLED=true`.
- Production configuration (`NODE_ENV=production`) strictly forbids `FINANCE_SANDBOX_ENABLED=true`, `PAYMENT_PROVIDER=sandbox`, and `SANDBOX_WEBHOOK_SECRET` (enforced by `loadConfig` in `backend/src/platform/config.ts`).
- `GET /me/wallet` explicitly returns `sandboxMode: true`, `withdrawable: false`, and a disclosure banner stating that balances are sandbox ledger projections only and no real-money disbursement, withdrawal, or live payment settlement is active.
- Financial amounts use PostgreSQL `BIGINT` minor units (`poisha`, 100 poisha = BDT 1) serialized as canonical positive integer strings, using exact BigInt arithmetic (`maxLoanCap70`, `buildInstallmentSchedule`, `allocateRepayment`) in `backend/src/finance/lending-math.ts`.
- Draft sandbox lending policy (`termVersion: "sandbox-v1"`): `annualRateBps = 0`, `feeMinor = 0`, 1–24 calendar-month UTC installments (`addCalendarMonthsUtc` with month-end clamping), exact integer remainder assigned to the final installment, FIFO allocation across open installments, and manual `BANK_STAFF` grace extensions (`1..90` days). Production interest rates, fees, rounding, and partner credit rules remain gated by B08–B10 in [decisions](decisions.md).

## Core invariants

1. **Maker/checker collateral valuations**: Only active `BANK_STAFF` in an active `BANK` organization can draft valuations (`createValuation`, `approvedValueMinor <= assessedValueMinor`). Approval (`approveValuation`) requires a **different** `BANK_STAFF` member (`assessorId !== approvedById`) in the **same** `organizationId`, and neither user may own the animal. Farmer `estimateMinor` never authorizes borrowing.
2. **Minimum redacted bank projection**: `GET /animals/:id/collateral-risk` returns animal identity summary, verified veterinarian vaccination/checkup counts, live collateral status, and `clinicalDetailsRedacted: true` — strictly excluding clinical diagnoses, vet notes, prescriptions, and private images. Foreign bank organizations receive `404`.
3. **70% LTV cap & single live collateral lock**: `maxLoanCap70(approvedValueMinor)` caps requested principal at `floor(approvedValueMinor * 7 / 10)`. Submitting a loan consumes the active non-expired `LoanQuote` (`status: "USED"`) and inserts into `collateral_reservations`, guarded by both animal advisory locks and the PostgreSQL partial unique index `one_live_collateral_per_animal` (`WHERE status IN ('HELD', 'ACTIVE')`).
4. **Immutable double-entry ledger**: Every disbursement and repayment settlement commits via `postBalancedTransaction` across `BANK_POOL`, `USER_WALLET`, `PROVIDER_CLEARING`, and `PLATFORM_ESCROW` accounts. PostgreSQL constraint triggers verify `SUM(DEBIT) = SUM(CREDIT)` with at least two legs per `ledger_transaction` at commit (`DEFERRABLE INITIALLY DEFERRED`) and block `UPDATE`/`DELETE` on `ledger_transactions` and `ledger_entries`.
5. **HMAC webhook verification & deduplication**: `POST /webhooks/payments/sandbox` is `@Public()` (bypasses Firebase user auth) and authenticates callbacks exclusively via `X-Palito-Signature` timing-safe HMAC-SHA256 verification (`sha256=<hex>`) over canonical sorted JSON (`canonicalWebhookJson`) using `SANDBOX_WEBHOOK_SECRET`. Processed `(provider, externalEventId)` rows are persisted atomically in `provider_events`: identical replays return `{ deduplicated: true }`, mismatched replays fail with `409 Conflict`.

## API contract (`/api/v1`)

| Method / path | Scope / headers | Purpose |
|---|---|---|
| `POST /valuations` | `BANK_STAFF` + `Idempotency-Key` | Draft valuation (`DRAFT`) |
| `POST /valuations/:id/approve` | Different same-bank `BANK_STAFF` + `If-Match` + `Idempotency-Key` | Maker/checker approval -> `APPROVED`; enqueues `VALUATION_APPROVED` |
| `GET /animals/:id/valuations` | Owner or same-bank `BANK_STAFF` | Lists versioned valuations |
| `GET /animals/:id/collateral-eligibility` | Owner or `BANK_STAFF` | Shows current eligibility, live collateral flag, and 70% cap |
| `GET /animals/:id/collateral-risk` | Owner or relationship-bound `BANK_STAFF` | Redacted clinical summary without medical notes |
| `POST /loans/quotes` | Animal owner + `Idempotency-Key` | Expiring 30-min `sandbox-v1` quote bounded by 70% cap |
| `POST /loans` | Animal owner + `Idempotency-Key` | Reserves collateral under `one_live_collateral_per_animal` and submits loan |
| `GET /loans`, `/loans/:id`, `/loans/:id/installments` | Borrower or lending `BANK_STAFF` | Scoped loan details, schedule, and allocations |
| `POST /loans/:id/decision` | Lending `BANK_STAFF` + `If-Match` + `Idempotency-Key` | `approve` -> `APPROVED`; `reject` -> `REJECTED` + releases collateral |
| `POST /loans/:id/disburse` | Lending `BANK_STAFF` + `If-Match` + `Idempotency-Key` | Moves `APPROVED` -> `DISBURSING` and creates `LOAN_DISBURSEMENT` intent |
| `POST /loans/:id/repayment-intents` | Borrower + `Idempotency-Key` | `WALLET` settles immediately from sandbox balance; provider returns pending intent |
| `POST /loans/:id/grace` | Lending `BANK_STAFF` + `If-Match` + `Idempotency-Key` | Extends an open installment (`1..90` days) with recorded reason |
| `POST /payments/care-fee-intents` | Appointment farmer + `Idempotency-Key` | Sandbox `CARE_FEE` intent linked to appointment |
| `GET /me/wallet`, `GET /payments/:id` | Owner / authorized party | Ledger-derived wallet balance (non-withdrawable) and payment intent state |
| `POST /webhooks/payments/sandbox` | `@Public()` + `X-Palito-Signature` | Settles/fails intents, builds installment schedules on disbursement, releases collateral on `PAID` |
| `GET /admin/ledger/reconciliation` | `ADMIN` (`403` otherwise) | Verifies global debit == credit parity and flags any unbalanced transactions |
