> Current M3 update (2026-11-15): Firebase identity/session paths and opt-in `/identity` client screens are implemented. M3 is **in progress**, not complete. Read [identity checkpoint](identity.md) for exact endpoints, setup, actual tests and unfinished staff/native/provider gates. Earlier milestone descriptions below remain historical or proposed unless superseded there.

# Tooling review and adoption

Updated for M2, 2026-11-15. A guidance file, connected tool and executable dependency are different. M0 status is retained where relevant; M1 installed only the explicit backend/web-lint dependencies and configured development/CI checks. No provider/cloud services were activated.

| Item | Observed status / provenance | M0 action / next gate |
|---|---|---|
| GitHub integration | Connected; read main tree and PR #1 through the connector | Used for source verification and review delivery; local public clone used for baseline checks |
| Repository backend guidance | Reviewed PR #1 head `859a3445b9adc59edd66b8c88e021d67fabf5d8c`; blob `f95f5e49b14a061f56c7035c7069e85576c6fed8` | Adopted `.agents/skills/backend/SKILL.md` on this branch with required name/description YAML; direct AGENTS link. Original PR unmerged; auto-discovery in another client unverified. Not a personal/plugin skill installation |
| Node/npm | Runtime v24.22.1 / npm 11.9.0; repo pins Node 24.22.3, engine accepts ^24.3.0 | Record patch difference; no runtime/manifest upgrade. Exact pinned patch reproduction remains a separate check |
| Existing frontend/shared tooling | `npm ci --ignore-scripts --no-audit --no-fund` installed lockfile dependencies; no lock changes | Existing TypeScript, Expo ESLint, Jest and Node tests executed; scripts intentionally not run by installation; Next.js resolved to 16.4.6 (manifest ^16.2.1) |
| Firebase SDK/Admin/CLI/emulator | No Firebase package/configuration in this source baseline; no Firebase tools exposed in this session | Proposed M3. Official docs reviewed; no project inspected, emulator run, SMS sent or Identity Platform upgrade |
| NestJS / Prisma / PostgreSQL service | NestJS 12.5.0 and pg 8.23.1 installed/locked; development Compose PostgreSQL 18.7; local disposable tests used 18.6 binaries | M1 implemented/tested foundation connectivity. Prisma CLI/client/adapter 7.10.1 are installed and locked; two migrations and the core schema are implemented in M2. Docker runtime unavailable locally; see checkpoint for CI evidence |
| Microsoft postgres-skills | External collection named in source plan; not installed/reviewed at a pinned revision | Deferred before M2: inspect relevant portable guidance, LICENSE, supported agent and exact commit; no Azure assumption or guessed skills-lock entry |
| Playwright CLI/MCP | No project Playwright runner/configuration; no browser test run | Proposed M4 web journeys; select one route and commit repeatable tests. Node web domain tests are not browser E2E |
| Maestro / device checks | No attached device evidence or project Maestro setup | Proposed M3/M4/M9; no native lifecycle/accessibility claim from browser export |
| OWASP ASVS / API guidance | Reference checklist, not executable scanner | Adopted in security design; pin review version before formal M9 checklist |
| CodeQL + Gitleaks + dependency checks | M1 workflows added with verified SHA-pinned actions; Gitleaks 8.30.1 local staged-tree scan; npm audit high/critical gate | Local scan/check outcomes and hosted execution are distinct; no complete security audit claimed. No Semgrep duplicate |
| Existing `skills-lock.json` | Contains hallmark source/hash only | Preserved unchanged; new guidance provenance recorded here rather than inventing installer metadata |
| Claude-Mem | No tools exposed in this session | Files/source are authoritative; no claim to have retrieved unavailable history |

