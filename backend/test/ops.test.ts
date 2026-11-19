import "reflect-metadata";
import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import {
  AdherenceDto,
  AuditEventsPageDto,
  MarkNotificationsReadDto,
  NotificationPrefsDto,
} from "../src/ops/dto.js";
import {
  computeBackoffMs,
  dhakaDateString,
  minimalNotificationCopy,
  validateAdherenceDate,
} from "../src/ops/ops-math.js";
import { harness } from "./helpers.js";

test("ops-math: computeBackoffMs grows exponentially and caps cleanly", () => {
  const b1 = computeBackoffMs(1);
  const b2 = computeBackoffMs(2);
  const b3 = computeBackoffMs(3);
  const b20 = computeBackoffMs(20);
  const b21 = computeBackoffMs(21);

  assert.ok(b1 > 0);
  assert.ok(b2 >= b1 * 2);
  assert.ok(b3 >= b2 * 2);
  assert.ok(b20 >= b3);
  assert.equal(b20, b21);
});

test("ops-math: dhakaDateString and validateAdherenceDate enforce UTC+6 local dates", () => {
  assert.equal(
    dhakaDateString(new Date("2026-11-15T17:59:59.000Z")),
    "2026-11-15",
  );
  assert.equal(
    dhakaDateString(new Date("2026-11-15T18:00:00.000Z")),
    "2026-11-16",
  );

  const now = new Date("2026-11-15T12:00:00.000Z");
  const validToday = validateAdherenceDate("2026-11-15", now);
  assert.ok(validToday instanceof Date);
  assert.ok(Number.isFinite(validToday.getTime()));

  assert.throws(() => validateAdherenceDate("2026-11-20", now));
  assert.throws(() => validateAdherenceDate("2026-02-30", now));
  assert.throws(() => validateAdherenceDate("15-11-2026", now));
});

test("ops-math: minimalNotificationCopy avoids clinical or PII content across all M4/M5/M6 topics", () => {
  const topics = [
    "REMINDER_DUE",
    "REMINDER_OVERDUE_ESCALATED",
    "CARE_REMINDER_DUE",
    "CARE_REMINDER_ESCALATION",
    "APPOINTMENT_REQUESTED",
    "APPOINTMENT_ACCEPTED",
    "APPOINTMENT_REJECTED",
    "APPOINTMENT_CANCELLED",
    "CONSULTATION_COMPLETED",
    "VALUATION_APPROVED",
    "LOAN_SUBMITTED",
    "LOAN_APPROVED",
    "LOAN_REJECTED",
    "LOAN_DISBURSED",
    "LOAN_GRACE_GRANTED",
    "LOAN_REPAID",
    "LOAN_REPAYMENT_SETTLED",
    "PAYMENT_SETTLED",
    "UNKNOWN_TOPIC_FALLBACK",
  ];

  for (const topic of topics) {
    const copy = minimalNotificationCopy(topic);
    assert.equal(typeof copy.title, "string");
    assert.equal(typeof copy.body, "string");
    assert.ok(copy.title.trim().length > 0, `${topic} missing title`);
    assert.ok(copy.body.trim().length > 0, `${topic} missing body`);
    assert.doesNotMatch(copy.title, /diagnosis|prescription|01\d{9}/i);
    assert.doesNotMatch(copy.body, /diagnosis|prescription|01\d{9}/i);
  }
});

test("M5 DTOs enforce notify-v1 consent, adherence enum/date pattern, UUID arrays, and audit filters", async () => {
  const badPrefs = plainToInstance(NotificationPrefsDto, {
    inAppEnabled: true,
    smsEnabled: false,
    pushEnabled: false,
    consentVersion: "legacy-v0",
  });
  assert.ok((await validate(badPrefs)).length > 0);

  const goodPrefs = plainToInstance(NotificationPrefsDto, {
    inAppEnabled: true,
    smsEnabled: true,
    pushEnabled: false,
    consentVersion: "notify-v1",
  });
  assert.equal((await validate(goodPrefs)).length, 0);

  const badAdherence = plainToInstance(AdherenceDto, {
    localDate: "2026/11/15",
    status: "missed",
  });
  assert.ok((await validate(badAdherence)).length >= 2);

  const badRead = plainToInstance(MarkNotificationsReadDto, {
    ids: ["not-a-uuid"],
  });
  assert.ok((await validate(badRead)).length > 0);

  const goodAudit = plainToInstance(AuditEventsPageDto, {
    targetKind: "loan",
    targetId: "00000000-0000-4000-8000-000000000001",
    limit: "10",
  });
  assert.equal((await validate(goodAudit)).length, 0);
});

test("HTTP harness requires authentication for all M5 notification, adherence, and ops admin routes", async () => {
  const { app } = await harness();
  try {
    const server = app.getHttpServer();
    await request(server).get("/api/v1/me/notification-preferences").expect(401);
    await request(server)
      .patch("/api/v1/me/notification-preferences")
      .send({
        inAppEnabled: true,
        smsEnabled: false,
        pushEnabled: false,
        consentVersion: "notify-v1",
      })
      .expect(401);
    await request(server).get("/api/v1/notifications").expect(401);
    await request(server)
      .post("/api/v1/notifications/read")
      .send({ ids: ["00000000-0000-4000-8000-000000000001"] })
      .expect(401);
    await request(server)
      .post(
        "/api/v1/reminders/00000000-0000-4000-8000-000000000001/adherence-events",
      )
      .send({ localDate: "2026-11-15", status: "taken" })
      .expect(401);
    await request(server).get("/api/v1/admin/system-health").expect(401);
    await request(server).get("/api/v1/admin/outbox/dead-letter").expect(401);
    await request(server)
      .post("/api/v1/admin/outbox/00000000-0000-4000-8000-000000000001/retry")
      .expect(401);
    await request(server).get("/api/v1/admin/audit-events").expect(401);
  } finally {
    await app.close();
  }
});
