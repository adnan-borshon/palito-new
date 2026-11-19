import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CareFailure, type CareRequest, type CareTransport } from "../src/care.ts";
import {
  FinanceWorkspace,
  financeInitialView,
  formatMinorBdt,
  type FinanceView,
} from "../src/finance-workspace.ts";

const farmerProfile = {
  userId: "farmer-1",
  displayName: "Rahim Farmer",
  memberships: [] as { role: string }[],
};

function createFixture() {
  let profile = { ...farmerProfile };
  let failWrites = false;
  const calls: { path: string; method?: string; key?: string; version?: number; body?: unknown }[] = [];
  let latestView: FinanceView = financeInitialView();

  const transport: CareTransport = async <T>(path: string, request?: CareRequest) => {
    calls.push({
      path,
      method: request?.method,
      key: request?.key,
      version: request?.version,
      body: request?.body,
    });
    if (path === "/me") return profile as T;
    if (path === "/me/wallet") {
      return {
        accountCode: `USER_WALLET:${profile.userId}`,
        balanceMinor: "3500000",
        currency: "BDT",
        sandboxMode: true,
        withdrawable: false,
        disclosure:
          "Sandbox ledger preview only — no real-money transfer or withdrawal is enabled.",
        entries: [],
        paymentIntents: [],
      } as T;
    }
    if (path.startsWith("/animals?")) {
      return {
        items: [
          {
            id: "00000000-0000-4000-8000-000000000301",
            name: "Goru-1",
            tag: "TAG-301",
            status: "ACTIVE",
          },
        ],
        nextCursor: null,
      } as T;
    }
    if (path.endsWith("/collateral-eligibility")) {
      return {
        animalId: "00000000-0000-4000-8000-000000000301",
        animalStatus: "ACTIVE",
        farmerEstimatedValueMinor: "12000000",
        eligible: true,
        reason: "Eligible",
        hasLiveCollateralReservation: false,
        latestApprovedValuation: {
          id: "00000000-0000-4000-8000-000000000401",
          version: 2,
          organizationId: "bank-org-1",
          assessedValueMinor: "10000000",
          approvedValueMinor: "10000000",
          maxLoanCap70Minor: "7000000",
          currency: "BDT",
          expiresAt: "2030-01-01T00:00:00.000Z",
        },
      } as T;
    }
    if (request?.method && failWrites) {
      throw new Error("Transient sandbox timeout");
    }
    if (path === "/loans/quotes" && request?.method === "POST") {
      return {
        id: "00000000-0000-4000-8000-000000000501",
        animalId: "00000000-0000-4000-8000-000000000301",
        valuationId: "00000000-0000-4000-8000-000000000401",
        approvedValueMinor: "10000000",
        maxPrincipalMinor: "7000000",
        requestedPrincipalMinor: "3500000",
        termMonths: 3,
        termVersion: "sandbox-v1",
        status: "QUOTED",
        expiresAt: "2030-01-01T00:00:00.000Z",
      } as T;
    }
    if (path === "/loans" && request?.method === "POST") {
      return { id: "loan-new", version: 1, status: "SUBMITTED" } as T;
    }
    return { items: [], nextCursor: null } as T;
  };

  let seq = 0;
  const workspace = new FinanceWorkspace(
    transport,
    () => `finance-cmd-${++seq}`,
    (v) => {
      latestView = v;
    },
  );

  return {
    workspace,
    calls,
    get view() {
      return latestView;
    },
    setFailWrites(value: boolean) {
      failWrites = value;
    },
    switchIdentity(userId: string) {
      profile = { ...farmerProfile, userId };
    },
  };
}

test("formatMinorBdt formats exact integer minor units without floating rounding errors", () => {
  assert.equal(formatMinorBdt("0"), "BDT 0.00 (0 poisha)");
  assert.equal(formatMinorBdt("3500005"), "BDT 35000.05 (3500005 poisha)");
  assert.equal(formatMinorBdt("10000000"), "BDT 100000.00 (10000000 poisha)");
});

test("FinanceWorkspace shows non-withdrawable sandbox disclosure, quotes & submits loans, and reuses idempotency key on retry", async () => {
  const fx = createFixture();
  assert.match(financeInitialView().disclosure, /sandbox|no real-money/i);

  await fx.workspace.act(() => fx.workspace.home());
  assert.equal(fx.view.profile?.userId, "farmer-1");
  assert.ok(fx.view.cards.some((c) => c.lines.some((l) => l.includes("Withdrawable: No"))));

  fx.view.actions.find((a) => a.label.includes("Check collateral & quote"))!.run();
  await new Promise((r) => setImmediate(r));
  await new Promise((r) => setImmediate(r));

  const animalCard = fx.view.cards.find((c) => c.id === "00000000-0000-4000-8000-000000000301");
  assert.ok(animalCard);
  animalCard.actions.find((a) => a.label === "Request loan quote")!.run();
  await new Promise((r) => setImmediate(r));
  assert.ok(fx.view.form);

  const formValues = {
    requestedPrincipalMinor: "3500000",
    termMonths: "3",
    purpose: "Cattle feed",
  };
  fx.setFailWrites(true);
  await fx.workspace.submit(formValues);
  assert.match(fx.view.notice, /Transient sandbox timeout/);

  fx.setFailWrites(false);
  await fx.workspace.submit(formValues);
  assert.equal(fx.view.form, null);

  const quotePosts = fx.calls.filter((c) => c.path === "/loans/quotes" && c.method === "POST");
  assert.equal(quotePosts.length, 2);
  assert.equal(quotePosts[0]!.key, quotePosts[1]!.key);
  assert.ok(fx.calls.some((c) => c.path === "/loans" && c.method === "POST"));
});

