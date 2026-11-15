import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dateOnly, MAX_MINOR_UNITS, moneyJson, parseMinorUnits, wholeBdtToMinor } from '../src/platform/data-contracts.js';
import { assertSyntheticSeedAllowed } from '../src/database/synthetic.js';

test('BDT minor units use canonical decimal strings, exact conversion and PostgreSQL bigint bounds', () => {
  assert.equal(wholeBdtToMinor(140000), 14000000n);
  assert.deepEqual(moneyJson(12345n), { currency: 'BDT', amountMinor: '12345' });
  assert.equal(parseMinorUnits(MAX_MINOR_UNITS.toString()), MAX_MINOR_UNITS);
  assert.equal(parseMinorUnits('0'), 0n);
  for (const value of [123, 1.2, '', '01', '+1', '-1', '1.5', '1e2', ' 1', 'NaN', (MAX_MINOR_UNITS+1n).toString()]) assert.throws(() => parseMinorUnits(value));
  for (const value of [1.5, -1, NaN, Infinity, Number.MAX_SAFE_INTEGER+1]) assert.throws(() => wholeBdtToMinor(value));
});

test('date-only values reject invalid calendar/timestamp formats and preserve UTC calendar identity', () => {
  assert.equal(dateOnly('2024-02-29').toISOString(), '2024-02-29T00:00:00.000Z');
  for (const value of ['2023-02-29','2026-04-31','2026-13-01','2026-1-01','0000-01-01','2026-01-01T00:00:00Z']) assert.throws(() => dateOnly(value));
});

test('synthetic seed is blocked in production, without opt-in, and on nonlocal/admin databases', () => {
  const allowed = { NODE_ENV: 'test', SEED_SYNTHETIC: 'true', DATABASE_URL: 'postgresql://palito_runtime:local-only@127.0.0.1/palito_test' };
  assert.doesNotThrow(() => assertSyntheticSeedAllowed(allowed));
  for (const change of [{ NODE_ENV: 'production' }, { SEED_SYNTHETIC: undefined }, { DATABASE_URL: 'postgresql://palito_runtime:local-only@remote.example/palito_test' }, { DATABASE_URL: 'postgresql://admin:local-only@127.0.0.1/palito_test' }, { DATABASE_URL: 'postgresql://palito_runtime:local-only@127.0.0.1/production' }]) assert.throws(() => assertSyntheticSeedAllowed({ ...allowed, ...change }));
});
