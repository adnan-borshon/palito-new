# Palito mobile requirements matrix

Updated 2026-11-14. Source: `docs/srs.pdf`, **physical PDF page numbers** (49 pages), and the approved user plan. SRS defines three detailed use cases: UC-001 intervention, UC-002 insurance claim, UC-003 livestock loan. A contents reference to UC-004 has no corresponding defined use case and is not invented here.

**All application implementation and verification entries below start Pending.** Source analysis and downloaded assets do not demonstrate working behavior. Update a row only with code location and dated test evidence. Web coverage is reserved but blocked by PAL-GATE-01.

Figma identifiers below abbreviate the shared prefix `24466:`; “New” means no supplied eligible mobile frame. Full source mapping is in screen-inventory.md. “Plan” denotes a requirement added explicitly by the approved plan, not a claim that it appears verbatim in the SRS.

| ID | SRS PDF page / source | Role | Canonical screen | Figma node suffix | Behavior / acceptance check | Mock dependency | Implementation | Verification |
|---|---|---|---|---|---|---|---|---|
| PAL-ACC-01 | 42,48 | All | Onboarding / language | 64177 | Bangla initial locale; switch and persist English; welcome leads to phone entry. | Locale storage | Pending | Pending |
| PAL-ACC-02 | 42,48 | All | Phone / OTP | 64443,64513,64526 | Validate local phone; send demo OTP; verify invalid/expired code and resend; label simulation. | Auth repository | Pending | Pending |
| PAL-ACC-03 | 28–29; plan | All | Demo accounts / role home | New | Switch among five roles; role-specific routes and permitted actions; shared record IDs preserved. | Account repository | Pending | Pending |
| PAL-ACC-04 | 42 | Farmer | Farm setup / first animal | 64655; New | Capture farm name/location and first animal; required fields persist; resume incomplete onboarding. | Farm repository | Pending | Pending |
| PAL-ACC-05 | 42; plan | All | Profile / settings | New | Edit profile, language, preferences; logout returns to access flow; no real identity claim. | Profile repository | Pending | Pending |
| PAL-ACC-06 | 23; plan | All | Scenario controls | New | Reset with confirmation, seed scenarios, persisted restore, corrupted-data fallback, offline toggle. | Versioned storage | Pending | Pending |
| PAL-FARM-01 | 29,36,43 | Farmer | Home | 64665 | Show herd totals, health counts, device status, critical alert, key shortcuts and notifications from current data. | Animals / alerts | Pending | Pending |
| PAL-FARM-02 | 29,36,43 | Farmer | Animal list / add / edit | 65234; New | Register/edit livestock species, breed, age, weight, identity/photo; validate fields and duplicate ID. | Animals | Pending | Pending |
| PAL-FARM-03 | 7–9,36,47 | Farmer,Vet | Animal passport | 65234,65272,65350,65388 | Stable animal identity links health, device, vaccination, ownership and financial encumbrance. | Passport records | Pending | Pending |
| PAL-FARM-04 | 7–9,47 | Farmer,Vet | Health history / gallery | 65350; New | Chronological visits, diagnoses, treatment and vaccination history; evidence/photo demo gallery. | Health records | Pending | Pending |
| PAL-FARM-05 | 7–9,29,30 | Farmer | Connect device / status | 65272; New | Pair demo device; show linked animal, battery, connection and last sync; prevent duplicate pairing. | IoT mock | Pending | Pending |
| PAL-FARM-06 | 7–9,30,47 | Farmer,Vet | Vitals / trends | 65272 | Show units, observed time, temperature, activity/rumination and seven-day trends; stale data labeled. | IoT samples | Pending | Pending |
| PAL-FARM-07 | 30–31 | Farmer,Vet | Disconnected device | New | Data-loss/low-battery warning offers device check/reminder; do not imply live healthy data. | IoT offline scenario | Pending | Pending |
| PAL-HEALTH-01 | 30–31 UC-001 | Farmer | Alert detail / priority booking | 64665,68578 | Device anomaly creates AI urgency assessment and actionable notification linked to same animal. | Alerts / demo clock | Pending | Pending |
| PAL-HEALTH-02 | 30–31 UC-001 | Farmer,Vet | Priority booking / vet queue | 68596,68642; New | Accept alert, allocate available vet, share seven-day trends and persist a single priority appointment. | Appointments | Pending | Pending |
| PAL-HEALTH-03 | 31 UC-001 | Vet,Farmer | Escalation queue / notification | New | Ignored alert after four demo hours escalates once; visible to vet and farmer. | Demo clock / alerts | Pending | Pending |
| PAL-HEALTH-04 | 31,42,48 | Farmer,Vet | Emergency request / dispatch | 68578,68596,68642 | One-tap emergency entry, critical triage, simulated dispatch and linked emergency medical-loan option. | Emergency mock | Pending | Pending |
| PAL-HEALTH-05 | 30–31 UC-001 | Vet,Farmer,Insurer | Completed intervention | 69320,69343; New | Consultation creates prescription and health record; farmer and insurer receive prevention notification. | Atomic workflow | Pending | Pending |
| PAL-AI-01 | 7–9,29,35 | Farmer | AI symptoms / chat | 69581,69592,69608 | Select animal, enter livestock symptoms; deterministic guidance and escalation, clearly demonstrated. | AI scenario repository | Pending | Pending |
| PAL-AI-02 | 7–9,23,49 | Farmer | Voice assistance | 69618,69641,69665 | Demonstrate start/stop/review/transcript; Bangla/English copy; no real voice processing claim. | Voice mock | Pending | Pending |
| PAL-AI-03 | 7–9,29 | Farmer | Photo analysis | 69600 | Select sample livestock photo/evidence; show analyzing/error/result states; remove human psoriasis content. | Photo / AI mock | Pending | Pending |
| PAL-CARE-01 | 29,44 | Farmer | Vet discovery / categories | 68193,68386,66590 | Search/filter available vets, species, specialty/location; empty/no-availability recovery. | Vets repository | Pending | Pending |
| PAL-CARE-02 | 44 | Farmer | Vet profile | 67229 | Read qualifications, fees, reviews, availability; correct template timezone/medical copy. | Vet profiles | Pending | Pending |
| PAL-CARE-03 | 29,44 | Farmer,Vet | Book / schedule | 67941,68075 | Choose animal, concern, date/time, video or physical; validate availability and duplicate submissions. | Appointments | Pending | Pending |
| PAL-CARE-04 | 29,38,44 | Vet,Farmer | Appointment decision | 67989; New | Vet confirms/rejects with reason; farmer sees same decision and new availability. | Appointments | Pending | Pending |
| PAL-CARE-05 | 44 | Farmer,Vet | Appointment list / reschedule / cancel | 67989,69297,69472 | Upcoming/past lists; reschedule eligible appointments; cancel with confirmation and consistent status. | Appointments | Pending | Pending |
| PAL-CARE-06 | 29,38,44 | Farmer,Vet | Payment / receipt | 68123,68158,69448,69460 | Review booking cost and mock method; single simulated payment receipt; failure/retry idempotent. | Wallet ledger | Pending | Pending |
| PAL-CARE-07 | 29–31,44 | Vet,Farmer | Consultation / call | 69320,69343 | Simulated call state, patient context, mute/end controls; reconnect/unavailable states. | Consultation mock | Pending | Pending |
| PAL-CARE-08 | 29–31,38 | Vet | Clinical record / prescription | New | Review history/trends, enter diagnosis/treatment and prescription, validate before publishing. | Health records | Pending | Pending |
| PAL-CARE-09 | 7–9,44 | Farmer | Prescription archive / reminders | 64665; New | View prescribed medicines, schedule reminder, mark taken/skipped; vaccination/deworming reminders. | Medication repository | Pending | Pending |
| PAL-CARE-10 | 28,38; plan | Vet | Schedule / emergency / profile | New | Manage available slots, prioritize escalations, view patients and update profile. | Vet schedule | Pending | Pending |
| PAL-SHOP-01 | 7–9,35,43 | Farmer | Medicine / feed catalog | New | Browse/search medicine/feed demo products, detail, quantity and availability. | Mock catalog | Pending | Pending |
| PAL-SHOP-02 | 25–26,35 | Farmer | Cart / checkout / order detail | New | Validate quantity/address; confirm simulated order/payment and receipt; duplicate prevention. | Orders / wallet | Pending | Pending |
| PAL-SHOP-03 | 25–26,35 | Farmer | Delivery tracking | New | Visible order state and mocked delivery events; unavailable/failure/cancel recovery. | Delivery mock | Pending | Pending |
| PAL-INS-01 | 29,31–32,38,45 | Farmer,Insurer | Insurance overview / enrollment | 64935,65575 | Select eligible animal, coverage, evidence, consent; review fees; submit once and track application. | Policies / applications | Pending | Pending |
| PAL-INS-02 | 29,38 | Insurer | Application review / policy issue | New | Review health passport/evidence; approve or reject with reason; issue active policy on approval. | Policies | Pending | Pending |
| PAL-INS-03 | 31–32 UC-002 | Farmer | Death report / claim form | 65726,65748 | Active eligible policy required; select animal, incident, deceased-animal sample evidence with demo GPS/time. | Claims / attachments | Pending | Pending |
| PAL-INS-04 | 31–32 UC-002 | Insurer | Evidence / automatic review | New | Demonstrate last 48h IoT, condition disclosure, weather/disaster checks; explain outcome. | Evidence scenario | Pending | Pending |
| PAL-INS-05 | 32 UC-002 | Insurer,Vet | Complex claim referral / review | 65783; New | Refer complex case to vet; vet records assessment; simulated seven-day target and status visible. | Claims / vet tasks | Pending | Pending |
| PAL-INS-06 | 31–32 UC-002 | Insurer,Farmer | Claim approval / rejection | 69559; New | Accept/reject with reason and evidence; invalid transitions blocked; notify farmer. | Claims | Pending | Pending |
| PAL-INS-07 | 31–32 UC-002 | Insurer,Farmer | Payout / wallet receipt | 66445,69559 | Simulate bKash/Nagad payout; display target 48h as demo; transaction and animal death state persist. | Ledger / claims | Pending | Pending |
| PAL-INS-08 | 32 UC-002 | Insurer,Bank,Farmer | Secured claim settlement | New | Route payout to outstanding secured debt first; remainder farmer; update loan/passport/ledger once. | Atomic settlement | Pending | Pending |
| PAL-INS-09 | 38; plan | Insurer | Policy management / notifications | New | View policies and claim queues; filter/status/detail and linked notifications. | Policies / inbox | Pending | Pending |
| PAL-LOAN-01 | 33–34 UC-003,45 | Farmer | Loan overview / collateral | 65067,65462 | Show existing loans, eligible unencumbered animal and record; avoid duplicate collateral. | Loans / animals | Pending | Pending |
| PAL-LOAN-02 | 33–34 UC-003 | Farmer,Bank | Valuation / offer | 66465 | Verified breed/age/weight/health valuation; principal <=70% value, health changes risk/offer. | Loan calculator | Pending | Pending |
| PAL-LOAN-03 | 33–34 UC-003 | Farmer,Bank | Terms / application | 66465; New | Accept disclosed demo rate/repayment terms, repayment source and passport; submit once. | Loan applications | Pending | Pending |
| PAL-LOAN-04 | 29,33–34,38 | Bank | Borrower / collateral review | New | Review borrower, health passport, valuation and existing security; verify cap before decision. | Shared loan record | Pending | Pending |
| PAL-LOAN-05 | 29,33–34,38 | Bank,Farmer | Approval / rejection | 69534; New | Decision reason and timestamp; eligibility rechecked; stage Applied/Verified/Approved visible. | Loan transition rules | Pending | Pending |
| PAL-LOAN-06 | 33–34 UC-003 | Bank,Farmer | Simulated disbursement | 69534 | Simulated 24h target, one ledger entry, active loan and secured passport flag. | Loans / ledger | Pending | Pending |
| PAL-LOAN-07 | 33–34,38,45 | Bank,Farmer | Repayment / active loan | 69514; New | Amount and balance validation, schedule, partial/full demo repayment, receipt and credit update. | Loan repayment | Pending | Pending |
| PAL-LOAN-08 | 34 UC-003 | Bank,Farmer | Grace period | New | Milk-production drop notifies bank; review/grant grace period; updated due date visible. | Risk scenario / schedule | Pending | Pending |
| PAL-LOAN-09 | 32–34 | Bank,Insurer,Farmer | Collateral settlement | New | Claim settlement reduces/retires debt, prevents negative balance and releases collateral as applicable. | Settlement repository | Pending | Pending |
| PAL-WAL-01 | 29,38,45 | Farmer | Wallet / transactions | 64935,65067 | Balance and receipts derive from mock ledger; linked insurance/loan actions and status. | Ledger | Pending | Pending |
| PAL-WAL-02 | 38; plan | All | Financial action state | New | Confirm amounts; failure/retry never duplicate payments, payouts, disbursements or repayments. | Idempotent operations | Pending | Pending |
| PAL-NOT-01 | 29–35,38,43 | All | Inbox / empty / detail | 69366,69379 | Role-targeted events, unread/read and linked record; cross-role state consistency. | Notifications | Pending | Pending |
| PAL-ADM-01 | 29,38 | Admin | Users / access | New | List/filter demo accounts, inspect roles, enable/disable with confirmation; permission feedback. | User repository | Pending | Pending |
| PAL-ADM-02 | 34,38; plan | Admin | Educational content | New | Create/edit/publish demo livestock educational articles; farmer sees published content only. | Content repository | Pending | Pending |
| PAL-ADM-03 | 29,34,38 | Admin | System health / activity | New | Simulated service/device health, audit events and relevant details; no production telemetry claim. | System scenario / log | Pending | Pending |
| PAL-ADM-04 | 34,38 | Admin | Reports | New | Filter health, appointment, loan/claim aggregates; explain sample data and empty results. | Derived reports | Pending | Pending |
| PAL-QA-01 | 23,40–41; plan | All | Every screen | All eligible | Bangla/English complete; local formatting; high contrast, text scaling, labels and touch targets. | Localization | Pending | Pending |
| PAL-QA-02 | 23; plan | All | Every workflow | New states | Loading/empty/error/confirmation/success, offline/unavailable, form validation and retry. | Scenario controls | Pending | Pending |
| PAL-QA-03 | plan | All | Navigation / forms | All eligible | Safe areas, keyboard, scrolling, back navigation, repeated presses and deep-link recovery. | Native navigation | Pending | Pending |
| PAL-QA-04 | plan | All | Persistence / reset | New | Restore same versioned records across sessions/accounts; reset deterministic seed; handle malformed storage. | Storage adapter | Pending | Pending |
| PAL-QA-05 | plan | All | Review handoff | Not applicable | Run TS/lint/Doctor/dependency/bundle/shared/component/journey checks; native gaps explicitly unverified. | Test harness | Pending | Pending |
| PAL-GATE-01 | approved plan | All | Mobile review | Not applicable | Provide runnable preview/results/coverage, wait for explicit approval before any web implementation. | Human review gate | Pending | Pending |

