import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../src/platform/config.js';
import { testConfig } from './helpers.js';

test('configuration requires PostgreSQL and bounded numeric/enum values without leaking input', () => {
  assert.throws(() => loadConfig({}), /DATABASE_URL/);
  for (const env of [{ PORT: '0' }, { PORT: '' }, { DATABASE_URL: 'mysql://secret:password@host/db' }, { RATE_LIMIT_MAX: '-1' }, { BODY_LIMIT_BYTES: 'NaN' }, { AUTH_MODE: 'demo' }, { DEMO_MODE: 'true' }, { LOG_LEVEL: 'nonsense' }]) {
    assert.throws(() => testConfig(env), error => error instanceof Error && error.message.startsWith('Invalid configuration fields:') && !error.message.includes('password'));
  }
});

test('CORS uses exact origins and production forbids insecure development configuration', () => {
  for (const CORS_ORIGINS of ['*', 'https://example.com/path', 'https://user:secret@example.com', 'https://example.com/']) assert.throws(() => testConfig({ CORS_ORIGINS }));
  const production = { NODE_ENV: 'production', WEB_ORIGIN: 'https://palito.example', DATABASE_URL: 'postgresql://palito_runtime:secret@db/palito?sslmode=verify-full', CORS_ORIGINS: 'https://palito.example' };
  assert.equal(testConfig(production).SWAGGER_ENABLED, false);
  assert.equal(testConfig(production).FINANCE_SANDBOX_ENABLED, false);
  assert.equal(testConfig(production).NOTIFICATION_CHANNEL_MODE, 'in-app-only');
  for (const env of [
    { SWAGGER_ENABLED: 'true' },
    { FIREBASE_AUTH_EMULATOR_HOST: 'localhost:9099' },
    { PAYMENT_PROVIDER: 'sandbox' },
    { FINANCE_SANDBOX_ENABLED: 'true' },
    { NOTIFICATION_CHANNEL_MODE: 'sandbox' },
    { SANDBOX_WEBHOOK_SECRET: 'sandbox-webhook-secret-16+' },
    { CORS_ORIGINS: 'http://localhost:3000' },
    { DATABASE_URL: 'postgresql://user:secret@db/palito' },
  ]) assert.throws(() => testConfig({ ...production, ...env }));
  assert.throws(() => testConfig({ SANDBOX_WEBHOOK_SECRET: 'too-short' }), /SANDBOX_WEBHOOK_SECRET/);
  assert.throws(() => testConfig({ NOTIFICATION_CHANNEL_MODE: 'sms-live' }), /NOTIFICATION_CHANNEL_MODE/);
  const defaults = testConfig();
  assert.equal(defaults.FINANCE_SANDBOX_ENABLED, false);
  assert.equal(defaults.NOTIFICATION_CHANNEL_MODE, 'in-app-only');
  assert.equal(defaults.WORKER_ENABLED, false);
  assert.equal(defaults.WORKER_POLL_MS, 5000);
  assert.equal(defaults.WORKER_BATCH_SIZE, 25);
  const config = testConfig({ CORS_ORIGINS: 'http://localhost:3000' });
  assert.ok(Object.isFrozen(config)); assert.ok(Object.isFrozen(config.CORS_ORIGINS));
  assert.throws(()=>testConfig({NODE_ENV:'development'}),/dedicated palito_runtime role/);
  assert.doesNotThrow(()=>testConfig({NODE_ENV:'development',DATABASE_URL:'postgresql://palito_runtime:local@127.0.0.1/palito_dev'}));
});

test('compiled startup exits nonzero for invalid configuration and names only invalid fields', () => {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('../src/main.js', import.meta.url))], {
    env: { ...process.env, NODE_ENV: 'test', DATABASE_URL: 'not-a-url-private-value', PORT: 'invalid-private-port' }, encoding: 'utf8', timeout: 20000,
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Invalid configuration fields: PORT, DATABASE_URL/);
  assert.ok(!result.stderr.includes('not-a-url-private-value'));
  assert.ok(!result.stderr.includes('invalid-private-port'));
});
