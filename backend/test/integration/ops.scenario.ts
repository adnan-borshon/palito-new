import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import sharp from "sharp";
import type { PrismaClient } from "../../src/generated/prisma/client.js";
import type { AccountPrincipal } from "../../src/identity/accounts.js";
import { CareService } from "../../src/care/care.service.js";
import { OpsService } from "../../src/ops/ops.service.js";
import { dhakaDateString } from "../../src/ops/ops-math.js";
import { OutboxWorkerService } from "../../src/ops/outbox.worker.js";
import { SYNTHETIC_IDS } from "../../src/database/synthetic.js";
import { loadConfig } from "../../src/platform/config.js";
import { DatabaseService } from "../../src/platform/database.js";
import { createLogger } from "../../src/platform/logger.js";

const key = () => randomUUID();

async function denied(work: Promise<unknown>, status: number) {
  await assert.rejects(
    work,
    (e: { getStatus?: () => number }) => e.getStatus?.() === status,
  );
}

export async function opsScenario(
  prisma: PrismaClient,
  env: NodeJS.ProcessEnv,
) {
  const config = loadConfig({
    ...env,
    HEALTHCARE_NO_CHARGE_PILOT: "true",
    NOTIFICATION_CHANNEL_MODE: "sandbox",
    WORKER_ENABLED: "false",
    WORKER_BATCH_SIZE: "25",
    LOG_LEVEL: "silent",
  });
  const logger = createLogger(config);
  const db = new DatabaseService(config, logger);
  const care = new CareService(db, config);
  const worker = new OutboxWorkerService(db, config, logger);
  const ops = new OpsService(db, config);

  async function actor(role?: "VET" | "ADMIN") {
    const user = await prisma.user.create({
      data: {
        firebaseUid: `synthetic-m5-${key()}`,
        displayName: `Synthetic M5 ${role ?? "Farmer"}`,
        status: "ACTIVE",
      },
    });
    const memberships: AccountPrincipal["memberships"] = [];
    if (role) {
      const kind = role === "VET" ? "CLINIC" : "PLATFORM";
      const org = await prisma.organization.create({
        data: { name: `Synthetic M5 ${role} Org`, kind, status: "ACTIVE" },
      });
      const m = await prisma.membership.create({
        data: {
          organizationId: org.id,
          organizationKind: kind,
          userId: user.id,
          role,
          status: "ACTIVE",
        },
      });
      memberships.push({ id: m.id, organizationId: org.id, role });
    }
    if (role === "VET") {
      await prisma.vetCredential.create({
        data: {
          userId: user.id,
          registrationNumber: `SYNTHETIC-M5-${key()}`,
          status: "VERIFIED",
          reviewedById: SYNTHETIC_IDS.reviewer,
          reviewedAt: new Date(),
        },
      });
    }
    return {
      userId: user.id,
      displayName: user.displayName,
      locale: "en",
      status: "ACTIVE",
      firebaseUid: user.firebaseUid,
      memberships,
      capabilities: [],
    } as AccountPrincipal;
  }

  try {
    const farmer = await actor();
    const otherFarmer = await actor();
    const vet = await actor("VET");
    const admin = await actor("ADMIN");

    const farm = await care.createFarm(farmer, key(), {
      name: "M5 Ops Farm",
      district: "Dhaka",
      address: "Private M5 Address",
      areaAcres: "2.0",
    });
    const animal = await care.createAnimal(farmer, key(), {
      farmId: farm.id,
      name: "M5 Cow",
      species: "cattle",
      breed: "Local",
      sex: "female",
      birthDate: "2022-01-01",
      weightKg: "180.0",
      estimateMinor: "8000000",
    });

    // 1. Outbox enqueue deduplication & Care consultation pipeline enqueues minimal notifications
    const futureSlotTime = new Date(Date.now() + 2 * 60_000);
    futureSlotTime.setUTCSeconds(0, 0);
    await care.availability(vet, key(), 0, [futureSlotTime.toISOString()]);
    const vetSlots = await care.slots(vet.userId);
    const appt = await care.book(farmer, key(), {
      animalId: animal.id,
      slotId: vetSlots.items[0]!.id,
      mode: "visit",
      reason: "Routine check",
      consent: true,
      consentVersion: "care-v1",
    });
    await care.decision(vet, appt.id, key(), 1, {
      decision: "accept",
      note: "Accepted for visit",
    });
    await care.start(vet, appt.id, key(), 2);
    const sensitiveDiagnosis = "CONFIDENTIAL_DIAGNOSIS_M5_SECRET";
    const followUpAt = new Date(Date.now() + 2 * 3_600_000).toISOString();
    await care.complete(vet, appt.id, key(), 3, {
      kind: "checkup",
      diagnosis: sensitiveDiagnosis,
      advice: "Vitamin course",
      medicines: [
        { name: "SecretMed", dose: "10ml", frequency: "Daily", days: 3 },
      ],
      followUpAt,
    });

    // Direct duplicate enqueue must be idempotent without aborting transaction
    const dedupeKey = `m5-dedupe-${key()}`;
    await prisma.$transaction(async (tx) => {
      await OutboxWorkerService.enqueue(tx, {
        topic: "APPOINTMENT_ACCEPTED",
        dedupeKey,
        aggregateKind: "appointment",
        aggregateId: appt.id,
        payload: {
          recipientId: farmer.userId,
          linkKind: "appointment",
          linkId: appt.id,
        },
      });
      await OutboxWorkerService.enqueue(tx, {
        topic: "APPOINTMENT_ACCEPTED",
        dedupeKey,
        aggregateKind: "appointment",
        aggregateId: appt.id,
        payload: {
          recipientId: farmer.userId,
          linkKind: "appointment",
          linkId: appt.id,
        },
      });
    });
    assert.equal(await prisma.outboxEvent.count({ where: { dedupeKey } }), 1);

    const initialBatch = await worker.processBatch("m5-worker-1");
    assert.ok(initialBatch.succeeded >= 1);

    // Notifications contain no clinical diagnosis/medicine leakage and are strictly user-scoped
    const inbox = await ops.listNotifications(farmer, { limit: 25 });
    assert.ok(inbox.items.length >= 2);
    assert.ok(inbox.unreadCount >= 2);
    for (const item of inbox.items) {
      assert.ok(!item.title.includes(sensitiveDiagnosis));
      assert.ok(!item.body.includes(sensitiveDiagnosis));
      assert.ok(!item.body.includes("SecretMed"));
    }

    const otherInbox = await ops.listNotifications(otherFarmer, { limit: 25 });
    assert.equal(otherInbox.items.length, 0);
    const crossRead = await ops.markRead(otherFarmer, key(), {
      ids: [inbox.items[0]!.id],
    });
    assert.equal(crossRead.markedCount, 0);

    const marked = await ops.markRead(farmer, key(), {
      ids: inbox.items.map((i) => i.id),
    });
    assert.equal(marked.unreadCount, 0);

    // 2. Notification preferences (notify-v1 + optimistic concurrency)
    const prefs0 = await ops.getPreferences(farmer);
    const prefs1 = await ops.updatePreferences(farmer, key(), prefs0.version, {
      inAppEnabled: true,
      smsEnabled: true,
      pushEnabled: false,
      consentVersion: "notify-v1",
    });
    assert.equal(prefs1.version, prefs0.version + 1);
    assert.equal(prefs1.smsEnabled, true);
    await denied(
      ops.updatePreferences(farmer, key(), prefs0.version, {
        inAppEnabled: true,
        smsEnabled: false,
        pushEnabled: false,
        consentVersion: "notify-v1",
      }),
      409,
    );

    // 3. Crash-before-send & crash-after-send recovery with idempotent notification deduplication
    const crashKey = `m5-crash-${key()}`;
    await prisma.$transaction((tx) =>
      OutboxWorkerService.enqueue(tx, {
        topic: "APPOINTMENT_REQUESTED",
        dedupeKey: crashKey,
        aggregateKind: "appointment",
        aggregateId: appt.id,
        payload: {
          recipientId: farmer.userId,
          linkKind: "appointment",
          linkId: appt.id,
        },
      }),
    );

    const failBefore = await worker.processBatch("m5-worker-before", {
      faultHook: ({ dedupeKey: k, stage }) => {
        if (k === crashKey && stage === "before_send") {
          throw new Error("Simulated crash before delivery");
        }
      },
    });
    assert.ok(failBefore.failed >= 1);
    assert.equal(
      await prisma.notification.count({
        where: { recipientId: farmer.userId, dedupeKey: crashKey },
      }),
      0,
    );

    const afterBackoff = new Date(Date.now() + 10 * 60_000);
    const failAfter = await worker.processBatch("m5-worker-after", {
      now: afterBackoff,
      faultHook: ({ dedupeKey: k, stage }) => {
        if (k === crashKey && stage === "after_send") {
          throw new Error("Simulated crash after delivery");
        }
      },
    });
    assert.ok(failAfter.failed >= 1);
    assert.equal(
      await prisma.notification.count({
        where: { recipientId: farmer.userId, dedupeKey: crashKey },
      }),
      1,
    );

    await worker.processBatch("m5-worker-recover", {
      now: new Date(afterBackoff.getTime() + 10 * 60_000),
    });
    const recoveredEvent = await prisma.outboxEvent.findUniqueOrThrow({
      where: { dedupeKey: crashKey },
    });
    assert.equal(recoveredEvent.status, "COMPLETED");
    assert.equal(
      await prisma.notification.count({
        where: { recipientId: farmer.userId, dedupeKey: crashKey },
      }),
      1,
    );

    // 4. Stale PROCESSING lease reclamation
    const staleKey = `m5-stale-${key()}`;
    await prisma.outboxEvent.create({
      data: {
        topic: "CONSULTATION_COMPLETED",
        dedupeKey: staleKey,
        aggregateKind: "consultation",
        aggregateId: appt.id,
        status: "PROCESSING",
        lockOwner: "crashed-worker",
        lockedUntil: new Date(Date.now() - 60_000),
        payload: {
          recipientId: farmer.userId,
          linkKind: "animal",
          linkId: animal.id,
        },
      },
    });
    const reclaimedBatch = await worker.processBatch("m5-worker-reclaim");
    assert.ok(reclaimedBatch.reclaimed >= 1);
    await worker.processBatch("m5-worker-after-reclaim-backoff", {
      now: new Date(Date.now() + 60_000),
    });
    assert.equal(
      (
        await prisma.outboxEvent.findUniqueOrThrow({
          where: { dedupeKey: staleKey },
        })
      ).status,
      "COMPLETED",
    );

    // 5. Dead-letter queue + non-admin rejection + admin retry
    const dlqKey = `m5-dlq-${key()}`;
    const dlqEvent = await prisma.outboxEvent.create({
      data: {
        topic: "CONSULTATION_COMPLETED",
        dedupeKey: dlqKey,
        aggregateKind: "consultation",
        aggregateId: appt.id,
        maxAttempts: 1,
        payload: {
          recipientId: farmer.userId,
          linkKind: "animal",
          linkId: animal.id,
        },
      },
    });
    await worker.processBatch("m5-worker-dlq", {
      faultHook: ({ dedupeKey: k, stage }) => {
        if (k === dlqKey && stage === "before_send") {
          throw new Error("Terminal adapter failure");
        }
      },
    });
    assert.equal(
      (
        await prisma.outboxEvent.findUniqueOrThrow({
          where: { id: dlqEvent.id },
        })
      ).status,
      "DEAD_LETTER",
    );
    await denied(ops.deadLetters(farmer, { limit: 25 }), 403);
    await denied(ops.retryDeadLetter(farmer, dlqEvent.id, key()), 403);
    await denied(ops.systemHealth(farmer), 403);
    await denied(ops.auditEvents(farmer, { limit: 25 }), 403);

    const dlqList = await ops.deadLetters(admin, { limit: 25 });
    assert.ok(dlqList.items.some((item) => item.id === dlqEvent.id));
    await ops.retryDeadLetter(admin, dlqEvent.id, key());
    await worker.processBatch("m5-worker-dlq-recovered", {
      now: new Date(Date.now() + 5_000),
    });
    assert.equal(
      (
        await prisma.outboxEvent.findUniqueOrThrow({
          where: { id: dlqEvent.id },
        })
      ).status,
      "COMPLETED",
    );

    const attempts = await prisma.jobAttempt.findMany({
      where: { outboxEventId: dlqEvent.id },
      orderBy: { attemptNumber: "asc" },
    });
    assert.deepEqual(attempts.map(({ attemptNumber, outcome }) => [attemptNumber, outcome]), [
      [1, "FAILED"],
      [2, "SUCCEEDED"],
    ]);

    // 6. Due & 4h overdue escalation sweep + adherence suppression + Asia/Dhaka date uniqueness
    const completedVetRecord = await prisma.healthRecord.findFirstOrThrow({
      where: { animalId: animal.id, source: "VET" },
    });
    const dueAtNow = new Date();
    const takenReminder = await prisma.careReminder.update({
      where: { recordId: completedVetRecord.id },
      data: { dueAt: dueAtNow },
    });
    const amendment = await care.amend(vet, completedVetRecord.id, key(), {
      note: "Synthetic follow-up fixture",
      reason: "Exercise separate reminder adherence",
    });
    const missedReminder = await prisma.careReminder.create({
      data: {
        animalId: animal.id,
        ownerId: farmer.userId,
        recordId: amendment.id,
        dueAt: dueAtNow,
      },
    });

    const todayDhaka = dhakaDateString(dueAtNow);
    await ops.recordAdherence(farmer, takenReminder.id, key(), {
      localDate: todayDhaka,
      status: "taken",
    });
    await denied(
      ops.recordAdherence(farmer, takenReminder.id, key(), {
        localDate: todayDhaka,
        status: "skipped",
      }),
      409,
    );

    const sweepNow = new Date(dueAtNow.getTime() + 4 * 3_600_000 + 60_000);
    const sweep = await worker.sweepReminders("m5-sweep-worker", sweepNow);
    assert.ok(sweep.dueDispatched >= 2);
    assert.ok(sweep.escalated >= 1);
    assert.equal(
      await prisma.outboxEvent.count({
        where: { dedupeKey: `reminder-escalation:${missedReminder.id}` },
      }),
      1,
    );
    assert.equal(
      await prisma.outboxEvent.count({
        where: { dedupeKey: `reminder-escalation:${takenReminder.id}` },
      }),
      0,
    );

    // 7. Expired non-READY file cleanup leaves READY files intact
    const expiredUpload = {
      animalId: animal.id,
      uploaderId: farmer.userId,
      ownerAtUploadId: farmer.userId,
      purpose: "animal-photo",
      contentType: "image/png",
      declaredBytes: 128,
      expiresAt: new Date(Date.now() - 60_000),
    };
    const pendingUpload = await prisma.privateFile.create({
      data: expiredUpload,
    });
    const pngBytes = await sharp({
      create: {
        width: 1,
        height: 1,
        channels: 4,
        background: { r: 20, g: 120, b: 60, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
    const quarantinedFile = await prisma.privateFile.create({
      data: {
        ...expiredUpload,
        status: "QUARANTINED",
        bytes: new Uint8Array(pngBytes),
        sha256: createHash("sha256").update(pngBytes).digest("hex"),
      },
    });
    const readyUpload = await care.upload(farmer, key(), {
      animalId: animal.id,
      purpose: "animal-photo",
      contentType: "image/png",
      sizeBytes: pngBytes.length,
    });
    const stored = await care.content(
      farmer,
      readyUpload.id,
      "image/png",
      pngBytes,
    );
    await care.fileComplete(farmer, readyUpload.id, key(), stored.sha256);

    const removed = await worker.cleanupExpiredFiles("m5-file-cleaner");
    assert.ok(removed >= 2);
    assert.equal(
      await prisma.privateFile.findUnique({ where: { id: pendingUpload.id } }),
      null,
    );
    assert.equal(
      await prisma.privateFile.findUnique({
        where: { id: quarantinedFile.id },
      }),
      null,
    );
    assert.ok(
      await prisma.privateFile.findUnique({ where: { id: readyUpload.id } }),
    );

    // 8. Admin health/audit & runtime DB immutability triggers
    const health = await ops.systemHealth(admin);
    assert.equal(health.status, "ok");
    const audits = await ops.auditEvents(admin, { limit: 25 });
    assert.ok(audits.items.length >= 1);

    await assert.rejects(
      db.prisma.$executeRawUnsafe(
        "UPDATE palito.audit_events SET action = 'FORGED'",
      ),
    );
    await assert.rejects(
      db.prisma.$executeRawUnsafe("DELETE FROM palito.audit_events"),
    );
    await assert.rejects(
      db.prisma.$executeRawUnsafe("DELETE FROM palito.notifications"),
    );
  } finally {
    await db.onApplicationShutdown();
  }
}
