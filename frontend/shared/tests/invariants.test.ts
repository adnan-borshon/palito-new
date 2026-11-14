import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDemoRepository, createDemoState, DEMO_IDS as ids, DEMO_STORAGE_KEY, isValidDate, maximumLoanAmount, demoBalance, isoAfter } from '../src/index.ts';
import type { DemoCommand, DemoRepository, DemoState, DemoStorage } from '../src/types.ts';

const clock = () => new Date('2026-11-14T03:00:00.000Z');
const repository = () => createDemoRepository({ now: clock });
async function ok(repo: DemoRepository, command: DemoCommand) { const result = await repo.execute(command); assert.equal(result.ok, true, JSON.stringify(result)); assert.ok(result.ok); return result; }
const login = (repo: DemoRepository, userId: string) => ok(repo, { type: 'auth.switch', userId });
async function failsAtomically(repo: DemoRepository, command: DemoCommand, code?: string) {
  const before = repo.getSnapshot(); const result = await repo.execute(command); assert.equal(result.ok, false, `${command.type} unexpectedly succeeded`);
  assert.ok(!result.ok); if (code) assert.equal(result.code, code);
  assert.ok(result.message.bn.length > 0 && result.message.en.length > 0); assert.strictEqual(repo.getSnapshot(), before); return result;
}
function memoryStorage() {
  let value: string | null = null; let rejectWrites = false;
  const storage: DemoStorage = { async getItem(key) { assert.equal(key, DEMO_STORAGE_KEY); return value; }, async setItem(key, next) { assert.equal(key, DEMO_STORAGE_KEY); if (rejectWrites) throw new Error('disk full'); value = next; }, async removeItem() { value = null; } };
  return { storage, setRaw(next: string | null) { value = next; }, getRaw() { return value; }, rejectWrites(value: boolean) { rejectWrites = value; } };
}

test('Money cap rejects NaN, Infinity, unsafe integers, negative values and ratios', async () => {
  for (const value of [NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1, -1, 1.5]) assert.equal(maximumLoanAmount(value), 0);
  assert.equal(maximumLoanAmount(100, NaN), 0); assert.equal(maximumLoanAmount(100, Infinity), 0); assert.equal(maximumLoanAmount(100, -1), 0);
  assert.equal(maximumLoanAmount(101), 70); assert.equal(maximumLoanAmount(100, 1), 70);
  assert.equal(maximumLoanAmount(88000), 61600);
  assert.equal(maximumLoanAmount(Number.MAX_SAFE_INTEGER), Number(BigInt(Number.MAX_SAFE_INTEGER) * 7n / 10n));
  const repo = repository(); await login(repo, ids.farmer);
  for (const amount of [NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1, 0, -1, 100.1, 98001]) await failsAtomically(repo, { type: 'loan.offer', animalId: ids.healthy, amount, termMonths: 12, purpose: 'Sample purpose', repaymentSource: 'Sample sales' });
  await failsAtomically(repo, { type: 'loan.offer', animalId: ids.healthy, amount: 1000, termMonths: 0, purpose: 'Sample purpose', repaymentSource: 'Sample sales' });
  await failsAtomically(repo, { type: 'loan.offer', animalId: ids.healthy, amount: 1000, termMonths: 37, purpose: 'Sample purpose', repaymentSource: 'Sample sales' });
});

test('Invalid dates, future births, invalid animal values and weights are rejected', async () => {
  for (const date of ['2026-02-30', '2025-02-29T00:00:00.000Z', '2026-13-01', 'not-a-date', '2026-11-14T25:00:00.000Z']) assert.equal(isValidDate(date), false);
  assert.equal(isValidDate('2024-02-29'), true);
  const repo = repository(); await login(repo, ids.farmer);
  for (const animal of [{ birthDate: '2026-02-30' }, { birthDate: '2027-01-01' }, { birthDate: '1900-01-01' }, { weightKg: 0 }, { weightKg: Infinity }, { value: Number.MAX_SAFE_INTEGER + 1 }]) await failsAtomically(repo, { type: 'animal.update', animalId: ids.healthy, animal });
});

test('Role, ownership, blocked account and request replay cannot bypass authorization', async () => {
  const repo = repository(); await login(repo, ids.farmer);
  await failsAtomically(repo, { type: 'animal.update', animalId: ids.otherAnimal, animal: { name: 'Not my animal' } }, 'unauthorized');
  await failsAtomically(repo, { type: 'loan.decide', loanId: 'loan-pending', approve: true }, 'unauthorized');
  await ok(repo, { type: 'loan.repay', loanId: 'loan-active', amount: 100, requestId: 'owned-repayment' });
  await login(repo, ids.otherFarmer);
  await failsAtomically(repo, { type: 'loan.repay', loanId: 'loan-active', amount: 100, requestId: 'owned-repayment' }, 'duplicate');
  await failsAtomically(repo, { type: 'loan.repay', loanId: 'loan-active', amount: 100 }, 'unauthorized');
  await failsAtomically(repo, { type: 'notification.read', notificationId: `welcome-${ids.farmer}` }, 'unauthorized');
  const suspended = createDemoState('normal', clock()); suspended.users[0].status = 'suspended'; suspended.session.userId = ids.farmer;
  const blocked = createDemoRepository({ initialState: suspended }); await failsAtomically(blocked, { type: 'animal.update', animalId: ids.healthy, animal: { name: 'Blocked change' } }, 'blocked');
});

