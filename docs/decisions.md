# Palito decisions

Recorded 2026-11-14. These decisions implement the user's approved plan. They are authoritative until superseded by explicit user feedback.

| ID | Decision | Reason / evidence |
|---|---|---|
| D01 | Finish every mobile role, test and fix, deliver preview, then wait for explicit mobile approval. | Approved delivery order. Silence, a milestone, and a new session are not approval. |
| D02 | No Next.js screens or web-specific layouts during the mobile phase. | The reserved web location is a placeholder only. |
| D03 | SRS defines behavior; Figma ALL SCREENS defines existing mobile appearance. | User's source-priority rule. Existing Figma web pages are excluded. |
| D04 | Phone and demonstration OTP authenticate locally. | SRS pp.42,48 overrides copied email/password templates in Figma. No real SMS, identity check, or password storage. |
| D05 | Anek Bangla and Plus Jakarta Sans; observed green Brand palette. | Figma mobile overrides older SRS p.41 color/font suggestions and generic inherited library variables. |
| D06 | Bangla is the initial language, English is complete alternative. | SRS pp.23,40,42 and approved plan. Persist chosen language; do not translate identifiers or change values. |
| D07 | Farmer, veterinarian, bank, insurer, admin all have mobile navigation. | SRS actor model pp.28–29,38 plus explicit approved scope. Missing Figma views reuse the mobile brand. |
| D08 | One shared, locally persisted demonstration repository links every role. | A booking/loan/claim must remain the same record when switching accounts. Version storage; reset requires confirmation. |
| D09 | All AI, IoT, authentication, identity, calls, transactions, delivery and financial decisions are demonstrations. | Frontend-only scope. No production APIs, real transfers, paid infrastructure or new backend. |
| D10 | Preserve Expo 58 compatibility fixes and Node 24 setup. | Approved technical baseline; verify actual package versions before Expo API changes. |
| D11 | Farmer primary navigation uses Home, Animals, Scan, Wallet, Profile; vet/emergency stays prominent. | Figma dashboard navigation reconciled with SRS p.41 Vet shortcut. |
| D12 | Animal records show livestock data; remove human blood-pressure/psoriasis, VPN, Asklepios and PST residues. | SRS domain takes precedence over unrelated template content. Keep useful layout, not misleading content. |
| D13 | Loan principal cannot exceed 70% of current verified collateral value. | UC-003 pp.33–34. Enforce in validation and bank decisions, not just helper copy. |
| D14 | Claims on secured animals settle outstanding debt first, then route remainder to farmer. | UC-002 p.32. One atomic mock settlement updates claim, loan, passport, wallet and notifications. |
| D15 | After four hours without farmer action, monitoring alerts escalate. | UC-001 pp.30–31. Use a controllable demo clock; never depend on waiting real hours. |
| D16 | Preview in a browser is a mobile implementation preview, not evidence of native correctness. | Approved test requirements. Device-only behavior remains unverified until tested on a device/emulator. |
| D17 | Bundled original Figma assets and licensed local fonts; no transient URLs at runtime. | Figma design-to-code skill and offline requirement. Full-screen references are QA only, never app assets. |
| D18 | No asserted model accuracy, payout service level or security certification. | SRS competitive and aspirational claims pp.10–13 are not achieved results. Time limits are labeled simulated workflow targets. |
| D19 | Production-style UI copy with zero "demo/simulation" disclaimers; preserve 1-tap login & OTP `123456` workflow. | Explicit user instruction on 2026-11-14: present the app as a real production frontend without "demo/simulation/sample" labels, while keeping the quick-access login role selector and environment switcher for testing. |

## Handling gaps

Missing mobile designs: create native cards, detail pages, review queues and forms using the same header, fonts, spacing, status treatment and action hierarchy. Do not stretch desktop mockups into mobile. Role permissions are navigation and demo-domain checks; this frontend does not claim real authorization security.

Missing external data: expose deterministic loading/empty/error/offline/retry states with seed scenarios. A mocked GPS timestamp, attachment or voice recording must say it is a demo. Financial examples must not imply actual offers.

## Change record

- 2026-11-14: Re-read live project structure, refreshed key Figma contexts, confirmed migration to `frontend/mobile`, and recorded original source mappings. Implementation and verification status are tracked separately.

