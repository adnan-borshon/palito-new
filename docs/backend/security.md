> Current M3 update (2026-11-15): Firebase identity/session paths and opt-in `/identity` client screens are implemented. M3 software now includes staff invitation/approval, MFA/recovery, verified contact changes, revocation and native configuration; live-provider/device acceptance remains separate. Read [identity checkpoint](identity.md) for exact endpoints, setup, actual tests and provider/device release gates and completed staff/recovery implementation. Earlier milestone descriptions below remain historical or proposed unless superseded there.

# Security design and permissions

M0 threat model plus M1 foundation controls. M1 implements tested default-deny authentication boundary, configuration guards, safe errors/logging, body/DTO limits, exact CORS, security headers and per-instance rate limiting. The disabled verifier authenticates nobody. M2 additionally enforces database role separation, core FK/check/exclusion constraints and signed/approved history protections; application database credentials cannot migrate. Resource permissions below remain planned for later milestones; no security audit or production identity/authorization implementation is complete.

Every permission requires a verified Firebase identity, active Palito account and current relevant membership/grant. `F` = farm-owned/authorized, `V` = verified assigned vet with time-limited care/referral grant, `B`/`I` = own bank/insurer organization and assigned case, `A` = explicit audited support capability. All other access is denied. Admin has no general clinical/financial rewrite permission.

| Action / resource | Farmer | Vet | Bank staff | Insurer staff | Admin / service |
|---|---|---|---|---|---|
| Farm/animal identity, list/search | F read/write nonclinical fields | V minimum identity | B collateral projection | I policy/claim projection | A support projection |
| Passport/clinical history/file | F read own; observations only | V read/sign/amend own clinical entries | B approved risk summary only | I necessary coverage/claim evidence | A audited minimum; no unrestricted edit |
| Availability/appointment | F book/cancel/reschedule own | Own schedule + assigned visits/decisions | Deny | Deny | A operational support; conflict checks remain |
| Prescription/reminder | F read and adherence events | V sign; author amendments | Deny | I only explicitly approved evidence | Worker schedules authorized deliveries |
| Estimate/verified valuation | F estimate; read permitted approved value | Assess only with explicit valuation grant | B approve/version under bank policy | I permitted insured-value read | No silent override of approved value |
| Quote/loan/disburse/grace | F own quote/apply/accept | Deny | B case decision; policy step-up | Linked settlement projection only | A reconcile; no public approval bypass |
| Repayment/payment intent | F own authorized intent | Deny | B reconcile case; cannot act as farmer | Linked settlement only | Authenticated provider callback/service posts confirmed transfer |
| Policy/claim/review/payout | F own apply/submit/read | Referred clinical opinion, no payout | Linked debt allocation only | I review/approve under separation policy | Authorized settlement worker; A audited exception |
| Upload/download | Authorized linked purpose and record | V linked clinical/referral | B minimum evidence | I claim evidence | Quarantine scanner; every signed link checks current grant |
| Device bind/telemetry/alert | F bind after device proof, acknowledge | V trends and assigned escalations | Approved summary only | Approved claim evidence only | Device principal ingests own stream; worker creates reviewed-rule alerts |
| Orders/fulfillment | F cart/place/eligible cancel | Permitted prescription read only | Deny | Deny | Trusted fulfillment actor advances; provider confirms/refunds |
| Profile/membership/content | Own allowed profile, locale/preferences | Own profile, no self-verification | Scoped invitations only if granted | Scoped invitations only if granted | Explicit user/content capabilities, no self-elevation |
| Inbox/reports/exports | Own inbox/data | Assigned aggregate | B org/case | I org/case | A minimal audited report; scoped export job/download |

Care/claim grant expiry, staff departure, account suspension, consent withdrawal and ownership transfer must revoke access, including cached data and later signed-link requests. Exact clinical retention/disclosure policy is B14; unapproved projections stay denied. Owner IDs in DTOs never select the acting principal.

## Threats, controls and planned evidence