test('Pending/active collateral, policy duplicates and active policy prerequisites are enforced', async () => {
  const repo = repository(); await login(repo, ids.farmer);
  await failsAtomically(repo, { type: 'loan.offer', animalId: ids.collateral, amount: 1000, termMonths: 6, purpose: 'Duplicate collateral', repaymentSource: 'Sample sales' }, 'collateral');
  await failsAtomically(repo, { type: 'policy.apply', animalId: ids.sick, insurerId: ids.insurer, coverage: 50000 }, 'duplicate');
  await failsAtomically(repo, { type: 'claim.submit', policyId: 'policy-pending', kind: 'death', amount: 1000, evidence: { photo: true, location: true, description: 'Sample evidence' } }, 'coverage');
  await failsAtomically(repo, { type: 'claim.submit', policyId: `policy-${ids.healthy}`, kind: 'death', amount: 1000, evidence: { photo: false, location: true, description: 'Sample evidence' } }, 'evidence');
  await failsAtomically(repo, { type: 'claim.submit', policyId: `policy-${ids.healthy}`, kind: 'death', amount: 1000, evidence: { photo: true, location: true, description: 'Sample evidence', latitude: 91, longitude: 89 } }, 'evidence');
  await ok(repo, { type: 'demo.advanceTime', hours: 24 * 356 });
  await failsAtomically(repo, { type: 'claim.submit', policyId: `policy-${ids.healthy}`, kind: 'death', amount: 1000, evidence: { photo: true, location: true, description: 'Sample evidence' } }, 'coverage');
});

test('Vet schedule collisions are rejected for different animals and for reschedules', async () => {
  const repo = repository(); await login(repo, ids.farmer); const occupied = repo.getSnapshot().appointments[0].scheduledAt;
  await failsAtomically(repo, { type: 'appointment.book', animalId: ids.sick, vetId: ids.vet, scheduledAt: occupied, mode: 'visit', priority: 'routine', reason: 'Different animal same veterinarian' }, 'duplicate');
  const second = await ok(repo, { type: 'appointment.book', animalId: ids.sick, vetId: ids.vet, scheduledAt: isoAfter(occupied, 60), mode: 'visit', priority: 'routine', reason: 'Available veterinarian slot' });
  await failsAtomically(repo, { type: 'appointment.reschedule', appointmentId: second.id!, scheduledAt: isoAfter(occupied, 15) }, 'duplicate');
});

test('Failed transitions never partially charge a wallet, create records, or release collateral', async () => {
  const repo = repository(); await login(repo, ids.farmer);
  await failsAtomically(repo, { type: 'loan.repay', loanId: 'loan-active', amount: 32001 });
  await ok(repo, { type: 'cart.set', productId: 'product-collar', quantity: 12 });
  await ok(repo, { type: 'cart.set', productId: 'product-feed', quantity: 3 });
  await failsAtomically(repo, { type: 'order.place', address: 'A valid sample delivery address' }, 'funds');
  assert.equal(demoBalance(repo.getSnapshot(), ids.farmer), 32000);
  await login(repo, ids.vet);
  await failsAtomically(repo, { type: 'consultation.complete', appointmentId: 'appointment-pending', diagnosis: 'Premature diagnosis', advice: 'Premature advice', medicines: [] }, 'invalid_transition');
  await login(repo, ids.bank); await failsAtomically(repo, { type: 'loan.grace', loanId: 'loan-active', days: 14, note: 'No production drop present' }, 'invalid_transition');
});

test('Snapshot identity is stable; subscribers see one persisted commit per concurrent duplicate', async () => {
  const backing = memoryStorage(); const repo = createDemoRepository({ now: clock, storage: backing.storage }); await login(repo, ids.farmer);
  let notifications = 0; const unsubscribe = repo.subscribe(() => { notifications++; assert.ok(backing.getRaw()); });
  const before = repo.getSnapshot(); assert.strictEqual(before, repo.getSnapshot()); assert.ok(Object.isFrozen(before.animals[0]));
  const command = { type: 'loan.repay', loanId: 'loan-active', amount: 500, requestId: 'concurrent-1' } as const;
  const result = await Promise.all(Array.from({ length: 10 }, () => repo.execute(command))); assert.ok(result.every(item => item.ok)); assert.equal(notifications, 1);
  assert.equal(repo.getSnapshot().loans.find(item => item.id === 'loan-active')?.outstanding, 31500);
  const after = repo.getSnapshot(); await ok(repo, command); assert.strictEqual(repo.getSnapshot(), after); assert.equal(notifications, 1);
  await failsAtomically(repo, { ...command, amount: 600 }, 'duplicate'); unsubscribe();
});

