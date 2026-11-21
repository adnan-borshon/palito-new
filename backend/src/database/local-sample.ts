import { deleteApp, initializeApp } from 'firebase-admin/app';
import { getAuth, type Auth, type CreateRequest, type UserRecord } from 'firebase-admin/auth';
import type { PrismaClient } from '../generated/prisma/client.js';
import { loadConfig } from '../platform/config.js';
import { dateOnly } from '../platform/data-contracts.js';
import { assertSyntheticSeedAllowed } from './synthetic.js';

const sampleId = (number: number) => `a0110000-0000-4000-8000-${String(number).padStart(12, '0')}`;
const farmers = [
  { id: sampleId(1), uid: 'palito-local-farmer', displayName: 'স্থানীয় নমুনা খামারি · Sample farmer', phoneNumber: '+8801700000101', farm: 'Shapla Farm', animal: 'Shapla' },
  { id: sampleId(2), uid: 'palito-local-other-farmer', displayName: 'Sample farmer 2', phoneNumber: '+8801700000102', farm: 'Doyel Farm', animal: 'Doyel' },
];
const staff = [
  { uid: 'palito-local-vet', displayName: 'Sample veterinarian', email: 'vet@palito.example', role: 'VET', kind: 'CLINIC', organization: 'Sample clinic' },
  { uid: 'palito-local-bank', displayName: 'Sample bank officer', email: 'bank@palito.example', role: 'BANK_STAFF', kind: 'BANK', organization: 'Sample bank' },
  { uid: 'palito-local-insurer', displayName: 'Sample insurer', email: 'insurer@palito.example', role: 'INSURER_STAFF', kind: 'INSURER', organization: 'Sample insurer' },
  { uid: 'palito-local-admin', displayName: 'Sample administrator', email: 'admin@palito.example', role: 'ADMIN', kind: 'PLATFORM', organization: 'Sample platform' },
] as const;

async function ensureAuthUser(auth: Auth, expected: CreateRequest & { uid: string }) {
  let user: UserRecord;
  try {
    user = await auth.getUser(expected.uid);
  } catch (error) {
    if ((error as { code?: string }).code !== 'auth/user-not-found') throw error;
    try {
      user = await auth.createUser(expected);
    } catch (createError) {
      if ((createError as { code?: string }).code !== 'auth/uid-already-exists') throw createError;
      user = await auth.getUser(expected.uid);
    }
  }
  if (user.disabled || user.phoneNumber !== expected.phoneNumber || user.email !== expected.email ||
    (expected.emailVerified && !user.emailVerified)) throw new Error('Local sample auth identity collision');
}

// The SDK uses the loopback Auth emulator from the process environment. Keep this
// command separate from integration fixtures and from any hosted startup path.
export async function seedLocalSample(prisma: PrismaClient) {
  assertSyntheticSeedAllowed(process.env);
  const config = loadConfig(process.env);
  if (config.AUTH_MODE !== 'emulator' || config.FIREBASE_PROJECT_ID !== 'demo-palito') {
    throw new Error('Local samples require the demo-palito Auth emulator');
  }
  const password = process.env.LOCAL_SAMPLE_STAFF_PASSWORD;
  if (!password || password.length < 12) throw new Error('Set a local sample staff password of at least 12 characters');

  const app = initializeApp({ projectId: config.FIREBASE_PROJECT_ID }, 'palito-local-sample');
  try {
    const auth = getAuth(app);
    for (const { uid, phoneNumber, displayName } of farmers) {
      await ensureAuthUser(auth, { uid, phoneNumber, displayName });
    }
    for (const { uid, email, displayName } of staff) {
      await ensureAuthUser(auth, { uid, email, emailVerified: true, password, displayName });
    }

    await prisma.$transaction(async tx => {
      for (const [index, farmer] of farmers.entries()) {
        const farmId = sampleId(30 + index);
        const animalId = sampleId(40 + index);
        const user = await tx.user.upsert({
          where: { id: farmer.id },
          create: { id: farmer.id, firebaseUid: farmer.uid, displayName: farmer.displayName, phoneE164: farmer.phoneNumber, status: 'ACTIVE' },
          update: {},
        });
        if (user.firebaseUid !== farmer.uid || user.phoneE164 !== farmer.phoneNumber) throw new Error('Local sample farmer identity collision');
        const farm = await tx.farm.upsert({
          where: { id: farmId },
          create: { id: farmId, ownerId: user.id, name: farmer.farm, district: 'Sample district', address: 'Local example only', areaAcres: '2.000' },
          update: {},
        });
        if (farm.ownerId !== user.id) throw new Error('Local sample farm ownership mismatch');
        const animal = await tx.animal.upsert({
          where: { id: animalId },
          create: {
            id: animalId, farmId, ownerId: user.id, tag: `LOCAL-${index + 1}`, name: farmer.animal,
            species: 'cattle', breed: 'Local', sex: 'female', birthDate: dateOnly('2022-01-01'),
            weightKg: '320.000', estimateMinor: 9000000n,
          },
          update: {},
        });
        if (animal.ownerId !== user.id || animal.farmId !== farmId) throw new Error('Local sample animal ownership mismatch');
        await tx.ownershipHistory.createMany({
          data: [{ id: sampleId(50 + index), animalId, toOwnerId: user.id, reason: 'Initial local sample registration' }],
          skipDuplicates: true,
        });
      }

      for (const [index, account] of staff.entries()) {
        const userId = sampleId(10 + index);
        const organizationId = sampleId(20 + index);
        const user = await tx.user.upsert({
          where: { id: userId },
          create: { id: userId, firebaseUid: account.uid, displayName: account.displayName, emailNormalized: account.email, status: 'ACTIVE' },
          update: {},
        });
        if (user.firebaseUid !== account.uid || user.emailNormalized !== account.email) throw new Error('Local sample staff identity collision');
        await tx.organization.upsert({
          where: { id: organizationId },
          create: { id: organizationId, kind: account.kind, name: account.organization, status: 'ACTIVE' },
          update: {},
        });
        await tx.membership.createMany({
          data: [{ organizationId, organizationKind: account.kind, userId, role: account.role, status: 'ACTIVE' }],
          skipDuplicates: true,
        });
      }

      await tx.vetCredential.createMany({
        data: [{ userId: sampleId(10), registrationNumber: 'PALITO-LOCAL-VET', status: 'VERIFIED', reviewedById: sampleId(13), reviewedAt: new Date() }],
        skipDuplicates: true,
      });
    });
  } finally {
    await deleteApp(app);
  }
}
