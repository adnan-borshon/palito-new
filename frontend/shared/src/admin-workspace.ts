import {
  CareFailure,
  CareWorkspace,
  careTime,
  type CareCard,
  type CareField,
  type CarePage,
} from "./care.ts";

type AdminSection = "overview" | "users" | "content" | "audit" | "reports";
const sections: { id: AdminSection; label: string }[] = [
  { id: "overview", label: "সিস্টেম · Overview" },
  { id: "users", label: "ব্যবহারকারী · Users & access" },
  { id: "content", label: "শিক্ষামূলক কন্টেন্ট · Content" },
  { id: "audit", label: "অডিট · Audit log" },
  { id: "reports", label: "প্রতিবেদন · Reports" },
];
type UserSummary = { id: string; displayName: string; status: string; memberships: { role: string; status: string }[] };
type Content = {
  id: string; slug: string; titleBn: string; titleEn: string;
  bodyBn: string; bodyEn: string; category: string; status: string; version: number;
};
type Organization = { id: string; name: string; kind: string };
type StaffMember = { id: string; role: string; status: string; user: UserSummary & { vetCredential: { status: string } | null } };
type Recovery = { id: string; kind: string; user: { displayName: string } };
type Audit = { id: string; action: string; actorKind: string; targetKind: string; createdAt: string };
type DeadLetter = { id: string; topic: string; attempts: number; lastErrorCode: string | null };
const contentFields = ["slug", "titleBn", "titleEn", "bodyBn", "bodyEn", "category"] as const;
const fieldLabels = ["Slug", "বাংলা শিরোনাম · Bangla title", "English title", "বাংলা লেখা · Bangla text", "English text", "Category"];
const categories = ["HEALTH", "NUTRITION", "FINANCE", "INSURANCE", "IOT"];

export class AdminWorkspace extends CareWorkspace {
  private page: AdminSection = "overview";
  private cursor?: string;

  override home() {
    return this.openPage(this.page, this.cursor);
  }

  override clear() {
    this.page = "overview";
    this.cursor = undefined;
    super.clear();
  }

  override refresh() {
    if (this.view.section !== "home" || this.view.form) return;
    return this.act(() => this.home());
  }

