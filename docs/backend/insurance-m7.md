# M7 insurance and claim settlement sandbox implementation

M7 delivers the explicitly opt-in livestock insurance policy enrollment, confirmed-premium coverage activation, policy renewal, private evidence mortality claim submission, advisory review check, verified veterinarian referral & clinical opinion, maker/checker claim decision, deceased-animal borrowing block, and atomic debt-first claim settlement sandbox (`20261115000800_insurance_claim_settlement_sandbox`), integrated into the `/finance` workspace (`FinanceWorkspace`) in Next.js web and Expo mobile.

## Explicit sandbox gate and policy boundary

- Like M6, all M7 routes fail closed with `503 Service Unavailable` unless `FINANCE_SANDBOX_ENABLED=true` (which is strictly forbidden in `NODE_ENV=production`).
- Draft sandbox insurance terms (`termVersion: "ins-sandbox-v1"`, `consentVersion: "ins-sandbox-v1"`):
  - **Approval does not bypass confirmed premium (`PAL-INS-02`)**: `POST /policies/:id/decision` with `decision: "approve"` moves a `SUBMITTED` policy to `APPROVED_AWAITING_PREMIUM` (`premiumConfirmedAt = null`, `startsAt = null`, `endsAt = null`). Coverage only transitions to `ACTIVE` with `[startsAt, endsAt]` once the `POLICY_PREMIUM` payment intent is confirmed (via sandbox `WALLET` or HMAC-verified `POST /webhooks/payments/sandbox`), posting a balanced `POLICY_PREMIUM` ledger entry (`USER_WALLET` or `PROVIDER_CLEARING` → `INSURER_POOL`).
  - **Single live policy per animal**: Enforced by animal advisory lock and PostgreSQL partial unique index `one_live_policy_per_animal` (`WHERE status IN ('SUBMITTED', 'APPROVED_AWAITING_PREMIUM', 'ACTIVE')`).
  - **Renewals (`PAL-INS-01`)**: `POST /policies/:id/renewals` creates a new versioned `SUBMITTED` policy (`policyVersion = prev + 1`, `renewedFromPolicyId = prev.id`) only after the prior policy is `EXPIRED` (or past `endsAt`), preventing overlapping unapproved coverage.
  - **Mortality claims vs illness gap (`SRS-GAP-09`, `PAL-INS-03`)**: Only `incidentKind: "DEATH"` is enabled in `ins-sandbox-v1`; `CRITICAL_ILLNESS` and repeat illness claims are explicitly rejected (`409 Conflict`) until insurer repeat/partial illness rules are approved (B11).

## Claim evidence, referral, maker/checker decision and debt-first settlement

1. **Incident-time active coverage & real private evidence (`PAL-INS-03`)**:
   - `POST /claims` verifies that `policy.premiumConfirmedAt` is present and `startsAt <= incidentAt <= endsAt` (`incidentAt <= now`), that `claimedAmountMinor <= policy.coverageMinor`, and that every UUID in `evidenceFileIds` (`1..5`) is an existing `READY` `PrivateFile` owned by the farmer for that animal.
   - Creates immutable `claim_evidence_links` rows, sets `reviewTargetAt = createdAt + 7 days` (operational complex review tracking target, `PAL-INS-05` / `SRS-GAP-05`), and enforces `one_live_claim_per_policy`.
2. **Advisory review & verified vet referral (`PAL-INS-04`, `PAL-INS-05`)**:
   - `POST /claims/:id/review-requests` records an `ADVISORY_CHECK` `ClaimReview` (`autonomousApprovalAllowed: false`; IoT/weather adapters remain M8a/b) and moves `SUBMITTED → UNDER_REVIEW`.
   - `POST /claims/:id/referrals` creates a time-limited `ClaimReferralGrant` (`1..168` hours, default `72`h) for an active `VERIFIED` veterinarian in an active `CLINIC`, moving the claim to `REFERRED_TO_VET`.
   - `CareService` grants `GET /files/:id` and `GET /files/:id/download` on linked `READY` claim evidence files to the claim's active `INSURER_STAFF` and the referred `VET` holding an active non-expired `ClaimReferralGrant` (denying non-referred vets with `404`).
   - `POST /claims/:id/opinions` allows **only** the referred verified `VET` with an active non-expired referral grant to record an immutable `VET_OPINION` (`CONFIRM_MORTALITY | INCONCLUSIVE | REJECT_EVIDENCE`), moving the claim to `VET_REVIEWED` without issuing payout.
