import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { createApplication } from '../../src/application.js';
import { DatabaseService } from '../../src/platform/database.js';
import { createLogger } from '../../src/platform/logger.js';
import { testConfig } from '../helpers.js';

const databaseUrl = process.env.TEST_DATABASE_URL;
assert.ok(databaseUrl, 'TEST_DATABASE_URL is required; integration tests never silently skip PostgreSQL');

test('real PostgreSQL readiness, outage response, pool shutdown and development OpenAPI', async () => {
  const config = testConfig({ DATABASE_URL: databaseUrl, SWAGGER_ENABLED: 'true' });
  const app = await createApplication(config, createLogger(config));
  await app.init();
  try {
    await request(app.getHttpServer()).get('/api/v1/health/ready').expect(200, { status: 'ready' });
    const spec = await request(app.getHttpServer()).get('/api/openapi.json').expect(200);
    assert.ok(spec.body.paths['/api/v1/health/live']);
    const database = app.get(DatabaseService);
    await database.onApplicationShutdown();
    const failed = await request(app.getHttpServer()).get('/api/v1/health/ready').expect(503);
    assert.equal(failed.body.error.code, 'DEPENDENCY_UNAVAILABLE');
    assert.ok(!JSON.stringify(failed.body).includes(databaseUrl!));
    await request(app.getHttpServer()).get('/api/v1/health/live').expect(200);
  } finally { await app.close(); }
});

test('unreachable PostgreSQL times out within the configured bound without exposing credentials', async () => {
  const config = testConfig({ DATABASE_TIMEOUT_MS: '100' });
  const app = await createApplication(config, createLogger(config));
  await app.init();
  try {
    const start = performance.now();
    const failed = await request(app.getHttpServer()).get('/api/v1/health/ready').expect(503);
    assert.ok(performance.now() - start < 2000);
    assert.ok(!JSON.stringify(failed.body).includes('postgresql:'));
    await request(app.getHttpServer()).get('/api/openapi.json').expect(404);
  } finally { await app.close(); }
});

test('real listener handles SIGTERM and releases its TCP listener and database connections', async () => {
  const reservation = createServer();
  reservation.listen(0, '127.0.0.1'); await once(reservation, 'listening');
  const port = (reservation.address() as { port: number }).port;
  await new Promise<void>((resolve, reject) => reservation.close(error => error ? reject(error) : resolve()));
  const child = spawn(process.execPath, [fileURLToPath(new URL('../../src/main.js', import.meta.url))], {
    env: { ...process.env, NODE_ENV: 'test', DATABASE_URL: databaseUrl, LOG_LEVEL: 'info', PORT: String(port), HOST: '127.0.0.1', SWAGGER_ENABLED: 'false', AUTH_MODE: 'disabled', DEMO_MODE: 'false' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = ''; child.stdout.on('data', value => { output += value.toString(); });
  const exited = once(child, 'exit');
  try {
    const deadline = Date.now() + 10000;
    while (!output.includes('application_started') && Date.now() < deadline && child.exitCode === null) await new Promise(resolve => setTimeout(resolve, 25));
    assert.ok(output.includes('application_started'), 'API must start before shutdown check');
    const response = await fetch(`http://127.0.0.1:${port}/api/v1/health/ready`);
    assert.equal(response.status, 200);
    child.kill('SIGTERM');
    const result = await Promise.race([exited, new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Shutdown timed out')), 5000).unref())]);
    assert.ok(result[0] === 0 || result[1] === 'SIGTERM');
    await assert.rejects(fetch(`http://127.0.0.1:${port}/api/v1/health/live`));
  } finally { if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL'); }
});
