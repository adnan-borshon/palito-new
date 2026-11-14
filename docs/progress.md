# Palito mobile & web progress

Updated 2026-11-15. **Both `@palito/mobile` (Expo SDK 58) and `@palito/web` (Next.js 16 App Router) are implemented and connected to `@palito/shared`.**

## Current phase

- **Mobile (`frontend/mobile`):** Complete across all five roles (`farmer`, `vet`, `bank`, `insurer`, `admin`) and verified with TypeScript, ESLint, Expo Doctor (`20/20`), shared domain tests (`18/18`), mobile component/journey tests (`11/11`), and static web preview bundle export (`export:web`).
- **Web (`frontend/web`):** Complete across all five roles (`bank`, `vet`, `admin`, `insurer`, `farmer`) using Next.js 16 App Router, React `19.3.0`, TypeScript, Tailwind CSS v4, 3-layer Palito design system tokens (`globals.css`), local `Anek Bangla` + `Plus Jakarta Sans` fonts, split-pane desktop workbenches for institutional/clinical roles, 100% mobile workflow parity for Farmer, and a **Web-to-Mobile Companion Bridge (`MobileHandoffModal`)**.
- **Backend Readiness (`frontend/web/src/lib/client.ts` & `storage.ts`):** All UI components call `useWebApp()` over a decoupled client boundary that automatically injects idempotency `requestId` keys and isolates storage/session handling so a future backend, database, and SMS OTP provider can be attached without modifying React screens.

| Workstream | Status | Evidence / Key Files |
|---|---|---|
| Shared domain repository & persistence | Complete & verified | `frontend/shared/src/*`; 18/18 Node tests pass |
| Mobile application (`@palito/mobile`) | Complete & verified | `frontend/mobile/src/features/registry.tsx`; 11/11 Jest tests pass |
| Web application (`@palito/web`) | Complete & verified | `frontend/web/src/features/registry.tsx`, `bank.tsx`, `vet.tsx`, `admin.tsx`, `insurer.tsx`, `farmer.tsx` |
| Backend-agnostic adapter layer | Complete | `frontend/web/src/lib/client.ts`, `frontend/web/src/lib/storage.ts`, `frontend/web/src/providers/web-provider.tsx` |
| Web-to-Mobile companion bridge | Complete | `AppShell` (`frontend/web/src/components/app-shell.tsx`) + `palito://` deep link & QR modal |

## Token & Context Optimization Index (for future sessions)

To minimize context window usage in future sessions:
1. **Start with `claude-mem`:** Call `work_state_read` and `search(query="Palito")` (`search` → `timeline` → `get_observations`) instead of re-scanning the repository.
2. **Use AST Outlines (`claude-mem`):** Prefer `smart_outline` and `smart_unfold` on feature files (`frontend/mobile/src/features/*` and `frontend/web/src/features/*`) rather than reading full files.
3. **Node 24 Requirement:** Always prepend `$env:Path = "$env:NVM_HOME\v24.22.3;" + $env:Path` in PowerShell before running `npm`, `npx`, or `node`.