3. **Maker/checker decision & deceased animal borrowing block (`PAL-INS-06`, `PAL-LOAN-09`)**:
   - `POST /claims/:id/decision` requires linked private evidence, at least one recorded `ClaimReview` (`ADVISORY_CHECK` or `VET_OPINION`), and maker/checker separation (`decidedById` cannot match any `INSURER_STAFF` user who initiated the advisory review or vet referral on that claim).
   - Approving a `DEATH` claim sets `approvedAmountMinor` (`<= claimedAmountMinor <= coverageMinor`, supporting partial or full approval) and transitions the insured animal to `status = "DECEASED"`. Because M6/M7 enrollment and valuation routes require `animal.status === "ACTIVE"`, a deceased animal can never secure new valuations, loan quotes, loans, or insurance policies, while all historical records, policies, and debt remain preserved.
4. **Atomic debt-first settlement & concurrency safety (`PAL-INS-07`, `PAL-INS-08`, `PAL-LOAN-09`)**:
   - `POST /claims/:id/settlements` (`WALLET` immediate settlement or `SANDBOX_SIMULATOR` / `MOBILE_MONEY_PENDING` pending `CLAIM_PAYOUT` intent settled via HMAC-SHA256 webhook) acquires the animal advisory lock (`lockAnimal`), locks the claim row (`FOR UPDATE`), and locks any `ACTIVE` loan on that animal (`FOR UPDATE`) in the same global lock order as `createRepaymentIntent`.
   - `allocateClaimSettlement(approvedAmountMinor, currentDebtMinor)` in `backend/src/finance/lending-math.ts` computes:
     - `debtPayoffMinor = min(approvedAmountMinor, currentDebtMinor)`
     - `farmerRemainderMinor = approvedAmountMinor - debtPayoffMinor`
   - Posts one balanced multi-leg `CLAIM_SETTLEMENT` `LedgerTransaction` (DEBIT `INSURER_POOL` for `approvedAmountMinor`; CREDIT `BANK_POOL` for `debtPayoffMinor` if `> 0`; CREDIT `USER_WALLET` for `farmerRemainderMinor` if `> 0`), allocates `debtPayoffMinor` FIFO across open loan installments (`applyLoanRepaymentSettlement`, releasing collateral if the loan reaches `PAID`), persists an immutable `ClaimSettlementAllocation`, and transitions the claim to `SETTLED` and policy to `CLAIMED`.

## API contract (`/api/v1`)

| Method / path | Scope / headers | Purpose |
|---|---|---|
| `POST /policies` | Animal owner + `Idempotency-Key` | Apply for `ins-sandbox-v1` policy (`SUBMITTED`) |
| `GET /policies`, `GET /policies/:id` | Owner or `INSURER_STAFF` | Scoped policy list and detail |
| `POST /policies/:id/decision` | Insurer `INSURER_STAFF` + `If-Match` + `Idempotency-Key` | `approve` → `APPROVED_AWAITING_PREMIUM`; `reject` → `REJECTED` |
| `POST /policies/:id/premium-intents` | Owner + `If-Match` + `Idempotency-Key` | `WALLET` activates policy immediately; provider returns pending `POLICY_PREMIUM` intent |
| `POST /policies/:id/renewals` | Owner + `Idempotency-Key` | Renews an `EXPIRED` policy into a new versioned `SUBMITTED` policy |
| `POST /claims` | Policy owner + `Idempotency-Key` | Submits `DEATH` claim with `READY` `evidenceFileIds[]` during active coverage window |
| `GET /claims`, `GET /claims/:id` | Owner, `INSURER_STAFF`, or referred `VET` | Scoped claims, evidence links, reviews, and settlement allocation |
| `POST /claims/:id/review-requests` | `INSURER_STAFF` + `If-Match` + `Idempotency-Key` | Records advisory coverage/evidence check (`UNDER_REVIEW`) |
| `POST /claims/:id/referrals` | `INSURER_STAFF` + `If-Match` + `Idempotency-Key` | Grants time-limited `ClaimReferralGrant` to a verified `VET` (`REFERRED_TO_VET`) |
| `POST /claims/:id/opinions` | Referred verified `VET` + `If-Match` + `Idempotency-Key` | Appends signed `VET_OPINION` (`VET_REVIEWED`) |
| `POST /claims/:id/decision` | Maker/checker `INSURER_STAFF` + `If-Match` + `Idempotency-Key` | Approves (`APPROVED` + marks animal `DECEASED`) or rejects (`REJECTED`) |
| `POST /claims/:id/settlements` | `INSURER_STAFF` + `If-Match` + `Idempotency-Key` | Executes or initiates debt-first claim settlement (`CLAIM_PAYOUT`) |
| `GET /loans/:id/settlements` | Borrower, loan `BANK_STAFF`, or linked `INSURER_STAFF` | Lists debt-first `ClaimSettlementAllocation` records applied to a loan |
