import { writeFileSync } from 'node:fs';
import { createApplication, createOpenApi } from '../dist/application.js';
import { loadConfig } from '../dist/platform/config.js';
import { createLogger } from '../dist/platform/logger.js';

const config = loadConfig(process.env);
const app = await createApplication(config, createLogger({ ...config, LOG_LEVEL: 'silent' }));
try {
  writeFileSync(new URL('../openapi.json', import.meta.url), JSON.stringify(createOpenApi(app), null, 2) + '\n');
  console.log('Generated backend/openapi.json');
} finally { await app.close(); }
