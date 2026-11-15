import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { Accounts } from '../src/identity/accounts.js';
import { FirebaseIdentity, validateIdentity, recent } from '../src/identity/firebase.js';
import { Sessions, fingerprint, cookieValue } from '../src/identity/sessions.js';
import { testConfig } from './helpers.js';
import type { DatabaseService } from '../src/platform/database.js';
import type { Request, Response } from 'express';
const token = (change = {}) => ({ uid: 'alice', sub: 'alice', aud: 'demo-palito', iss: 'https://securetoken.google.com/demo-palito', exp: Date.now()/1000 + 3600, iat: Date.now()/1000, auth_time: Date.now()/1000, firebase: { sign_in_provider: 'phone', identities: {} }, phone_number: '+8801712345678', ...change }) as DecodedIdToken;

test('identity rejects expired, future, wrong-project, wrong-issuer and malformed subjects; recent auth is bounded', () => {
  assert.equal(validateIdentity(token(), 'demo-palito').uid, 'alice');
  for (const value of [{ exp: 0 }, { iat: Date.now()/1000+300 }, { aud: 'other-project' }, { iss: 'https://evil.example' }, { sub: 'bob' }, { uid: '' }, { auth_time: NaN }]) assert.throws(() => validateIdentity(token(value), 'demo-palito'));
  assert.throws(() => recent(token({ auth_time: Date.now()/1000 - 301 })));
});
test('emulator configuration is explicit, local, demo-only and impossible in production', () => {
  const valid = { AUTH_MODE: 'emulator', FIREBASE_PROJECT_ID: 'demo-palito', FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099' };
  assert.doesNotThrow(() => testConfig(valid));
  for (const value of [{ FIREBASE_AUTH_EMULATOR_HOST: '' }, { FIREBASE_AUTH_EMULATOR_HOST: 'evil.example:9099' }, { FIREBASE_PROJECT_ID: 'real-project' }, { AUTH_MODE: 'firebase' }, { NODE_ENV: 'production' }]) assert.throws(() => testConfig({ ...valid, ...value }));
});
test('official Admin adapter in disabled mode accepts no credential', async () => {
  const firebase = new FirebaseIdentity(testConfig());
  await assert.rejects(firebase.verify('forged-token'));
  await assert.rejects(firebase.verify('x'.repeat(12001)));
});
function accounts(row: unknown) {
  let current = row; let created: unknown;
  const service = new Accounts({ prisma: { user: { findUnique: async () => current, create: async ({ data }: { data: unknown }) => { created = data; return { id: 'generated', status: 'ACTIVE' }; } } } } as unknown as DatabaseService);
  return { service, set: (row: unknown) => { current = row; }, created: () => created };
}
const user = { id: 'alice-id', displayName: 'Alice', locale: 'bn', status: 'ACTIVE', memberships: [{ id: 'm', organizationId: 'org', role: 'ADMIN' }], vetCredential: null };
test('every request rereads suspension and membership; phone/custom claims never confer staff roles', async () => {
  const { service, set } = accounts(user);
  const phone = await service.principal(token({ role: 'ADMIN' }));
  assert.deepEqual(phone.memberships, []); assert.deepEqual(phone.capabilities, ['profile:read']);
  const staff = token({ email_verified: true, firebase: { sign_in_provider: 'password', sign_in_second_factor: 'phone', identities: {} } });
  assert.equal((await service.principal(staff)).memberships.length, 1);
  set({ ...user, memberships: [] }); assert.deepEqual((await service.principal(staff)).memberships, []);
  for (const status of ['PENDING', 'SUSPENDED', 'ARCHIVED']) { set({ ...user, status }); await assert.rejects(service.principal(staff)); }
  set(null); await assert.rejects(service.principal(staff));
});
test('staff context requires verified email, recent password+SMS MFA; vet additionally requires verified credentials', async () => {
  const { service } = accounts({ ...user, memberships: [{ id: 'm', organizationId: 'o', role: 'VET' }], vetCredential: { status: 'PENDING' } });
  const staff = token({ email_verified: true, firebase: { sign_in_provider: 'password', sign_in_second_factor: 'phone', identities: {} } });
  assert.deepEqual((await service.principal(staff)).memberships, []);
  const admin = accounts(user).service;
  for (const identity of [token(), token({ email_verified: false }), token({ ...staff, auth_time: Date.now()/1000-301 }), token({ ...staff, firebase: { ...staff.firebase, sign_in_second_factor: undefined } })]) assert.deepEqual((await admin.principal(identity)).memberships, []);
});
test('onboarding maps only verified Bangladesh phone UID; no privileged fields or email linking', async () => {
  const { service, created, set } = accounts(null);
  await service.onboard(token(), 'Alice', 'bn');
  assert.deepEqual(created(), { firebaseUid: 'alice', displayName: 'Alice', locale: 'bn', phoneE164: '+8801712345678', status: 'ACTIVE' });
  await assert.rejects(service.onboard(token({ phone_number: '+11234567890' }), 'Alice', 'bn'));
  await assert.rejects(service.onboard(token({ firebase: { sign_in_provider: 'password', identities: {} } }), 'Alice', 'bn'));
  set({ ...user, status: 'SUSPENDED' }); await assert.rejects(service.onboard(token(), 'Alice', 'bn'));
});
test('CSRF requires exact origin and matching unpredictable cookie/header; duplicate cookies denied', () => {
  const sessions = new Sessions({} as DatabaseService, testConfig());
  const csrf = 'a'.repeat(64);
  const request = (headers: object) => ({ headers, method: 'POST' }) as Request;
  const headers = { origin: 'http://localhost:3000', cookie: `__Host-palito-csrf=${csrf}`, 'x-csrf-token': csrf };
  sessions.checkCsrf(request(headers));
  for (const change of [{ origin: undefined }, { origin: 'https://evil.example' }, { 'x-csrf-token': 'wrong' }, { cookie: '' }, { cookie: `${headers.cookie}; ${headers.cookie}` }]) assert.throws(() => sessions.checkCsrf(request({ ...headers, ...change })));
  assert.equal(cookieValue(request({ cookie: 'session=x; session=y' }), 'session'), undefined);
});
test('session registry stores only hashes and denies revoked/expired/foreign cookies', async () => {
  let record: { firebaseUid: string; expiresAt: Date; revokedAt: Date | null } | null = { firebaseUid: 'alice', expiresAt: new Date(Date.now()+60000), revokedAt: null };
  let saved: unknown;
  const sessions = new Sessions({ prisma: { webSession: { findUnique: async () => record, create: async (input: unknown) => { saved = input; }, updateMany: async () => { if (record) record.revokedAt = new Date(); } } } } as unknown as DatabaseService, testConfig());
  let emitted = '';
  const response = { cookie(_name: string, value: string) { emitted = value; }, clearCookie() {} } as unknown as Response;
  await sessions.save('secret-cookie', 'alice', response);
  assert.ok(!JSON.stringify(saved).includes('secret-cookie')); assert.equal((saved as {data:{tokenHash:string}}).data.tokenHash, fingerprint(emitted));
  const first = emitted; await sessions.save('secret-cookie', 'alice', response); assert.notEqual(emitted, first);
  await sessions.check('secret-cookie', 'alice'); await assert.rejects(sessions.check('secret-cookie', 'bob'));
  await sessions.clear({ headers: { cookie: '__Host-palito-session=secret-cookie' } } as Request, response);
  await assert.rejects(sessions.check('secret-cookie', 'alice'));
  record = { firebaseUid: 'alice', expiresAt: new Date(0), revokedAt: null }; await assert.rejects(sessions.check('secret-cookie', 'alice'));
  record = null; await assert.rejects(sessions.check('secret-cookie', 'alice'));
});