  private async openPage(section: AdminSection, cursor?: string) {
    this.page = section;
    this.cursor = cursor;
    const query = `?limit=25${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
    const result = await this.authenticated(async (read, profile) => {
      if (!profile.memberships.some((m) => m.role === "ADMIN")) throw new CareFailure(403);
      let cards: CareCard[];
      let nextCursor: string | null = null;

      switch (section) {
        case "overview": {
          const [health, dead] = await Promise.all([
            read<{ deploymentTier: string; workerEnabled: boolean; outbox: Record<string, number> }>("/admin/system-health"),
            read<CarePage<DeadLetter>>(`/admin/outbox/dead-letter${query}`),
          ]);
          nextCursor = dead.nextCursor;
          cards = [{
            id: "health",
            title: "সিস্টেম হেলথ · System health",
            lines: [
              `Environment: ${health.deploymentTier} · Worker: ${health.workerEnabled ? "On" : "Off"}`,
              ...Object.entries(health.outbox).map(([label, count]) => `${label}: ${count}`),
            ],
            actions: [],
          }, ...dead.items.map((job) => ({
            id: job.id,
            title: job.topic,
            lines: [`Attempts: ${job.attempts}`, job.lastErrorCode ?? "Failed"],
            actions: [this.action("Retry failed job", async () => {
              await this.write(`/admin/outbox/${job.id}/retry`);
              await this.home();
            })],
          }))];
          break;
        }
        case "users": {
          const users = await read<CarePage<UserSummary>>(`/admin/users${query}`);
          nextCursor = users.nextCursor;
          cards = users.items.map((user) => ({
            id: user.id,
            title: user.displayName,
            lines: [user.status, ...user.memberships.map((m) => `${m.role} · ${m.status}`)],
            actions: user.id !== profile.userId && !user.memberships.some((m) => m.role === "ADMIN") &&
              (user.status === "ACTIVE" || user.status === "SUSPENDED")
              ? [this.confirmAction(
                user.status === "ACTIVE" ? "Suspend account" : "Restore suspended account",
                `/staff/users/${user.id}/status`,
                { status: user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" },
                () => this.home(),
              )] : [],
          }));
          break;
        }
        case "content": {
          const content = await read<CarePage<Content>>(`/admin/content${query}`);
          nextCursor = content.nextCursor;
          cards = content.items.map((item) => this.contentCard(item));
          break;
        }
        case "audit": {
          const audit = await read<CarePage<Audit>>(`/admin/audit-events${query}`);
          nextCursor = audit.nextCursor;
          cards = audit.items.map((event) => ({
            id: event.id,
            title: event.action,
            lines: [careTime(event.createdAt), `${event.actorKind} · ${event.targetKind}`],
            actions: [],
          }));
          break;
        }
        case "reports": {
          const report = await read<{ generatedAt: string; aggregates: Record<string, number> }>("/admin/reports");
          cards = [{
            id: "aggregates",
            title: "সিস্টেম প্রতিবেদন · System report",
            lines: [
              careTime(report.generatedAt),
              ...Object.entries(report.aggregates).map(([label, total]) => `${label}: ${total}`),
            ],
            actions: [this.action("Open audited summary export", () => this.exportSummary())],
          }];
          break;
        }
      }
      return { profile, cards, nextCursor };
    });

    this.emit({
      section: "home",
      profile: result.profile,
      title: `প্রশাসন · Administration · ${sections.find((entry) => entry.id === section)!.label}`,
      cards: result.cards,
      notice: result.cards.length ? "" : "কোনো রেকর্ড নেই · No records to show.",
      form: null,
      actions: [
        ...sections.map((entry) => this.action(entry.label, () => this.openPage(entry.id))),
        ...(section === "users" ? [
          this.action("সংগঠন · Staff organizations", () => this.organizations()),
          this.action("অ্যাকাউন্ট পুনরুদ্ধার · Recovery review", () => this.recovery()),
        ] : []),
        ...(section === "content" ? [this.action("নতুন খসড়া · New draft", async () => this.editContent())] : []),
        ...(result.nextCursor ? [this.action("পরের পাতা · Next page", () => this.openPage(section, result.nextCursor!))] : []),
        ...(cursor ? [this.action("প্রথম পাতা · First page", () => this.openPage(section))] : []),
      ],
    });
  }

  private confirmAction(label: string, path: string, body: object, reload: () => Promise<void>) {
    return this.action(label, async () => {
      this.form(label, [{ key: "confirm", label: "Confirm this change", value: "false", type: "check" }], async () => {
        await this.write(path, body);
        await reload();
      });
    });
  }

  private async organizations() {
    const organizations = await this.request<Organization[]>("/staff/organizations");
    this.emit({
      section: null,
      title: "সংগঠন · Staff organizations",
      actions: [
        this.action("Back to users", () => this.openPage("users")),
        this.action("Approve organization", async () => {
          this.form("Approve organization", [
            { key: "name", label: "Organization name", value: "", maxLength: 160 },
            { key: "kind", label: "Organization type", value: "CLINIC", type: "select",
              options: ["CLINIC", "BANK", "INSURER"].map((value) => ({ value, label: value })) },
          ], async (values) => {
            await this.write("/staff/organizations", values);
            await this.organizations();
          });
        }),
      ],
      cards: organizations.map((organization) => ({
        id: organization.id,
        title: organization.name,
        lines: [organization.kind],
        actions: [this.action("View staff", () => this.members(organization))],
      })),
    });
  }

  private async members(organization: Organization) {
    const members = await this.request<StaffMember[]>(`/staff/organizations/${organization.id}/memberships`);
    this.emit({
      section: null,
      title: organization.name,
      actions: [this.action("Back to organizations", () => this.organizations())],
      cards: members.map((member) => ({
        id: member.id,
        title: member.user.displayName,
        lines: [`${member.role} · ${member.status} · ${member.user.status}`,
          ...(member.user.vetCredential ? [`Credential: ${member.user.vetCredential.status}`] : [])],
        actions: [
          ...(member.role !== "ADMIN" && member.status !== "REVOKED" ? [this.confirmAction(
            "Revoke membership", `/staff/memberships/${member.id}/status`, { status: "REVOKED" },
            () => this.members(organization),
          )] : []),
          ...(member.user.vetCredential?.status === "PENDING" ? [this.confirmAction(
            "Verify reviewed vet credential", `/staff/vets/${member.user.id}/credential`, { status: "VERIFIED" },
            () => this.members(organization),
          )] : []),
        ],
      })),
    });
  }

  private async recovery() {
    const requests = await this.request<Recovery[]>("/staff/recovery-requests");
    this.emit({
      section: null,
      title: "অ্যাকাউন্ট পুনরুদ্ধার · Recovery review",
      notice: "Verify the requester through the support process before approving.",
      actions: [this.action("Back to users", () => this.openPage("users"))],
      cards: requests.map((row) => ({
        id: row.id,
        title: row.user.displayName,
        lines: [row.kind],
        actions: (["APPROVED", "REJECTED"] as const).map((decision) => this.confirmAction(
          decision === "APPROVED" ? "Approve recovery" : "Reject recovery",
          `/staff/recovery-requests/${row.id}/decision`, { decision }, () => this.recovery(),
        )),
      })),
    });
  }

  private contentCard(content: Content): CareCard {
    return {
      id: content.id,
      title: `${content.titleBn} · ${content.titleEn}`,
      lines: [`${content.category} · ${content.status} · ${content.slug}`],
      actions: [
        this.action("সম্পাদনা · Edit article", async () => this.editContent(content)),
        ...(content.status === "DRAFT" ? [this.action("প্রকাশ করুন · Publish", async () => {
          await this.write(`/content/${content.id}/publication`, {}, content.version);
          await this.home();
        })] : []),
      ],
    };
  }

  private editContent(content?: Content) {
    const fields: CareField[] = contentFields.map((key, index) => {
      const category = key === "category";
      const multiline = key === "bodyBn" || key === "bodyEn";
      return {
        key, label: fieldLabels[index]!, value: content?.[key] ?? (category ? "HEALTH" : ""),
        type: category ? "select" : multiline ? "multiline" : "text",
        maxLength: multiline ? 8000 : key === "slug" ? 120 : 200,
        options: category ? categories.map((value) => ({ value, label: value })) : undefined,
      };
    });
    this.form(content ? "Edit educational article" : "Create educational draft", fields, async (values) => {
      await this.write(content ? `/content/${content.id}` : "/content", values, content?.version, content ? "PATCH" : "POST");
      await this.home();
    });
  }

  private async exportSummary() {
    const job = await this.write<{ id: string }>("/admin/exports", { reportKind: "SUMMARY" });
    const report = await this.request<{ payload: Record<string, string | number | null>; expiresAt: string }>(`/admin/exports/${job.id}/download`);
    this.emit({
      section: null,
      title: "অডিটকৃত প্রতিবেদন · Audited summary export",
      actions: [this.action("Back to reports", () => this.openPage("reports"))],
      cards: [{
        id: job.id,
        title: "Summary",
        lines: Object.entries(report.payload).filter(([, value]) => value !== null).map(([key, value]) => `${key}: ${value}`),
        actions: [],
      }],
    });
  }
}
