# Backend M0 checkpoint

Updated 2026-11-15. **M0 review deliverable completed; awaiting user review. M1 has not started.** Branch: `codex/palito-m0-assessment`. Base/current application source: `b31b165bc92f2734776b608aeba241a6b9dd291e`. The GitHub review branch/PR head is the authoritative commit for these documents; no self-referential commit hash is embedded here.

## Scope completed

- Read original `docs/srs.pdf` (49 physical pages), master prompt, requirements/design/decision/progress/test documents, shared command types and handlers, frontend integration seams and package/lockfiles. Extracted the PDF text and inspected the use-case, DFD, class, activity, CRC and state diagrams on pp.29,34,36–39. Original SRS SHA-256: `989d6cd8583ea763a019d5f4d89b1b2094b1c39e478f8ec51135df569179ccb3`.
- Preserved the uploaded plan content as `source-plan.md`, normalizing trailing blank lines only. Original upload SHA-256: `a8dbcea0d9e221760f4dd24fca36f35574fb755ffa455a1cba6362a002e9f98b`; archived file SHA-256: `bb8fa9ae5f69f870f82ee64ffaff25a46be29f729b19179990e03a5f2329558a`. Its old planning-only/pending statements are historical; this checkpoint records execution.
- Mapped all **65 PAL IDs** to proposed module/API, conceptual tables, permissions, planned acceptance tests, milestone/status and engineering ownership; added 10 explicit SRS gap dispositions and UC-001/002/003 acceptance. No UC-004 body invented.
- Classified all **53 current demo commands** exactly once. Defined future scoped read projections, DTO/error/session/idempotency/money/time contracts, conceptual schema and migration boundaries. No endpoints or tables were created.
- Defined default-deny resource permissions, threats and future denial/concurrency/recovery tests. Proposed a concrete staff MFA flow and selected native-development-build auth approach with explicit compatibility/security gates. Unresolved business/provider policies have owners/deadlines and fail-closed scope.
- Reviewed PR #1 (still open/unmerged) at `859a3445b9adc59edd66b8c88e021d67fabf5d8c`; adopted its backend guidance on this review branch with YAML metadata and direct AGENTS link. Updated contradictory frontend-only/current-phase documentation while retaining historical reports and demo behavior.
- Wrote M1–M10 backlog, baseline/operations plan and truthful tooling manifest. No external skill collection, provider integration, database or CI pipeline was installed by a guidance file.

## Checks actually executed in this M0 session

Linux; Node **v24.22.1**, npm **11.9.0** (repo pins Node 24.22.3; engine accepts ^24.3.0). Fresh public clone with clean initial worktree. Lockfile-resolved Expo **58.0.25**, TypeScript **6.0.3**, Jest **30.5.2**, Next.js **16.4.6**, React **19.3.0**. No application source/dependency changes were required for these checks.

| Command / check | Actual result | Limit |
|---|---|---|
| `npm ci --ignore-scripts --no-audit --no-fund` | Exit 0; 1,377 packages installed; lockfile unchanged | Install scripts intentionally skipped; deprecation/proxy-config warnings observed; no audit claim |
| `node --test frontend/shared/tests/*.test.ts` | Exit 0; **18 passed, 0 failed** | Demo domain only; also rerun inside npm test |
| `npm run typecheck` | Exit 0; mobile, web and shared workspaces | Not database/native/provider verification |
| `npm run lint` | Exit 0; mobile Expo ESLint | Shared lint is not included by root lint; no independent shared lint claim |
| `npm run lint:web` | Exit 0 | Script is TypeScript only; genuine web ESLint remains M1 work |
| `npm test` | Exit 0; mobile **3 suites / 11 tests**, web **2 tests**, shared **18 tests**; **31 total passed, 0 failed** | Web tests are Node workflow/helper tests, not Playwright/browser E2E; no new tests added for documentation |
| `npm run build:web` | Exit 0; Next.js compilation/types and 5 static pages generated; role route dynamic | Compile/static generation, not authenticated browser journey |
| `npm run export:web` | Exit 0; Expo web bundle exported to `frontend/mobile/dist` | Browser target only; no native build/hardware result |
| `CI=1 npx expo install --check` (mobile) | Exit 1: HTTP proxy timeout | Online dependency compatibility check unavailable; not labeled pass |
| `EXPO_OFFLINE=1 CI=1 npx expo install --check` (mobile) | Exit 0: dependencies up to date; warning that offline validation is unreliable | Cached/offline result only; does not resolve failed online check |
| `npx --no-install expo-doctor` (mobile) | Exit 1: package absent (`expo-doctor@1.21.8` requested), auto-install disabled by `--no-install` | Deliberately did not install a new diagnostic tool; no current Doctor pass claim |
| Source-to-document validation | 65 PAL rows and 53 commands match exact source sets; YAML metadata/direct link validated; local backend links and Markdown table structure checked | Documentary consistency only, not agent-client auto-discovery |
| `git diff --check`; staged scope review | Pass; only documentation, AGENTS and backend guidance | Build-generated `.next` modifications restored; generated untracked output excluded; `.next` cleanup deferred to M1 |

