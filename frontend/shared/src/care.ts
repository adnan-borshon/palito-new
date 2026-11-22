/** Real API projections. This module never imports or serializes DemoState. */
export interface CareProfile {
  userId: string;
  displayName: string;
  memberships: { role: string; organizationId?: string }[];
}
export interface CareFarm {
  id: string;
  name: string;
  district: string;
  address: string;
  areaAcres: string;
  version: number;
}
export interface CareAnimal {
  id: string;
  ownerId: string;
  farmId: string;
  name: string;
  tag: string;
  species: string;
  breed: string;
  sex: string;
  birthDate: string;
  weightKg: string;
  estimateMinor: string;
  version: number;
  status: string;
  photoFileId: string | null;
}
export interface CareAppointment {
  id: string;
  animalId: string;
  vetId: string;
  farmerId: string;
  startsAt: string;
  endsAt: string;
  mode: string;
  reason: string;
  decisionNote: string;
  status: string;
  version: number;
}
export interface CareRecord {
  id: string;
  source: string;
  kind: string;
  note: string;
  vetId: string | null;
  signedAt: string | null;
  amendsId: string | null;
  createdAt: string;
  prescription: { id: string; signedAt: string | null } | null;
}
export interface CareSlot {
  id: string;
  startsAt: string;
  endsAt: string;
  status?: string;
}
export interface CareReminder {
  id: string;
  animalId: string;
  dueAt: string;
  enabled: boolean;
  dispatchedAt?: string | null;
  escalatedAt?: string | null;
  adherenceEvents?: {
    id: string;
    localDate: string;
    status: "taken" | "skipped";
    recordedAt: string;
  }[];
  version: number;
}
export interface CareNotification {
  id: string;
  category: string;
  title: string;
  body: string;
  linkKind: string | null;
  linkId: string | null;
  readAt: string | null;
  createdAt: string;
}
export interface CareNotificationPrefs {
  inAppEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  consentVersion: string;
  version: number;
  channelMode?: string;
}
export interface CarePrescription {
  id: string;
  advice: string;
  signedAt: string;
  items: {
    medicineName: string;
    dose: string;
    frequency: string;
    days: number;
  }[];
}
export const CARE_REFRESH_MS = 30_000;
export const careSections = [
  { id: "home", label: "প্রধান পাতা · Home" },
  { id: "animals", label: "খামার ও পশু · Farms & animals" },
  { id: "visits", label: "ভিজিট · Visits" },
  { id: "prescriptions", label: "প্রেসক্রিপশন · Prescriptions" },
] as const;
export type CareSection = (typeof careSections)[number]["id"];
interface CarePrescriptionSummary {
  id: string;
  signedAt: string;
  animalName: string;
  animalTag: string;
}
export interface CarePage<T> {
  items: T[];
  nextCursor: string | null;
}
export interface CareRequest {
  method?: string;
  body?: unknown;
  key?: string;
  version?: number;
  raw?: ArrayBuffer;
  contentType?: string;
  binary?: boolean;
}
export type CareTransport = <T>(
  path: string,
  request?: CareRequest,
) => Promise<T>;
export class CareFailure extends Error {
  readonly status: number;
  constructor(status: number) {
    super(
      status === 409
        ? "তথ্য বদলেছে · Details changed. Refresh and try again."
        : status === 503
          ? "সেবা সাময়িকভাবে বন্ধ · This service is unavailable or not enabled in this environment."
          : status === 400
            ? "তথ্য পরীক্ষা করুন · Check the form values."
            : status === 429
              ? "একটু অপেক্ষা করুন · Too many requests. Try again shortly."
              : status >= 500
                ? "সার্ভারে সমস্যা · The server could not load your records. Try again."
                : "সেশন বা অনুমতি যাচাই করুন · Check sign-in and access.",
    );
    this.status = status;
  }
}
export interface CareField {
  key: string;
  label: string;
  value: string;
  type?: "text" | "multiline" | "number" | "date" | "check" | "select";
  options?: { value: string; label: string }[];
  optional?: boolean;
  maxLength?: number;
}
export interface CareAction {
  label: string;
  run: () => void;
}
export interface CareCard {
  id: string;
  title: string;
  lines: string[];
  actions: CareAction[];
}
export interface CareForm {
  title: string;
  fields: CareField[];
  medicines?: boolean;
  submit: (values: Record<string, string>) => Promise<void>;
}
export interface CareView {
  section: CareSection | null;
  profile: CareProfile | null;
  title: string;
  notice: string;
  busy: boolean;
  cards: CareCard[];
  actions: CareAction[];
  form: CareForm | null;
  image: string | null;
  uploadAnimalId: string | null;
  uploadOwner: boolean;
}
const CONSENT =
  "I allow this assigned vet to read this animal’s passport, history, visit address and current-owner files until 72 hours after the appointment ends. I can withdraw access at any time.";
