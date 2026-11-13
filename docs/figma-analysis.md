# Palito Figma mobile analysis

Updated 2026-11-14. Design source: [ALL SCREENS](https://www.figma.com/design/gO7Dw9643GnykZaLhGCidh?node-id=24466-64175), file `gO7Dw9643GnykZaLhGCidh`. All 56 eligible mobile variants are recorded in screen-inventory.md. Existing web designs are outside this phase.

## Source evidence retained locally

High-fidelity context was requested using the Figma design-to-code skill, with screenshot included. Context text and screenshots are ignored QA references under `docs/.references/figma`; they must never be imported into runtime code.

| Feature | Node | Context reference | Screenshot reference | Quality / findings |
|---|---|---|---|---|
| Welcome | 24466:64177 | 24466-64177.md | 24466-64177.png | Full context; 375×812 reference; original orbit/logo |
| Farmer home | 24466:64665 | 24466-64665.md | 24466-64665.png | Full context; long source 375×2595, screenshot scaled to 148×1024; use context for exact spacing/type |
| Animal vitals | 24466:65272 | 24466-65272.md | 24466-65272.png | Full context; 375×966; tabs, forecast notice, metrics and chart |
| Vet category | 24466:68193 | 24466-68193.md | 24466-68193.png | Full context; 375×812; original illustration |
| Loan collateral | 24466:65462 | 24466-65462.md | 24466-65462.png | Full context; source 375×1067, image scaled to 360×1024 |
| Vet profile heading | 24466:67236 | 24466-67236.md | 24466-67236.png | Full child context; 343×138; verified name, specialty and rating layout |

The whole vet profile 24466:67229 had previously returned sparse hierarchy. Its children must be used for high-fidelity implementation. The header child above is refreshed; other detail/rating sections need source review when access returns.

## External source limitation

On 2026-11-14, Figma returned its Starter-plan MCP call limit while refreshing 24466:65575 (insurance enrollment), 24466:66465 (loan offer) and a larger home screenshot. The corresponding .md files contain the error, **not design context**. Do not use them as implementation references or claim complete visual verification. The frame inventory and prior source observations remain available, along with collateral/home patterns. Continue missing views in the documented brand; identify unverified visual parity.

## Canonical design findings

- Home: deep green greeting/location header and three herd metrics; red urgent alert; two-column shortcuts; white animal cards; vet avatars; medication and disease-awareness illustration cards; AI message; learning cards and support illustration.
- Animal: green header, original cow identity card, purple AI warning, Health / Records / Finance tabs, white current metrics and seven-day chart. Health values must be livestock-specific and correctly labeled.
- Finance: green heading, compact amber explanatory card, animal eligibility/selection cards, reason for unavailable collateral, strong primary CTA. Values and stages must derive from shared state.
- Care: white/light background, bold Bangla headline, original phone/vet illustration and species choice; vet identity/rating with an accessible booking action.
- AI: green voice bubble, restrained green bot treatment and simple readable conversation. Human blood-pressure/psoriasis and VPN text are template residue and excluded.

## Local asset provenance

All following images come from original Figma source images or an exact export of the indicated illustration node. They are not screenshots of application screens. Binary file signatures were checked; JPEG source images were saved with .jpg even where the temporary URL ended in .png.

| Manifest key | Local file under assets/palito/images | Figma source | Intended slot |
|---|---|---|---|
| mark | palito-mark.png | 24466:64186 export | Original green mark; PNG includes shadow overflow |
| onboarding | onboarding-orbit.png | 24466:64179 export | Welcome illustration; no form/text/buttons included |
| cow | cow.jpg | Home/vitals imgFrame c82fa | Animal identity thumbnail and sample gallery |
| farmerAvatar | farmer-avatar.png | Home imgSizeSmTypeImageIndicatorNone a0e0c | Farmer avatar |
| vetAvatar1 | vet-avatar-1.png | Home imgAvatar 7924b | First vet portrait; cover/circle crop per source |
| vetAvatar2 | vet-avatar-2.jpg | Home imgAvatar1 37c28 | Second vet portrait |
| vetAvatar3 | vet-avatar-3.jpg | Home imgAvatar2 fe2ef | Third vet portrait |
| vetAvatar4 | vet-avatar-4.jpg | Home imgAvatar3 fd5bc | Fourth vet portrait |
| vetAvatar5 | vet-avatar-5.jpg | Home imgAvatar4 11822 | Fifth vet portrait |
| vetConsultation | vet-consultation.png | 24466:68199 export | 309×224 care entry illustration |
| medication | medication.png | 24466:64737 export | Medication card, source 96px art slot; export includes overflow |
| diseaseAwareness | disease-awareness.png | 24466:64772 export | Disease awareness card, 311×166 |
| support | support.png | 24466:64899 export | Support card, source 96px art slot; export includes overflow |
| articleFarm | article-farm.jpg | Home imgFrame1 becea | Livestock farm article cover |
| articleCattle | article-cattle.jpg | Home imgFrame2 84129 | Second livestock article cover |
| articleAuthor | article-author.png | Home imgAvatar5 83182 | Article author avatar |

Exact exported art geometry: onboarding PNG 375×397 includes visible source overflow around a 343×328 illustration frame. Mark PNG 112×112 includes shadow overflow around a 64×64 source mark. Preserve intrinsic aspect and optical bounds rather than stretching exported art to a square crop. Do not invent a new logo.

Fonts: official Expo Google Fonts source paths `anek-bangla/{400Regular,500Medium,600SemiBold,700Bold}` and `plus-jakarta-sans/{400Regular,600SemiBold,700Bold}`, downloaded 2026-11-14. Their SIL Open Font Licenses are bundled in fonts/LICENSE-AnekBangla.txt and fonts/LICENSE-PlusJakartaSans.txt. Seven TTF headers verified; runtime asset map is manifest.ts.

## Remaining fidelity work

Bundled major imagery is ready. Fine decorative SVG icons, full vet profile imagery, financial illustrations and other unseen static assets require source access/inspection before claiming exact parity. Use current canonical refs and shared native icon system for required functional controls; document each source gap. No production screenshot can substitute for those assets. At final QA verify file, slot, callsite and rendered geometry for every used image.

