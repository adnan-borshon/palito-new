# Proposed API contract

M0 design; no routes or DTOs implemented. Prefix `/api/v1`. Methods below complement all command mappings in [command inventory](command-inventory.md) and requirement reads in [traceability](requirements-traceability.md). Exact provider DTOs and financial product fields remain gated by [decisions](decisions.md) before their implementation milestone.

## Common rules

- Allowlist DTO fields and reject unknown fields; never accept a client role/owner/org as authority. A referenced farm/organization is checked against server memberships.
- Path IDs are UUIDs. Lists use opaque `cursor`, `limit` default 25/max 100, allowlisted filters, stable `(createdAt,id)` sort and `{items,nextCursor}`. Scope before filtering/counting/pagination.
- Successful resource responses expose only approved fields. Errors use `{error:{code,message,requestId,details?}}`; safe field validation only, no SQL/provider/stack/token disclosure. UI localizes stable codes into Bangla/English.
- Codes/status: `VALIDATION` 400; `UNAUTHENTICATED` 401; `FORBIDDEN` 403; `NOT_FOUND` 404 (use consistently for inaccessible object IDs); `CONFLICT`/`VERSION_CONFLICT`/`IDEMPOTENCY_MISMATCH` 409; `RATE_LIMITED` 429; `DEPENDENCY_UNAVAILABLE` 503. Unexpected faults use safe 500 + correlation ID.
- Every protected request rechecks account/membership. Privileged/sensitive operations require verified MFA and recent auth. Cookies require CSRF and origin validation for unsafe methods. Mobile uses `Authorization: Bearer <Firebase ID token>`.
- Versioned mutable resources expose integer `version` and require `If-Match` on PATCH/state transitions. Reject stale writes with 409; policy/valuation/clinical immutable versions cannot be overwritten.
- Domain creation/state-change commands use `Idempotency-Key` (session exchange/logout follow separate CSRF and identity lifecycle semantics); financial mutations require a durable client intent and key across retries/restarts. Bind stored result to actor, operation and canonical payload in the transaction; same key/different payload -> 409. Define retention against provider retry/reconciliation horizon before M6; never expire a pending financial intent simply on a short TTL.
- Money is `{currency:"BDT",amountMinor:"12345"}`. Date-only births, UTC event instants and Asia/Dhaka display follow architecture. Server generates IDs, financial state, timestamps and actor fields.

## Identity and first healthcare workflow DTOs

`text(n)` below means trimmed nonempty text with maximum length n, validated at runtime. Proposed caps should be reviewed when implementing M1/M4. Request body maximum is 256 KiB for ordinary JSON; file bytes use the separate limited upload path. No blanket whole-state payload.

