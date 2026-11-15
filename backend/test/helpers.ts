import { Test } from '@nestjs/testing';
import type { Type } from '@nestjs/common';
import { AppModule } from '../src/app.module.js';
import { configureApplication } from '../src/application.js';
import { loadConfig } from '../src/platform/config.js';
import { createLogger } from '../src/platform/logger.js';
import { DatabaseService } from '../src/platform/database.js';

export function testConfig(overrides: NodeJS.ProcessEnv = {}) {
  return loadConfig({ NODE_ENV: 'test', DATABASE_URL: 'postgresql://test:test@127.0.0.1:1/test', LOG_LEVEL: 'silent', ...overrides });
}
export async function harness(options: { env?: NodeJS.ProcessEnv; controllers?: Type[]; ping?: () => Promise<void>; log?: (value: string) => void } = {}) {
  const config = testConfig(options.env);
  const logger = createLogger({ ...config, LOG_LEVEL: options.log ? 'info' : 'silent' }, options.log ? { write: options.log } : undefined);
  const module = await Test.createTestingModule({ imports: [AppModule.register(config, logger)], controllers: options.controllers ?? [] })
    .overrideProvider(DatabaseService).useValue({ ping: options.ping ?? (async () => {}) }).compile();
  const app = module.createNestApplication({ bodyParser: false, logger: false });
  configureApplication(app, config, logger);
  await app.init();
  return { app, config };
}
