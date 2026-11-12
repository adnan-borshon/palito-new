# Palito

An Expo SDK 58 starter for Android, iOS, and the web, using React Native,
React Native Web, Expo Router, and strict TypeScript.

## Run locally

Use Node 24 LTS. This project pins Node 24.22.3 in `.nvmrc` and `.node-version`.
With nvm-windows:

```powershell
nvm use 24.22.3
npm install
npm start
```

If this is a new machine, run `nvm install 24.22.3` first. To select Node only
for the current terminal session, you can instead use:

```powershell
$env:Path = "$env:NVM_HOME\v24.22.3;" + $env:Path
```

| Command | Purpose |
| --- | --- |
| `npm start` | Start the Expo development server |
| `npm run web` | Open the web app |
| `npm run android` | Open an Android emulator or connected device |
| `npm run ios` | Open the iOS simulator on macOS |
| `npm run typecheck` | Check TypeScript without emitting files |
| `npm run lint` | Run Expo's ESLint configuration |
| `npm run doctor` | Check Expo project health |
| `npm run export:web` | Produce the web build in `dist/` |

Use an Expo Go release compatible with SDK 58 or a development build for device
testing. See [Expo's current setup guidance](https://docs.expo.dev/get-started/create-a-project/).
Running an iOS simulator locally requires macOS; web and Android development work
on Windows.

## Project layout

- `src/app/`: Expo Router routes. Start with `index.tsx`; `_layout.tsx` configures navigation.
- `src/components/`: Shared components and platform-specific variants.
- `src/constants/theme.ts`: Theme colors, spacing, and typography.
- `src/hooks/`: Theme and platform hooks.
- `assets/`: Images, icons, and splash assets.
- `app.json`: App identity and Expo platform configuration.

The official starter includes Home and Explore screens, light/dark themes,
typed routes, and React Compiler. Imports can use the `@/` alias for `src/`.
The web output uses Expo's server mode. The `dist/` folder includes client and
server output; use an Expo-compatible host to deploy it.

## Codex tools and skills

Project skills:

- `.agents/skills/frontend-design/`
- `.agents/skills/vercel-react-native-skills/`
- `.agents/skills/web-design-guidelines/`
- `.agents/skills/ui-ux-pro-max/`

Global integrations are configured in the local Codex profile, independently
of the application dependencies: Expo, Figma, Playwright, and the 21st.dev CLI
and skills. Credentials belong to each tool's local credential store.

To inspect or reconnect them:

```powershell
codex mcp list
codex mcp login expo
codex mcp login figma
21st login
```

New skills become available on the next Codex turn. Reopen Codex if newly added
MCP tools are not visible in the current session.

## Validation

```powershell
npm run typecheck
npm run lint
npx expo install --check
npm run doctor
npm run export:web
```

The template's optional `npm run reset-project` command moves the example app
into `example/` and creates a blank route folder. Keep the starter until you are
ready to replace it.
