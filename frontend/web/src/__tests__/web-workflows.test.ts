import assert from 'node:assert/strict';
import test from 'node:test';
import { DEMO_IDS, type DemoStorage } from '@palito/shared';
import { createPalitoWebClient } from '../lib/client.ts';
import {
  canonicalSidebarScreen,
  isCommonWebScreen,
  mobileDeepLink,
  webHref,
} from '../navigation.ts';

function createMemoryStorage(): DemoStorage {
  const store = new Map<string, string>();
  return {
    async getItem(k) {
      return store.get(k) ?? null;
    },
    async setItem(k, v) {
      store.set(k, v);
    },
    async removeItem(k) {
      store.delete(k);
    },
  };
}

test('navigation helpers resolve common screens, sidebar aliases, and mobile handoff links', () => {
  assert.equal(isCommonWebScreen('notifications'), true);
  assert.equal(isCommonWebScreen('profile-edit'), true);
  assert.equal(isCommonWebScreen('demo'), true);
  assert.equal(isCommonWebScreen('home'), false);

  // Bank aliases
  assert.equal(canonicalSidebarScreen('bank', 'applications'), 'applications');
  assert.equal(canonicalSidebarScreen('bank', 'passport'), 'applications');
  assert.equal(canonicalSidebarScreen('bank', 'loan'), 'loans');
  assert.equal(canonicalSidebarScreen('bank', 'settlements'), 'loans');

  // Vet aliases
  assert.equal(canonicalSidebarScreen('vet', 'appointment'), 'appointments');
  assert.equal(canonicalSidebarScreen('vet', 'emergency'), 'appointments');
  assert.equal(canonicalSidebarScreen('vet', 'animal'), 'animals');
  assert.equal(canonicalSidebarScreen('vet', 'passport'), 'animals');
  assert.equal(canonicalSidebarScreen('vet', 'claim'), 'reviews');
  assert.equal(canonicalSidebarScreen('vet', 'review-overdue'), 'reviews');
  assert.equal(canonicalSidebarScreen('vet', 'schedule'), 'profile');

  // Insurer aliases
  assert.equal(canonicalSidebarScreen('insurer', 'claim'), 'claims');
  assert.equal(canonicalSidebarScreen('insurer', 'review-overdue'), 'claims');
  assert.equal(canonicalSidebarScreen('insurer', 'policy'), 'policies');
  assert.equal(canonicalSidebarScreen('insurer', 'passport'), 'applications');

  // Admin aliases
  assert.equal(canonicalSidebarScreen('admin', 'user'), 'users');
  assert.equal(canonicalSidebarScreen('admin', 'article'), 'content');
  assert.equal(canonicalSidebarScreen('admin', 'audit'), 'reports');

  // Farmer aliases
  assert.equal(canonicalSidebarScreen('farmer', 'animal-edit'), 'animals');
  assert.equal(canonicalSidebarScreen('farmer', 'record-add'), 'animals');
  assert.equal(canonicalSidebarScreen('farmer', 'alert'), 'devices');
  assert.equal(canonicalSidebarScreen('farmer', 'book'), 'care');
  assert.equal(canonicalSidebarScreen('farmer', 'loan-apply'), 'wallet');
  assert.equal(canonicalSidebarScreen('farmer', 'claim-apply'), 'wallet');
  assert.equal(canonicalSidebarScreen('farmer', 'order'), 'market');

  assert.equal(webHref('bank', 'home'), '/bank/home');
  assert.equal(webHref('vet', 'claim', 'c-1'), '/vet/claim/c-1');
  assert.equal(
    mobileDeepLink('farmer', 'animal', DEMO_IDS.healthy),
    `palito://farmer/animal/${DEMO_IDS.healthy}`,
  );
});

