# Palito implementation status

## Mandatory review gate & phase progression

1. Complete all five mobile roles → test and fix → present runnable mobile preview and evidence → user review → explicit user approval (**Approved 2026-11-15**).
2. Implement `@palito/web` (`frontend/web`) with role-prioritized desktop workbenches (`bank`, `vet`, `admin`, `insurer`) and 100% mobile feature/workflow parity for `farmer`, backed by a clean backend-agnostic client boundary (`src/lib/client.ts`, `src/lib/storage.ts`). (**Done**)

## Current architecture

- `frontend/mobile`: Expo SDK 58, React 19.3.0, React Native 0.88.1, Expo Router, TypeScript.
- `frontend/web`: Next.js 16 App Router, React 19.3.0, TypeScript, Tailwind CSS v4, Lucide icons, native accessible `<dialog>` / `tablist` / responsive container-query tables, local `Anek Bangla` + `Plus Jakarta Sans` fonts, and local Palito brand assets.
- `frontend/shared`: platform-independent domain types, fixtures, command repository, validation, localization, 70% LTV quote calculation (`demoLoanQuote`, `maximumLoanAmount`), and `hasIoTEvidence`.
- `backend`: intentionally empty (`.gitkeep`) until backend/database/auth stack is selected; `@palito/web` isolates transport in `frontend/web/src/lib/client.ts` with automatic `requestId` idempotency for zero-UI-rewrite backend integration.
- Node 24 LTS (`v24.22.3`); single root npm workspace and lockfile.