test('Persistence restores shared state and idempotency; write failures remain atomic and recover', async () => {
  const backing = memoryStorage(); const repo = createDemoRepository({ now: clock, storage: backing.storage }); await login(repo, ids.farmer);
  const repayment = { type: 'loan.repay', loanId: 'loan-active', amount: 300, requestId: 'restored-payment' } as const;
  await ok(repo, repayment); const restored = createDemoRepository({ now: clock, storage: backing.storage }); assert.equal((await restored.hydrate()).ok, true);
  assert.deepEqual(restored.getSnapshot(), repo.getSnapshot()); const before = restored.getSnapshot(); await ok(restored, repayment); assert.strictEqual(restored.getSnapshot(), before);
  backing.rejectWrites(true); await failsAtomically(restored, { type: 'loan.repay', loanId: 'loan-active', amount: 100 }, 'storage');
  backing.rejectWrites(false); await ok(restored, { type: 'loan.repay', loanId: 'loan-active', amount: 100 });
  await ok(restored, { type: 'demo.reset', scenario: 'normal' }); assert.equal(restored.getSnapshot().processedRequests.length, 0); assert.equal(restored.getSnapshot().loans[0].outstanding, 32000);
  assert.equal(restored.getSnapshot().session.userId, ids.farmer);
});

test('Malformed, unsupported, missing-field and cross-owner persisted snapshots are rejected', async () => {
  const modifications: ((state: DemoState) => unknown)[] = [
    state => ({ ...state, schemaVersion: 99 }), state => ({ ...state, loans: null }), state => ({ ...state, session: { locale: 'bn' } }),
    state => { state.loans[0].farmerId = ids.otherFarmer; return state; },
    state => { state.claims.push({ id: 'broken', policyId: 'missing', animalId: ids.healthy, farmerId: ids.farmer, insurerId: ids.insurer, kind: 'death', amount: 1000, evidence: { photo: true, location: true, description: 'Sample evidence' }, status: 'submitted', createdAt: state.now }); return state; },
    state => { state.loans[0].amount = state.loans[0].collateralValue; return state; },
    state => { state.animals[0].ownerId = ids.otherFarmer; return state; },
    state => { state.devices[0].readings[0].temperature = NaN; return state; },
  ];
  for (const mutate of modifications) {
    const backing = memoryStorage(); backing.setRaw(JSON.stringify(mutate(createDemoState('normal', clock()))));
    const repo = createDemoRepository({ now: clock, storage: backing.storage }); const before = repo.getSnapshot(); const result = await repo.hydrate(); assert.equal(result.ok, false); assert.strictEqual(repo.getSnapshot(), before);
  }
  const backing = memoryStorage(); backing.setRaw('{bad JSON'); const repo = createDemoRepository({ now: clock, storage: backing.storage }); assert.equal((await repo.hydrate()).ok, false);
  await ok(repo, { type: 'demo.reset', scenario: 'empty' }); assert.equal((await repo.hydrate()).ok, true);
});

test('Offline and single simulated network failures preserve records; local controls allow recovery', async () => {
  const repo = repository(); await login(repo, ids.farmer); await ok(repo, { type: 'demo.offline', offline: true });
  await failsAtomically(repo, { type: 'loan.repay', loanId: 'loan-active', amount: 100 }, 'offline');
  await ok(repo, { type: 'session.locale', locale: 'en' }); await ok(repo, { type: 'notification.read' });
  await ok(repo, { type: 'demo.offline', offline: false }); await ok(repo, { type: 'demo.failNext' });
  await failsAtomically(repo, { type: 'loan.repay', loanId: 'loan-active', amount: 100 }, 'network');
  await ok(repo, { type: 'loan.repay', loanId: 'loan-active', amount: 100 }); assert.equal(repo.getSnapshot().loans[0].outstanding, 31900);
});

test('OTP validates phone/account, expires with clock, never appears in audit, and localizes errors', async () => {
  const repo = repository(); await failsAtomically(repo, { type: 'auth.requestOtp', phone: '123' }, 'validation');
  await ok(repo, { type: 'auth.requestOtp', phone: '01712345678' }); await failsAtomically(repo, { type: 'auth.verifyOtp', code: '000000' }, 'otp');
  await ok(repo, { type: 'demo.advanceTime', hours: 0.1 }); await failsAtomically(repo, { type: 'auth.verifyOtp', code: '123456' }, 'otp');
  await ok(repo, { type: 'auth.requestOtp', phone: '+8801712345678' }); await ok(repo, { type: 'auth.verifyOtp', code: '123456' });
  assert.equal(repo.getSnapshot().session.userId, ids.farmer); assert.equal(JSON.stringify(repo.getSnapshot().audit).includes('123456'), false);
});