test('web client executes end-to-end 5-role workflows with automatic requestId', async () => {
  const client = createPalitoWebClient({
    storage: createMemoryStorage(),
    latencyMs: 0,
  });
  await client.hydrate();

  // 1. Farmer simulates emergency alert and books vet consultation
  await client.execute({ type: 'auth.switch', userId: DEMO_IDS.farmer });
  const simRes = await client.execute({
    type: 'alert.simulate',
    animalId: DEMO_IDS.healthy,
    kind: 'emergency',
    severity: 'critical',
  });
  assert.equal(simRes.ok, true);

  // 2. Advance time +4h to trigger UC-001 SLA escalation
  const advRes = await client.execute({ type: 'demo.advanceTime', hours: 4 });
  assert.equal(advRes.ok, true);
  assert.equal(
    client.getSnapshot().alerts.some((a) => a.status === 'escalated'),
    true,
  );

  // 3. Switch to Vet, complete a consultation & submit clinical review
  await client.execute({ type: 'auth.switch', userId: DEMO_IDS.vet });
  const appt = client
    .getSnapshot()
    .appointments.find(
      (a) => a.vetId === DEMO_IDS.vet && ['requested', 'accepted'].includes(a.status),
    );
  assert.ok(appt);
  if (appt.status === 'requested') {
    await client.execute({
      type: 'appointment.decide',
      appointmentId: appt.id,
      accept: true,
      note: 'Accepted on web workbench',
    });
  }
  await client.execute({
    type: 'consultation.start',
    appointmentId: appt.id,
  });
  const rxRes = await client.execute({
    type: 'consultation.complete',
    appointmentId: appt.id,
    diagnosis: 'Ruminal acidosis',
    advice: 'Oral buffer twice daily',
    medicines: [{ name: 'Buffer Mix', dose: '50g', frequency: '2x daily', days: 3 }],
  });
  assert.equal(rxRes.ok, true);

  // 4. Switch to Bank, approve & disburse submitted loan
  await client.execute({ type: 'auth.switch', userId: DEMO_IDS.bank });
  const submittedLoan = client
    .getSnapshot()
    .loans.find((l) => l.bankId === DEMO_IDS.bank && l.status === 'submitted');
  if (submittedLoan) {
    const dec = await client.execute({
      type: 'loan.decide',
      loanId: submittedLoan.id,
      approve: true,
      note: 'Collateral verified via web workbench',
    });
    assert.equal(dec.ok, true);
    const disb = await client.execute({
      type: 'loan.disburse',
      loanId: submittedLoan.id,
    });
    assert.equal(disb.ok, true);
  }

  // 5. Farmer submits claim on active policy -> Insurer refers to Vet -> Vet reviews -> Insurer approves & pays
  await client.execute({ type: 'auth.switch', userId: DEMO_IDS.farmer });
  const activePolicy = client
    .getSnapshot()
    .policies.find((p) => p.farmerId === DEMO_IDS.farmer && p.status === 'active');
  assert.ok(activePolicy);
  const submitClaim = await client.execute({
    type: 'claim.submit',
    policyId: activePolicy.id,
    kind: 'illness',
    amount: 15000,
    evidence: {
      photo: true,
      location: true,
      description: 'Acute fever verified by collar telemetry',
      capturedAt: client.getSnapshot().now,
      latitude: 24.3396,
      longitude: 89.6011,
    },
  });
  assert.equal(submitClaim.ok, true);

  await client.execute({ type: 'auth.switch', userId: DEMO_IDS.insurer });
  const openClaim = client
    .getSnapshot()
    .claims.find((c) => ['submitted', 'manual_review'].includes(c.status));
  assert.ok(openClaim);
  const referRes = await client.execute({
    type: 'claim.refer',
    claimId: openClaim.id,
    vetId: DEMO_IDS.vet,
  });
  assert.equal(referRes.ok, true);

  await client.execute({ type: 'auth.switch', userId: DEMO_IDS.vet });
  const vetRev = await client.execute({
    type: 'claim.vetReview',
    claimId: openClaim.id,
    opinion: 'Collar telemetry confirms acute febrile spike.',
  });
  assert.equal(vetRev.ok, true);

  await client.execute({ type: 'auth.switch', userId: DEMO_IDS.insurer });
  const claimDec = await client.execute({
    type: 'claim.decide',
    claimId: openClaim.id,
    approve: true,
    note: 'Approved after vet forensic opinion',
  });
  assert.equal(claimDec.ok, true);
  const payRes = await client.execute({
    type: 'claim.pay',
    claimId: openClaim.id,
  });
  assert.equal(payRes.ok, true);
});
