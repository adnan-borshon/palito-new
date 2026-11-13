import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDemoRepository, createDemoState, DEMO_IDS as ids, demoBalance, demoLoanQuote, hasIoTEvidence, isoAfter } from '../src/index.ts';
import type { DemoCommand, DemoRepository } from '../src/types.ts';

const clock = () => new Date('2026-11-14T03:00:00.000Z');
const repository = () => createDemoRepository({ now: clock });
async function ok(repo: DemoRepository, command: DemoCommand) {
  const result = await repo.execute(command); assert.equal(result.ok, true, `${command.type}: ${JSON.stringify(result)}`);
  assert.ok(result.ok); return result;
}
const login = (repo: DemoRepository, userId: string) => ok(repo, { type: 'auth.switch', userId });

test('UC001: alert → priority booking → vet consult → prescription → history and reminder', async () => {
  const repo = repository(); await login(repo, ids.farmer);
  await ok(repo, { type: 'alert.acknowledge', alertId: 'alert-temperature' });
  const booking = await ok(repo, { type: 'appointment.book', animalId: ids.sick, vetId: ids.vet, scheduledAt: isoAfter(repo.getSnapshot().now, 60), mode: 'video', priority: 'routine', reason: 'Review the sample temperature change', alertId: 'alert-temperature' });
  assert.equal(repo.getSnapshot().appointments.find(item => item.id === booking.id)?.priority, 'urgent');
  await login(repo, ids.vet);
  await ok(repo, { type: 'appointment.decide', appointmentId: booking.id!, accept: true });
  await ok(repo, { type: 'consultation.start', appointmentId: booking.id! });
  const prescription = await ok(repo, { type: 'consultation.complete', appointmentId: booking.id!, diagnosis: 'Demonstration assessment only', advice: 'Sample follow-up note, not medical advice.', medicines: [{ name: 'Sample reminder item', dose: 'Demo only', frequency: 'As recorded in demo', days: 3 }] });
  const state = repo.getSnapshot(); assert.equal(state.alerts.find(item => item.id === 'alert-temperature')?.status, 'resolved');
  assert.equal(state.records.filter(item => item.appointmentId === booking.id).length, 1);
  assert.equal(state.prescriptions.find(item => item.id === prescription.id)?.farmerId, ids.farmer);
  await login(repo, ids.farmer); const reminder = repo.getSnapshot().reminders[0];
  await ok(repo, { type: 'reminder.take', reminderId: reminder.id });
  const duplicate = await repo.execute({ type: 'reminder.take', reminderId: reminder.id }); assert.equal(duplicate.ok, false);
});

test('UC001 alternatives: four-hour escalation, device reconnection and emergency dispatch', async () => {
  const repo = repository(); await login(repo, ids.farmer);
  await ok(repo, { type: 'demo.advanceTime', hours: 3.99 }); assert.equal(repo.getSnapshot().alerts[0].status, 'open');
  await ok(repo, { type: 'demo.advanceTime', hours: 0.01 }); assert.equal(repo.getSnapshot().alerts[0].status, 'escalated');
  assert.ok(repo.getSnapshot().notifications.some(item => item.userId === ids.vet && item.entityId === 'alert-temperature'));
  const device = repo.getSnapshot().devices.find(item => item.animalId === ids.healthy)!;
  await ok(repo, { type: 'device.disconnect', deviceId: device.id });
  assert.ok(repo.getSnapshot().alerts.some(item => item.kind === 'disconnected' && item.animalId === ids.healthy));
  await ok(repo, { type: 'device.connect', animalId: ids.healthy, serial: device.serial });
  assert.equal(repo.getSnapshot().alerts.find(item => item.kind === 'disconnected')?.status, 'resolved');
  const alert = await ok(repo, { type: 'alert.simulate', animalId: ids.healthy, kind: 'emergency', severity: 'critical' });
  assert.ok(repo.getSnapshot().appointments.some(item => item.alertId === alert.id && item.priority === 'emergency' && item.mode === 'visit'));
  const emergencyLoan = await ok(repo, { type: 'loan.offer', animalId: ids.healthy, amount: 5000, termMonths: 3, purpose: 'Simulated medical emergency support', repaymentSource: 'Sample milk sales' });
  assert.equal(repo.getSnapshot().loans.find(item => item.id === emergencyLoan.id)?.status, 'offered');
});

