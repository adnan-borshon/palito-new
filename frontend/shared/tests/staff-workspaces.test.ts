import { test } from "node:test";
import assert from "node:assert/strict";
import { AdminWorkspace } from "../src/admin-workspace.ts";
import type { CareRequest, CareTransport } from "../src/care.ts";
import { FinanceWorkspace } from "../src/finance-workspace.ts";

const tick = () => new Promise((resolve) => setImmediate(resolve));

test("verified bank and insurer land on their own server lists", async () => {
  const calls: string[] = [];
  let role = "BANK_STAFF";
  const transport: CareTransport = async <T>(path: string) => {
    calls.push(path);
    if (path === "/me") {
      return { userId: role, displayName: role, memberships: [{ role, organizationId: "org" }] } as T;
    }
    return { items: [], nextCursor: null } as T;
  };
  const workspace = new FinanceWorkspace(transport, () => "test-key", () => {});
  await workspace.act(() => workspace.open());
  assert.match(workspace.view.title, /Bank dashboard/);
  workspace.view.actions.find((action) => action.label.includes("Loan applications"))!.run();
  await tick();
  assert.ok(calls.includes("/loans?limit=25&status=SUBMITTED"));
  assert.ok(!calls.includes("/me/wallet"));

  workspace.clear();
  calls.length = 0;
  role = "INSURER_STAFF";
  await workspace.act(() => workspace.open());
  assert.match(workspace.view.title, /Insurer dashboard/);
  workspace.view.actions.find((action) => action.label === "দাবি · Claims")!.run();
  await tick();
  assert.ok(calls.includes("/claims?limit=25"));
  assert.ok(calls.every((path) => !path.startsWith("/loans")));
});

test("admin dashboard protects draft access and publishes a versioned draft through the API", async () => {
  let memberships: { role: string }[] = [];
  const calls: { path: string; request?: CareRequest }[] = [];
  const transport: CareTransport = async <T>(path: string, request?: CareRequest) => {
    calls.push({ path, request });
    if (path === "/me") return { userId: "admin", displayName: "Admin", memberships } as T;
    if (path === "/admin/system-health")
      return { deploymentTier: "test", workerEnabled: false, outbox: { pending: 1 } } as T;
    if (path.startsWith("/admin/content"))
      return {
        items: [{ id: "draft", version: 2, titleBn: "খামার", titleEn: "Farm", category: "HEALTH", slug: "farm", status: "DRAFT" }],
        nextCursor: null,
      } as T;
    return { items: [], nextCursor: null } as T;
  };
  const workspace = new AdminWorkspace(transport, () => "test-audit-key", () => {});
  await workspace.act(() => workspace.home());
  assert.ok(calls.every(({ path }) => path === "/me"));
  assert.equal(workspace.view.profile, null);

  memberships = [{ role: "ADMIN" }];
  await workspace.act(() => workspace.home());
  assert.ok(workspace.view.cards[0]?.lines.includes("pending: 1"));
  workspace.view.actions.find((action) => action.label.includes("Content"))!.run();
  await tick();
  workspace.view.cards[0]?.actions.find((action) => action.label.includes("Publish"))!.run();
  await tick();
  assert.ok(calls.some(({ path, request }) =>
    path === "/content/draft/publication" && request?.version === 2 && request.key === "test-audit-key",
  ));
});