## Rechecked findings and assigned remediation

| Finding | Current evidence | Later work |
|---|---|---|
| Fixed OTP, public role switch and local whole-state authority | `support.ts` auth handlers; `repository.ts` public/local classification; client storage/providers | Preserve isolated demo; M3 server identity/scoping and production demo rejection |
| Farmer estimate drives loan borrowing power | Scratch-only probe: seeded animal quote cap **98,000 BDT**, doubled estimate cap **196,000 BDT** using `demoLoanQuote`; `animal.update` accepts value | M6 independent approved/versioned valuation; no production quote from editable estimate |
| Exact IoT boundary loses valid coverage one minute later | Scratch-only probe at fixed `2026-11-15T00:00:00Z`: all four seeded animals return **true**, same data at +1 minute **false** in `hasIoTEvidence` | M8a approved sampling tolerance and missing/stale coverage tests; advisory use only until policy validated |
| Web adapter generates fresh request IDs | `frontend/web/src/lib/client.ts` enriches every execute lacking explicit ID | M6 durable per-intent ID across retries/restarts; M4 transition idempotency |
| Interest shown but principal-only schedules | `frontend/mobile/src/features/finance/loans.tsx` uses `ceil(amount/termMonths)` and `finance.ts` starts outstanding at principal | M6 versioned approved terms, exact schedule, interest/allocation and ledger reconciliation |
| Prescription/order authority too broad | `support.ts` permits any nonempty farmer prescription for restricted product; `order.advance` permits farmer-owned order progression | M8d medicine/expiry/quantity matching and trusted fulfillment actor |
| Whole-state client queue cannot enforce distributed security/concurrency | Shared local snapshots, `Promise` queue and complete fixture state | M2–4 DB constraints/locks plus API permissions; M6 ledger/outbox and separate-process race tests |
| Repository operational baseline needs cleanup | 495 tracked `.next` files; no `.github` workflows; web lint only tsc; stale docs | Docs reconciled in M0; generated-output/CI/genuine lint changes reserved for M1 |

These are demo-to-production gaps, not proof that a deployed backend was exploited. No fixes from later milestones have been slipped into M0.

## Open decisions / unavailable evidence

User review is needed for proposed staff email/password + SMS MFA, native Firebase development-build direction and gates, no-charge healthcare pilot, and SRS gap dispositions. Product/partner owners still must approve finance, valuation authority, clinical data disclosure/retention, provider selection, emergency coverage and device/clinical thresholds before their dependent milestones.

No Firebase project access/configuration, MFA enrollment, emulator run, Bangladesh SMS delivery, PostgreSQL constraint/migration test, browser E2E, native device build/process-kill/accessibility check, AI/provider integration, real payment, load test, backup/restore, scanner audit or deployment was performed. Online Expo validation and exact pinned Node-patch reproduction remain unverified. The M0 deliverable is reviewable with these limits; it does not claim those later gates passed.

## Resume exactly here

1. Read `AGENTS.md`, this checkpoint, backend README/decisions/traceability and current user feedback. Inspect branch/main and PR #1 for concurrent changes; avoid duplicating its guidance or merging either PR automatically.
2. **Wait for user review and instruction. Do not start M1 in this session.**
3. Once authorized, begin M1 backend/config/CI foundation only, with genuine lint and generated-output cleanup. Follow B01's compatible-version check; retain the unresolved provider/policy gates. First database/schema and authentication implementations remain M2 and M3.
