import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { IsString, MaxLength } from 'class-validator';
import request from 'supertest';
import { Public } from '../src/platform/auth.js';
import { HealthController } from '../src/health/health.controller.js';
import { createOpenApi } from '../src/application.js';
import { harness } from './helpers.js';

class InputDto { @IsString() @MaxLength(40) name!: string; }
@Controller('probe')
class ProbeController {
  @Get() privateRoute() { return { shouldNeverBePublic: true }; }
  @Public() @Post('validate') validate(@Body() body: InputDto) { return { name: body.name }; }
  @Public() @Get('fault') fault() { throw new Error('Bearer secret-token phone +8801712345678 sql=SELECT password'); }
}

test('health/live is independent, ready tracks database and draining; OpenAPI describes actual health routes', async () => {
  let available = true;
  const { app } = await harness({ ping: async () => { if (!available) throw new Error('database credential'); } });
  try {
    await request(app.getHttpServer()).get('/api/v1/health/live').expect(200, { status: 'ok' });
    await request(app.getHttpServer()).get('/api/v1/health/ready').expect(200, { status: 'ready' });
    available = false;
    const unavailable = await request(app.getHttpServer()).get('/api/v1/health/ready').expect(503);
    assert.equal(unavailable.body.error.code, 'DEPENDENCY_UNAVAILABLE');
    assert.ok(!JSON.stringify(unavailable.body).includes('credential'));
    await request(app.getHttpServer()).get('/api/v1/health/live').expect(200);
    available = true;
    await request(app.getHttpServer()).get('/api/v1/health/ready').expect(200);
    app.get(HealthController).beforeApplicationShutdown();
    await request(app.getHttpServer()).get('/api/v1/health/ready').expect(503);
    const spec = createOpenApi(app);
    assert.ok(spec.paths['/api/v1/health/live']?.get);
    assert.ok(spec.paths['/api/v1/health/ready']?.get?.responses?.['503']);
  } finally { await app.close(); }
});

test('global guard denies missing, forged and demo credentials; unknown paths return safe 404', async () => {
  const { app } = await harness({ controllers: [ProbeController] });
  try {
    for (const authorization of ['', 'Bearer forged-token', 'Bearer 123456', 'Basic fake', 'Bearer one two']) {
      const response = await request(app.getHttpServer()).get('/api/v1/probe').set('Authorization', authorization).expect(401);
      assert.equal(response.body.error.code, 'UNAUTHENTICATED');
      assert.ok(!JSON.stringify(response.body).includes(authorization || 'shouldNeverBePublic'));
    }
    await request(app.getHttpServer()).get('/missing?token=private').expect(404);
  } finally { await app.close(); }
});

test('HTTP envelope, headers, strict DTO, malformed/oversized JSON and CORS all use the shared boundary', async () => {
  const lines: string[] = [];
  const { app } = await harness({ controllers: [ProbeController], env: { CORS_ORIGINS: 'http://localhost:3000', BODY_LIMIT_BYTES: '1024' }, log: value => lines.push(value) });
  try {
    const ok = await request(app.getHttpServer()).post('/api/v1/probe/validate').send({ name: 'Farmer' }).expect(201);
    assert.equal(ok.body.name, 'Farmer');
    assert.equal(ok.headers['x-content-type-options'], 'nosniff');
    assert.equal(ok.headers['cache-control'], 'no-store');
    assert.equal(ok.headers['x-powered-by'], undefined);
    assert.match(ok.headers['x-request-id']!, /^[\da-f-]{36}$/);
    for (const body of [{ name: 9 }, { name: 'Farmer', role: 'admin' }, {}]) await request(app.getHttpServer()).post('/api/v1/probe/validate').send(body).expect(400);
    await request(app.getHttpServer()).post('/api/v1/probe/validate').set('Content-Type', 'application/json').send('{"password":"never-log"').expect(400);
    const oversized = await request(app.getHttpServer()).post('/api/v1/probe/validate').send({ name: 'x'.repeat(2048), password: 'never-log' }).expect(413);
    assert.equal(oversized.body.error.code, 'PAYLOAD_TOO_LARGE');
    const fault = await request(app.getHttpServer()).get('/api/v1/probe/fault?token=never-log').set('Cookie', 'session=never-log').set('X-Request-Id', 'never-log').expect(500);
    assert.equal(fault.body.error.requestId, fault.headers['x-request-id']);
    assert.ok(!JSON.stringify(fault.body).includes('secret-token'));
    const allowed = await request(app.getHttpServer()).get('/api/v1/health/live').set('Origin', 'http://localhost:3000').expect(200);
    assert.equal(allowed.headers['access-control-allow-origin'], 'http://localhost:3000');
    const denied = await request(app.getHttpServer()).get('/api/v1/health/live').set('Origin', 'https://evil.example').expect(403);
    assert.equal(denied.headers['access-control-allow-origin'], undefined);
    await request(app.getHttpServer()).options('/api/v1/probe/validate').set('Origin', 'http://localhost:3000').set('Access-Control-Request-Method', 'POST').expect(204);
    assert.ok(!lines.join('').includes('never-log'));
    assert.ok(!lines.join('').includes('+8801712345678'));
    assert.ok(!lines.join('').includes('secret-token'));
  } finally { await app.close(); }
});

test('rate limits reject requests without disabling liveness probes', async () => {
  const { app } = await harness({ controllers: [ProbeController], env: { RATE_LIMIT_MAX: '2' } });
  try {
    for (let i = 0; i < 2; i++) await request(app.getHttpServer()).get('/api/v1/probe').expect(401);
    const blocked = await request(app.getHttpServer()).get('/api/v1/probe').expect(429);
    assert.equal(blocked.body.error.code, 'RATE_LIMITED'); assert.ok(blocked.headers['retry-after']);
    await request(app.getHttpServer()).get('/api/v1/health/live').expect(200);
  } finally { await app.close(); }
});
