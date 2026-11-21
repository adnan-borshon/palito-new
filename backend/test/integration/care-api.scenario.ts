import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import request from "supertest";
import sharp from "sharp";
import { getAuth } from "firebase-admin/auth";
import { getApps } from "firebase-admin/app";
import type { PrismaClient } from "../../src/generated/prisma/client.js";
import { SYNTHETIC_IDS } from "../../src/database/synthetic.js";
import { createApplication } from "../../src/application.js";
import { loadConfig } from "../../src/platform/config.js";
import { createLogger } from "../../src/platform/logger.js";
const password = "Synthetic-care-emulator-only-123!";
const base = () => `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`;
async function rest(path: string, body?: unknown) {
  const response = await fetch(
    `${base()}${path}`,
    body
      ? {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer owner",
          },
          body: JSON.stringify(body),
        }
      : {},
  );
  const value = await response.json();
  assert.ok(
    response.ok,
    `Official emulator status ${response.status}: ${value.error?.message}`,
  );
  return value;
}
const endpoint = (method: string) =>
  `/identitytoolkit.googleapis.com/v1/accounts:${method}?key=synthetic-emulator-key`;
const mfa = (method: string) =>
  `/identitytoolkit.googleapis.com/v2/accounts/${method}?key=synthetic-emulator-key`;
