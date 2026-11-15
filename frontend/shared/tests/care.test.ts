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

test("care workspace loads notifications, updates notify-v1 preferences, and marks adherence", async () => {
  const unreadId = "00000000-0000-4000-8000-000000000101";
  const reminderId = "00000000-0000-4000-8000-000000000201";
  const calls: { path: string; method?: string; version?: number; body?: unknown }[] = [];
  let prefs = {
    inAppEnabled: true,
    smsEnabled: false,
    pushEnabled: false,
    consentVersion: "notify-v1",
    version: 1,
  };
  let readAt: string | null = null;
  let lastAdherence: { localDate: string; status: "taken" | "skipped" } | null = null;

  const transport: CareTransport = async <T>(path: string, request?: CareRequest) => {
    calls.push({ path, method: request?.method, version: request?.version, body: request?.body });
    if (path === "/me") return profile as T;
    if (path.startsWith("/notifications?")) {
      return {
        items: [
          {
            id: unreadId,
            topic: "REMINDER_DUE",
            category: "reminder",
            title: "Treatment reminder due",
            body: "Open Palito to review your due reminder.",
            linkKind: "reminder",
            linkId: reminderId,
            readAt,
            createdAt: "2026-11-15T10:00:00.000Z",
          },
        ],
        unreadCount: readAt ? 0 : 1,
        nextCursor: null,
      } as T;
    }
    if (path === "/notifications/read" && request?.method === "POST") {
      readAt = "2026-11-15T10:05:00.000Z";
      return { updated: 1 } as T;
    }
    if (path === "/me/notification-preferences" && !request?.method) {
      return prefs as T;
    }
    if (path === "/me/notification-preferences" && request?.method === "PATCH") {
      prefs = { ...(request.body as typeof prefs), version: prefs.version + 1 };
      return prefs as T;
    }
    if (path.startsWith("/reminders?") && !request?.method) {
      return {
        items: [
          {
            id: reminderId,
            title: "Morning vitamin dose",
            dueAt: "2026-11-15T08:00:00.000Z",
            status: "OPEN",
            adherenceEvents: lastAdherence ? [lastAdherence] : [],
          },
        ],
        nextCursor: null,
      } as T;
    }
    if (path === `/reminders/${reminderId}/adherence-events` && request?.method === "POST") {
      lastAdherence = request.body as typeof lastAdherence;
      return { id: "adh-1", ...lastAdherence } as T;
    }
    return { items: [], nextCursor: null } as T;
  };

  const workspace = new CareWorkspace(transport, () => `cmd-${calls.length}`, () => {});
  await workspace.act(() => workspace.home());
  workspace.view.actions.find((a) => a.label.includes("Notifications"))!.run();
  await new Promise((r) => setImmediate(r));
  await new Promise((r) => setImmediate(r));
  assert.match(workspace.view.title, /1 unread/);
  workspace.view.actions.find((a) => a.label === "Mark all read")!.run();
  await new Promise((r) => setImmediate(r));
  await new Promise((r) => setImmediate(r));
  assert.match(workspace.view.title, /0 unread/);

  await workspace.act(() => workspace.preferencesForm());
  assert.ok(workspace.view.form);
  await workspace.submit({ inAppEnabled: "true", smsEnabled: "true", pushEnabled: "false" });
  const patchCall = calls.find((c) => c.path === "/me/notification-preferences" && c.method === "PATCH");
  assert.ok(patchCall);
  assert.equal(patchCall.version, 1);
  assert.deepEqual(patchCall.body, {
    inAppEnabled: true,
    smsEnabled: true,
    pushEnabled: false,
    consentVersion: "notify-v1",
  });

  await workspace.act(() => workspace.home());
  const reminderCard = workspace.view.cards.find((c) => c.id === reminderId);
  assert.ok(reminderCard);
  reminderCard.actions.find((a) => a.label === "Taken today")!.run();
  await new Promise((r) => setImmediate(r));
  await new Promise((r) => setImmediate(r));
  assert.ok(calls.some((c) => c.path === `/reminders/${reminderId}/adherence-events` && c.method === "POST"));
});