test('UC002: enhanced claim pays secured bank debt first and remainder to farmer exactly once', async () => {
  const repo = repository(); await login(repo, ids.farmer); const startBalance = demoBalance(repo.getSnapshot(), ids.farmer);
  const claim = await ok(repo, { type: 'claim.submit', policyId: `policy-${ids.collateral}`, kind: 'death', amount: 90000, evidence: { photo: true, location: true, description: 'Sample evidence with a demo timestamp', capturedAt: repo.getSnapshot().now, latitude: 24.1, longitude: 89.5 } });
  assert.equal(hasIoTEvidence(repo.getSnapshot(), ids.collateral, repo.getSnapshot().now), true);
  await login(repo, ids.insurer); await ok(repo, { type: 'claim.autoReview', claimId: claim.id! });
  assert.equal(repo.getSnapshot().claims[0].status, 'approved');
  const pay = { type: 'claim.pay', claimId: claim.id!, requestId: 'payout-uc002' } as const;
  const results = await Promise.all([repo.execute(pay), repo.execute(pay)]); assert.ok(results.every(result => result.ok));
  const state = repo.getSnapshot(); const paid = state.claims[0];
  assert.equal(paid.status, 'paid'); assert.equal(paid.debtSettlement, 32000); assert.equal(paid.farmerPayout, 58000);
  assert.equal(paid.payout, paid.debtSettlement! + paid.farmerPayout!);
  assert.equal(state.loans.find(item => item.id === 'loan-active')?.outstanding, 0);
  assert.equal(state.loans.find(item => item.id === 'loan-active')?.status, 'settled');
  assert.equal(demoBalance(state, ids.farmer), startBalance + 58000);
  assert.equal(demoBalance(state, ids.bank), 32000);
  assert.equal(state.payments.filter(item => item.kind === 'insurance_payout').length, 1);
  assert.equal(state.animals.find(item => item.id === ids.collateral)?.status, 'deceased');
  assert.equal((await repo.execute({ type: 'claim.pay', claimId: claim.id! })).ok, false);
});

test('UC002 manual path: disconnected IoT → manual review → veterinary referral → insurer decision', async () => {
  const repo = repository(); await login(repo, ids.farmer);
  await ok(repo, { type: 'device.disconnect', deviceId: `device-${ids.healthy}` });
  const claim = await ok(repo, { type: 'claim.submit', policyId: `policy-${ids.healthy}`, kind: 'death', amount: 50000, evidence: { photo: true, location: true, description: 'Sample evidence requiring veterinary review' } });
  await login(repo, ids.insurer); await ok(repo, { type: 'claim.autoReview', claimId: claim.id! }); assert.equal(repo.getSnapshot().claims[0].status, 'manual_review');
  await ok(repo, { type: 'claim.refer', claimId: claim.id!, vetId: ids.vet });
  assert.equal((await repo.execute({ type: 'claim.decide', claimId: claim.id!, approve: true, note: 'Premature approval should fail' })).ok, false);
  await login(repo, ids.vet); await ok(repo, { type: 'claim.vetReview', claimId: claim.id!, opinion: 'The sample evidence was reviewed for this demonstration.' });
  await login(repo, ids.insurer); await ok(repo, { type: 'claim.decide', claimId: claim.id!, approve: false, note: 'Demo decision: evidence is inconclusive.' });
  assert.equal(repo.getSnapshot().claims[0].status, 'rejected'); assert.equal(repo.getSnapshot().payments.some(item => item.kind === 'insurance_payout'), false);
});