## Connected acceptance journeys

1. **UC-001:** Seed a disconnected device first and verify stale readings/reminder. Reconnect and inject anomaly. Farmer receives same animal alert; accepting creates one priority appointment. Vet sees seven-day trends, completes consultation and prescription. Farmer passport/history and medicine reminders update; insurer receives prevention event. Repeat with four-hour ignored alert and emergency branch.
2. **UC-002:** Enroll an eligible animal, approve policy as insurer, submit claim evidence as farmer. Exercise automatic decision, complex vet referral, rejection and retry. Approve payout once; confirm animal death record, receipt and notifications. Repeat on loan-secured collateral and assert debt-first settlement plus farmer remainder.
3. **UC-003:** Select eligible animal; demonstrate 70% boundary and rejection above it. Accept terms, review as bank, approve and simulate disbursement. Verify passport security, wallet, repayment source and credit state. Exercise poor-health offer, rejection, duplicate request, partial/full repayments, milk-drop grace period and insurance settlement.

## Test evidence format

Record requirement ID, date, platform, exact command or walkthrough, scenario/record IDs, observed result and artifact path. Distinguish automated pass, manual pass, failing, blocked and unverified. A browser pass cannot mark native behavior verified.

## Source exclusions and reconciliation

Survey charts and competitive accuracy/approval claims on pp.10–22 inform context, not achieved product claims. Pharmacy/delivery, government, identity providers, AI/IoT and financial gateways remain simulated external dependencies. The SRS's old typography/palette and Figma email/password or human-health template copy are reconciled in decisions.md. No bank/insurer/admin scope is dropped merely because its Figma mobile screen is absent.

