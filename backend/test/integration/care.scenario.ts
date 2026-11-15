import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import sharp from "sharp";
import type { PrismaClient } from "../../src/generated/prisma/client.js";
import type { AccountPrincipal } from "../../src/identity/accounts.js";
import { CareService } from "../../src/care/care.service.js";
import { DatabaseService } from "../../src/platform/database.js";
import { loadConfig } from "../../src/platform/config.js";
import { createLogger } from "../../src/platform/logger.js";
import { SYNTHETIC_IDS } from "../../src/database/synthetic.js";
const key = () => randomUUID();
async function denied(work: Promise<unknown>, status: number) {
  await assert.rejects(
    work,
    (e: { getStatus?: () => number }) => e.getStatus?.() === status,
  );
}
export async function careScenario(
  prisma: PrismaClient,
  env: NodeJS.ProcessEnv,
) {
  const config = loadConfig({
    ...env,
    HEALTHCARE_NO_CHARGE_PILOT: "true",
    LOG_LEVEL: "silent",
  });
  const db = new DatabaseService(config, createLogger(config));
  const other = new DatabaseService(config, createLogger(config));
  const care = new CareService(db, config),
    second = new CareService(other, config);
  async function actor(role?: "VET" | "ADMIN" | "BANK_STAFF") {
    const user = await prisma.user.create({
      data: {
        firebaseUid: `synthetic-m4-${key()}`,
        displayName: "Synthetic care test",
        status: "ACTIVE",
      },
    });
    const memberships: AccountPrincipal["memberships"] = [];
    if (role) {
      const kind =
        role === "VET" ? "CLINIC" : role === "ADMIN" ? "PLATFORM" : "BANK";
      const org = await prisma.organization.create({
        data: { name: "Synthetic care org", kind, status: "ACTIVE" },
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
    if (role === "VET")
      await prisma.vetCredential.create({
        data: {
          userId: user.id,
          registrationNumber: `SYNTHETIC-${key()}`,
          status: "VERIFIED",
          reviewedById: SYNTHETIC_IDS.reviewer,
          reviewedAt: new Date(),
        },
      });
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
    const a = await actor(),
      b = await actor(),
      vet = await actor("VET"),
      outsider = await actor("VET"),
      admin = await actor("ADMIN"),
      bank = await actor("BANK_STAFF");
    const farmData = {
      name: "Synthetic M4 farm",
      district: "Dhaka",
      address: "Synthetic location",
      areaAcres: "1.125",
    };
    const farm = await care.createFarm(a, key(), farmData),
      farmB = await care.createFarm(b, key(), farmData);
    const animalData = {
      farmId: farm.id,
      name: "Synthetic animal",
      species: "cattle",
      breed: "Synthetic",
      sex: "female",
      birthDate: "2020-01-01",
      weightKg: "200.250",
      estimateMinor: "10000001",
    };
    const replay = key();
    const animal = await care.createAnimal(a, replay, animalData);
    assert.deepEqual(await care.createAnimal(a, replay, animalData), animal);
    await denied(
      care.createAnimal(a, replay, { ...animalData, name: "Changed" }),
      409,
    );
    await denied(care.createAnimal(b, key(), animalData), 404);
    const animalB = await care.createAnimal(b, key(), {
      ...animalData,
      farmId: farmB.id,
    });
    assert.equal((await care.animals(a, { limit: 1 })).items.length, 1);
    assert.equal(
      (await care.passport(a, animal.id)).animal.estimateMinor,
      "10000001",
    );
    for (const p of [b, vet, outsider, admin, bank]) {
      await denied(care.passport(p, animal.id), 404);
      await denied(care.records(p, animal.id, { limit: 25 }), 404);
      await denied(care.files(p, animal.id, { limit: 25 }), 404);
    }
    const edit = {
      name: "Edited",
      breed: "Synthetic",
      weightKg: "201",
      estimateMinor: "10000002",
    };
    await denied(care.editAnimal(b, animal.id, key(), 1, edit), 404);
    await care.editAnimal(a, animal.id, key(), 1, edit);
    await denied(care.editAnimal(a, animal.id, key(), 1, edit), 409);
    for (let n = 0; n < 3; n++)
      await care.observation(a, animal.id, key(), `Synthetic observation ${n}`);
    const first = await care.records(a, animal.id, { limit: 2 });
    assert.ok(first.nextCursor);
    assert.equal(first.items.length, 2);
    assert.equal(
      (
        await care.records(a, animal.id, {
          limit: 2,
          cursor: first.nextCursor!,
        })
      ).items.length,
      1,
    );
    const start = new Date(Math.ceil((Date.now() + 120000) / 60000) * 60000);
    const starts = Array.from({ length: 5 }, (_, n) =>
      new Date(start.getTime() + n * 3600000).toISOString(),
    );
    const profileKey = key();
    const professional = {
      district: "Dhaka",
      species: ["cattle"],
      bio: "Synthetic test practice",
    };
    await care.profile(vet, profileKey, 0, professional);
    await care.profile(vet, profileKey, 0, professional);
    assert.equal(
      (
        await care.vets({ limit: 25, district: "Dhaka", species: "cattle" })
      ).items.some((v) => v.id === vet.userId),
      true,
    );
    assert.equal(
      (await care.vets({ limit: 25, district: "Elsewhere" })).items.some(
        (v) => v.id === vet.userId,
      ),
      false,
    );
    assert.equal(
      (await care.professional(vet.userId)).professional?.bio,
      professional.bio,
    );
    await care.availability(vet, key(), 0, starts);
    await denied(care.availability(vet, key(), 0, starts), 409);
    await denied(care.availability(a, key(), 0, starts), 403);
    const slots = (await care.slots(vet.userId)).items;
    assert.equal(slots.length, 5);
    const booking = {
      animalId: animal.id,
      slotId: slots[0]!.id,
      mode: "visit" as const,
      reason: "Synthetic care",
      consent: true,
      consentVersion: "care-v1",
    };
    await denied(
      new CareService(db, {
        ...config,
        HEALTHCARE_NO_CHARGE_PILOT: false,
      }).book(a, key(), booking),
      503,
    );
    const outcomes = await Promise.allSettled([
      care.book(a, key(), booking),
      second.book(b, key(), { ...booking, animalId: animalB.id }),
    ]);
    assert.equal(outcomes.filter((o) => o.status === "fulfilled").length, 1);
    const losing = outcomes.find(
      (o) => o.status === "rejected",
    ) as PromiseRejectedResult;
    assert.equal(losing.reason.getStatus(), 409);
    const winning = outcomes[0]!.status === "fulfilled" ? a : b;
    const winningAnimal = winning === a ? animal : animalB;
    const appointment = (
      outcomes.find((o) => o.status === "fulfilled") as PromiseFulfilledResult<{
        id: string;
        version: number;
      }>
    ).value;
    assert.equal(
      (await care.appointments(winning, { limit: 25 })).items.length,
      1,
    );
    assert.equal(
      (await care.appointments(outsider, { limit: 25 })).items.length,
      0,
    );
    await care.passport(vet, winningAnimal.id);
    await denied(care.appointmentDetail(outsider, appointment.id), 404);
    await denied(
      care.complete(vet, appointment.id, key(), 1, {
        diagnosis: "Synthetic",
        advice: "Synthetic",
        medicines: [],
      }),
      409,
    );
    await care.decision(vet, appointment.id, key(), 1, {
      decision: "accept",
      note: "Synthetic accepted",
    });
    await care.start(vet, appointment.id, key(), 2);
    const completionKey = key();
    const completion = {
      kind: "vaccination",
      diagnosis: "Synthetic test finding",
      advice: "Synthetic test advice",
      medicines: [
        {
          name: "Synthetic test item",
          dose: "Synthetic dose",
          frequency: "Synthetic frequency",
          days: 1,
        },
      ],
      followUpAt: new Date(Date.now() + 86400000).toISOString(),
    };
    const signed = await care.complete(
      vet,
      appointment.id,
      completionKey,
      3,
      completion,
    );
    assert.deepEqual(
      await care.complete(vet, appointment.id, completionKey, 3, completion),
      signed,
    );
    const rx = await care.prescription(winning, signed.prescriptionId);
    assert.ok(rx.signedAt);
    assert.equal(rx.animalId, winningAnimal.id);
    assert.equal(rx.items.length, 1);
    await denied(care.prescription(outsider, signed.prescriptionId), 404);
    await assert.rejects(
      prisma.prescription.update({
        where: { id: rx.id },
        data: { advice: "forged" },
      }),
    );
    const amendment = await care.amend(vet, signed.recordId, key(), {
      note: "Synthetic correction",
      reason: "Synthetic test reason",
    });
    assert.equal(amendment.amendsId, signed.recordId);
    const reminders = await care.reminders(winning);
    assert.equal(reminders.items.length, 1);
    assert.equal(reminders.delivery, "NOT_ENABLED_M5");
    await care.reminder(winning, reminders.items[0]!.id, key(), 1, false);
    const png = await sharp({
      create: { width: 2, height: 2, channels: 3, background: "#286644" },
    })
      .png()
      .toBuffer();
    const upload = await care.upload(winning, key(), {
      animalId: winningAnimal.id,
      purpose: "animal-photo",
      contentType: "image/png",
      sizeBytes: png.length,
    });
    await denied(care.download(winning, upload.id), 404);
    await denied(care.content(winning, upload.id, "image/jpeg", png), 400);
    const content = await care.content(winning, upload.id, "image/png", png);
    assert.equal(
      (await care.fileInfo(winning, upload.id)).sha256,
      content.sha256,
    );
    await denied(
      care.fileComplete(winning, upload.id, key(), "0".repeat(64)),
      404,
    );
    await care.fileComplete(winning, upload.id, key(), content.sha256);
    const downloaded = await care.download(vet, upload.id);
    assert.equal(
      createHash("sha256").update(downloaded).digest("hex"),
      content.sha256,
    );
    await denied(care.download(outsider, upload.id), 404);
    const html = Buffer.from("<script>malicious</script>");
    const bad = await care.upload(winning, key(), {
      animalId: winningAnimal.id,
      purpose: "clinical-evidence",
      contentType: "image/png",
      sizeBytes: html.length,
    });
    await denied(care.content(winning, bad.id, "image/png", html), 400);
    await care.withdraw(winning, appointment.id, key());
    await care.withdraw(winning, appointment.id, key());
    await Promise.all(
      [
        care.download(vet, upload.id),
        care.passport(vet, winningAnimal.id),
        care.prescription(vet, rx.id),
        care.complete(vet, appointment.id, completionKey, 3, completion),
      ].map((work) => denied(work, 404)),
    );
    assert.equal((await care.appointments(vet, { limit: 25 })).items.length, 0);
    // Cancellation still works after withdrawal and releases the slot atomically.
    const next = await care.book(winning, key(), {
      ...booking,
      animalId: winningAnimal.id,
      slotId: slots[1]!.id,
    });
    await care.withdraw(winning, next.id, key());
    await care.cancel(winning, next.id, key(), 1, "Synthetic cancelled");
    assert.equal(
      (await prisma.vetSlot.findUniqueOrThrow({ where: { id: slots[1]!.id } }))
        .status,
      "OPEN",
    );
    const rescheduled = await care.book(winning, key(), {
      ...booking,
      animalId: winningAnimal.id,
      slotId: slots[1]!.id,
    });
    await care.reschedule(winning, rescheduled.id, key(), 1, slots[2]!.id);
    await care.cancel(
      winning,
      rescheduled.id,
      key(),
      2,
      "Synthetic cancellation",
    );
    const expiring = await care.book(winning, key(), {
      ...booking,
      animalId: winningAnimal.id,
      slotId: slots[3]!.id,
    });
    // Simulate elapsed grant time through the migration-owned test fixture only.
    const grant = await prisma.careGrant.findUniqueOrThrow({
      where: { appointmentId: expiring.id },
    });
    assert.ok(grant.expiresAt > new Date());
    await prisma.vetCredential.update({
      where: { userId: vet.userId },
      data: { status: "REJECTED" },
    });
    await denied(care.passport(vet, winningAnimal.id), 403);
    await denied(
      care.decision(vet, expiring.id, key(), 1, {
        decision: "accept",
        note: "Denied",
      }),
      403,
    );
    await prisma.vetCredential.update({
      where: { userId: vet.userId },
      data: { status: "VERIFIED" },
    });
    await prisma.membership.update({
      where: { id: vet.memberships[0]!.id },
      data: { status: "REVOKED" },
    });
    await denied(care.passport(vet, winningAnimal.id), 403);
    await prisma.membership.update({
      where: { id: vet.memberships[0]!.id },
      data: { status: "ACTIVE" },
    });
    await prisma.careGrant.update({
      where: { id: grant.id },
      data: { expiresAt: new Date(grant.grantedAt.getTime() + 1) },
    });
    await denied(care.passport(vet, winningAnimal.id), 404);
    await assert.rejects(
      prisma.privateFile.update({
        where: { id: upload.id },
        data: { sha256: "0".repeat(64) },
      }),
    );
    await assert.rejects(
      prisma.animal.update({
        where: { id: winningAnimal === animal ? animalB.id : animal.id },
        data: { photoFileId: upload.id },
      }),
    );
    // Current ownership must invalidate both old receipts and old file links.
    const recipient = winning === a ? b : a,
      recipientFarm = winning === a ? farmB : farm;
    await prisma.animal.update({
      where: { id: winningAnimal.id },
      data: { ownerId: recipient.userId, farmId: recipientFarm.id },
    });
    await denied(care.download(winning, upload.id), 404);
    await denied(care.download(recipient, upload.id), 404);
    await denied(care.passport(vet, winningAnimal.id), 404);
    if (winning === a)
      await denied(care.createAnimal(a, replay, animalData), 404);
    assert.ok(
      await prisma.careEvent.count({
        where: { kind: "CONSULTATION_COMPLETED" },
      }),
    );
  } finally {
    await db.onApplicationShutdown();
    await other.onApplicationShutdown();
  }
}
