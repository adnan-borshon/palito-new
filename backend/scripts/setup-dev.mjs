import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const path = fileURLToPath(new URL('../.env', import.meta.url));
const password = randomBytes(32).toString('hex');
const values = [
  'NODE_ENV=development', 'HOST=127.0.0.1', 'PORT=4000',
  'POSTGRES_USER=palito_dev', `POSTGRES_PASSWORD=${password}`, 'POSTGRES_DB=palito_dev', 'POSTGRES_PORT=5432',
  `DATABASE_URL=postgresql://palito_dev:${password}@127.0.0.1:5432/palito_dev`,
  'CORS_ORIGINS=http://localhost:3000,http://localhost:8081',
  'LOG_LEVEL=info', 'AUTH_MODE=disabled', 'DEMO_MODE=false', 'SWAGGER_ENABLED=true', '',
];
try {
  writeFileSync(path, values.join('\n'), { flag: 'wx', mode: 0o600 });
  console.log('Created backend/.env with random development credentials. Never commit it.');
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
  console.log('backend/.env already exists; left unchanged.');
}
