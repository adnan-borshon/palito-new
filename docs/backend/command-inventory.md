# Demo command migration inventory

Source: all 53 discriminants in `frontend/shared/src/types.ts` at `b31b165bc92f2734776b608aeba241a6b9dd291e`, checked against handlers in `repository.ts`, `health.ts`, `finance.ts`, `support.ts`. Each appears exactly once below. Paths are proposed under `/api/v1`, not implemented. Production API = server-owned state; local preference = stays client-side unless explicitly synced; demo-only = no production route; deferred integration = needs provider/hardware or an approved policy. All migrations are future work.

The old engine's `localCommand`/`publicCommand` flags describe demo offline behavior, not the production classification. In particular notification read, reminders and notification preferences become recipient-scoped persisted API mutations. The complete `DemoState` and generic `execute(DemoCommand)` must never be public production contracts.

| Current command | Classification | Delivery | Target | Actor / changed trust rule |
|---|---|---|---|---|
| `auth.requestOtp` | Deferred integration | M3 | Firebase phone SDK | Public abuse-controlled identity challenge; no server-authored fixed OTP |
| `auth.verifyOtp` | Deferred integration | M3 | Firebase credential verification; POST /sessions for web | Verify provider-issued identity; no local code grants server role |
| `auth.switch` | Demo-only | Demo | No production API | Membership switch selects existing authorized context, never changes identity |
| `auth.logout` | Production API | M3 | DELETE /sessions/current + SDK signOut | Self; revoke session and clear client private caches |
| `session.locale` | Local preference | M3 | Client locale; optional PATCH /me/preferences | Self; unauthenticated locale stays local |
| `session.onboard` | Local preference | M3/M4 | Client progress; persisted onboarding derived from own farm/animal | Cannot assert server verification by flipping client boolean |
| `profile.update` | Production API | M3/M4 | PATCH /me; PUT /vets/me/availability | Self allowlist; specialty/availability cannot approve vet credentials |
| `farm.save` | Production API | M4a | POST /farms or PATCH /farms/:id | F; validated address/size and ownership |
| `animal.add` | Production API | M4a | POST /animals | F; value input becomes estimate, not approved valuation |
| `animal.update` | Production API | M4a | PATCH /animals/:id | F; allowlisted nonclinical fields, optimistic version |
| `animal.archive` | Production API | M4a | POST /animals/:id/archive | F; check active appointments/encumbrances; preserve history |
| `record.add` | Production API | M4c | POST /animals/:id/observations; clinician uses signed record path | F observation only; V clinical entry; separate evidence provenance |
| `device.connect` | Deferred integration | M8a | POST /animals/:id/device-bindings | F + independent device proof; serial alone insufficient |
| `device.disconnect` | Deferred integration | M8a | DELETE /device-bindings/:id | F; audit unbinding, no pretending device is physically off |
| `alert.simulate` | Demo-only | Demo | No production API | Real alerts arise from validated telemetry/reviewed rules |
| `alert.acknowledge` | Production API | M4b/M8a | POST /alerts/:id/acknowledgement | F; state/version checked; M4 only manual authorized alerts |
| `appointment.book` | Production API | M4b | POST /appointments | F; server slot/urgency validation; idempotency and alert ownership |
| `appointment.decide` | Production API | M4b | POST /appointments/:id/decision | Assigned verified V; accept/reject reason and version |
| `appointment.cancel` | Production API | M4b | POST /appointments/:id/cancellation | F/assigned V under cancellation rule; atomically release slot |
| `appointment.reschedule` | Production API | M4b | POST /appointments/:id/reschedule | F/assigned V under policy; competing slots transactional |
| `consultation.start` | Production API | M4c | POST /appointments/:id/consultations | Assigned verified V; accepted appointment prerequisite |
| `consultation.complete` | Production API | M4c | POST /consultations/:id/completion | V; signed diagnosis/advice/items; history/reminder/outbox atomic |
| `reminder.toggle` | Production API | M5 | PATCH /reminders/:id | F own; persist preference even though old engine calls it local |
| `reminder.take` | Production API | M5 | POST /reminders/:id/adherence-events | F own; record date/status, deduplicate; no medical authority |
| `ai.ask` | Deferred integration | M8b | POST /ai/requests | F; add animalId + permitted audio/image references; no automatic prescribing |
| `cart.set` | Production API | M8d | PUT /me/cart/items/:productId | F; draft can be local but server revalidates price/stock/prescription |
| `order.place` | Production API | M8d | POST /orders | F; reserve stock and durable payment intent; no success from client redirect |
| `order.cancel` | Production API | M8d | POST /orders/:id/cancellation | F eligible state; refund separate confirmed intent |
| `order.advance` | Deferred integration | M8d | POST /orders/:id/fulfillment-events | Trusted fulfillment actor only; farmer's demo advance removed from API client |
| `policy.apply` | Production API | M7 | POST /policies | F own eligible animal; versioned terms, real evidence and consent |
| `policy.decide` | Production API | M7 | POST /policies/:id/decision | I case; premium confirmation governs actual coverage activation |
| `policy.renew` | Production API | M7 | POST /policies/:id/renewals | F; new terms/version/period; no overlapping unapproved coverage |
| `claim.submit` | Production API | M7 | POST /claims | F linked policy; replace evidence booleans with reviewed file IDs/incident metadata |
| `claim.autoReview` | Deferred integration | M7/M8a/b | POST /claims/:id/review-requests | I requests advisory review; no autonomous final real-money approval |
| `claim.refer` | Production API | M7 | POST /claims/:id/referrals | I case; creates limited grant for named verified V |
| `claim.vetReview` | Production API | M7 | POST /claims/:id/opinions | Referred V only; signed opinion does not issue payout |
| `claim.decide` | Production API | M7 | POST /claims/:id/decision | I; versioned evidence/reason, separation policy and step-up |
| `claim.pay` | Production API | M7 | POST /claims/:id/settlements | I requests approved settlement; service/provider confirmation posts money |
| `loan.offer` | Production API | M6 | POST /loan-quotes | F; independently approved valuation/terms/expiry; no farmer-controlled risk policy |
| `loan.accept` | Production API | M6 | POST /loans/:id/acceptance | F; accepted quote/terms, live reservation and expiry rechecked |
| `loan.decide` | Production API | M6 | POST /loans/:id/decision | B assigned case; approved value/cap/membership/step-up |
| `loan.disburse` | Production API | M6 | POST /loans/:id/disbursements | B creates intent; verified provider confirms ledger posting |
| `loan.repay` | Production API | M6 | POST /loans/:id/repayment-intents | F own; stable intent/key, confirmed amount/currency and locked allocation |
| `loan.grace` | Production API | M6 | POST /loans/:id/grace-decisions | B; approved policy/evidence, no client-controlled deadline authority |
| `notification.read` | Production API | M5 | POST /notifications/read | Recipient only; bounded explicit IDs or own scoped read-before cutoff |
| `settings.notifications` | Production API | M5 | PATCH /me/notification-preferences | Self; per-user not global demo settings |
| `admin.userStatus` | Production API | M3/M8e | POST /admin/users/:id/status-decisions | A capability; audit and suspension revocation; no accidental last-admin lockout |
| `admin.userRole` | Production API | M3/M8e | POST /organizations/:id/membership-decisions | A/explicit org manager; invitations/approval not direct global role overwrite |
| `content.save` | Production API | M8e | POST /content or PATCH /content/:id; publication command | A publisher; farmer reads published projection only |
| `demo.offline` | Demo-only | Demo | No production API | Local test scenario; actual connectivity is observed |
| `demo.failNext` | Demo-only | Demo | No production API | Isolated fault injection only |
| `demo.advanceTime` | Demo-only | Demo | No production API | Server clock/jobs authoritative; test clock isolated |
| `demo.reset` | Demo-only | Demo | No production API | Never reset real shared data from a client |

Classification totals: Deferred integration: 7, Demo-only: 6, Local preference: 2, Production API: 38.

Read workflows have no demo commands: map dashboard, passports, history/gallery, vet discovery, schedules, queues, wallet/receipts, inbox, content, system health and reports through the read projections in [traceability](requirements-traceability.md) and [API contracts](api-contracts.md). Booking cost/call controls are local UI simulations today; real payment is M6 and participant-limited provider calls M8c. No current command or read screen is silently considered an implemented backend feature.

M4 addition: the real `/care` workspace uses explicit API command DTOs documented in healthcare.md. The original 53 local demo commands and their mappings above remain preserved; no whole DemoState server endpoint or demo-to-live migration was introduced.