| Method / path | Request fields (allowlist) | Response / authorization |
|---|---|---|
| POST /sessions | `idToken`, CSRF token/header; no role or UID field | Web only; verify expected Firebase project, recent auth <=5min and origin; issue Secure/HttpOnly/SameSite cookie, return minimal principal; clear browser Firebase auth persistence |
| DELETE /sessions/current | CSRF header for web; explicit current-session semantics | Clear/revoke current session; logout-all is separate recent-auth action; mobile SDK signs out and clears private cache |
| GET /me | None | Palito ID, allowed profile, account status, approved capabilities and onboarding progress; never all users |
| GET /me/memberships | Bounded pagination | Active approved membership contexts only; changing UI context grants nothing |
| PATCH /me | `name:text(120)`, `district:text(120)` | Self allowlist; no status/role/verification change |
| PATCH /me/preferences | `locale:"bn"\|"en"` | Self; client may keep anonymous locale without a server account |
| PATCH /me/notification-preferences | Allowed channel booleans and explicit consent version | Self; product-defined urgent operational messages handled separately |
| POST /farms | `name:text(120)`, `district:text(120)`, `address:text(500)`, `size` nonnegative exact bounded number | Create farm/membership for principal; unit documented; return ID/version |
| PATCH /farms/:id | Same editable fields, `If-Match` | F; cannot change ownership by body field |
| POST /animals | `farmId`, `name:text(120)`, allowed `species`, `breed:text(120)`, allowed `sex`, `birthDate`, positive bounded `weightKg`, optional `tag:text(80)`, `estimate:Money`, optional authorized `photoFileId` | F; unique stable identity; estimate distinct from verified value; no healthScore/status/approvedValue accepted |
| PATCH /animals/:id | Same editable attributes except farm transfer, `If-Match` | F; identity/ownership/clinical/encumbrance fields immutable through generic edit |
| POST /animals/:id/archive | `reason:text(1000)`, `If-Match` | F; dependent record checks and audit; no hard deletion of history |
| GET /animals/:id/passport | Authorized scope; no `includeAll` | F/V clinical projections; B approved collateral summary; I permitted coverage evidence; unapproved disclosure fields absent |
| POST /animals/:id/observations | Allowed observation kind, `title:{bn,en}`, `note:text(4000)`, optional future `nextDueAt`, authorized `fileIds[]` | F labels farmer observation; cannot impersonate prescriber/sign clinical entries |
| PUT /vets/me/availability | Bounded slot/time-zone rules with explicit UTC instants and `If-Match` | Verified vet self; reject overlaps and keep booked slots protected |
| POST /appointments | `animalId`, `vetId`, `scheduledAt`, `mode:"video"\|"visit"`, `reason:text(2000)`, optional `alertId` | F animal ownership; server validates slot, alert/priority and cost policy; do not trust client `priority`/price |
| POST /appointments/:id/decision | `decision:"accept"\|"reject"`, `note:text(1000)` required for reject, `If-Match` | Assigned V; check status, membership, slot and credential |
| POST /appointments/:id/cancellation | `reason:text(1000)`, `If-Match` | F/assigned V under agreed cancellation policy; transaction releases slot and emits event |
| POST /appointments/:id/reschedule | `scheduledAt`, `If-Match` | Eligible F/assigned V; atomically release old/reserve new slot; never reschedule completed consultation |
| POST /appointments/:id/consultations | `If-Match` | Assigned verified V; start only accepted appointment; return consultation ID |
| POST /consultations/:id/completion | `diagnosis:text(4000)`, `advice:text(4000)`, bounded `medicines[]:{medicineId?,name,dose,frequency,days}`, `If-Match` | V signs; validate prescription items/duration; atomic history+prescription+reminder intent+audit+outbox |
| POST /records/:id/amendments | `reason:text(1000)`, corrected allowlisted clinical content, reference version | Authorized author/clinical reviewer under policy; preserve original signed version |
| PATCH /reminders/:id | `enabled:boolean`, `If-Match` | F; per-animal/per-recipient ownership |
| POST /reminders/:id/adherence-events | `localDate`, `status:"taken"\|"skipped"` | F; unique reminder/date/status policy; records observation, not provider prescription |
| POST /notifications/read | Bounded `ids[]` or `readBefore` cutoff; no recipient ID | Scope to current recipient, including bulk mutation |
| POST /files/uploads | `purpose`, `contentType`, bounded `sizeBytes`, `recordType`, `recordId` | Check record permission; return upload ID and expiring private upload grant; no public bucket |
| POST /files/:id/completion | Uploaded hash/metadata to verify, not trusted client `verified:true` | Quarantine until server content/size/type checks; reject purpose/owner mismatch |
| GET /files/:id/download | None | Reauthorize current record relationship; short-lived URL or stream; no permission inherited from guessing file ID |

## Read projections and planned extension methods

| Family | Proposed reads / bounded actions | First delivery |
|---|---|---|
| Livestock | GET /farms, /farms/:id/summary, /animals, /animals/:id, /animals/:id/records, /animals/:id/files | M4 |
| Care | GET /vets, /vets/:id, /vets/:id/slots, /appointments, /appointments/:id, /consultations/:id, /prescriptions, /prescriptions/:id, /reminders | M4/5 |
| Inbox/content | GET /notifications, /content (published only), /content/:id | M5/M8e |
| Lending/money | GET /loans, /loans/:id, /loans/:id/installments, /animals/:id/collateral-eligibility, /me/wallet, /payments, /payments/:id; POST /valuations, /loans; methods in command inventory | M6; accepted rate/terms/rounding DTOs require B08–10 |
| Insurance | GET /policies, /policies/:id, /claims, /claims/:id; renewal, referral, opinion, decision and settlement methods in command inventory | M7; coverage/incident/appeal DTOs require B11 |
| Telemetry | GET /animals/:id/telemetry, /alerts, /alerts/:id; device binding methods; POST /devices/:id/telemetry for independent device principal | M8a; session/sequence/observedAt/unit DTO requires B15 |
| AI/emergency/calls | POST /ai/requests, /emergency-requests, /consultations/:id/call-token | M8b/c; authorized animal/file inputs and participant/provider contracts |
| Commerce | GET /products, /products/:id, /me/cart, /orders, /orders/:id; cart/order/fulfillment methods in command inventory | M8d; server price, stock, dispensing/refund and provider policy |
| Admin | GET /admin/users, /admin/system-health, /admin/audit-events, /admin/reports; POST /admin/exports, /admin/users/:id/status-decisions, /organizations/:id/invitations, /organizations/:id/membership-decisions; POST/PATCH /content, POST publication | M3/M8e; explicit capability, scoped audit/export |
| Providers | POST /provider-webhooks/:provider | M6 onward; signature and amount/currency/recipient validation, event deduplication; no user session substitutes for provider trust |

Any method not listed remains denied until its feature contract is reviewed. No generic `/commands` endpoint and no global role overwrite route.
