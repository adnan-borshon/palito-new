# Palito mobile design system

Source: [Figma ALL SCREENS](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-64175). Refreshed 2026-11-14. Existing mobile frames are visual authority; SRS is functional authority.

## Color

| Semantic purpose | Source value | Notes |
|---|---|---|
| Screen background | #F8FAFC | Light cool neutral |
| Card / inverse text | #FFFFFF | No translucent glass panels |
| Primary text | #1F2937 | Gray 80 |
| Secondary text | #4B5563 | Gray 60 |
| Muted / border | #94A3B8 / #E2E8F0 | Gray 40 / 20; muted color cannot be sole status cue |
| Green primary | #15803D | Brand 60, primary CTA and active icon |
| Green header / deep | #0A401E / #05200F | Brand 80 / 90; actual home header is very dark green |
| Green strong | #0F602D | Brand 70 |
| Green tint | #EBF4EE / #D8E9DE | Brand 5 / 10 |
| Green mid | #B1D4BE / #8ABF9E / #63AA7D | Brand 20 / 30 / 40 |
| Warning | #F59E0B / #FEF3C7 | Icon / background, pair with dark text |
| Critical banner | #D41406 | Visible dashboard emergency alert |
| Destructive | #F43F5E / #881337 | Status accent / strong text |
| AI accent | #9333EA / #F3E8FF | Analysis/forecast notice, not a competing brand |
| Success | #10B981 | Use status label and icon together |

Do not adopt unrelated purple/blue generic `Primary` variables from the inherited library. Do not introduce a new dark theme in this phase. Validate actual foreground/background contrast and text-size behavior; a source swatch does not prove accessibility.

## Type

Anek Bangla is the principal family, with 400, 500, 600 and 700 files bundled. Plus Jakarta Sans 400, 600 and 700 supports Latin labels where the source uses it. Font exports in `frontend/mobile/assets/palito/manifest.ts` are `AnekBanglaRegular`, `AnekBanglaMedium`, `AnekBanglaSemiBold`, `AnekBanglaBold`, `PlusJakartaSansRegular`, `PlusJakartaSansSemiBold`, `PlusJakartaSansBold`.

| Source role | Size / line height | Weight |
|---|---|---|
| Supporting metadata | 12 / 16 | Regular or medium |
| Secondary body | 14 / 20 | Regular |
| Body / button | 16 / 22–26 | Regular / semibold |
| Section heading | 18 / 24 | Bold |
| Screen heading | 20 / 28 | Bold |
| Prominent value | 24 / 32 | Bold |
| Onboarding headline | 30 / 38 | Bold |

Use these as hierarchy, not fixed-height text boxes. Allow Bangla ascenders/descenders, dynamic type, wrapping and longer English labels. Never shrink important text to preserve a screenshot crop.

Font binaries are downloaded from the official [Expo Google Fonts repository](https://github.com/expo/google-fonts/tree/main/font-packages). Local OFL licenses sit alongside fonts. No font-package dependency was added; no runtime font download is required.

## Layout and components

- Reference canvas is 375px wide. Main horizontal inset is 16; spacing rhythm 8, 12, 16, 24. Do not hardcode the screen width.
- White cards use 12–16px corners; hero bottom corners and some editorial cards use 24. Buttons usually use 14px corners and a 48px minimum height.
- Card shadows are subtle: #0F172A at 0.03, offset 0/4, blur 8; and 0.02, offset 0/8, blur 16. Native elevation must remain restrained.
- Deep green headers use white labels; next action is visually distinct. Tabs have a thin green active underline.
- Farmer bottom navigation is Home / Animals / Scan / Wallet / Profile, with a green circular center action. Keep route labels, accessibility labels and touch areas.
- Primary buttons fill available width on forms; destructive decisions require explicit confirmation. Secondary buttons never compete with the primary.
- Animal cards show original cow image, name, species/breed, age, health and insured/secured status. A colored dot alone is insufficient.
- Status cards contain a label, date, value and next action. Financial progress is Applied → Verified → Approved → Disbursed.
- Use 44pt/48dp touch targets, safe-area padding, scrollable forms and keyboard avoidance. Role queues use native list rows/cards, not tiny desktop tables.

## Original imagery

Asset manifest and source provenance are finalized after downloads in `assets/palito`. Original photos remain data-slot images; vectors may be exported as exact assembled illustration nodes to retain Figma geometry. Do not substitute emoji or generated logos. Reference screenshots under `docs/.references` are QA artifacts, not runtime assets.

Before marking visual parity complete, verify local file existence, correct slot, crop/fit and effective geometry at its callsite. Screen screenshots contain status bars and UI; never use them to implement a screen.

## Missing screens

Reuse the established typography, green header, white cards, semantic statuses and illustrated entry points for veterinarian, bank, insurer and admin screens. Give each role relevant summaries, queue filters, detail/evidence pages and clear decisions. Keep lower-literacy farmer flows short, use readable Bangla and explain irreversible demo actions before confirming.

## Interaction states

Every screen needs intentional loading, empty, unavailable/offline, validation, confirmation and success behavior where applicable. Error messages must identify a recovery action. Simulation labels belong near demo-dependent actions, not in every visual heading. Respect reduced motion; native focus and screen-reader order follow reading order.

