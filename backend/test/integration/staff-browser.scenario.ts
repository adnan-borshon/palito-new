import assert from "node:assert/strict";
import type { Browser, Page } from "playwright";

const web = "http://localhost:3000";
const staffPassword = "Synthetic-emulator-password-only-123!";

async function signIn(page: Page, email: string) {
  await page.goto(`${web}/identity/staff`);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(staffPassword);
  const challenge = page.waitForResponse((response) =>
    response.url().includes("mfaSignIn:start") && response.ok(),
  );
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  const { phoneResponseInfo } = await (await challenge).json();
  const codes = await fetch(
    `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/emulator/v1/projects/demo-palito/verificationCodes`,
  );
  assert.equal(codes.status, 200);
  const { verificationCodes } = await codes.json();
  const record = verificationCodes.find((entry: { sessionInfo: string }) =>
    entry.sessionInfo === phoneResponseInfo.sessionInfo,
  );
  assert.ok(record);
  await page.getByLabel("SMS code", { exact: true }).fill(record.code);
  await page.getByRole("button", { name: "Verify MFA code", exact: true }).click();
  await page.getByText("MFA verified. Accept your invitation or open your staff session.", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Open staff session", exact: true }).click();
  await page.getByRole("navigation", { name: "Verified dashboards" }).waitFor();
}

async function assertFitsPhone(page: Page) {
  const width = await page.evaluate(() => ({
    viewport: window.innerWidth,
    page: document.documentElement.scrollWidth,
  }));
  assert.ok(width.page <= width.viewport + 1, "Dashboard must fit a narrow phone viewport");
}

export async function staffBrowserJourney(browser: Browser) {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  try {
    await page.goto(web);
    await page.waitForURL("**/identity");
    await page.getByRole("heading", { name: "পালিতো · Palito sign-in" }).waitFor();
    assert.equal(await page.getByRole("link", { name: "নমুনা · Try the demo" }).getAttribute("href"), "/demo");
    await page.getByLabel("নাম · Name", { exact: true }).focus();
    await page.keyboard.press("Tab");
    assert.equal(await page.getByLabel("ফোন · Phone (+880)", { exact: true }).evaluate((input) =>
      input === document.activeElement), true);
    await assertFitsPhone(page);

    await signIn(page, "bank@palito.example");
    await page.getByRole("link", { name: /Bank & insurance workspace/ }).click();
    await page.getByRole("heading", { name: /Bank dashboard/ }).waitFor();
    await page.getByRole("button", { name: /Loan applications/ }).click();
    await page.getByRole("heading", { name: /Bank dashboard.*SUBMITTED/ }).waitFor();
    await assertFitsPhone(page);

    await page.goto(`${web}/operations`);
    await page.getByRole("status").filter({ hasText: /Check sign-in and access/ }).waitFor();
    assert.equal(await page.getByRole("button", { name: /Users & access/ }).count(), 0);

    await signIn(page, "insurer@palito.example");
    await page.getByRole("link", { name: /Bank & insurance workspace/ }).click();
    await page.getByRole("heading", { name: /Insurer dashboard/ }).waitFor();
    await page.getByRole("button", { name: "দাবি · Claims", exact: true }).click();
    await page.getByRole("heading", { name: /Insurer dashboard.*claims/ }).waitFor();
    await assertFitsPhone(page);

    await signIn(page, "admin@palito.example");
    await page.getByRole("link", { name: /Administration dashboard/ }).click();
    await page.getByRole("heading", { name: /System health/ }).waitFor();
    await page.getByRole("button", { name: "শিক্ষামূলক কন্টেন্ট · Content", exact: true }).click();
    await page.getByRole("button", { name: /New draft/ }).click();
    for (const [label, value] of [
      ["Slug", "release-smoke-content"],
      ["বাংলা শিরোনাম · Bangla title", "খামার পরিচর্যা"],
      ["English title", "Farm care"],
      ["বাংলা লেখা · Bangla text", "নমুনা লেখা"],
      ["English text", "Sample article text"],
    ] as const) {
      await page.getByLabel(label, { exact: true }).fill(value);
    }
    await page.getByRole("button", { name: "সংরক্ষণ · Save", exact: true }).click();
    const article = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "খামার পরিচর্যা · Farm care" }) });
    await article.getByText(/DRAFT/).waitFor();
    await article.getByRole("button", { name: /Publish/ }).click();
    await article.getByText(/PUBLISHED/).waitFor();
    await assertFitsPhone(page);
    await page.reload();
    await page.getByRole("button", { name: "শিক্ষামূলক কন্টেন্ট · Content", exact: true }).click();
    await article.getByText(/PUBLISHED/).waitFor();

    await page.route("**/api/v1/admin/content?*", (route) => route.fulfill({ status: 503, body: "" }));
    await page.getByRole("button", { name: "শিক্ষামূলক কন্টেন্ট · Content", exact: true }).click();
    await page.getByRole("status").filter({ hasText: /service is unavailable/ }).waitFor();
    await page.unroute("**/api/v1/admin/content?*");
    await page.getByRole("button", { name: /Refresh administration/ }).click();
    await article.getByText(/PUBLISHED/).waitFor();
  } finally {
    await context.close();
  }
}
