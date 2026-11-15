import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { LoggerService } from '@nestjs/common';
import { createLogger, FrameworkLogger } from '../src/platform/logger.js';
import { testConfig } from './helpers.js';

test('structured logger redacts credential fields and does not serialize arbitrary Nest exception messages', () => {
  const lines: string[] = [];
  const logger = createLogger(testConfig({ LOG_LEVEL: 'info' }), { write: value => lines.push(value) });
  logger.info({ event: 'test', password: 'secret-password', token: 'secret-token', phone: 'private-phone', databaseUrl: 'private-db', req: { headers: { authorization: 'secret-header', cookie: 'secret-cookie' } } });
  const framework: LoggerService = new FrameworkLogger(logger);
  framework.error(new Error('arbitrary-sensitive-exception'));
  for (const sensitive of ['secret-password', 'secret-token', 'private-phone', 'private-db', 'secret-header', 'secret-cookie']) assert.ok(!lines.join('').includes(sensitive));
  assert.equal(JSON.parse(lines[0]!).password, '[REDACTED]');
  assert.ok(lines.every(line => JSON.parse(line).service === 'palito-api'));
  assert.ok(!lines.join('').includes('arbitrary-sensitive-exception'));
});