| Threat | Required control | Planned acceptance evidence |
|---|---|---|
| Public demo controls/role tampering | Explicit demo bundle/environment; production fail-closed; server-owned roles | SEC-DEMO: seeded OTP, clock/reset/switch and forged role never reach API privilege |
| BOLA/IDOR, cross-org reads | Scoped queries plus relationship checks on detail/list/search/nested/export/file paths | SEC-SCOPE: farmer A/B, bank A/B, insurer A/B and unassigned vet denial for every enabled route |
| Stale membership/revoked session | Per-request account/membership status; sensitive revocation and recent-auth/MFA check | SEC-AUTH: wrong-project/expired/revoked token, suspended user, stale claim, missing factor, recovery/logout |
| Cookie theft/CSRF/session fixation | In-memory sign-in, recent token exchange, secure cookie, origin + CSRF on unsafe methods | SEC-WEB: cross-origin exchange/mutation, expired cookie, missing CSRF, replay/reauth |
| OTP abuse/enumeration | Firebase app verification, API abuse limits, resend/region/cost controls, generic responses | SEC-OTP: resend/failure bursts; real Bangladesh operator delivery recorded separately |
| Duplicate money/slot/collateral | PostgreSQL constraints, locks/version checks, durable intent/idempotency, ledger/outbox | SEC-RACE: independent DB connections/API processes, timeout-after-commit, repayment/payout race |
| Malicious uploads/privacy leaks | Private storage, allowlisted type/size, actual content checks, quarantine, purpose scope | SEC-FILE: disguised file, cross-account URL, expired/revoked link, metadata deception |
| Callback forgery/reordering | Provider signature, amount/currency/recipient/reference validation and unique event key | SEC-PROVIDER: replay, duplicate, reordered and wrong-amount event cannot post money |
| Telemetry replay/forged evidence | Independent device principal, binding/version, observed/received time, session/sequence | SEC-IOT: stale/future/replayed/foreign device event; jitter and missing-sample coverage |
| AI disclosure/unsafe decisions | Server adapter, minimal authorized context, budgets, uncertainty and vet handoff | SEC-AI: hostile input, provider outage, no clinical signature/financial posting authority |
| Secret/log/export leakage | Redacted structured logs, safe errors, no server keys in client bundle, scoped export | SEC-LOG: OTP/token/phone/clinical details absent; scanner findings triaged |
| Lost jobs/provider ambiguity | Transactional outbox, unique logical deliveries, bounded retry and reconciliation | SEC-RECOVERY: worker crash before/after send, failed job triage, restore rehearsal |

Apply OWASP ASVS/API Security guidance to enabled API scope; guidance is not an installed scanner. Scan only authorized local/staging systems. Retention/deletion/consent policies need approval; amendments/reversals preserve necessary clinical/financial history. Do not declare legal compliance from this design.

## M4–M10 enforced boundaries

See [healthcare](healthcare.md), [ops M5](ops-m5.md), [lending M6](lending-m6.md), [insurance M7](insurance-m7.md), [extensions M8](extensions-m8.md), [QA & security M9](qa-security-m9.md), and [deployment & pilot M10](deployment-pilot-m10.md) for implemented DTOs, consent rules, outbox/ledger/claim/extension invariants, security matrix verification, and deployment preflight controls; [progress](progress.md) records executed checks.
- Care booking defaults off (`HEALTHCARE_NO_CHARGE_PILOT=true` enables BDT 0 pilot only); financial sandbox fails closed (`503`) unless `FINANCE_SANDBOX_ENABLED=true`; M8 extensions fail closed (`503`) unless `EXTENSIONS_SANDBOX_ENABLED=true`. `DEPLOYMENT_TIER=production` rejects all sandbox, emulator, and Swagger flags; `DEPLOYMENT_TIER=staging` requires `HTTPS`, `sslmode=verify-full`, `palito_runtime`, and `AUTH_MODE=firebase`.
- IoT ingestion (`POST /devices/:id/telemetry`) authenticates strictly via `X-Palito-Device-Secret`, `sessionEpoch`, monotonic `sequenceNumber`, owner continuity, and bounded event time (`+5m` / `-24h`).
- AI endpoints enforce explicit voice confirmation (`transcriptConfirmed=true`), prompt sanitization (`sanitizeAiPrompt`), 20/day budget, and zero autonomous clinical/financial authority. Call tokens require consultation participants + active `CareGrant`. Commerce fulfillment transitions deny farmers (`403`) and enforce cumulative prescription limits.
- M9 security matrix (`security-matrix.test.ts`, `extensions.scenario.ts`) exercises `SEC-DEMO`, `SEC-AUTH`, `SEC-INPUT`, `SEC-SCOPE`, `SEC-IOT`, `SEC-AI`, and `SEC-LOG` (including expanded `REDACT_PATHS` in `logger.ts`), and `staff.controller.ts` blocks self-suspension or suspending the last active admin.
- M10 deployment preflight (`deployment-preflight.ts`, `deployment-preflight.test.ts`) rejects `SEED_SYNTHETIC=true` or leaked `DATABASE_ADMIN_URL` in hosted runtime environments, enforces distinct `palito_migrator` vs `palito_runtime` credentials, and verifies immutable `SHA-256` digests for all 9 migrations.
