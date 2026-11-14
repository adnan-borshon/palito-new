# Palito mobile screen inventory

Updated 2026-11-14. Eligible source: [ALL SCREENS, node 24466:64175](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-64175). **56 mobile frame variants**, normally 375×812; taller frames are scrolling content. These variants consolidate into canonical flows; count is not 56 unique implemented screens. Three tiny unrelated frames are excluded. Existing Figma web pages are excluded.

| Figma node | Source frame name | Canonical screen/state | Requirement links | Adaptation | Status |
|---|---|---|---|---|---|
| [24466:64177](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-64177) | Splash & Onboarding | Welcome | PAL-ACC-01 | Original mark/orbit and Bangla introduction | Implemented (`auth/welcome.tsx`) |
| [24466:64213](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-64213) | Splash & Onboarding1 | Access | PAL-ACC-02 | Email visual only; replaced with phone/OTP | Implemented (`auth/login.tsx`) |
| [24466:64238](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-64238) | Authentication | Register | PAL-ACC-02 | Remove password fields; keep source form rhythm | Consolidated (`auth/login.tsx`) |
| [24466:64254](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-64254) | Authentication | Access method | PAL-ACC-02 | Simplify to phone and demo accounts | Consolidated (`auth/login.tsx`) |
| [24466:64263](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-64263) | Authentication | Recovery | PAL-ACC-02 | Password reset template; mapped to OTP resend/recovery | Consolidated (`auth/login.tsx`) |
| [24466:64398](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-64398) | Authentication | Recovery sent | PAL-ACC-02 | Mapped to demo code sent confirmation | Consolidated (`auth/login.tsx`) |
| [24466:64443](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-64443) | Profile Setup Account Completion | Phone / profile | PAL-ACC-02,04 | Phone entry and onboarding details | Implemented (`auth/login.tsx`, `common/index.tsx`) |
| [24466:64513](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-64513) | Splash & Onboarding2 | OTP entry | PAL-ACC-02 | Primary OTP layout | Implemented (`auth/login.tsx`) |
| [24466:64526](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-64526) | Splash & Onboarding3 | OTP variant | PAL-ACC-02 | Validation/resend state | Implemented (`auth/login.tsx`) |
| [24466:64539](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-64539) | Splash & Onboarding4 | Identity evidence | PAL-ACC-04 | Optional demo evidence; no real identity verification | Consolidated (`farmer/animals.tsx`) |
| [24466:64655](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-64655) | Splash & Onboarding5 | Farm completion | PAL-ACC-04 | Mapped to farm/first animal setup | Implemented (`farmer/animals.tsx`) |
| [24466:64665](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-64665) | Dashboard Home Farm View | Farmer home | PAL-FARM-01 | Long 2595px source; native sections scroll | Implemented (`farmer/home.tsx`) |
| [24466:64935](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-64935) | Financial Hub Wallet6 | Insurance overview | PAL-INS-01,PAL-WAL-01 | Coverage and premium summary | Implemented (`finance/insurance.tsx`, `finance/loans.tsx`) |
| [24466:65067](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-65067) | Financial Hub Wallet1 | Loan overview | PAL-LOAN-01,PAL-WAL-01 | 1151px source | Implemented (`finance/loans.tsx`) |
| [24466:65234](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-65234) | Animal Profile1 | Animal list/profile | PAL-FARM-02,03 | Canonical animal card | Implemented (`farmer/animals.tsx`, `farmer/components.tsx`) |
| [24466:65272](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-65272) | Animal Profile2 | Health/vitals tab | PAL-FARM-06 | 966px source; livestock units and trends | Implemented (`farmer/animals.tsx`, `farmer/monitoring.tsx`) |
| [24466:65350](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-65350) | Animal Profile3 | Records tab | PAL-FARM-04 | Visits, treatments, vaccinations | Implemented (`farmer/animals.tsx`) |
| [24466:65388](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-65388) | Animal Profile4 | Financial tab | PAL-FARM-03,PAL-LOAN-01 | 1008px; insurance and encumbrance | Implemented (`farmer/animals.tsx`) |
| [24466:65462](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-65462) | Financial Hub Wallet2 | Collateral selection | PAL-LOAN-01 | 1067px; unavailable/selected animals | Implemented (`finance/loans.tsx`) |
| [24466:65575](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-65575) | Financial Hub Wallet7 | Insurance enrollment | PAL-INS-01 | 1047px; animal and vet/evidence selection | Implemented (`finance/insurance.tsx`) |
| [24466:65726](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-65726) | Home Smart Health Metrics | Claim animal selection | PAL-INS-03 | Insured animal selection | Implemented (`finance/insurance.tsx`) |
| [24466:65748](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-65748) | Home Smart Health Metrics | Death claim evidence | PAL-INS-03 | Evidence form; timestamp/GPS demonstration | Implemented (`finance/insurance.tsx`) |
| [24466:65783](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-65783) | Financial Hub Wallet8 | Claim vet dispatch | PAL-INS-05 | Review/dispatch branch | Implemented (`finance/insurance.tsx`, `vet/index.tsx`) |
| [24466:66445](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-66445) | Financial Hub Wallet9 | Insurance success | PAL-INS-07 | Confirmation reconciled with policy/claim state | Implemented (`finance/insurance.tsx`) |
| [24466:66465](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-66465) | Financial Hub Wallet3 | Loan offer | PAL-LOAN-02,03 | 70% maximum and explicit terms | Implemented (`finance/loans.tsx`) |
| [24466:66579](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-66579) | Vet Portal2 | Vet discovery entry | PAL-CARE-01 | Companion discovery variant | Consolidated (`farmer/care.tsx`) |
| [24466:66590](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-66590) | Doctor Consultation2 | Vet listing | PAL-CARE-01 | Search/filter/list | Implemented (`farmer/care.tsx`) |
| [24466:67229](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-67229) | Vet Portal3 | Vet profile | PAL-CARE-02 | Verified heading + booking form | Implemented (`farmer/care.tsx`) |
| [24466:67941](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-67941) | Vet Portal4 | Appointment booking | PAL-CARE-03 | Animal/date/time/channel | Implemented (`farmer/care.tsx`) |
| [24466:67989](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-67989) | Doctor Consultation2 | Appointment list | PAL-CARE-05 | Upcoming/past | Implemented (`farmer/care.tsx`) |
| [24466:68075](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-68075) | Doctor Consultation2 | Booking variant | PAL-CARE-03 | Alternative booking state | Consolidated (`farmer/care.tsx`) |
| [24466:68123](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-68123) | Vet Portal5 | Checkout | PAL-CARE-06 | Cost review/mock payment | Implemented (`farmer/care.tsx`) |
| [24466:68158](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-68158) | Doctor Consultation2 | Checkout variant | PAL-CARE-06 | Payment choice/status | Consolidated (`farmer/care.tsx`) |
| [24466:68193](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-68193) | Vet Portal | Vet category selection | PAL-CARE-01 | Original phone/vet illustration | Implemented (`farmer/care.tsx`) |
| [24466:68386](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-68386) | Vet Portal1 | Category selection variant | PAL-CARE-01 | Selected state | Consolidated (`farmer/care.tsx`) |
| [24466:68578](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-68578) | Doctor Consultation | Emergency search | PAL-HEALTH-04 | Priority search | Implemented (`farmer/monitoring.tsx`) |
| [24466:68596](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-68596) | Doctor Consultation | Emergency vet found | PAL-HEALTH-02,04 | Matched clinician | Implemented (`farmer/monitoring.tsx`) |
| [24466:68642](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-68642) | Doctor Consultation | Dispatch tracking | PAL-HEALTH-04 | Simulated tracking | Implemented (`farmer/monitoring.tsx`, `farmer/care.tsx`) |
| [24466:69297](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-69297) | Doctor Consultation2 | Appointment preparation | PAL-CARE-05 | Reschedule/cancel entry | Implemented (`farmer/care.tsx`) |
| [24466:69320](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-69320) | Doctor Consultation | Consultation call | PAL-CARE-07 | Simulated call controls | Implemented (`farmer/care.tsx`, `vet/index.tsx`) |
| [24466:69343](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-69343) | Doctor Consultation2 | Consultation call variant | PAL-CARE-07 | Connection/end state | Implemented (`farmer/care.tsx`) |
| [24466:69366](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-69366) | Notification Search | Notification list | PAL-NOT-01 | Role-targeted entries | Implemented (`common/index.tsx`) |
| [24466:69379](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-69379) | Notification Search | Notification empty | PAL-NOT-01 | Clear empty state | Implemented (`common/index.tsx`) |
| [24466:69448](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-69448) | Vet Portal6 | Payment success | PAL-CARE-06 | Receipt details | Implemented (`farmer/care.tsx`) |
| [24466:69460](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-69460) | Doctor Consultation2 | Payment success variant | PAL-CARE-06 | Confirmation variant | Consolidated (`farmer/care.tsx`) |
| [24466:69472](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-69472) | Doctor Consultation | Appointment cancellation | PAL-CARE-05 | Confirmation/status | Implemented (`farmer/care.tsx`) |
| [24466:69514](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-69514) | Doctor Consultation | Repayment success | PAL-LOAN-07 | Payment-to-loan receipt | Implemented (`finance/loans.tsx`) |
| [24466:69534](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-69534) | Financial Hub Wallet4 | Loan approved | PAL-LOAN-05,06 | Approval/disbursement distinct | Implemented (`finance/loans.tsx`) |
| [24466:69559](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-69559) | Doctor Consultation | Claim approved | PAL-INS-06,07 | Decision/payout distinct | Implemented (`finance/insurance.tsx`) |
| [24466:69581](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-69581) | AI Wellness Companion | AI scan entry | PAL-AI-01 | Remove VPN residue | Implemented (`farmer/companion.tsx`) |
| [24466:69592](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-69592) | AI Wellness Companion | AI chat | PAL-AI-01 | Livestock symptoms and context | Implemented (`farmer/companion.tsx`) |
| [24466:69600](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-69600) | AI Wellness Companion | Photo scan | PAL-AI-03 | Human psoriasis image excluded | Implemented (`farmer/companion.tsx`) |
| [24466:69608](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-69608) | AI Wellness Companion | AI result chat | PAL-AI-01,03 | Deterministic livestock result | Implemented (`farmer/companion.tsx`) |
| [24466:69618](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-69618) | AI Wellness Companion | Voice start | PAL-AI-02 | Mic simulation entry | Implemented (`farmer/companion.tsx`) |
| [24466:69641](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-69641) | AI Wellness Companion | Voice recording | PAL-AI-02 | Recording/review state | Implemented (`farmer/companion.tsx`) |
| [24466:69665](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-69665) | AI Wellness Companion | Voice chat result | PAL-AI-02 | Replace human blood pressure text | Implemented (`farmer/companion.tsx`) |