async function code(sessionInfo: string) {
  const values = await rest(
    "/emulator/v1/projects/demo-palito/verificationCodes",
  );
  return values.verificationCodes.find(
    (v: { sessionInfo: string }) => v.sessionInfo === sessionInfo,
  ).code;
}
export async function careVet(prisma: PrismaClient) {
  const firebase = getAuth(
    getApps().find((a) => a.name === "palito-demo-palito"),
  );
  const email = `synthetic-care-${randomUUID()}@example.test`;
  const user = await firebase.createUser({
    email,
    password,
    emailVerified: true,
  });
  const primary = await rest(endpoint("signInWithPassword"), {
    email,
    password,
    returnSecureToken: true,
  });
  const start = await rest(mfa("mfaEnrollment:start"), {
    idToken: primary.idToken,
    phoneEnrollmentInfo: { phoneNumber: "+8801700000060" },
  });
  const session = start.phoneSessionInfo.sessionInfo;
  await rest(mfa("mfaEnrollment:finalize"), {
    idToken: primary.idToken,
    displayName: "Synthetic care factor",
    phoneVerificationInfo: { sessionInfo: session, code: await code(session) },
  });
  const pending = await rest(endpoint("signInWithPassword"), {
    email,
    password,
    returnSecureToken: true,
  });
  const challenge = await rest(mfa("mfaSignIn:start"), {
    mfaPendingCredential: pending.mfaPendingCredential,
    mfaEnrollmentId: pending.mfaInfo[0].mfaEnrollmentId,
    phoneSignInInfo: {},
  });
  const info = challenge.phoneResponseInfo.sessionInfo;
  const signed = await rest(mfa("mfaSignIn:finalize"), {
    mfaPendingCredential: pending.mfaPendingCredential,
    phoneVerificationInfo: { sessionInfo: info, code: await code(info) },
  });
  // Test-only fixture. Production credential approval remains the M3 administrator API.
  const vet = await prisma.user.create({
    data: {
      firebaseUid: user.uid,
      displayName: "Synthetic care vet",
      status: "ACTIVE",
      emailNormalized: email,
    },
  });
  const org = await prisma.organization.create({
    data: { kind: "CLINIC", name: "Synthetic care clinic", status: "ACTIVE" },
  });
  const membership = await prisma.membership.create({
    data: {
      userId: vet.id,
      organizationId: org.id,
      organizationKind: "CLINIC",
      role: "VET",
      status: "ACTIVE",
    },
  });
  await prisma.vetCredential.create({
    data: {
      userId: vet.id,
      registrationNumber: `SYNTHETIC-${randomUUID()}`,
      status: "VERIFIED",
      reviewedById: SYNTHETIC_IDS.reviewer,
      reviewedAt: new Date(),
    },
  });
  return {
    id: vet.id,
    token: signed.idToken as string,
    primary: primary.idToken as string,
    email,
    password,
    membershipId: membership.id,
  };
}
export async function careApiScenario(
  prisma: PrismaClient,
  env: NodeJS.ProcessEnv,
) {
  const config = loadConfig({
    ...env,
    AUTH_MODE: "emulator",
    FIREBASE_PROJECT_ID: "demo-palito",
    FIREBASE_AUTH_EMULATOR_HOST: process.env.FIREBASE_AUTH_EMULATOR_HOST,
    HEALTHCARE_NO_CHARGE_PILOT: "true",
    LOG_LEVEL: "silent",
    CORS_ORIGINS: "http://localhost:3000",
    RATE_LIMIT_MAX: "2000",
  });
  const app = await createApplication(config, createLogger(config));
  await app.init();
  const server = app.getHttpServer();
  try {
    async function farmer(phoneNumber: string) {
      const sent = await rest(endpoint("sendVerificationCode"), {
        phoneNumber,
      });
      const identity = await rest(endpoint("signInWithPhoneNumber"), {
        sessionInfo: sent.sessionInfo,
        code: await code(sent.sessionInfo),
      });
      await request(server)
        .post("/api/v1/onboarding")
        .send({
          idToken: identity.idToken,
          displayName: "Synthetic M4 API farmer",
          locale: "bn",
        })
        .expect(201);
      return identity.idToken as string;
    }
    const a = await farmer("+8801700000051"),
      b = await farmer("+8801700000052"),
      vet = await careVet(prisma);
    const get = (token: string, path: string) =>
      request(server)
        .get(`/api/v1${path}`)
        .set("Authorization", `Bearer ${token}`);
    const post = (token: string, path: string, version?: number) => {
      const r = request(server)
        .post(`/api/v1${path}`)
        .set("Authorization", `Bearer ${token}`)
        .set("Idempotency-Key", randomUUID());
      if (version !== undefined) r.set("If-Match", String(version));
      return r;
    };
    await request(server).get("/api/v1/vets").expect(401);
    await post(vet.primary, "/vets/me/availability")
      .send({ startsAt: [] })
      .expect(404); // wrong method never changes availability
    const farm = (
      await post(a, "/farms")
        .send({
          name: "API farm",
          district: "Dhaka",
          address: "Synthetic private address",
          areaAcres: "1.5",
        })
        .expect(201)
    ).body;
    const body = {
      farmId: farm.id,
      name: "API animal",
      species: "cattle",
      breed: "Synthetic",
      sex: "female",
      birthDate: "2020-01-01",
      weightKg: "100",
      estimateMinor: "1000000",
    };
    await post(b, "/animals").send(body).expect(404);
    await post(a, "/animals")
      .send({ ...body, ownerId: "forged" })
      .expect(400);
    const animal = (await post(a, "/animals").send(body).expect(201)).body;
    // The web session reads the same row created through the native-style bearer API.
    const csrf = await request(server).get("/api/v1/sessions/csrf").expect(200);
    const csrfCookie = (csrf.headers["set-cookie"] as unknown as string[])[0]!.split(";")[0]!;
    const exchanged = await request(server)
      .post("/api/v1/sessions")
      .set("Origin", "http://localhost:3000")
      .set("Cookie", csrfCookie)
      .set("X-CSRF-Token", csrf.body.csrfToken)
      .send({ idToken: a })
      .expect(201);
    const webCookie = (exchanged.headers["set-cookie"] as unknown as string[])
      .find((value) => value.startsWith("__Host-palito-session=") && !value.startsWith("__Host-palito-session=;"))!.split(";")[0]!;
    const webGet = (path: string) => request(server).get(`/api/v1${path}`).set("Cookie", webCookie);
    assert.equal((await webGet("/animals").expect(200)).body.items[0].id, animal.id);

    const badCursor = Buffer.from(
      JSON.stringify([new Date().toISOString(), "-".repeat(36)]),
    ).toString("base64url");
    await get(a, `/animals?cursor=${badCursor}`).expect(400);
    await get(b, `/animals/${animal.id}/passport`).expect(404);
    await get(b, `/animals/${animal.id}/records`).expect(404);
    await post(a, `/animals/${animal.id}/observations`)
      .send({ note: "Synthetic farmer observation" })
      .expect(201);
    const startsAt = [
      new Date(Math.ceil((Date.now() + 120000) / 60000) * 60000).toISOString(),
    ];
    const availability = (token: string) =>
      request(server)
        .put("/api/v1/vets/me/availability")
        .set("Authorization", `Bearer ${token}`)
        .set("Idempotency-Key", randomUUID())
        .set("If-Match", "0")
        .send({ startsAt });
    await availability(vet.primary).expect(403);
    await availability(vet.token).expect(200);
    const slot = (await get(a, `/vets/${vet.id}/slots`).expect(200)).body
      .items[0];
    await post(a, "/appointments")
      .send({
        animalId: animal.id,
        slotId: slot.id,
        mode: "visit",
        reason: "Synthetic API request",
        consent: false,
        consentVersion: "care-v1",
      })
      .expect(400);
    const appointment = (
      await post(a, "/appointments")
        .send({
          animalId: animal.id,
          slotId: slot.id,
          mode: "visit",
          reason: "Synthetic API request",
          consent: true,
          consentVersion: "care-v1",
        })
        .expect(201)
    ).body;
    assert.equal(appointment.payment.mode, "NO_CHARGE_PILOT");
    await get(vet.primary, `/animals/${animal.id}/passport`).expect(404);
    await post(vet.token, `/appointments/${appointment.id}/decision`, 1)
      .send({ decision: "accept", note: "Synthetic accepted" })
      .expect(201);
    await post(vet.token, `/appointments/${appointment.id}/consultations`, 2)
      .send({})
      .expect(201);
    const signed = (
      await post(vet.token, `/consultations/${appointment.id}/completion`, 3)
        .send({
          diagnosis: "Synthetic finding",
          advice: "Synthetic advice",
          medicines: [
            {
              name: "Synthetic item",
              dose: "Synthetic dose",
              frequency: "Synthetic frequency",
              days: 1,
            },
          ],
          followUpAt: new Date(Date.now() + 86400000).toISOString(),
        })
        .expect(201)
    ).body;
    await get(a, `/prescriptions/${signed.prescriptionId}`).expect(200);
    assert.equal((await webGet("/prescriptions").expect(200)).body.items[0].id, signed.prescriptionId);
    await get(b, `/prescriptions/${signed.prescriptionId}`).expect(404);
    for (const token of [a, vet.token]) {
      const list = (await get(token, "/prescriptions?limit=1").expect(200)).body;
      assert.equal(list.items.length, 1);
      assert.equal(list.items[0].id, signed.prescriptionId);
      assert.equal(list.items[0].animalName, "API animal");
      assert.equal(list.items[0].advice, undefined);
      assert.equal(list.nextCursor, null);
    }
    for (const token of [b, vet.primary]) {
      const list = (await get(token, "/prescriptions").expect(200)).body;
      assert.deepEqual(list.items, []);
    }
    await request(server).get("/api/v1/prescriptions").expect(401);

    const png = await sharp({
      create: { width: 1, height: 1, channels: 3, background: "#447744" },
    })
      .png()
      .toBuffer();
    const file = (
      await post(a, "/files/uploads")
        .send({
          animalId: animal.id,
          purpose: "animal-photo",
          contentType: "image/png",
          sizeBytes: png.length,
        })
        .expect(201)
    ).body;
    await request(server)
      .put(`/api/v1/files/${file.id}/content`)
      .set("Authorization", `Bearer ${b}`)
      .set("Content-Type", "image/png")
      .send(png)
      .expect(404);
    const uploaded = await request(server)
      .put(`/api/v1/files/${file.id}/content`)
      .set("Authorization", `Bearer ${a}`)
      .set("Content-Type", "image/png")
      .send(png)
      .expect(200);
    await post(a, `/files/${file.id}/completion`)
      .send({ sha256: uploaded.body.sha256 })
      .expect(201);
    await get(vet.token, `/files/${file.id}/download`)
      .expect("Content-Type", /image\/png/)
      .expect(200);
    await post(a, `/appointments/${appointment.id}/consent-withdrawal`)
      .send({})
      .expect(201);
    await get(vet.token, `/files/${file.id}/download`).expect(404);
    await get(vet.token, `/animals/${animal.id}/records`).expect(404);
    assert.deepEqual((await get(vet.token, "/prescriptions").expect(200)).body.items, []);
    assert.equal((await get(a, "/prescriptions").expect(200)).body.items[0].id, signed.prescriptionId);

    assert.equal((await get(a, "/reminders").expect(200)).body.items.length, 1);
    await request(server)
      .put(`/api/v1/files/${file.id}/content`)
      .set("Authorization", `Bearer ${a}`)
      .set("Content-Type", "image/png")
      .send(Buffer.alloc(1048577))
      .expect(413);
  } finally {
    await app.close();
  }
}
