# Palito mobile progress

Updated 2026-11-14. **MOBILE REVIEW GATE: READY FOR USER REVIEW. No Next.js web implementation has been started.**

## Current phase

Mobile phase complete across all five roles (`farmer`, `vet`, `bank`, `insurer`, `admin`) and verified with TypeScript, ESLint, Expo Doctor (`20/20`), shared domain tests (`18/18`), mobile component/journey tests (`11/11`), and static web preview bundle export (`export:web`). Waiting for explicit user approval before starting the Next.js web application.

| Workstream | Status | Evidence / next action |
|---|---|---|
| Approved plan and role scope | Complete | `docs/decisions.md`, `docs/implementation-plan.md` |
| SRS discovery | Complete | All 49 physical pages mapped in `docs/requirements-matrix.md` |
| Figma discovery | Complete | 56 mobile variants consolidated in `docs/screen-inventory.md` |
| Local fonts & original Figma assets | Complete | 7 TTF fonts + OFL licenses and 16 images in `frontend/mobile/assets/palito/manifest.ts` |
| Shared domain repository & persistence | Complete & verified | `frontend/shared/src/*`; 18/18 Node tests pass (`docs/test-report-shared.md`) |
| Five mobile role workflows | Complete & verified | `farmer`, `vet`, `bank`, `insurer`, `admin` integrated in `frontend/mobile/src/features/registry.tsx` |
| Automated checks & bundle verification | Complete | TS `0` errors, ESLint `0` errors, Doctor `20/20`, Shared `18/18`, Mobile `11/11`, `export:web` passed (`docs/testing/mobile-verification.md`) |
| User mobile review | **Ready for review** | Launch instructions, accounts, walkthroughs, and limitations delivered |
| Web application (`frontend/web`) | **Gated** | Start only after explicit user approval of the mobile phase |

## Token & Context Optimization Index (for future sessions)

To minimize context window usage in future sessions:
1. **Start with `claude-mem`:** Call `work_state_read` and `search(query="Palito")` (3-step workflow: `search` → `timeline` → `get_observations`) instead of re-scanning the repository.
2. **Use AST Outlines (`claude-mem`):** Prefer `smart_outline` and `smart_unfold` on large feature files (`farmer/care.tsx`, `finance/loans.tsx`, `vet/index.tsx`, `admin/index.tsx`) rather than `read_file` on entire files.
3. **Node 24 Requirement:** Always prepend `$env:Path = "$env:NVM_HOME\v24.22.3;" + $env:Path` in PowerShell before running `npm`, `npx`, or `node`.

## Known limitations

- Physical Android/iOS device testing (hardware keyboard, physical safe-area cutouts, screen-reader voice output, native OS process-kill lifecycle) is unverified on this Windows machine without an attached device/simulator.
- Figma MCP Starter-plan rate limit prevented refreshing full child context for `24466:65575` and `24466:66465`; those screens and operator roles (`vet`, `bank`, `insurer`, `admin`) are implemented using the extracted Palito design system tokens and shared components.
- All backend-dependent operations (OTP `123456`, IoT collar telemetry, AI symptom/photo/voice guidance, video calls, wallet/bKash/Nagad payments, loan valuations, insurance claims, and order delivery) are local simulations.
