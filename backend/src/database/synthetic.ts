import type { PrismaClient } from '../generated/prisma/client.js';
import { dateOnly, wholeBdtToMinor } from '../platform/data-contracts.js';

export const SYNTHETIC_IDS = {
  farmerA: '10000000-0000-4000-8000-000000000001', farmerB: '10000000-0000-4000-8000-000000000002',
  vet: '10000000-0000-4000-8000-000000000003', reviewer: '10000000-0000-4000-8000-000000000004',
  farmA: '20000000-0000-4000-8000-000000000001', farmB: '20000000-0000-4000-8000-000000000002',
  animalA: '30000000-0000-4000-8000-000000000001', animalB: '30000000-0000-4000-8000-000000000002',
  organization: '40000000-0000-4000-8000-000000000001', membership: '40000000-0000-4000-8000-000000000002',
  valuation: '50000000-0000-4000-8000-000000000001',
} as const;

export function assertSyntheticSeedAllowed(env: NodeJS.ProcessEnv): void {
  if (!['development', 'test'].includes(env.NODE_ENV ?? '') || env.SEED_SYNTHETIC !== 'true') throw new Error('Synthetic seed requires explicit development/test opt-in');
  const url = new URL(env.DATABASE_URL ?? '');
  if (!['postgres:','postgresql:'].includes(url.protocol) || !['127.0.0.1','localhost','[::1]'].includes(url.hostname) || decodeURIComponent(url.username) !== 'palito_runtime' || !/^\/(palito_dev|palito_test|palito_m2_)[a-zA-Z0-9_]*$/.test(url.pathname)) throw new Error('Synthetic seed requires a dedicated local development/test database');
}

export async function seedSynthetic(prisma: PrismaClient, env: NodeJS.ProcessEnv): Promise<void> {
  assertSyntheticSeedAllowed(env);
  const ids = SYNTHETIC_IDS;
  await prisma.$transaction(async db => {
    const users = [
      { id: ids.farmerA, firebaseUid: 'synthetic-m2-farmer-a', displayName: 'Synthetic farmer A' },
      { id: ids.farmerB, firebaseUid: 'synthetic-m2-farmer-b', displayName: 'Synthetic farmer B' },
      { id: ids.vet, firebaseUid: 'synthetic-m2-vet', displayName: 'Synthetic pending veterinarian' },
      { id: ids.reviewer, firebaseUid: 'synthetic-m2-reviewer', displayName: 'Synthetic reviewer' },
    ];
    const existing = await db.user.findMany({ where: { id: { in: users.map(user => user.id) } } });
    if (existing.some(user => users.find(expected => expected.id === user.id)?.firebaseUid !== user.firebaseUid)) throw new Error('Seed ID collision; no data changed');
    await db.user.createMany({ data: users.map(user => ({ ...user, status: 'ACTIVE' as const })), skipDuplicates: true });
    await db.organization.createMany({ data: [{ id: ids.organization, kind: 'BANK', name: 'Synthetic bank', status: 'PENDING' }], skipDuplicates: true });
    await db.membership.createMany({ data: [{ id: ids.membership, organizationId: ids.organization, organizationKind: 'BANK', userId: ids.reviewer, role: 'BANK_STAFF', status: 'INVITED' }], skipDuplicates: true });
    await db.vetCredential.createMany({ data: [{ userId: ids.vet, registrationNumber: 'SYNTHETIC-M2-ONLY', status: 'PENDING' }], skipDuplicates: true });
    await db.farm.createMany({ data: [
      { id: ids.farmA, ownerId: ids.farmerA, name: 'Synthetic farm A', district: 'Synthetic district', address: 'Synthetic address A', areaAcres: '2.000' },
      { id: ids.farmB, ownerId: ids.farmerB, name: 'Synthetic farm B', district: 'Synthetic district', address: 'Synthetic address B', areaAcres: '3.000' },
    ], skipDuplicates: true });
    await db.animal.createMany({ data: [
      { id: ids.animalA, farmId: ids.farmA, ownerId: ids.farmerA, tag: 'SYNTHETIC-M2-A', name: 'Synthetic animal A', species: 'cattle', breed: 'Synthetic breed', sex: 'female', birthDate: dateOnly('2020-01-01'), weightKg: '450.000', estimateMinor: wholeBdtToMinor(140000) },
      { id: ids.animalB, farmId: ids.farmB, ownerId: ids.farmerB, tag: 'SYNTHETIC-M2-B', name: 'Synthetic animal B', species: 'cattle', breed: 'Synthetic breed', sex: 'female', birthDate: dateOnly('2021-01-01'), weightKg: '320.000', estimateMinor: wholeBdtToMinor(90000) },
    ], skipDuplicates: true });
    await db.ownershipHistory.createMany({ data: [
      { id: '60000000-0000-4000-8000-000000000001', animalId: ids.animalA, toOwnerId: ids.farmerA, reason: 'Synthetic initial registration' },
      { id: '60000000-0000-4000-8000-000000000002', animalId: ids.animalB, toOwnerId: ids.farmerB, reason: 'Synthetic initial registration' },
    ], skipDuplicates: true });
    const assessedAt = new Date();
    await db.valuation.createMany({ data: [{ id: ids.valuation, animalId: ids.animalA, ownerAtAssessmentId: ids.farmerA, assessorId: ids.reviewer, version: 1, amountMinor: wholeBdtToMinor(100000), assessedAt, expiresAt: new Date(assessedAt.getTime()+86400000) }], skipDuplicates: true });
  });
}