export function careTime(value: string) {
  return `${new Date(value).toLocaleString("en-GB", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" })} (Dhaka, UTC+6)`;
}
export function careDhakaDate(instant: Date = new Date()): string {
  return new Date(instant.getTime() + 6 * 3600000).toISOString().slice(0, 10);
}
const f = (
  key: string,
  label: string,
  value = "",
  type: CareField["type"] = "text",
  optional = false,
): CareField => ({ key, label, value, type, optional });
const select = (
  key: string,
  label: string,
  options: { value: string; label: string }[],
  value = options[0]?.value ?? "",
): CareField => ({ ...f(key, label, value, "select"), options });
const required = (v: Record<string, string>, key: string) => {
  const value = v[key]?.trim();
  if (!value) throw new CareFailure(400);
  return value;
};
export function careInitialView(): CareView {
  return {
    section: null,
    profile: null,
    title: "খামার ও চিকিৎসা · Farm & care",
    notice: "যাচাইকৃত অ্যাকাউন্ট দিয়ে প্রবেশ করুন · Sign in to open your care dashboard.",
    busy: false,
    cards: [],
    actions: [],
    form: null,
    image: null,
    uploadAnimalId: null,
    uploadOwner: false,
  };
}
/** Memory-only workspace with generation fencing for sign-out/background/account changes. */
export class CareWorkspace {
  view: CareView = careInitialView();
  private generation = 0;
  private keys = new Map<string, string>();
  private identity: string | null = null;
  private section: CareSection = "home";
  private returnTo: () => Promise<void> = () => this.home();
  private readonly transport: CareTransport;
  private readonly newKey: () => string;
  private readonly changed: (view: CareView) => void;
  constructor(
    transport: CareTransport,
    newKey: () => string,
    changed: (view: CareView) => void,
  ) {
    this.transport = transport;
    this.newKey = newKey;
    this.changed = changed;
  }
  protected emit(patch: Partial<CareView>) {
    this.view = { ...this.view, ...patch };
    this.changed(this.view);
  }
  clear() {
    this.generation++;
    this.identity = null;
    this.keys.clear();
    this.returnTo = () => this.home();
    this.emit(careInitialView());
  }
  protected async authenticated<T>(
    work: (send: CareTransport, profile: CareProfile) => Promise<T>,
  ): Promise<T> {
    const epoch = this.generation;
    const expected = this.identity;
    const send: CareTransport = async <R>(path: string, request?: CareRequest) => {
      if (epoch !== this.generation) throw new CareFailure(401);
      const result = await this.transport<R>(path, request);
      if (epoch !== this.generation) throw new CareFailure(401);
      return result;
    };
    const before = await send<CareProfile>("/me");
    if (expected && before.userId !== expected) throw new CareFailure(401);
    this.identity = before.userId;
    const result = await work(send, before);
    const after = await send<CareProfile>("/me");
    if (after.userId !== before.userId) throw new CareFailure(401);
    if (before.memberships.some((member) => !after.memberships.some(
      (current) => current.role === member.role && current.organizationId === member.organizationId,
    ))) throw new CareFailure(403);
    return result;
  }
  protected request<T>(path: string, request?: CareRequest): Promise<T> {
    return this.authenticated((send) => send<T>(path, request));
  }
  async act(work: () => Promise<void>) {
    if (this.view.busy) return;
    const epoch = this.generation;
    this.emit({ busy: true, notice: "" });
    try {
      await work();
    } catch (error) {
      if (epoch === this.generation) {
        if (
          error instanceof CareFailure &&
          [401, 403, 404].includes(error.status)
        )
          this.clear();
        this.emit({
          notice:
            error instanceof Error
              ? error.message
              : "Request failed. Please retry.",
        });
      }
    } finally {
      if (epoch === this.generation) this.emit({ busy: false });
    }
  }
  protected async write<T>(
    path: string,
    body: unknown = {},
    version?: number,
    method = "POST",
  ): Promise<T> {
    const fingerprint = JSON.stringify([path, method, version, body]);
    let key = this.keys.get(fingerprint);
    if (!key) {
      key = this.newKey();
      this.keys.set(fingerprint, key);
    }
    const result = await this.request<T>(path, { method, body, key, version });
    this.keys.delete(fingerprint);
    return result;
  }
  private async all<T>(
    path: string,
    read: CareTransport = (endpoint, request) => this.request(endpoint, request),
  ): Promise<T[]> {
    const rows: T[] = [];
    let cursor: string | null = null;
    do {
      const page: CarePage<T> = await read<CarePage<T>>(
        `${path}${path.includes("?") ? "&" : "?"}limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`,
      );
      rows.push(...page.items);
      cursor = page.nextCursor;
      if (rows.length >= 1000 && cursor)
        throw new Error("Narrow this workspace to fewer than 1,000 records.");
    } while (cursor);
    return rows;
  }
  protected action(label: string, work: () => Promise<void>): CareAction {
    return {
      label,
      run: () => {
        void this.act(work);
      },
    };
  }
  protected form(
    title: string,
    fields: CareField[],
    submit: CareForm["submit"],
    medicines = false,
  ) {
    this.emit({ form: { title, fields, submit, medicines }, image: null });
  }
  dismiss() {
    this.emit({ form: null, image: null });
  }
  async submit(values: Record<string, string>) {
    const form = this.view.form;
    if (!form) return;
    await this.act(async () => {
      for (const field of form.fields) {
        if (!field.optional && field.type !== "check")
          required(values, field.key);
        if (
          field.type === "check" &&
          !field.optional &&
          values[field.key] !== "true"
        )
          throw new CareFailure(400);
      }
      await form.submit(values);
      this.emit({ form: null, notice: "সংরক্ষিত · Saved" });
    });
  }
  refresh() {
    if (!this.view.section || this.view.form || this.view.image) return;
    return this.act(() => this.home());
  }
  async home(section: CareSection = this.section) {
    this.section = section;
    const { profile, isVet, showAnimals, showVisits, farms, animals, appointments, reminders, prescriptions } =
      await this.authenticated(async (read, profile) => {
        const isVet = profile.memberships.some((membership) => membership.role === "VET");
        const showAnimals = section === "animals" || (section === "home" && !isVet);
        const showVisits = section === "home" || section === "visits";
        const [farms, animals, appointments, reminders, prescriptions] = await Promise.all([
          showAnimals ? this.all<CareFarm>("/farms", read) : [],
          showAnimals || (section === "visits" && !isVet) ? this.all<CareAnimal>("/animals", read) : [],
          showVisits ? this.all<CareAppointment>("/appointments", read) : [],
          showVisits && !isVet ? this.all<CareReminder>("/reminders", read) : [],
          section === "prescriptions" ? this.all<CarePrescriptionSummary>("/prescriptions", read) : [],
        ]);
        return { profile, isVet, showAnimals, showVisits, farms, animals, appointments, reminders, prescriptions };
      });
    this.returnTo = () => this.home();
    this.emit({
      section,
      profile,
      title: section === "home"
        ? isVet ? "পশুচিকিৎসক ড্যাশবোর্ড · Vet dashboard" : "খামারি ড্যাশবোর্ড · Farmer dashboard"
        : careSections.find((tab) => tab.id === section)!.label,
      image: null,
      form: null,
      uploadAnimalId: null,
      notice: "",
      actions: [
        ...(showAnimals
          ? [
              this.action("খামার যোগ · Add farm", async () => this.farmForm()),
              this.action("পশু নিবন্ধন · Register animal", async () => this.animalForm(farms)),
            ]
          : []),
        ...(showVisits && !isVet
          ? [this.action("পশু চিকিৎসক · Find a vet", () => this.directory(animals))]
          : []),
        ...(showVisits && isVet
          ? [
              this.action("Professional profile", () => this.professionalForm()),
              this.action("আমার সময়সূচি · My availability", () => this.schedule()),
            ]
          : []),
        ...(section === "home"
          ? [
              this.action("বিজ্ঞপ্তি · Notifications", () => this.notifications()),
              this.action("বিজ্ঞপ্তি পছন্দ · Notification prefs", () => this.preferencesForm()),
              this.action("তথ্যভাণ্ডার · Published content", () => this.publishedContent()),
              ...(animals.length
                ? [this.action("এআই সহায়তা · AI triage (sandbox)", () => this.aiTriageForm(animals))]
                : []),
              this.action("ফার্মেসি ও অর্ডার · Pharmacy & orders", () => this.pharmacyCatalog()),
            ]
          : []),
      ],
      cards: [
        ...farms.map((farm) => ({
          id: farm.id,
          title: farm.name,
          lines: [farm.district, farm.address, `${farm.areaAcres} acres`],
          actions: [this.action("Edit farm", async () => this.farmForm(farm))],
        })),
        ...(showAnimals ? animals : []).map((animal) => ({
          id: animal.id,
          title: `${animal.name} · ${animal.tag}`,
          lines: [
            `${animal.species} · ${animal.status}`,
            `${animal.weightKg} kg`,
          ],
          actions: [
            this.action("পাসপোর্ট · Passport", () => this.passport(animal.id)),
            ...(animal.status === "ACTIVE"
              ? [
                  this.action("Edit animal", async () =>
                    this.editAnimal(animal),
                  ),
                  this.action("Archive animal", async () =>
                    this.form(
                      "Archive animal",
                      [f("reason", "Reason")],
                      async (v) => {
                        await this.write(
                          `/animals/${animal.id}/archive`,
                          { reason: v.reason },
                          animal.version,
                        );
                        await this.home();
                      },
                    ),
                  ),
                ]
              : []),
          ],
        })),
        ...appointments.map((row) => this.appointmentCard(row, profile)),
        ...prescriptions.map((row) => ({
          id: row.id,
          title: `${row.animalName} · ${row.animalTag}`,
          lines: [careTime(row.signedAt)],
          actions: [this.action("প্রেসক্রিপশন দেখুন · View signed prescription", () => this.prescription(row.id))],
        })),
        ...reminders.map((row) => ({
          id: row.id,
          title: "পরবর্তী চিকিৎসা · Follow-up",
          lines: [
            careTime(row.dueAt),
            row.enabled ? "Enabled · Outbox worker active" : "Disabled",
            ...(row.escalatedAt
              ? [`Escalated at ${careTime(row.escalatedAt)}`]
              : row.dispatchedAt
                ? [`Dispatched at ${careTime(row.dispatchedAt)}`]
                : []),
            ...(row.adherenceEvents?.length
              ? [
                  `Latest adherence: ${row.adherenceEvents[0]!.status} (${row.adherenceEvents[0]!.localDate.slice(0, 10)})`,
                ]
              : []),
          ],
          actions: [
            this.action(
              row.enabled ? "Disable reminder" : "Enable reminder",
              async () => {
                await this.write(
                  `/reminders/${row.id}`,
                  { enabled: !row.enabled },
                  row.version,
                  "PATCH",
                );
                await this.home();
              },
            ),
            this.action("Taken today", async () => {
              await this.write(`/reminders/${row.id}/adherence-events`, {
                status: "taken",
                localDate: careDhakaDate(),
              });
              await this.home();
            }),
            this.action("Skipped today", async () => {
              await this.write(`/reminders/${row.id}/adherence-events`, {
                status: "skipped",
                localDate: careDhakaDate(),
              });
              await this.home();
            }),
          ],
        })),
      ],
    });
  }
  private farmForm(farm?: CareFarm) {
    this.form(
      farm ? "Edit farm" : "খামার যোগ · Add farm",
      [
        f("name", "খামারের নাম · Farm name", farm?.name),
        f("district", "জেলা · District", farm?.district),
        f("address", "ঠিকানা · Address", farm?.address, "multiline"),
        f("areaAcres", "জমি · Area (acres)", farm?.areaAcres, "number"),
      ],
      async (v) => {
        await this.write(
          farm ? `/farms/${farm.id}` : "/farms",
          v,
          farm?.version,
          farm ? "PATCH" : "POST",
        );
        await this.home();
      },
    );
  }
  private animalForm(farms: CareFarm[]) {
    if (!farms.length)
      throw new Error("Add a farm before registering an animal.");
    this.form(
      "পশু নিবন্ধন · Register animal",
      [
        select(
          "farmId",
          "খামার · Farm",
          farms.map((farm) => ({ value: farm.id, label: farm.name })),
        ),
        f("name", "পশুর নাম · Animal name"),
        select(
          "species",
          "প্রজাতি · Species",
          ["cattle", "goat", "buffalo", "sheep"].map((value) => ({
            value,
            label: value,
          })),
        ),
        f("breed", "জাত · Breed"),
        select(
          "sex",
          "লিঙ্গ · Sex",
          ["female", "male", "unknown"].map((value) => ({
            value,
            label: value,
          })),
        ),
        f("birthDate", "জন্ম · Birth date (YYYY-MM-DD)", "", "date"),
        f("weightKg", "ওজন · Weight (kg)", "", "number"),
        f("estimateMinor", "Estimate (poisha; 100 = BDT 1)", "", "number"),
        f("tag", "Tag (optional; generated if blank)", "", "text", true),
      ],
      async (v) => {
        await this.write("/animals", {
          ...v,
          ...(!v.tag ? { tag: undefined } : {}),
        });
        await this.home();
      },
    );
  }
  private editAnimal(animal: CareAnimal) {
    this.form(
      "Edit animal",
      [
        f("name", "Animal name", animal.name),
        f("breed", "Breed", animal.breed),
        f("weightKg", "Weight (kg)", animal.weightKg, "number"),
        f(
          "estimateMinor",
          "Estimate (poisha; 100 = BDT 1)",
          animal.estimateMinor,
          "number",
        ),
      ],
      async (v) => {
        await this.write(`/animals/${animal.id}`, v, animal.version, "PATCH");
        await this.home();
      },
    );
  }
  async passport(id: string, cursor?: string) {
    const [passport, records, files] = await Promise.all([
      this.request<{
        animal: CareAnimal;
        farm: { name: string; district: string; address: string };
      }>(`/animals/${id}/passport`),
      this.request<CarePage<CareRecord>>(
        `/animals/${id}/records?limit=25${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`,
      ),
      this.all<{ id: string; purpose: string; createdAt: string }>(
        `/animals/${id}/files`,
      ),
    ]);
    const owner = passport.animal;
    const profile =
      this.view.profile ?? (await this.request<CareProfile>("/me"));
    this.returnTo = () => this.passport(id);
    this.emit({
      section: null,
      title: `${passport.animal.name} · পাসপোর্ট`,
      form: null,
      image: null,
      uploadAnimalId: id,
      uploadOwner: owner.ownerId === profile.userId,
      actions: [
        this.action("সব খামার · Back to workspace", () => this.home()),
        ...(owner.ownerId === profile.userId
          ? [
              this.action("নতুন পর্যবেক্ষণ · Add observation", async () =>
                this.form(
                  "Farmer observation",
                  [
                    f(
                      "note",
                      "Observation (not a signed diagnosis)",
                      "",
                      "multiline",
                    ),
                  ],
                  async (v) => {
                    await this.write(`/animals/${id}/observations`, v);
                    await this.passport(id);
                  },
                ),
              ),
            ]
          : []),
        ...(records.nextCursor
          ? [
              this.action("Older / next records", () =>
                this.passport(id, records.nextCursor!),
              ),
            ]
          : []),
      ],
      cards: [
        {
          id,
          title: passport.animal.tag,
          lines: [
            `${owner.species} · ${owner.breed}`,
            `Born ${owner.birthDate.slice(0, 10)} · ${owner.weightKg} kg`,
            `${passport.farm.name} · ${passport.farm.district}`,
            passport.farm.address,
          ],
          actions: [],
        },
        ...records.items.map((row) => ({
          id: row.id,
          title: `${row.kind} · ${row.source === "VET" ? "Signed veterinary record" : "Farmer observation"}`,
          lines: [
            careTime(row.createdAt),
            row.note,
            ...(row.amendsId ? [`Amends record ${row.amendsId}`] : []),
          ],
          actions: [
            ...(row.prescription
              ? [
                  this.action("প্রেসক্রিপশন · Prescription", () =>
                    this.prescription(row.prescription!.id),
                  ),
                ]
              : []),
            ...(row.vetId === profile.userId
              ? [
                  this.action("Append correction", async () =>
                    this.form(
                      "Clinical correction (original remains unchanged)",
                      [
                        f("note", "Correction", "", "multiline"),
                        f("reason", "Reason"),
                      ],
                      async (v) => {
                        await this.write(`/records/${row.id}/amendments`, v);
                        await this.passport(id);
                      },
                    ),
                  ),
                ]
              : []),
          ],
        })),
        ...files.map((file) => ({
          id: file.id,
          title: file.purpose,
          lines: [careTime(file.createdAt)],
          actions: [
            this.action("View private image", () => this.viewFile(file.id)),
          ],
        })),
      ],
    });
  }
  async upload(animalId: string, bytes: ArrayBuffer, contentType: string) {
    if (
      !["image/png", "image/jpeg"].includes(contentType) ||
      !bytes.byteLength ||
      bytes.byteLength > 1048576
    )
      throw new Error("Choose a PNG or JPEG image up to 1 MiB.");
    const fingerprint = `upload:${animalId}:${bytes.byteLength}:${Array.from(new Uint8Array(bytes)).join(",")}`;
    let key = this.keys.get(fingerprint);
    if (!key) {
      key = this.newKey();
      this.keys.set(fingerprint, key);
    }
    const file = await this.request<{ id: string }>(`/files/uploads`, {
      method: "POST",
      key,
      body: {
        animalId,
        purpose: this.view.uploadOwner ? "animal-photo" : "clinical-evidence",
        contentType,
        sizeBytes: bytes.byteLength,
      },
    });
    const state = await this.request<{ status: string; sha256: string | null }>(
      `/files/${file.id}`,
    );
    let sha256 = state.sha256;
    if (state.status === "PENDING")
      sha256 = (
        await this.request<{ sha256: string }>(`/files/${file.id}/content`, {
          method: "PUT",
          raw: bytes,
          contentType,
        })
      ).sha256;
    if (state.status !== "READY")
      await this.write(`/files/${file.id}/completion`, { sha256 });
    this.keys.delete(fingerprint);
    const { animal } = await this.request<{ animal: CareAnimal }>(
      `/animals/${animalId}/passport`,
    );
    if (animal.ownerId === this.identity)
      await this.write(
        `/animals/${animalId}`,
        {
          name: animal.name,
          breed: animal.breed,
          weightKg: animal.weightKg,
          estimateMinor: animal.estimateMinor,
          photoFileId: file.id,
        },
        animal.version,
        "PATCH",
      );
    await this.passport(animalId);
  }
  async viewFile(id: string) {
    const data = await this.request<ArrayBuffer>(`/files/${id}/download`, {
      binary: true,
    });
    this.emit({
      image: `data:image/png;base64,${careBase64(new Uint8Array(data))}`,
    });
  }
  private async prescription(id: string) {
    const rx = await this.request<CarePrescription>(`/prescriptions/${id}`);
    this.emit({
      section: null,
      title: "প্রেসক্রিপশন · Signed prescription",
      uploadAnimalId: null,
      form: null,
      cards: [
        {
          id: rx.id,
          title: careTime(rx.signedAt),
          lines: [
            rx.advice,
            ...rx.items.map(
              (m) =>
                `${m.medicineName} · ${m.dose} · ${m.frequency} · ${m.days} day(s)`,
            ),
          ],
          actions: [],
        },
      ],
      actions: [this.action("ফিরে যান · Back", this.returnTo)],
    });
  }
  async directory(animals: CareAnimal[], query = "") {
    const vets = await this.all<{
      id: string;
      displayName: string;
      professional: { district: string; species: string[]; bio: string } | null;
    }>(`/vets${query}`);
    this.emit({
      section: null,
      title: "যাচাইকৃত পশু চিকিৎসক · Verified vets",
      uploadAnimalId: null,
      form: null,
      cards: vets.map((v) => ({
        id: v.id,
        title: v.displayName,
        lines: [
          "Verified credential",
          ...(v.professional
            ? [
                v.professional.district,
                v.professional.species.join(", "),
                v.professional.bio,
              ]
            : ["Practice details not supplied"]),
        ],
        actions: [
          this.action("Available times", () =>
            this.bookingSlots(v.id, animals),
          ),
        ],
      })),
      actions: [
        this.action("Back to workspace", () => this.home()),
        this.action("Search vets", async () =>
          this.form(
            "Find a verified vet",
            [
              f("search", "Vet name", "", "text", true),
              f("district", "District", "", "text", true),
              {
                ...select("species", "Species", [
                  { value: "", label: "All species" },
                  ...["cattle", "goat", "buffalo", "sheep"].map((value) => ({
                    value,
                    label: value,
                  })),
                ]),
                optional: true,
              },
            ],
            async (v) => {
              const values = Object.entries(v)
                .filter(([, value]) => !!value)
                .map(
                  ([k, value]) =>
                    `${encodeURIComponent(k)}=${encodeURIComponent(value)}`,
                )
                .join("&");
              await this.directory(animals, values ? `?${values}` : "");
            },
          ),
        ),
      ],
    });
  }
  private async professionalForm() {
    const profile = await this.request<{
      professional: {
        district: string;
        species: string[];
        bio: string;
        version: number;
      } | null;
    }>(`/vets/${this.view.profile!.userId}`);
    const current = profile.professional;
    this.form(
      "Professional profile (self-reported practice details)",
      [
        f("district", "District", current?.district),
        f("bio", "Practice description", current?.bio, "multiline"),
        ...["cattle", "goat", "buffalo", "sheep"].map((value) =>
          f(
            value,
            `Treats ${value}`,
            String(current?.species.includes(value) ?? false),
            "check",
            true,
          ),
        ),
      ],
      async (v) => {
        const species = ["cattle", "goat", "buffalo", "sheep"].filter(
          (value) => v[value] === "true",
        );
        if (!species.length) throw new CareFailure(400);
        await this.write(
          "/vets/me/profile",
          { district: v.district, bio: v.bio, species },
          current?.version ?? 0,
          "PUT",
        );
        await this.home();
      },
    );
  }

