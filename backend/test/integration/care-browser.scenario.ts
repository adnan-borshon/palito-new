import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import type { Browser, Page } from "playwright";
export interface BrowserVet {
  email: string;
  password: string;
}
export async function careBrowserJourney(
  farmer: Page,
  browser: Browser,
  vet: BrowserVet,
  farmerToken: string,
) {
  const load = async (page: Page, heading = /Farmer dashboard/) => {
    await page.bringToFront();
    await page.goto("http://localhost:3000/care");
    await page.getByRole("heading", { name: heading }).waitFor();
  };
  await load(farmer);
  await farmer
    .getByRole("button", { name: "খামার যোগ · Add farm", exact: true })
    .click();
  for (const [label, value] of [
    ["খামারের নাম · Farm name", "Browser M4 farm"],
    ["জেলা · District", "Dhaka"],
    ["ঠিকানা · Address", "Synthetic browser private address"],
    ["জমি · Area (acres)", "1.5"],
  ])
    await farmer.getByLabel(label!, { exact: true }).fill(value!);
  await farmer
    .getByRole("button", { name: "সংরক্ষণ · Save", exact: true })
    .click();
  await farmer
    .getByRole("heading", { name: "Browser M4 farm", exact: true })
    .waitFor();
  await farmer
    .getByRole("button", { name: "পশু নিবন্ধন · Register animal", exact: true })
    .click();
  for (const [label, value] of [
    ["পশুর নাম · Animal name", "Browser M4 animal"],
    ["জাত · Breed", "Synthetic"],
    ["জন্ম · Birth date (YYYY-MM-DD)", "2020-01-01"],
    ["ওজন · Weight (kg)", "200"],
    ["Estimate (poisha; 100 = BDT 1)", "1000000"],
    ["Tag (optional; generated if blank)", "BROWSER-M4"],
  ])
    await farmer.getByLabel(label!, { exact: true }).fill(value!);
  await farmer
    .getByRole("button", { name: "সংরক্ষণ · Save", exact: true })
    .click();
  await farmer
    .getByRole("heading", {
      name: "Browser M4 animal · BROWSER-M4",
      exact: true,
    })
    .waitFor();
  // Use the native client's bearer-token auth path against the same backend
  // that accepted the web client's cookie-authenticated animal registration.
  const api = "http://127.0.0.1:4000/api/v1";
  const bearer = { Authorization: `Bearer ${farmerToken}` };
  const animals = await fetch(`${api}/animals`, { headers: bearer });
  assert.equal(animals.status, 200);
  const animal = (await animals.json()).items.find(
    (row: { tag: string }) => row.tag === "BROWSER-M4",
  );
  assert.ok(animal);
  const updated = await fetch(`${api}/animals/${animal.id}`, {
    method: "PATCH",
    headers: {
      ...bearer,
      "Content-Type": "application/json",
      "If-Match": String(animal.version),
      "Idempotency-Key": randomUUID(),
    },
    body: JSON.stringify({
      name: "Browser M4 animal synced",
      breed: animal.breed,
      weightKg: animal.weightKg,
      estimateMinor: animal.estimateMinor,
    }),
  });
  assert.equal(updated.status, 200);
  await farmer.evaluate(() => window.dispatchEvent(new Event("focus")));
  await farmer.getByRole("heading", { name: "Browser M4 animal synced · BROWSER-M4", exact: true }).waitFor();
  await farmer.getByRole("button", { name: "খামার ও পশু · Farms & animals", exact: true }).click();
  await farmer.getByRole("heading", { name: "Browser M4 animal synced · BROWSER-M4", exact: true }).waitFor();
  const context = await browser.newContext();
  const doctor = await context.newPage();
  try {
    await doctor.goto("http://localhost:3000/identity/staff");
    await doctor.getByLabel("Email", { exact: true }).fill(vet.email);
    await doctor.getByLabel("Password", { exact: true }).fill(vet.password);
    const challenge = doctor.waitForResponse(
      (r) => r.url().includes("mfaSignIn:start") && r.status() === 200,
    );
    await doctor.getByRole("button", { name: "Sign in", exact: true }).click();
    const info = await (await challenge).json();
    const codes = await (
      await fetch(
        `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/emulator/v1/projects/demo-palito/verificationCodes`,
      )
    ).json();
    const code = codes.verificationCodes.find(
      (v: { sessionInfo: string }) =>
        v.sessionInfo === info.phoneResponseInfo.sessionInfo,
    ).code;
    await doctor.getByLabel("SMS code", { exact: true }).fill(code);
    await doctor
      .getByRole("button", { name: "Verify MFA code", exact: true })
      .click();
    await doctor
      .getByText(
        "MFA verified. Accept your invitation or open your staff session.",
        { exact: true },
      )
      .waitFor();
    await doctor
      .getByRole("button", { name: "Open staff session", exact: true })
      .click();
    await doctor
      .getByText("স্বাগতম · Welcome, Synthetic care vet", { exact: true })
      .waitFor();
    await load(doctor, /Vet dashboard/);
    await doctor
      .getByRole("button", {
        name: "আমার সময়সূচি · My availability",
        exact: true,
      })
      .click();
    const startsAt = new Date(
      Math.ceil((Date.now() + 120000) / 60000) * 60000,
    ).toISOString();
    await doctor
      .getByLabel(
        "One UTC start per line, e.g. 2030-01-01T10:00:00Z. Replace open times; booked times stay reserved.",
        { exact: true },
      )
      .fill(startsAt);
    await doctor
      .getByRole("button", { name: "সংরক্ষণ · Save", exact: true })
      .click();
    await doctor.getByText("সংরক্ষিত · Saved", { exact: true }).waitFor();
    await load(farmer);
    await farmer
      .getByRole("button", { name: "পশু চিকিৎসক · Find a vet", exact: true })
      .click();
    const vetCard = farmer.getByRole("article").filter({
      has: farmer.getByRole("heading", {
        name: "Synthetic care vet",
        exact: true,
      }),
    });
    await vetCard
      .getByRole("button", { name: "Available times", exact: true })
      .click();
    await farmer
      .getByRole("button", { name: "Book this time", exact: true })
      .click();
    await farmer
      .getByLabel("কারণ · Reason", { exact: true })
      .fill("Synthetic browser care request");
    await farmer.getByRole("checkbox").check();
    await farmer
      .getByRole("button", { name: "সংরক্ষণ · Save", exact: true })
      .click();
    await farmer
      .getByRole("heading", {
        name: "মিলন · Appointment · REQUESTED",
        exact: true,
      })
      .waitFor();
    await load(doctor, /Vet dashboard/);
    await doctor
      .getByRole("button", { name: "Accept appointment", exact: true })
      .click();
    await doctor
      .getByLabel("Decision note", { exact: true })
      .fill("Synthetic accepted");
    await doctor
      .getByRole("button", { name: "সংরক্ষণ · Save", exact: true })
      .click();
    await doctor
      .getByRole("button", { name: "Start consultation", exact: true })
      .click();
    await doctor
      .getByRole("button", {
        name: "Sign consultation & prescription",
        exact: true,
      })
      .click();
    for (const [label, value] of [
      ["Clinical finding", "Synthetic browser finding"],
      ["Advice", "Synthetic browser advice"],
      [
        "Follow-up UTC (optional, e.g. 2030-01-01T10:00:00Z)",
        new Date(Date.now() + 86400000).toISOString(),
      ],
      ["Medicine 1 name", "Synthetic test item"],
      ["Medicine 1 dose", "Synthetic test dose"],
      ["Medicine 1 frequency", "Synthetic test frequency"],
      ["Medicine 1 days", "1"],
    ])
      await doctor.getByLabel(label!, { exact: true }).fill(value!);
    await doctor
      .getByRole("button", { name: "সংরক্ষণ · Save", exact: true })
      .click();
    await doctor
      .getByText("Synthetic browser advice", { exact: true })
      .waitFor();
    await load(farmer);
    await farmer
      .getByRole("heading", { name: "পরবর্তী চিকিৎসা · Follow-up", exact: true })
      .waitFor();
    await farmer.getByRole("button", { name: "প্রেসক্রিপশন · Prescriptions", exact: true }).click();
    await farmer.getByRole("button", { name: "প্রেসক্রিপশন দেখুন · View signed prescription", exact: true }).click();
    await farmer.getByText("Synthetic browser advice", { exact: true }).waitFor();
    const prescriptions = await fetch(`${api}/prescriptions`, { headers: bearer });
    assert.equal(prescriptions.status, 200);
    assert.ok((await prescriptions.json()).items.some(
      (row: { animalTag: string }) => row.animalTag === "BROWSER-M4",
    ));
    await farmer.getByRole("button", { name: "খামার ও পশু · Farms & animals", exact: true }).click();
    await farmer.getByRole("button", { name: "পাসপোর্ট · Passport", exact: true }).click();
    const png = await sharp({
      create: { width: 2, height: 2, channels: 3, background: "#447744" },
    })
      .png()
      .toBuffer();
    await farmer
      .getByLabel("পশুর ছবি · Upload animal photo (PNG / JPEG, up to 1 MiB)", {
        exact: true,
      })
      .setInputFiles({
        name: "synthetic.png",
        mimeType: "image/png",
        buffer: png,
      });
    await farmer
      .getByRole("button", { name: "View private image", exact: true })
      .waitFor();
    await farmer
      .getByRole("button", { name: "View private image", exact: true })
      .click();
    await farmer
      .getByAltText("Authorized private animal image", { exact: true })
      .waitFor();
    await load(farmer);
    await farmer
      .getByRole("button", { name: "Withdraw vet access", exact: true })
      .click();
    await farmer.getByRole("checkbox").check();
    await farmer
      .getByRole("button", { name: "সংরক্ষণ · Save", exact: true })
      .click();
    await farmer.getByText("সংরক্ষিত · Saved", { exact: true }).waitFor();
    await load(doctor, /Vet dashboard/);
    assert.equal(
      await doctor
        .getByRole("button", { name: "Patient passport", exact: true })
        .count(),
      0,
    );
  } finally {
    await context.close();
  }
}
