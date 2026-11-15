import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CareWorkspace,
  CareFailure,
  careBase64,
  type CareTransport,
  type CareView,
  type CareRequest,
} from "../src/care.ts";
const profile = { userId: "alice", displayName: "Alice", memberships: [] };
function fixture() {
  let identity = profile;
  let failure = false;
  const calls: { path: string; key?: string; body?: unknown }[] = [];
  let view: CareView;
  const transport: CareTransport = async <T>(
    path: string,
    request?: CareRequest,
  ) => {
    calls.push({ path, key: request?.key, body: request?.body });
    if (path === "/me") return identity as T;
    if (request?.method) {
      if (failure) throw new Error("Lost response");
      return { id: "new", version: 1 } as T;
    }
    return { items: [], nextCursor: null } as T;
  };
  const workspace = new CareWorkspace(
    transport,
    () => `command-${calls.length}`,
    (v) => {
      view = v;
    },
  );
  return {
    workspace,
    calls,
    get view() {
      return view!;
    },
    setIdentity: () => {
      identity = { ...profile, userId: "bob" };
    },
    fail: (value: boolean) => {
      failure = value;
    },
  };
}
test("care workspace keeps real transport separate, validates forms, and retains command key across network retry", async () => {
  const fx = fixture();
  await fx.workspace.act(() => fx.workspace.home());
  fx.view.actions.find((a) => a.label.includes("Add farm"))!.run();
  await new Promise((r) => setImmediate(r));
  const values = {
    name: "Farm",
    district: "Dhaka",
    address: "Private",
    areaAcres: "1",
  };
  fx.fail(true);
  await fx.workspace.submit(values);
  fx.fail(false);
  await fx.workspace.submit(values);
  const writes = fx.calls.filter((c) => c.path === "/farms" && c.key);
  assert.equal(writes.length, 2);
  assert.equal(writes[0]!.key, writes[1]!.key);
  assert.deepEqual(writes[1]!.body, values);
  assert.equal(fx.view.form, null);
  assert.ok(!fx.calls.some((c) => c.path.includes("demo")));
});
test("account changes invalidate workspace before a write and background clear fences pending reads", async () => {
  const fx = fixture();
  await fx.workspace.act(() => fx.workspace.home());
  fx.setIdentity();
  await fx.workspace.act(() => fx.workspace.home());
  assert.equal(fx.view.profile, null);
  assert.equal(fx.view.cards.length, 0);
  let release: ((v: unknown) => void) | undefined;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  const transport: CareTransport = async <T>() => pending as Promise<T>;
  const workspace = new CareWorkspace(
    transport,
    () => "command-key",
    () => {},
  );
  const loading = workspace.act(() => workspace.home());
  workspace.clear();
  release!(profile);
  await loading;
  assert.equal(workspace.view.profile, null);
  assert.equal(workspace.view.busy, false);
});
test("care base64 is portable and errors distinguish stale data from a disabled pilot", () => {
  for (const text of ["", "a", "ab", "abc", "hello"])
    assert.equal(
      careBase64(new TextEncoder().encode(text)),
      Buffer.from(text).toString("base64"),
    );
  assert.match(new CareFailure(409).message, /Refresh/);
  assert.match(new CareFailure(503).message, /not enabled/);
});
