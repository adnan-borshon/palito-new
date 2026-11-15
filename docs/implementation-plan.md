> Current M3 update (2026-11-15): Firebase identity/session paths and opt-in `/identity` client screens are implemented. M3 is **in progress**, not complete. Read [identity checkpoint](backend/identity.md) for exact endpoints, setup, actual tests and unfinished staff/native/provider gates. Earlier milestone descriptions below remain historical or proposed unless superseded there.

# Palito implementation status

## Mandatory review gate & phase progression

1. Complete all five mobile roles → test and fix → present runnable mobile preview and evidence → user review → explicit user approval (**Approved 2026-11-15**).
2. Implement `@palito/web` (`frontend/web`) with role-prioritized desktop workbenches (`bank`, `vet`, `admin`, `insurer`) and 100% mobile feature/workflow parity for `farmer`, backed by a clean backend-agnostic client boundary (`src/lib/client.ts`, `src/lib/storage.ts`). (**Done**)

## Current architecture

- `frontend/mobile`: Expo SDK 58, React 19.3.0, React Native 0.88.1, Expo Router, TypeScript.
- `frontend/web`: Next.js 16 App Router, React 19.3.0, TypeScript, Tailwind CSS v4, Lucide icons, native accessible `<dialog>` / `tablist` / responsive container-query tables, local `Anek Bangla` + `Plus Jakarta Sans` fonts, and local Palito brand assets.
- `frontend/shared`: platform-independent domain types, fixtures, command repository, validation, localization, 70% LTV quote calculation (`demoLoanQuote`, `maximumLoanAmount`), and `hasIoTEvidence`.
- `backend`: M1 NestJS/config/security/operations foundation implemented; PostgreSQL development setup and CI added. Prisma domain schema and Firebase integration remain M2/M3. Web transport is isolated, but automatic fresh request IDs do not by themselves make retries safe; API integration needs scoped queries, sessions and durable intent handling.
- Node 24 LTS (`v24.22.3`); single root npm workspace and lockfile.

## Backend milestone 0 — 2026-11-15

Current authorization is M0 only. [Backend review index](backend/README.md), [checkpoint](backend/progress.md) and [ordered milestones](backend/implementation-plan.md) supersede outdated frontend-only restrictions for this review. No application/runtime/schema changes or M1 work are included. Stop for user review.

## Backend milestone 1 — 2026-11-15

User reviewed M0 and authorized M1. [M1 report](backend/progress-m1.md) and [current checkpoint](backend/progress.md) describe the implemented foundation and actual checks. The older M0-only authorization note above is historical. M2 waits for user review/instruction.

## Backend milestone 2 — 2026-11-15

User reviewed M1 and authorized M2. Core PostgreSQL/Prisma schema, reviewed migrations, dedicated roles, synthetic fixtures and real database integrity tests are now implemented. [Current checkpoint](backend/progress.md) and [database design](backend/database.md) are authoritative for this phase. Earlier M0/M1-only notes are history. Stop for user review before M3; no Firebase/login or domain endpoints are included.