## Required mobile views absent from supplied canonical designs

| Role / group | Native views designed in the approved mobile brand | Status |
|---|---|---|
| Shared access | Demo role/account chooser, phone validation, expired OTP, profile/settings, notification detail, storage recovery, scenario/reset controls | Implemented (`auth/login.tsx`, `common/index.tsx`) |
| Farmer farm | Farm setup, animal add/edit, passport detail, gallery/evidence, connect device, battery/disconnected detail | Implemented (`farmer/animals.tsx`, `farmer/monitoring.tsx`) |
| Farmer care | Alert detail, escalation explanation, prescription archive/detail, medication schedules, emergency loan branch | Implemented (`farmer/monitoring.tsx`, `farmer/care.tsx`) |
| Farmer commerce | Medicine/feed catalog/detail, cart, checkout/address, order receipt, delivery events | Implemented (`farmer/companion.tsx`) |
| Farmer finance | Policy detail, application/claim status/evidence history, active loan detail, repayment form, grace status, transaction detail | Implemented (`finance/insurance.tsx`, `finance/loans.tsx`) |
| Veterinarian | Dashboard, queue/filter/detail, confirm/reject, availability schedule, patient history/trends, clinical note/prescription editor, complex claim assessment, escalations | Implemented (`vet/index.tsx`) |
| Bank | Dashboard, application queue/detail, borrower/collateral evidence, approve/reject, disbursement, active-loan and repayment detail, grace/settlement review | Implemented (`finance/index.tsx`, `finance/loans.tsx`) |
| Insurer | Dashboard, application/evidence review, issue/manage policy, claim queue/detail, vet referral, approve/reject/payout/settlement routing | Implemented (`finance/index.tsx`, `finance/insurance.tsx`) |
| Admin | Dashboard, user/access list/detail, education editor/publishing, simulated system health, audit log, reports | Implemented (`admin/index.tsx`) |
| All roles | Loading, empty, invalid, unavailable/offline, retry, confirmation and success states appropriate to each action | Implemented (`components/ui/index.tsx`, `features/**`) |