References for later review: [Firebase MCP](https://firebase.google.com/docs/ai-assistance/mcp-server), [PostgreSQL skills](https://github.com/microsoft/postgres-skills), [Playwright tools](https://playwright.dev/docs/getting-started-cli), [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/), [OWASP API](https://owasp.org/API-Security/). Listing a link is not verification of installed state, license or a pinned revision.

The backend guidance's protected-storage requirement is a release criterion. Do not assume the selected native SDK stores credentials safely because its API abstracts persistence. Inspect its supported storage/lifecycle and test before M3 approval; never duplicate raw refresh tokens into AsyncStorage. The web in-memory-to-cookie design avoids persistent browser Firebase credentials.

## M1 compatibility/provenance

[NestJS 12 migration guide](https://docs.nestjs.com/migration-guide) documents ESM and TypeScript 6 support; core/common/platform-express/testing 12.5.0 and Swagger 12.1.2 peer ranges were verified with npm metadata. Node 24.22.x meets the supported runtime. The official [Prisma requirements](https://docs.prisma.io/docs/orm/reference/system-requirements) and stable 7.x versions were inspected; 8.0.0-rc.33 was not adopted. M2 now introduces the core schema and explicitly generated ignored client; no unused finance/provider modules are scaffolded.

[Official PostgreSQL image docs](https://github.com/docker-library/docs/blob/master/postgres/README.md) list 18.7-alpine; the 18.x volume mounts at `/var/lib/postgresql`. [Version policy](https://www.postgresql.org/support/versioning/) recommends current minor releases. The temporary binary package `@embedded-postgres/linux-x64@18.6.0-beta.19` contains real PostgreSQL 18.6 and was used only outside the repository for local checks, not added to its dependencies.

Verified action refs on 2026-11-15: checkout v6 `d23441a48e516b6c34aea4fa41551a30e30af803`; setup-node v6 `249970729cb0ef3589644e2896645e5dc5ba9c38`; CodeQL v4 resolved annotated tag to commit `33d7b85da1a04171e211befe2c739303b9a4c066`; Gitleaks v3 `e0c47f4f8be36e29cdc102c57e68cb5cbf0e8d1e`. Gitleaks comments/artifact uploads are disabled. The [Gitleaks action](https://github.com/gitleaks/gitleaks-action) is available to this personal repository without an organization license; no license/service was bought.

## PostgreSQL guidance reviewed for M2

Reviewed Microsoft postgres-skills at commit `b7908c0b53b2a292fb8286d4d4bdba7ea4690291`: MIT license, plugin packaging supports Codex/Claude/Copilot, and generic advanced-indexing/connection-management references. Adopted portable guidance on scoped multicolumn B-tree ordering, unique/exclusion constraints, pool fan-out and distinct connection/query/idle-transaction limits. Source: [pinned repository](https://github.com/microsoft/postgres-skills/tree/b7908c0b53b2a292fb8286d4d4bdba7ea4690291).

The external plugin's connection workflow depends on postgres-mcp, which is not exposed/installed here. It was reviewed, not installed or claimed operational; no Azure control plane, PostgreSQL MCP connection, telemetry or new personal skill was activated. This task uses the explicitly authorized local/CI PostgreSQL development workflow and official PostgreSQL/Prisma documentation. Primary references: [constraints](https://www.postgresql.org/docs/18/ddl-constraints.html), [Prisma v7 migration customization](https://docs.prisma.io/docs/orm/v7/prisma-migrate/workflows/customizing-migrations), [Prisma generation](https://docs.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/generating-prisma-client).

## M3 SDK/dependency review

Firebase Admin 14.5.1 supports Node >=22; Firebase web 13.3.0 and matching React Native Firebase app/auth 27.1.1 are pinned. Native peer metadata supports the installed React Native/Expo range; this is not a native build/device result. Official Auth emulator CLI 15.36.0 is invoked explicitly in development/CI and is not a backend production dependency.

Client SDK Firestore dependencies (unused by the auth implementation) resolved an older gRPC 1.9.x with GHSA-m9gg-hp2v-232j/GHSA-f596-whhp-79r4. Root override selects patched same-major @grpc/grpc-js 1.14.7; the original Firebase and Expo versions are retained rather than accepting automatic major downgrades. [Upstream advisory](https://github.com/advisories/GHSA-m9gg-hp2v-232j) identifies patched 1.13.6/1.14.5. Verify the final lockfile, audit and build evidence before accepting this override.
