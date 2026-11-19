import "reflect-metadata";
import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateLoanQuoteDto } from "../src/finance/dto.js";
import { CreateOrderDto, SaveContentDto } from "../src/extensions/dto.js";
import { FarmDto } from "../src/care/dto.js";
import { createLogger } from "../src/platform/logger.js";
import { harness, testConfig } from "./helpers.js";

test("M9 SEC-DEMO: production config refuses all sandbox, swagger, and emulator switches and exposes zero demo routes", async () => {
  const prodBase = {
    NODE_ENV: "production",
    WEB_ORIGIN: "https://palito.example",
    DATABASE_URL:
      "postgresql://palito_runtime:secret@db/palito?sslmode=verify-full",
    CORS_ORIGINS: "https://palito.example",
  };
  for (const override of [
    { SWAGGER_ENABLED: "true" },
    { FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099" },
    { HEALTHCARE_NO_CHARGE_PILOT: "false", FINANCE_SANDBOX_ENABLED: "true" },
    { EXTENSIONS_SANDBOX_ENABLED: "true" },
    { PAYMENT_PROVIDER: "sandbox" },
    { NOTIFICATION_CHANNEL_MODE: "sandbox" },
    { SANDBOX_WEBHOOK_SECRET: "secret-at-least-16-chars" },
    { DEMO_MODE: "true" },
  ]) {
    assert.throws(() => testConfig({ ...prodBase, ...override }));
  }

  const { app } = await harness();
  try {
    const server = app.getHttpServer();
    await request(server).get("/api/v1/demo").expect(404);
    await request(server).post("/api/v1/commands").send({ command: "demo.reset" }).expect(404);
  } finally {
    await app.close();
  }
});

test("M9 SEC-AUTH: unauthenticated sweep across M3-M8 protected routes always fails closed with 401", async () => {
  const { app } = await harness({
    env: {
      HEALTHCARE_NO_CHARGE_PILOT: "true",
      FINANCE_SANDBOX_ENABLED: "true",
      EXTENSIONS_SANDBOX_ENABLED: "true",
      PAYMENT_PROVIDER: "sandbox",
      SANDBOX_WEBHOOK_SECRET: "sandbox-webhook-secret-16+",
    },
  });
  try {
    const server = app.getHttpServer();
    const uuid = "00000000-0000-4000-8000-000000000001";
    const protectedGets = [
      "/api/v1/me",
      "/api/v1/me/notification-preferences",
      "/api/v1/notifications",
      "/api/v1/farms",
      `/api/v1/farms/${uuid}/summary`,
      `/api/v1/animals/${uuid}/telemetry`,
      "/api/v1/alerts",
      "/api/v1/ai/requests",
      "/api/v1/emergency-requests",
      "/api/v1/products",
      "/api/v1/me/cart",
      "/api/v1/orders",
      "/api/v1/content",
      "/api/v1/admin/users",
      "/api/v1/admin/reports",
      `/api/v1/admin/exports/${uuid}/download`,
      "/api/v1/admin/system-health",
      "/api/v1/admin/audit-events",
      "/api/v1/admin/ledger/reconciliation",
      "/api/v1/policies",
      "/api/v1/claims",
      "/api/v1/loans",
    ];
    for (const route of protectedGets) {
      await request(server).get(route).expect(401);
    }

    for (const [method, path] of [
      ["post", `/api/v1/animals/${uuid}/device-bindings`],
      ["post", "/api/v1/ai/requests"],
      ["post", `/api/v1/consultations/${uuid}/call-token`],
      ["post", "/api/v1/emergency-requests"],
      ["post", "/api/v1/orders"],
      ["post", `/api/v1/orders/${uuid}/fulfillment-events`],
      ["post", "/api/v1/content"],
      ["post", "/api/v1/admin/exports"],
    ] as const) {
      await request(server)[method](path).send({}).expect(401);
    }
  } finally {
    await app.close();
  }
});

test("M9 SEC-INPUT: whitelist + forbidNonWhitelisted DTO boundary rejects mass-assignment fields", async () => {
  const farmErrors = await validate(
    plainToInstance(FarmDto, {
      name: "Safe Farm",
      district: "Dhaka",
      address: "Address",
      areaAcres: "1.5",
      ownerId: "00000000-0000-4000-8000-000000000099",
    }),
    { whitelist: true, forbidNonWhitelisted: true },
  );
  assert.ok(farmErrors.length > 0);

  const quoteErrors = await validate(
    plainToInstance(CreateLoanQuoteDto, {
      animalId: "00000000-0000-4000-8000-000000000001",
      valuationId: "00000000-0000-4000-8000-000000000002",
      requestedPrincipalMinor: "500000",
      termMonths: 6,
      maxPrincipalMinor: "99999999",
    }),
    { whitelist: true, forbidNonWhitelisted: true },
  );
  assert.ok(quoteErrors.length > 0);

  const orderErrors = await validate(
    plainToInstance(CreateOrderDto, {
      shippingAddress: "Sirajganj",
      status: "DELIVERED",
    }),
    { whitelist: true, forbidNonWhitelisted: true },
  );
  assert.ok(orderErrors.length > 0);

  const contentErrors = await validate(
    plainToInstance(SaveContentDto, {
      slug: "care-guide",
      titleBn: "গাইড",
      titleEn: "Guide",
      bodyBn: "বিস্তারিত",
      bodyEn: "Details",
      category: "HEALTH",
      status: "PUBLISHED",
    }),
    { whitelist: true, forbidNonWhitelisted: true },
  );
  assert.ok(contentErrors.length > 0);
});

test("M9 SEC-LOG: logger redacts tokens, headers, secrets, and cookies cleanly", () => {
  const lines: string[] = [];
  const logger = createLogger(
    testConfig({ LOG_LEVEL: "info" }),
    { write: (chunk: string) => lines.push(chunk) },
  );
  logger.info({
    event: "security_redaction_probe",
    authorization: "Bearer secret-jwt-token",
    cookie: "__session=secret-session-cookie",
    idToken: "firebase-id-token-value",
    invitationToken: "invite-secret-hex",
    provisioningSecret: "device-secret-hex",
  });
  const combined = lines.join("");
  assert.doesNotMatch(combined, /secret-jwt-token/);
  assert.doesNotMatch(combined, /secret-session-cookie/);
  assert.doesNotMatch(combined, /firebase-id-token-value/);
  assert.doesNotMatch(combined, /invite-secret-hex/);
});