  private async bookingSlots(
    vetId: string,
    animals: CareAnimal[],
    appointment?: CareAppointment,
  ) {
    const slots = await this.request<{ items: CareSlot[] }>(
      `/vets/${vetId}/slots`,
    );
    this.emit({
      section: null,
      title: "সময় নির্বাচন · Available times",
      uploadAnimalId: null,
      form: null,
      actions: [this.action("Back to workspace", () => this.home())],
      cards: slots.items.map((slot) => ({
        id: slot.id,
        title: careTime(slot.startsAt),
        lines: ["30 minutes · No-charge pilot · BDT 0"],
        actions: [
          this.action(
            appointment ? "Reschedule here" : "Book this time",
            async () => {
              if (!appointment && !animals.some((a) => a.status === "ACTIVE"))
                throw new Error("Register an active animal first.");
              this.form(
                appointment
                  ? "Reschedule (vet must accept again)"
                  : "বুকিং · Book care",
                appointment
                  ? [f("consent", CONSENT, "false", "check")]
                  : [
                      select(
                        "animalId",
                        "Animal",
                        animals
                          .filter((a) => a.status === "ACTIVE")
                          .map((a) => ({
                            value: a.id,
                            label: `${a.name} · ${a.tag}`,
                          })),
                      ),
                      select("mode", "Appointment type", [
                        { value: "visit", label: "Farm visit" },
                        {
                          value: "video",
                          label:
                            "Remote consultation (vet coordinates the call)",
                        },
                      ]),
                      f("reason", "কারণ · Reason", "", "multiline"),
                      f("consent", CONSENT, "false", "check"),
                    ],
                async (v) => {
                  if (appointment)
                    await this.write(
                      `/appointments/${appointment.id}/reschedule`,
                      { slotId: slot.id, consent: true },
                      appointment.version,
                    );
                  else
                    await this.write("/appointments", {
                      animalId: v.animalId,
                      slotId: slot.id,
                      mode: v.mode,
                      reason: v.reason,
                      consent: true,
                      consentVersion: "care-v1",
                    });
                  await this.home();
                },
              );
            },
          ),
        ],
      })),
    });
  }
  private appointmentCard(
    row: CareAppointment,
    profile: CareProfile,
  ): CareCard {
    const owner = row.farmerId === profile.userId;
    const vet =
      row.vetId === profile.userId &&
      profile.memberships.some((m) => m.role === "VET");
    const active = ["REQUESTED", "ACCEPTED"].includes(row.status);
    return {
      id: row.id,
      title: `মিলন · Appointment · ${row.status}`,
      lines: [
        careTime(row.startsAt),
        `${row.mode} · ${row.reason}`,
        ...(row.decisionNote ? [row.decisionNote] : []),
      ],
      actions: [
        this.action("Patient passport", () => this.passport(row.animalId)),
        ...(active
          ? [
              this.action("Cancel appointment", async () =>
                this.form(
                  "Cancel appointment",
                  [f("reason", "Reason")],
                  async (v) => {
                    await this.write(
                      `/appointments/${row.id}/cancellation`,
                      v,
                      row.version,
                    );
                    await this.home();
                  },
                ),
              ),
            ]
          : []),
        ...(owner
          ? [
              this.action("Withdraw vet access", async () =>
                this.form(
                  "Withdraw access immediately",
                  [
                    f(
                      "confirm",
                      "I want to withdraw this vet’s access.",
                      "false",
                      "check",
                    ),
                  ],
                  async () => {
                    await this.write(
                      `/appointments/${row.id}/consent-withdrawal`,
                    );
                    await this.home();
                  },
                ),
              ),
              ...(active
                ? [
                    this.action("Reschedule", () =>
                      this.bookingSlots(row.vetId, [], row),
                    ),
                  ]
                : []),
            ]
          : []),
        ...(vet && row.status === "REQUESTED"
          ? (["accept", "reject"] as const).map((decision) =>
              this.action(
                decision === "accept"
                  ? "Accept appointment"
                  : "Reject appointment",
                async () =>
                  this.form(
                    "Appointment decision",
                    [f("note", "Decision note")],
                    async (v) => {
                      await this.write(
                        `/appointments/${row.id}/decision`,
                        { decision, note: v.note },
                        row.version,
                      );
                      await this.home();
                    },
                  ),
              ),
            )
          : []),
        ...(vet && row.status === "ACCEPTED"
          ? [
              this.action("Start consultation", async () => {
                await this.write(
                  `/appointments/${row.id}/consultations`,
                  {},
                  row.version,
                );
                await this.home();
              }),
            ]
          : []),
        ...(vet && row.status === "IN_PROGRESS"
          ? [
              this.action("Sign consultation & prescription", async () =>
                this.completion(row),
              ),
            ]
          : []),
      ],
    };
  }
  private completion(row: CareAppointment) {
    this.form(
      "Consultation · sign once, correct by amendment",
      [
        select(
          "kind",
          "Record type",
          ["checkup", "vaccination", "treatment"].map((value) => ({
            value,
            label: value,
          })),
        ),
        f("diagnosis", "Clinical finding", "", "multiline"),
        f("advice", "Advice", "", "multiline"),
        f(
          "followUpAt",
          "Follow-up UTC (optional, e.g. 2030-01-01T10:00:00Z)",
          "",
          "text",
          true,
        ),
      ],
      async (v) => {
        const medicines = [];
        for (let i = 0; v[`medicine${i}Name`] !== undefined; i++) {
          const days = Number(required(v, `medicine${i}Days`));
          if (!Number.isInteger(days) || days < 1 || days > 365)
            throw new CareFailure(400);
          medicines.push({
            name: required(v, `medicine${i}Name`),
            dose: required(v, `medicine${i}Dose`),
            frequency: required(v, `medicine${i}Frequency`),
            days,
          });
        }
        const result = await this.write<{ prescriptionId: string }>(
          `/consultations/${row.id}/completion`,
          {
            kind: v.kind,
            diagnosis: v.diagnosis,
            advice: v.advice,
            medicines,
            ...(v.followUpAt ? { followUpAt: v.followUpAt } : {}),
          },
          row.version,
        );
        await this.home();
        this.returnTo = () => this.passport(row.animalId);
        await this.prescription(result.prescriptionId);
      },
      true,
    );
  }
  private async schedule() {
    const schedule = await this.request<{ version: number; items: CareSlot[] }>(
      "/vets/me/availability",
    );
    this.form(
      "সময় প্রকাশ · Publish 30-minute slots (next 90 days)",
      [
        f(
          "startsAt",
          "One UTC start per line, e.g. 2030-01-01T10:00:00Z. Replace open times; booked times stay reserved.",
          schedule.items
            .filter((s) => s.status === "OPEN")
            .map((s) => s.startsAt)
            .join("\n"),
          "multiline",
          true,
        ),
      ],
      async (v) => {
        const startsAt = (v.startsAt ?? "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
        await this.write(
          "/vets/me/availability",
          { startsAt },
          schedule.version,
          "PUT",
        );
        await this.home();
      },
    );
  }
  async notifications(cursor?: string) {
    const page = await this.request<{
      items: CareNotification[];
      unreadCount?: number;
      snapshotAt?: string;
      nextCursor: string | null;
    }>(`/notifications?limit=25&order=desc${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`);
    const unreadIds = page.items.filter((n) => !n.readAt).map((n) => n.id);
    this.returnTo = () => this.notifications(cursor);
    this.emit({
      section: null,
      title: `বিজ্ঞপ্তি · Notifications (${page.unreadCount ?? unreadIds.length} unread)`,
      uploadAnimalId: null,
      form: null,
      image: null,
      actions: [
        this.action("Back to workspace", () => this.home()),
        ...(page.nextCursor ? [this.action("আরও বিজ্ঞপ্তি · Next notifications", () => this.notifications(page.nextCursor!))] : []),
        ...(cursor ? [this.action("নতুন বিজ্ঞপ্তি · Latest notifications", () => this.notifications())] : []),
        ...((page.unreadCount ?? unreadIds.length)
          ? [
              this.action(page.snapshotAt ? "Mark all read" : "Mark this page read", async () => {
                await this.write("/notifications/read", page.snapshotAt ? { readBefore: page.snapshotAt } : { ids: unreadIds });
                await this.notifications();
              }),
            ]
          : []),
      ],
      cards: page.items.map((item) => ({
        id: item.id,
        title: `${item.title} · ${item.readAt ? "Read" : "Unread"}`,
        lines: [
          careTime(item.createdAt),
          item.body,
          `Category: ${item.category}`,
        ],
        actions: item.readAt
          ? []
          : [
              this.action("Mark read", async () => {
                await this.write("/notifications/read", { ids: [item.id] });
                await this.notifications();
              }),
            ],
      })),
    });
  }
  async preferencesForm() {
    const prefs = await this.request<CareNotificationPrefs>(
      "/me/notification-preferences",
    );
    this.form(
      "বিজ্ঞপ্তি পছন্দ · Notification preferences (SMS/Push simulated in M5)",
      [
        f(
          "inAppEnabled",
          "In-app notifications enabled",
          String(prefs.inAppEnabled),
          "check",
          true,
        ),
        f(
          "smsEnabled",
          "SMS notifications opt-in (simulated adapter; no live SMS sent)",
          String(prefs.smsEnabled),
          "check",
          true,
        ),
        f(
          "pushEnabled",
          "Push notifications opt-in (simulated adapter; no live push sent)",
          String(prefs.pushEnabled),
          "check",
          true,
        ),
      ],
      async (v) => {
        await this.write(
          "/me/notification-preferences",
          {
            inAppEnabled: v.inAppEnabled === "true",
            smsEnabled: v.smsEnabled === "true",
            pushEnabled: v.pushEnabled === "true",
            consentVersion: "notify-v1",
          },
          prefs.version,
          "PATCH",
        );
        await this.home();
      },
    );
  }
  async publishedContent() {
    const page = await this.request<{
      items: {
        id: string;
        slug: string;
        titleBn: string;
        titleEn: string;
        bodyBn: string;
        bodyEn: string;
        category: string;
      }[];
    }>("/content?limit=25");
    this.returnTo = () => this.publishedContent();
    this.emit({
      section: null,
      title: "তথ্যভাণ্ডার · Published educational content",
      uploadAnimalId: null,
      form: null,
      image: null,
      actions: [this.action("Back to workspace", () => this.home())],
      cards: page.items.map((item) => ({
        id: item.id,
        title: `${item.titleBn} · ${item.titleEn}`,
        lines: [`Category: ${item.category}`, item.bodyEn],
        actions: [],
      })),
    });
  }
  async aiTriageForm(animals: CareAnimal[]) {
    this.form(
      "এআই সহায়তা · Bounded AI triage (advisory only, sandbox)",
      [
        select(
          "animalId",
          "Animal",
          animals.map((a) => ({ value: a.id, label: `${a.name} (${a.tag})` })),
        ),
        select("modality", "Input modality", [
          { value: "TEXT", label: "Text prompt" },
          { value: "VOICE", label: "Confirmed voice transcript" },
          { value: "PHOTO", label: "READY private animal photo" },
        ]),
        f("promptText", "Describe symptoms or question", "", "multiline"),
      ],
      async (v) => {
        const res = await this.write<{
          guidanceText: string;
          uncertaintyNote: string;
        }>("/ai/requests", {
          animalId: v.animalId,
          modality: v.modality,
          promptText: v.promptText,
          ...(v.modality === "VOICE"
            ? { transcriptText: v.promptText, transcriptConfirmed: true }
            : {}),
          locale: "bn",
        });
        this.emit({
          section: null,
          title: "এআই পরামর্শ · Bounded AI triage response",
          form: null,
          actions: [this.action("Back to workspace", () => this.home())],
          cards: [
            {
              id: "ai-latest-response",
              title: "Advisory guidance (consult a verified vet)",
              lines: [res.guidanceText, res.uncertaintyNote],
              actions: [],
            },
          ],
        });
      },
    );
  }
  async pharmacyCatalog() {
    const [productsPage, ordersPage] = await Promise.all([
      this.request<{
        items: {
          id: string;
          sku: string;
          nameBn: string;
          nameEn: string;
          category: string;
          requiresPrescription: boolean;
          unitPriceMinor: string;
          stockQuantity: number;
        }[];
      }>("/products?limit=25"),
      this.request<{
        items: {
          id: string;
          status: string;
          totalMinor: string;
          createdAt: string;
        }[];
      }>("/orders?limit=25"),
    ]);
    this.returnTo = () => this.pharmacyCatalog();
    this.emit({
      section: null,
      title: "ফার্মেসি ও অর্ডার · Verified veterinary pharmacy (sandbox)",
      uploadAnimalId: null,
      form: null,
      image: null,
      actions: [this.action("Back to workspace", () => this.home())],
      cards: [
        ...productsPage.items.map((p) => ({
          id: p.id,
          title: `${p.nameBn} · ${p.nameEn} (${p.sku})`,
          lines: [
            `Category: ${p.category} · Price: ${p.unitPriceMinor} poisha · Stock: ${p.stockQuantity}`,
            p.requiresPrescription
              ? "Prescription required (must match signed vet Rx)"
              : "Over-the-counter veterinary supply",
          ],
          actions: [],
        })),
        ...ordersPage.items.map((o) => ({
          id: o.id,
          title: `Order ${o.status} · ${o.totalMinor} poisha`,
          lines: [careTime(o.createdAt)],
          actions: [],
        })),
      ],
    });
  }
}
/** Small portable encoder avoids Node Buffer in native/browser bundles. */
export function careBase64(bytes: Uint8Array) {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let value = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i]!,
      b = bytes[i + 1],
      c = bytes[i + 2];
    const n = (a << 16) | ((b ?? 0) << 8) | (c ?? 0);
    value +=
      alphabet[(n >>> 18) & 63]! +
      alphabet[(n >>> 12) & 63]! +
      (b === undefined ? "=" : alphabet[(n >>> 6) & 63]!) +
      (c === undefined ? "=" : alphabet[n & 63]!);
  }
  return value;
}
export function careMedicineFields(count: number): CareField[] {
  return Array.from({ length: count }, (_, i) => [
    f(`medicine${i}Name`, `Medicine ${i + 1} name`),
    f(`medicine${i}Dose`, `Medicine ${i + 1} dose`),
    f(`medicine${i}Frequency`, `Medicine ${i + 1} frequency`),
    f(`medicine${i}Days`, `Medicine ${i + 1} days`, "", "number"),
  ]).flat();
}

