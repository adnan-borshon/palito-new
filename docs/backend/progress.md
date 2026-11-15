# M4 healthcare implementation and review checkpoint

Updated 2026-11-15. The user authorized the next milestone after M3. Work is on the existing review branch/PR #2, based on verified M3 `5abab0fc619c778c7ff7de62b47d284188bac44d`. **Stop for review before M5.** No merge, production migration/deployment, paid activation or live OTP campaign is included.

Read [healthcare implementation](healthcare.md) for actual routes, consent/state/time rules, client behavior and pilot limits. [M3 completion](milestone-3-completion-checkpoint.md) is retained as history; its final hosted CI/security and actual Android compilation passed before M4.

## Implemented M4 scope

- Owner-scoped farms, animal registration/edit/soft archive, immutable farmer observations, current-location passport, paginated clinical history/private gallery and exact decimal/minor-unit inputs.
- Verified professional discovery, self-reported practice profile and filters, future 30-minute slots with overlap protection, explicit BDT 0 pilot booking, cancellation/rescheduling, assigned-vet acceptance and current-consent patient queue.
- Irreversible consent withdrawal, 72-hour post-slot expiry, fresh current account/membership/credential checks, owner-snapshot invalidation and current-authority checks on idempotent receipt replay. No bank/insurer/admin clinical bypass.
- Appointment-based consultation, immutable signed prescription/items, linked reasoned clinical amendments, explicit vet-authored follow-up reminders and atomic append-only event intents. Delivery remains M5.
- Private bounded PNG/JPEG initialization, decoded/re-encoded metadata-stripped canonical images, quarantine/hash/finalization, lost-response recovery, immutable READY bytes and authenticated revocable download access. PostgreSQL byte objects are an explicit small-pilot adapter, not claimed S3/production object storage.
- Real Next `/care` and configured Expo native `/care` farmer/vet screens, shared portable transport/model separate from DemoState, consent and no-charge wording, account-aware memory-only views, private photo/evidence, forms and signed prescription display. Demo screens are preserved.
- One additive fifth migration; previous published migrations unchanged. Database constraints preserve slot uniqueness/overlap, linked records/photos, immutable clinical evidence/commands/events and restricted runtime grants.

## Verification evidence

Final local validation passed **81 tests**, zero failed/skipped: **61 default** (16 native component, 2 web workflow, 21 shared and 22 backend) plus **20 real PostgreSQL/official Firebase emulator integration tests**. Both M4 service/HTTP scenarios, two independent connection pools racing a slot, professional filtering, ownership/consent/credential revocation, binary upload/hash recovery, signed prescription/amendment linkage, exact money and retained-row upgrade/repeatable migration/Prisma drift passed. Invalid cursor/version/input boundaries are covered.

Final lint, all workspace types, backend build, Next production build and Expo browser export passed. Dependency audit reports **zero high/critical**, existing 1 low + 20 moderate. The final staged-source scan is performed before push; its result and exact commit/hosted Chrome/native/security outcomes are recorded in PR #2. Pending hosted checks are not asserted passed here.

The local browser IPC limitation persists from M3; hosted Chrome executes the required actual browser journey. Native component tests mock SDK/transport. The existing actual Android arm64 build CI remains mandatory after adding SDK-compatible picker/file-system/crypto modules; compilation is not physical-device evidence.

## Explicit remaining rollout boundaries

Live Firebase project/ADC/native app identities, real SMS, Android/iOS hardware lifecycle and app verification still need owner configuration/devices. No live care data or clinical schedule is invented. Managed object-store selection, quotas/retention and additional-format malware scanning precede larger live use. The pilot accepts only bounded sanitized images. Video-call provider/token flow is M8c; paid care is M6; reliable reminder delivery/cleanup/recovery is M5. All 65 PAL requirements and 53 command mappings are preserved with later-milestone portions explicitly marked.
