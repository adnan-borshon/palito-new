"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  CareWorkspace,
  CARE_REFRESH_MS,
  careSections,
  careInitialView,
  CareFailure,
  careMedicineFields,
  type CareTransport,
  type CareView,
  type CareForm,
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
  if (r?.contentType) headers["Content-Type"] = r.contentType;
  const response = await fetch(`/api/v1${path}`, {
    method: r?.method ?? "GET",
    headers,
    credentials: "same-origin",
    cache: "no-store",
    body:
      r?.raw ?? (r?.body === undefined ? undefined : JSON.stringify(r.body)),
  });
  if (!response.ok) throw new CareFailure(response.status);
  return (
    r?.binary ? await response.arrayBuffer() : await response.json()
  ) as T;
};
function EntryForm({
  form,
  workspace,
  busy,
}: {
  form: CareForm;
  workspace: CareWorkspace;
  busy: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(form.fields.map((f) => [f.key, f.value])),
  );
  const [count, setCount] = useState(1);
  const fields = [
    ...form.fields,
    ...(form.medicines ? careMedicineFields(count) : []),
  ];
  return (
    <form
      className="rounded-2xl border border-emerald-200 bg-white p-5 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        void workspace.submit(values);
      }}
    >
      <h2 className="text-xl font-semibold">{form.title}</h2>
      {fields.map((field) => (
        <label className="block space-y-1" key={field.key}>
          <span>{field.label}</span>
          {field.type === "check" ? (
            <input
              className="ml-2"
              type="checkbox"
              required={!field.optional}
              checked={values[field.key] === "true"}
              onChange={(e) =>
                setValues({ ...values, [field.key]: String(e.target.checked) })
              }
            />
          ) : field.type === "select" ? (
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
              type={field.type === "date" ? "date" : "text"}
              inputMode={field.type === "number" ? "decimal" : "text"}
              maxLength={4000}
              value={values[field.key] ?? ""}
              onChange={(e) =>
                setValues({ ...values, [field.key]: e.target.value })
              }
            />
          )}
        </label>
      ))}
      {form.medicines && (
        <div className="flex gap-4">
          <button
            type="button"
            disabled={busy || count >= 20}
            onClick={() => setCount(count + 1)}
          >
            Add medicine
          </button>
          {count > 1 && (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setValues(
                  Object.fromEntries(
                    Object.entries(values).filter(
                      ([k]) => !k.startsWith(`medicine${count - 1}`),
                    ),
                  ),
                );
                setCount(count - 1);
              }}
            >
              Remove last medicine
            </button>
          )}
        </div>
      )}
      <div className="flex gap-4">
        <button
          className="rounded bg-emerald-800 text-white px-5 py-3"
          disabled={busy}
          type="submit"
        >
          সংরক্ষণ · Save
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
export default function CarePage() {
  const [view, setView] = useState<CareView>(careInitialView);
  const [workspace] = useState(
    () =>
      new CareWorkspace(
        transport,
        () => crypto.randomUUID(),
        (v) => setView(v),
      ),
  );
  useEffect(() => {
    const load = () => {
      if (document.visibilityState === "visible")
        void workspace.act(() => workspace.home());
    };
    const refresh = () => {
      if (document.visibilityState === "visible") void workspace.refresh();
    };
    const clear = () => workspace.clear();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") clear();
      else load();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", clear);
    window.addEventListener("pageshow", load);
    window.addEventListener("focus", refresh);
    const interval = window.setInterval(refresh, CARE_REFRESH_MS);
    load();
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", clear);
      window.removeEventListener("pageshow", load);
      window.removeEventListener("focus", refresh);
      window.clearInterval(interval);
      clear();
    };
  }, [workspace]);
  return (
    <main className="min-h-screen bg-emerald-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-5 py-8 space-y-5">
        <nav className="flex flex-wrap gap-5">
          <Link href="/identity">Sign-in & account</Link>
          <Link href="/identity/staff">Vet MFA sign-in</Link>
          <Link href="/finance">স্যান্ডবক্স ঋণ ও লেজার · Finance sandbox</Link>
          <button
            disabled={view.busy}
            onClick={() => void workspace.act(() => workspace.home())}
          >
            তথ্য আনুন · Load / refresh care
          </button>
        </nav>
        {view.profile && (
          <nav aria-label="Care dashboard sections" className="flex flex-wrap gap-2">
            {careSections.map((section) => (
              <button
                key={section.id}
                type="button"
                aria-pressed={view.section === section.id}
                disabled={view.busy}
                className="rounded-lg border border-emerald-700 bg-white px-4 py-2 aria-pressed:bg-emerald-800 aria-pressed:text-white"
                onClick={() => void workspace.act(() => workspace.home(section.id))}
              >
                {section.label}
              </button>
            ))}
          </nav>
        )}
        <h1 className="text-3xl font-bold">{view.title}</h1>
        {view.profile && <p>{view.profile.displayName}</p>}
        {(view.busy || view.notice) && (
          <p role="status" className="rounded-xl bg-white p-4">
            {view.busy ? "অপেক্ষা করুন · Please wait…" : view.notice}
          </p>
        )}
        {view.section && !view.busy && !view.notice && !view.cards.length && (
          <p className="rounded-xl bg-white p-4">এই তালিকা খালি · No records to show.</p>
        )}
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
        {view.uploadAnimalId && !view.form && (
          <label className="block rounded-xl border p-4 bg-white">
            {view.uploadOwner
              ? "পশুর ছবি · Upload animal photo"
              : "Upload clinical evidence"}{" "}
            (PNG / JPEG, up to 1 MiB)
            <input
              className="block mt-2"
              type="file"
              accept="image/png,image/jpeg"
              disabled={view.busy}
              onChange={(e) => {
                const file = e.target.files?.[0],
                  animalId = view.uploadAnimalId;
                e.target.value = "";
                if (file && animalId)
                  void workspace.act(async () =>
                    workspace.upload(
                      animalId,
                      await file.arrayBuffer(),
                      file.type,
                    ),
                  );
              }}
            />
          </label>
        )}
        {view.image && (
          <div>
            <Image
              unoptimized
              src={view.image}
              alt="Authorized private animal image"
              width={600}
              height={600}
              className="max-h-96 w-auto object-contain"
            />
            <button onClick={() => workspace.dismiss()}>Close image</button>
          </div>
        )}
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
