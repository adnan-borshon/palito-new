# Tooling review and adoption

Checked 2026-11-15. A guidance file, connected tool and executable dependency are different. None of the planned infrastructure/provider tooling was silently installed or activated in M0.

| Item | Observed status / provenance | M0 action / next gate |
|---|---|---|
| GitHub integration | Connected; read main tree and PR #1 through the connector | Used for source verification and review delivery; local public clone used for baseline checks |
| Repository backend guidance | Reviewed PR #1 head `859a3445b9adc59edd66b8c88e021d67fabf5d8c`; blob `f95f5e49b14a061f56c7035c7069e85576c6fed8` | Adopted `.agents/skills/backend/SKILL.md` on this branch with required name/description YAML; direct AGENTS link. Original PR unmerged; auto-discovery in another client unverified. Not a personal/plugin skill installation |
| Node/npm | Runtime v24.22.1 / npm 11.9.0; repo pins Node 24.22.3, engine accepts ^24.3.0 | Record patch difference; no runtime/manifest upgrade. Exact pinned patch reproduction remains a separate check |
| Existing frontend/shared tooling | `npm ci --ignore-scripts --no-audit --no-fund` installed lockfile dependencies; no lock changes | Existing TypeScript, Expo ESLint, Jest and Node tests executed; scripts intentionally not run by installation; Next.js resolved to 16.4.6 (manifest ^16.2.1) |
| Firebase SDK/Admin/CLI/emulator | No Firebase package/configuration in this source baseline; no Firebase tools exposed in this session | Proposed M3. Official docs reviewed; no project inspected, emulator run, SMS sent or Identity Platform upgrade |
| NestJS / Prisma / PostgreSQL service | Backend empty; packages/schema/database absent | Proposed M1/M2, select compatible versions then. No fabricated migration/setup command presented as runnable |
| Microsoft postgres-skills | External collection named in source plan; not installed/reviewed at a pinned revision | Deferred before M2: inspect relevant portable guidance, LICENSE, supported agent and exact commit; no Azure assumption or guessed skills-lock entry |
| Playwright CLI/MCP | No project Playwright runner/configuration; no browser test run | Proposed M4 web journeys; select one route and commit repeatable tests. Node web domain tests are not browser E2E |
| Maestro / device checks | No attached device evidence or project Maestro setup | Proposed M3/M4/M9; no native lifecycle/accessibility claim from browser export |
| OWASP ASVS / API guidance | Reference checklist, not executable scanner | Adopted in security design; pin review version before formal M9 checklist |
| CodeQL/Semgrep + secret/dependency checks | No `.github` workflows in baseline | Proposed M1 setup, M9 triage; do not stack tools or call lint an audit |
| Existing `skills-lock.json` | Contains hallmark source/hash only | Preserved unchanged; new guidance provenance recorded here rather than inventing installer metadata |
| Claude-Mem | No tools exposed in this session | Files/source are authoritative; no claim to have retrieved unavailable history |

References for later review: [Firebase MCP](https://firebase.google.com/docs/ai-assistance/mcp-server), [PostgreSQL skills](https://github.com/microsoft/postgres-skills), [Playwright tools](https://playwright.dev/docs/getting-started-cli), [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/), [OWASP API](https://owasp.org/API-Security/). Listing a link is not verification of installed state, license or a pinned revision.

The backend guidance's protected-storage requirement is a release criterion. Do not assume the selected native SDK stores credentials safely because its API abstracts persistence. Inspect its supported storage/lifecycle and test before M3 approval; never duplicate raw refresh tokens into AsyncStorage. The web in-memory-to-cookie design avoids persistent browser Firebase credentials.
