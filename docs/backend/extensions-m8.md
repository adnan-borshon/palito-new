# M8 extensions implementation (M8a–M8e)

M8 delivers the five remaining functional scope tracks (`20261115000900_extensions_iot_ai_commerce_content`, `backend/src/extensions/`) gated behind explicit opt-in `EXTENSIONS_SANDBOX_ENABLED=true` (`503 Service Unavailable` when false; strictly forbidden in `NODE_ENV=production`).

## Delivered M8 submilestones

### M8a — Telemetry, Devices & Reviewed Alerts
- `POST /devices/provision` (`ADMIN`): provisions a device record with random SHA-256 hashed provisioning secret (returned once).
- `POST /animals/:id/device-bindings`: requires animal owner + matching provisioning secret (`403` on mismatch), enforces `one_active_binding_per_device` and `one_active_binding_per_animal` partial unique indexes, and increments `sessionEpoch` across device transfers.
- `DELETE /device-bindings/:id`: unbinds active device cleanly (`UNBOUND`) with audit log.
- `POST /devices/:id/telemetry`: `@Public()` route authenticated exclusively via `X-Palito-Device-Secret`, verifying active owner match, exact `sessionEpoch`, strictly monotonic `sequenceNumber` (anti-replay), and bounded `validateTelemetryWindow` (`+5m` future skew, `24h` max age). Evaluates sandbox rules (`evaluateTelemetryRules`: high temperature `>= 39.5°C` → `CRITICAL`, battery `<= 15%` → `WARNING`), generates `device_alerts`, and enqueues `DEVICE_ALERT_RAISED`. `OutboxWorkerService.sweepAlerts` escalates unacknowledged alerts after 4 hours (`ALERT_ESCALATED_4H`).
- `GET /animals/:id/telemetry` & `GET /farms/:id/summary`: owner/consented-vet telemetry projection reporting 7-day sample counts, `missingSampleRatio`, and `stale` flags, plus live farm animal/binding/alert counts. `GET /alerts`, `/alerts/:id`, `POST /alerts/:id/acknowledgement`.

### M8b — Bounded AI Support
- `POST /ai/requests`, `GET /ai/requests`: requires active animal ownership, enforces `VOICE` explicit `transcriptConfirmed=true` and `PHOTO` `READY` owned `private_files` verification, enforces 20/day budget, sanitizes prompts against hostile instruction-override / autonomous-prescribing / financial-approval patterns (`sanitizeAiPrompt`), tracks `promptVersion` (`ai-sandbox-v1`) and `modelId`, handles simulated provider outage (`PROVIDER_OUTAGE_FALLBACK`), and always sets `suggestVetHandoff=true` with explicit clinical uncertainty notice.

### M8c — Call Tokens & Emergency Triage
- `POST /consultations/:id/call-token`: issues short-lived (`15m`) sandbox room tokens **only** to the appointment's `farmerId` or `vetId` when appointment status is `ACCEPTED`/`IN_PROGRESS` and an active non-revoked `CareGrant` exists within `endsAt + 72h` (`404` otherwise).
- `POST /emergency-requests`, `GET /emergency-requests`: records symptoms/linked alert and derives honest real-time `coverageStatus` (`VERIFIED_VET_COVERAGE_AVAILABLE` vs `NO_IMMEDIATE_COVERAGE_FALLBACK`) from active verified vets' open `VetSlot` rows that start within the next 15 minutes. This is the sandbox triage window.

### M8d — Prescription-Checked Commerce & Fulfillment
- `POST /admin/products`, `GET /products`, `GET /products/:id`: versioned BDT minor-unit product catalog.
- `GET /me/cart`, `PUT /me/cart/items/:productId`: regulated `MEDICINE` items require a signed prescription belonging to the farmer's animal containing the matching `matchedMedicineName`, and enforce cumulative dispensing caps (`maxPerPrescriptionQty`).
- `POST /orders`, `GET /orders`, `GET /orders/:id`, `POST /orders/:id/cancellation`, `POST /orders/:id/fulfillment-events`: locks `products` rows `FOR UPDATE`, reserves stock atomically, settles via sandbox `WALLET` (`ORDER_PAYMENT` balanced transaction) or `SANDBOX_SIMULATOR` HMAC webhook, allows farmer cancellation prior to shipment with automatic stock restoration & `ORDER_REFUND` ledger credit, and blocks farmers (`403`) from advancing fulfillment (`PACKED -> SHIPPED -> DELIVERED`, `ADMIN` only).

### M8e — Administration, Published Content, Reports & Exports
- `GET /admin/users` (`ADMIN` only), alongside M3 staff controller protection blocking self-suspension and suspending the last active `ADMIN` (`403`).
- `POST /content`, `PATCH /content/:id`, `POST /content/:id/publication`, `GET /content`, `GET /content/:id`: non-admins only ever read `PUBLISHED` entries (`404` on `DRAFT`).
- `GET /admin/reports`, `POST /admin/exports`, `GET /admin/exports/:id/download`: safe system aggregates and audited SHA-256-verified expiring exports (`24h` expiry).
