# Shared mobile domain contract

Status: types frozen for parallel implementation, 2026-11-14. Source of truth: `frontend/shared/src/types.ts`.

`@palito/shared` must export every type and `createDemoRepository(options?: RepositoryOptions): DemoRepository` plus `createDemoState(scenario?: DemoScenario, now?: Date): DemoState`. Engine implementation belongs in shared; no React or native dependencies. Monetary amounts are BDT (not minor units). ISO strings use UTC. `now` in state is the deterministic demo clock.

Repository snapshots are immutable and stable until a successful command; `subscribe` fires once after a committed transaction. `hydrate` restores validated schema v1 storage or returns a localized storage failure. Serialize execute operations, validate role and ownership, reject duplicate submissions and invalid transitions, preserve state on errors. Return localized CommandResult; never throw expected user errors. Injected storage follows AsyncStorage's API. Storage key: `palito.demo.v1`. Defaults: Bangla, logged out, normal scenario. Demo OTP: `123456`. Phone matches a seeded account; switch command is an explicit demonstration control.

Financial constraints: maximum loan 70% collateral valuation; only owned eligible livestock; no duplicate active collateral; coherent premium, claim, wallet, repayment and outstanding debt records. Payout of a deceased secured animal settles outstanding debt before crediting remaining payout to farmer. Use fixed illustrative quote rules, not real financial advice. AI and biometric readings are demonstrations. Four-hour unresolved alerts escalate when advancing demo time. Offline commands that simulate a server transaction fail; navigation, preferences and demo controls remain usable.

Engine additions: optional `requestId` on commands, persisted actor/payload-bound retry fingerprints in `processedRequests`, OTP expiry, optional claim evidence `capturedAt`/`latitude`/`longitude`, policy `enhanced` flag, animal `productionDrop`, and veterinarian profile availability/specialty/schedule. `demo.failNext` fails the next simulated server operation once without changing its domain state. Financial UI must retain its request ID on a retry and use a new one for a separate payment. Public exports include `DEMO_IDS`, `DEMO_ACCOUNTS`, `demoBalance`, `demoLoanQuote`, and `hasIoTEvidence`.

UI contract: `useDemo()` exports `{ state, repo, user, role, locale, t(bn,en), money(amountBDT), date(iso), run(command), busy, error, clearError, ready }`. `run` returns CommandResult and manages global feedback. Components use explicit commands and read snapshots; never mutate arrays or embed role-specific repository copies. `user` is User or undefined; `role` is Role or undefined. `t` selects only supplied strings. State is shared across demo accounts.

Routes: `/` onboarding/auth redirect, `/welcome`, `/login`, `/[role]/[screen]`, `/[role]/[screen]/[id]`. Each role uses the same provider and native stack. Feature modules live under `frontend/mobile/src/features`, never in route directory. Registry receives `{ screen: string; id?: string }` and chooses role module. Bottom navigation stays role-specific; detail pages use native back behavior.

Native UI exports from `@/components/ui`: `Screen`, `AppText`, `Button`, `Card`, `Field`, `Choice`, `Badge`, `Section`, `Row`, `EmptyState`, `LoadingState`, `ErrorState`, `Confirm`, `Stat`, `Icon`, `Divider`. Design tokens live in `@/theme`. Fonts loaded at root. Use `@/providers/demo` for state and `@/navigation` for role links.

Review gate: complete mobile coverage, verify, user review, explicit approval, then web. Shared code is platform independent; no web screen or Next.js implementation is authorized yet.