test('UC003: health-adjusted offer ≤70%, bank review, disbursement, grace and repayment', async () => {
  const repo = repository(); await login(repo, ids.farmer);
  const animal = repo.getSnapshot().animals.find(item => item.id === ids.sick)!; const quote = demoLoanQuote(animal);
  assert.equal(quote.collateralValue, 88000); assert.equal(quote.maximumAmount, 61600); assert.equal(quote.annualRate, 15);
  const loan = await ok(repo, { type: 'loan.offer', animalId: animal.id, amount: quote.maximumAmount, termMonths: 12, purpose: 'Illustrative farm improvement', repaymentSource: 'Milk production sales' });
  await ok(repo, { type: 'loan.accept', loanId: loan.id! }); await login(repo, ids.bank);
  await ok(repo, { type: 'loan.decide', loanId: loan.id!, approve: true });
  await ok(repo, { type: 'loan.disburse', loanId: loan.id! });
  await ok(repo, { type: 'loan.grace', loanId: loan.id!, days: 14, note: 'Sample milk production drop verified.' });
  assert.ok(repo.getSnapshot().loans.find(item => item.id === loan.id)?.graceUntil);
  await login(repo, ids.farmer);
  const repay = { type: 'loan.repay', loanId: loan.id!, amount: 1000, requestId: 'repayment-1' } as const;
  assert.ok((await Promise.all([repo.execute(repay), repo.execute(repay)])).every(result => result.ok));
  await ok(repo, { ...repay, requestId: 'repayment-2' });
  assert.equal(repo.getSnapshot().loans.find(item => item.id === loan.id)?.outstanding, quote.maximumAmount - 2000);
  assert.equal(repo.getSnapshot().payments.filter(item => item.referenceId === loan.id && item.kind === 'repayment').length, 2);
  await ok(repo, { type: 'loan.repay', loanId: loan.id!, amount: quote.maximumAmount - 2000, requestId: 'repayment-final' });
  assert.equal(repo.getSnapshot().loans.find(item => item.id === loan.id)?.status, 'paid');
  const second = await ok(repo, { type: 'loan.offer', animalId: animal.id, amount: 5000, termMonths: 6, purpose: 'A later valid application', repaymentSource: 'Sample milk sales' }); assert.ok(second.id);
});

test('Policy enrollment, order cancellation/refund, admin content and access share the same state', async () => {
  const repo = repository(); await login(repo, ids.farmer);
  const policy = await ok(repo, { type: 'policy.apply', animalId: ids.uninsured, insurerId: ids.insurer, coverage: 15000 });
  await login(repo, ids.insurer); await ok(repo, { type: 'policy.decide', policyId: policy.id!, approve: true });
  await login(repo, ids.farmer); const balance = demoBalance(repo.getSnapshot(), ids.farmer);
  await ok(repo, { type: 'cart.set', productId: 'product-feed', quantity: 2 });
  const order = await ok(repo, { type: 'order.place', address: 'Sample farm address in Sirajganj', requestId: 'order-1' });
  assert.equal(demoBalance(repo.getSnapshot(), ids.farmer), balance - 2900);
  await ok(repo, { type: 'order.advance', orderId: order.id! });
  await ok(repo, { type: 'order.cancel', orderId: order.id! }); assert.equal(demoBalance(repo.getSnapshot(), ids.farmer), balance);
  assert.equal((await repo.execute({ type: 'order.cancel', orderId: order.id! })).ok, false);
  await login(repo, ids.admin); await ok(repo, { type: 'content.save', id: 'content-finance', title: { bn: 'ঋণের ডেমো তথ্য', en: 'Loan demo guide' }, body: { bn: 'এই তথ্য কেবল ডেমোর জন্য।', en: 'This content is only a demonstration.' }, category: 'finance', status: 'published' });
  await ok(repo, { type: 'admin.userStatus', userId: ids.otherFarmer, status: 'suspended' });
  assert.equal((await repo.execute({ type: 'auth.switch', userId: ids.otherFarmer })).ok, false);
  assert.equal(repo.getSnapshot().content.find(item => item.id === 'content-finance')?.status, 'published');
  assert.ok(repo.getSnapshot().audit.some(item => item.action === 'admin.userStatus'));
});

test('All deterministic scenarios initialize with valid cross-role relationships', async () => {
  for (const scenario of ['normal', 'health', 'insurance', 'lending', 'empty'] as const) {
    const repo = createDemoRepository({ initialState: createDemoState(scenario, clock()) }); await login(repo, ids.farmer);
    assert.equal(repo.getSnapshot().settings.scenario, scenario);
    if (scenario === 'empty') assert.equal(repo.getSnapshot().animals.length, 0);
  }
});
