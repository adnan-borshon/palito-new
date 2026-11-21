# Palito

Palito is a Bangla-first livestock care platform for farmers, veterinarians, banks, insurers and administrators. The Next.js web app and Expo mobile app share TypeScript workflows. The NestJS API stores business records in PostgreSQL and uses Firebase for identity.

**Start with the web app at `/identity` to try the database-backed workflow.** The regular role dashboards at `/login` use a local demo store. Changes made there stay in that browser or app installation.

## Start locally with PostgreSQL

Install Git, Node.js **24.22.3**, npm and Docker with Compose v2. Start Docker Desktop if you use Windows. The commands below also work in PowerShell. Use a local development database.

### 1. Install and prepare the database

```sh
git clone https://github.com/adnan-borshon/palito-new.git
cd palito-new
npm ci --ignore-scripts --no-audit --no-fund
npm run setup:backend
npm run db:up --workspace @palito/backend
npm run db:bootstrap
npm run db:migrate
```

Setup creates `backend/.env` with generated local passwords. Bootstrap creates the database roles. Migrate installs the schema. Keep that file private and keep the generated database URLs when editing it.

### 2. Connect local sign-in

In `backend/.env`, update or add the following settings, keeping one entry per key.

```dotenv
AUTH_MODE=emulator
FIREBASE_PROJECT_ID=demo-palito
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
WEB_ORIGIN=http://localhost:3000
```

Create `frontend/web/.env.local` with these local emulator settings.

```dotenv
PALITO_API_ORIGIN=http://127.0.0.1:4000
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-palito
NEXT_PUBLIC_FIREBASE_API_KEY=synthetic-emulator-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-palito.firebaseapp.com
NEXT_PUBLIC_AUTH_EMULATOR=true
```

### 3. Start the app

Run each command from the repository root. Keep the terminals open.

| Terminal | Command |
|---|---|
| 1 · Firebase Auth emulator | `npm exec --yes --ignore-scripts --package firebase-tools@15.36.0 -- firebase emulators:start --config backend/firebase.json --project demo-palito --only auth --export-on-exit=backend/.firebase-local` |
| 2 · Palito API | `npm run dev:backend` |
| 3 · Next.js web app | `npm run dev:web` |

Open [database readiness](http://127.0.0.1:4000/api/v1/health/ready). A ready response means the API can query PostgreSQL. After the first graceful emulator shutdown, add `--import=backend/.firebase-local` to terminal 1's command on subsequent starts to keep the same emulator identities. The export contains local sign-in data and is ignored by Git.

### 4. Load sample records and sign in

With PostgreSQL and the Auth emulator running, temporarily add these settings to `backend/.env`. Choose a password of at least 12 characters for local staff sign-in.

```dotenv
SEED_SYNTHETIC=true
LOCAL_SAMPLE_STAFF_PASSWORD=choose-a-local-only-password
```

Run `npm run db:seed:local` from the repository root, then set `SEED_SYNTHETIC=false`. You can run the seed again with the flag enabled. It keeps the same records and does not reset existing emulator passwords or MFA enrollment.

| Role | Local sign-in details |
|---|---|
| Farmer | `+8801700000101`, owns **Shapla Farm** and **Shapla** |
| Second farmer | `+8801700000102`, owns **Doyel Farm** and **Doyel** |
| Veterinarian | `vet@palito.example`, MFA phone `+8801700000111` |
| Bank staff | `bank@palito.example`, MFA phone `+8801700000112` |
| Insurance staff | `insurer@palito.example`, MFA phone `+8801700000113` |
| Administrator | `admin@palito.example`, MFA phone `+8801700000114` |

- **Farmer:** Open [verified sign-in](http://localhost:3000/identity). Enter a name and the sample phone number, consent and request a code. Get the code from the Auth emulator terminal, then open **Farm & care**. You can also skip the seed and sign up with a different synthetic phone to start with an empty farm list.
- **Staff:** Open [staff sign-in](http://localhost:3000/identity/staff). Sign in with the sample email and your local staff password. On the first visit, enter the matching MFA phone, choose **Enroll SMS MFA** and verify the code from the emulator terminal. Sign in again, verify the MFA sign-in code and choose **Open staff session**. Sample memberships are already active. The emulator handles both verification flows locally.

### 5. Verify that records persist

As the first sample farmer, open **Farm & care** → **Add farm** and save a uniquely named farm. Refresh, then sign in as the same farmer in a private browser window. The farm should appear in both sessions. The second farmer should see only their own farms.

## Other entry points

| Goal | How to start |
|---|---|
| Explore mobile role designs with local examples | `npm start` starts Expo. `npm run web` opens the Expo browser preview. |
| Explore the web role demo | Run `npm run dev:web`, open `/login` and follow the labeled demo sign-in. |
| Use verified native sign-in | Use a configured native development build, platform Firebase files and a reachable HTTPS API. See the [identity guide](docs/backend/identity.md). |
| Process reminders and notifications | With PostgreSQL and the API configured, run `npm run worker --workspace @palito/backend` in another terminal. |
| Try lending and insurance | The verified `/finance` workspace uses database records and opt-in simulated payments. See [lending](docs/backend/lending-m6.md) and [insurance](docs/backend/insurance-m7.md) for flags, role setup and provider configuration. |

## Troubleshooting

- **I see role switching or the fixed demo code.** Open `http://localhost:3000/identity`. Use `npm run dev:web` for Next.js.
- **Sign-in or API calls fail.** Confirm the emulator and API terminals are running, check database readiness, and restart the API and Next.js after editing env files. Use `localhost:3000` consistently for the web session.
- **The API is alive but readiness returns 503.** Check Docker is running, run `npm run db:up --workspace @palito/backend`, and check bootstrap and migration output. Keep the generated credentials paired with their Docker volume.
- **Stop and resume.** Stop the terminals with Ctrl+C. Run `npm run db:down --workspace @palito/backend` to stop PostgreSQL and retain the development volume. Start it again with the same db:up command. Stop the Auth emulator with Ctrl+C so it saves its export. Use the import option above when restarting it.

## Project checks

From the root, run `npm run lint:all`, `npm run typecheck` and `npm test`. Database integration tests require a disposable PostgreSQL database and the Auth emulator. See the [CI workflow](.github/workflows/ci.yml) for the full setup. The [backend guide index](docs/backend/README.md) covers the API, worker, migrations, security and pilot readiness.
