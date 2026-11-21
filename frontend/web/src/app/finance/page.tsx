"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CARE_REFRESH_MS,
  CareFailure,
  FinanceWorkspace,
  financeInitialView,
  type CareForm,
  type CareTransport,
  type FinanceView,
} from "@palito/shared";
import { csrf } from "@/lib/firebase";

const transport: CareTransport = async <T,>(path: string, request = {}) => {
  const r = request as Parameters<CareTransport>[1];
  const headers: Record<string, string> = {};
  if (r?.method && r.method !== "GET") {
    headers["X-CSRF-Token"] = await csrf();
    if (r.key) headers["Idempotency-Key"] = r.key;
    if (r.version !== undefined) headers["If-Match"] = String(r.version);
  }
  if (r?.body !== undefined) headers["Content-Type"] = "application/json";
  const response = await fetch(`/api/v1${path}`, {
    method: r?.method ?? "GET",
    headers,
    credentials: "same-origin",
    cache: "no-store",
    body: r?.body === undefined ? undefined : JSON.stringify(r.body),
  });
  if (!response.ok) throw new CareFailure(response.status);
  return (await response.json()) as T;
};

function EntryForm({
  form,
  workspace,
  busy,
}: {
  form: CareForm;
  workspace: FinanceWorkspace;
  busy: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(form.fields.map((f) => [f.key, f.value])),
  );
  return (
    <form
      className="rounded-2xl border border-amber-300 bg-white p-5 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        void workspace.submit(values);
      }}
    >
      <h2 className="text-xl font-semibold">{form.title}</h2>
      {form.fields.map((field) => (
        <label className="block space-y-1" key={field.key}>
          <span>{field.label}</span>
          {field.type === "select" ? (
            <select
              className="block rounded border p-3 w-full"
              value={values[field.key] ?? field.value}
              onChange={(e) =>
                setValues({ ...values, [field.key]: e.target.value })
              }
            >
              {field.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : field.type === "multiline" ? (
            <textarea
              className="block rounded border p-3 w-full"
              required={!field.optional}
              maxLength={4000}
              rows={4}
              value={values[field.key] ?? ""}
              onChange={(e) =>
                setValues({ ...values, [field.key]: e.target.value })
              }
            />
          ) : (
            <input
              className="block rounded border p-3 w-full"
              required={!field.optional}
              type="text"
              inputMode={field.type === "number" ? "numeric" : "text"}
              maxLength={4000}
              value={values[field.key] ?? ""}
              onChange={(e) =>
                setValues({ ...values, [field.key]: e.target.value })
              }
            />
          )}
        </label>
      ))}
      <div className="flex gap-4">
        <button
          className="rounded bg-emerald-800 text-white px-5 py-3"
          disabled={busy}
          type="submit"
        >
          সংরক্ষণ · Submit
        </button>
        <button
          disabled={busy}
          type="button"
          onClick={() => workspace.dismiss()}
        >
          Close form
        </button>
      </div>
    </form>
  );
}

export default function FinancePage() {
  const [view, setView] = useState<FinanceView>(financeInitialView);
  const [workspace] = useState(
    () =>
      new FinanceWorkspace(
        transport,
        () => crypto.randomUUID(),
        (v) => setView(v),
      ),
  );
  useEffect(() => {
    const load = () => {
      if (document.visibilityState === "visible") void workspace.act(() => workspace.open());
    };
    const refresh = () => {
      if (document.visibilityState === "visible") void workspace.refresh();
    };
    const clear = () => workspace.clear();
    const visibility = () => document.visibilityState === "hidden" ? clear() : load();
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", clear);
    window.addEventListener("pageshow", load);
    window.addEventListener("focus", refresh);
    const interval = window.setInterval(refresh, CARE_REFRESH_MS);
    load();
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", clear);
      window.removeEventListener("pageshow", load);
      window.removeEventListener("focus", refresh);
      window.clearInterval(interval);
      clear();
    };
  }, [workspace]);

  return (
    <main className="min-h-screen bg-amber-50/40 text-slate-900">
      <div className="mx-auto max-w-4xl px-5 py-8 space-y-5">
        <nav className="flex flex-wrap gap-5">
          <Link href="/identity">Sign-in & account</Link>
          <Link href="/identity/staff">Bank / staff MFA sign-in</Link>
          <Link href="/care">খামার ও চিকিৎসা · Farm & care</Link>
          <button
            disabled={view.busy}
            onClick={() => void workspace.act(() => workspace.open())}
          >
            তথ্য আনুন · Load / refresh finance sandbox
          </button>
        </nav>
        <div
          role="note"
          className="rounded-xl border border-amber-400 bg-amber-100 p-4 text-sm font-medium text-amber-950"
        >
          {view.disclosure}
        </div>
        <h1 className="text-3xl font-bold">{view.title}</h1>
        {view.profile && <p>{view.profile.displayName}</p>}
        <p role="status" className="rounded-xl bg-white p-4">
          {view.busy ? "অপেক্ষা করুন · Please wait…" : view.notice}
        </p>
        <div className="flex flex-wrap gap-3">
          {view.actions.map((a) => (
            <button
              key={a.label}
              disabled={view.busy}
              className="rounded border border-emerald-700 bg-white px-4 py-3"
              onClick={a.run}
            >
              {a.label}
            </button>
          ))}
        </div>
        {view.form && (
          <EntryForm
            key={view.form.title}
            form={view.form}
            workspace={workspace}
            busy={view.busy}
          />
        )}
        {view.profile && !view.busy && !view.cards.length && !view.form && <p>কোনো রেকর্ড নেই · No records to show.</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          {view.cards.map((card) => (
            <article
              className="rounded-2xl border bg-white p-5 space-y-3"
              key={card.id}
            >
              <h2 className="text-lg font-semibold">{card.title}</h2>
              {card.lines.map((line, i) => (
                <p className="whitespace-pre-wrap break-words" key={i}>
                  {line}
                </p>
              ))}
              <div className="flex flex-wrap gap-3">
                {card.actions.map((a) => (
                  <button
                    className="underline text-emerald-900 py-2"
                    key={a.label}
                    disabled={view.busy}
                    onClick={a.run}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