test("FinanceWorkspace clears state on identity change and never imports DemoState", async () => {
  const fx = createFixture();
  await fx.workspace.act(() => fx.workspace.home());
  assert.equal(fx.view.profile?.userId, "farmer-1");

  fx.switchIdentity("farmer-2");
  await fx.workspace.act(() => fx.workspace.home());
  assert.equal(fx.view.profile, null);
  assert.equal(fx.view.cards.length, 0);

  // Also ensure 503 sandbox disabled surfaces clearly
  assert.match(new CareFailure(503).message, /not enabled/);

  // Static check: finance-workspace never imports DemoState or demo fixtures
  const source = readFileSync(
    new URL("../src/finance-workspace.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /from\s+["']\.\/(?:types|repository|state)/);
  assert.ok(!source.includes("./repository"));
});

test("FinanceWorkspace supports M7 insurance policy application, premium payment, and death claim submission", async () => {
  const calls: { path: string; method?: string; body?: unknown }[] = [];
  let policyStatus = "APPROVED_AWAITING_PREMIUM";

  const transport: CareTransport = async <T>(path: string, request?: CareRequest) => {
    calls.push({ path, method: request?.method, body: request?.body });
    if (path === "/me") return farmerProfile as T;
    if (path.startsWith("/policies?")) {
      return {
        items: [
          {
            id: "00000000-0000-4000-8000-000000000701",
            animalId: "00000000-0000-4000-8000-000000000301",
            farmerId: "farmer-1",
            insurerOrganizationId: "00000000-0000-4000-8000-000000000801",
            evidenceFileId: null,
            renewedFromPolicyId: null,
            policyVersion: 1,
            termVersion: "ins-sandbox-v1",
            consentVersion: "ins-sandbox-v1",
            coverageMinor: "8000000",
            premiumMinor: "200000",
            termMonths: 6,
            waitingDays: 0,
            currency: "BDT",
            status: policyStatus,
            decisionNote: "Approved awaiting premium",
            startsAt: policyStatus === "ACTIVE" ? "2026-11-15T00:00:00.000Z" : null,
            endsAt: policyStatus === "ACTIVE" ? "2027-05-15T00:00:00.000Z" : null,
            version: 2,
            createdAt: "2026-11-15T00:00:00.000Z",
          },
        ],
        nextCursor: null,
      } as T;
    }
    if (path.startsWith("/claims?")) {
      return { items: [], nextCursor: null } as T;
    }
    if (path.endsWith("/premium-intents") && request?.method === "POST") {
      policyStatus = "ACTIVE";
      return { paymentIntent: { id: "pi-prem", status: "CONFIRMED" } } as T;
    }
    if (path === "/claims" && request?.method === "POST") {
      return { id: "claim-1", status: "SUBMITTED" } as T;
    }
    return { items: [], nextCursor: null } as T;
  };

  let seq = 0;
  const workspace = new FinanceWorkspace(
    transport,
    () => `ins-cmd-${++seq}`,
    () => {},
  );

  await workspace.act(() => workspace.insuranceHome());
  assert.match(workspace.view.title, /Insurance & claim settlement sandbox/);
  const policyCard = workspace.view.cards.find(
    (c) => c.id === "00000000-0000-4000-8000-000000000701",
  );
  assert.ok(policyCard);
  policyCard.actions
    .find((a) => a.label === "Pay premium from sandbox wallet")!
    .run();
  await new Promise((r) => setImmediate(r));
  await new Promise((r) => setImmediate(r));

  const activePolicyCard = workspace.view.cards.find(
    (c) => c.id === "00000000-0000-4000-8000-000000000701",
  );
  assert.ok(activePolicyCard);
  activePolicyCard.actions.find((a) => a.label === "Submit death claim")!.run();
  await new Promise((r) => setImmediate(r));
  assert.ok(workspace.view.form);

  await workspace.submit({
    incidentAt: "2026-11-16T08:00:00.000Z",
    claimedAmountMinor: "8000000",
    evidenceFileId: "00000000-0000-4000-8000-000000000901",
    description: "Acute mortality with vet report",
  });
  assert.equal(workspace.view.form, null);
  assert.ok(
    calls.some((c) => c.path === "/claims" && c.method === "POST"),
  );
});
