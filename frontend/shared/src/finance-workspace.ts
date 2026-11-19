/** Real API projections for M6 Lending & Ledger Sandbox. Never imports or serializes DemoState. */
import {
  CareFailure,
  careTime,
  type CareAction,
  type CareAnimal,
  type CareCard,
  type CareField,
  type CareForm,
  type CarePage,
  type CareProfile,
  type CareRequest,
  type CareTransport,
} from "./care.ts";

export interface FinanceValuation {
  id: string;
  animalId: string;
  organizationId: string | null;
  assessorId: string;
  approvedById: string | null;
  version: number;
  status: string;
  amountMinor: string;
  assessedValueMinor: string;
  approvedValueMinor: string;
  maxLoanCap70Minor: string;
  currency: string;
  notes: string;
  expiresAt: string;
}

export interface FinanceEligibility {
  animalId: string;
  animalStatus: string;
  farmerEstimatedValueMinor: string;
  eligible: boolean;
  reason: string;
  hasLiveCollateralReservation: boolean;
  latestApprovedValuation: {
    id: string;
    version: number;
    organizationId: string | null;
    assessedValueMinor: string;
    approvedValueMinor: string;
    maxLoanCap70Minor: string;
    currency: string;
    expiresAt: string;
  } | null;
}

export interface FinanceQuote {
  id: string;
  animalId: string;
  valuationId: string;
  approvedValueMinor: string;
  maxPrincipalMinor: string;
  requestedPrincipalMinor: string;
  termMonths: number;
  termVersion: string;
  status: string;
  expiresAt: string;
}

export interface FinanceInstallment {
  id: string;
  installmentNumber: number;
  dueAt: string;
  principalMinor: string;
  feeMinor: string;
  paidMinor: string;
  status: string;
  graceReason: string | null;
  graceUntil: string | null;
  version: number;
}

export interface FinanceLoan {
  id: string;
  quoteId: string;
  animalId: string;
  farmerId: string;
  bankOrganizationId: string;
  purpose: string;
  repaymentSource: string;
  termVersion: string;
  principalMinor: string;
  totalPayableMinor: string;
  totalRepayableMinor: string;
  repaidMinor: string;
  outstandingMinor: string;
  termMonths: number;
  currency: string;
  status: string;
  decisionNote: string;
  version: number;
  createdAt: string;
  installments?: FinanceInstallment[];
}

export interface FinancePolicy {
  id: string;
  animalId: string;
  farmerId: string;
  insurerOrganizationId: string;
  evidenceFileId: string | null;
  renewedFromPolicyId: string | null;
  policyVersion: number;
  termVersion: string;
  consentVersion: string;
  coverageMinor: string;
  premiumMinor: string;
  termMonths: number;
  waitingDays: number;
  currency: string;
  status: string;
  decisionNote: string;
  startsAt: string | null;
  endsAt: string | null;
  version: number;
  createdAt: string;
}

export interface FinanceClaimReview {
  id: string;
  authorId: string;
  authorRole: string;
  kind: string;
  recommendation: string;
  notes: string;
  createdAt: string;
}

export interface FinanceClaimAllocation {
  id: string;
  claimId: string;
  loanId: string | null;
  debtAllocatedMinor: string;
  farmerAllocatedMinor: string;
  totalSettledMinor: string;
  currency: string;
}

export interface FinanceClaim {
  id: string;
  policyId: string;
  animalId: string;
  farmerId: string;
  insurerOrganizationId: string;
  incidentKind: string;
  incidentAt: string;
  description: string;
  claimedAmountMinor: string;
  approvedAmountMinor: string | null;
  currency: string;
  status: string;
  reviewTargetAt: string;
  decisionNote: string;
  version: number;
  createdAt: string;
  evidenceLinks?: { id: string; fileId: string }[];
  reviews?: FinanceClaimReview[];
  referralGrants?: { id: string; vetId: string; status: string; expiresAt: string }[];
  settlementAllocation?: FinanceClaimAllocation | null;
}

export interface FinanceWallet {
  accountCode: string;
  balanceMinor: string;
  currency: string;
  sandboxMode: boolean;
  withdrawable: boolean;
  disclosure: string;
  entries: {
    id: string;
    direction: string;
    amountMinor: string;
    currency: string;
    createdAt: string;
    transaction?: {
      referenceKind: string;
      description: string;
    };
  }[];
  paymentIntents: {
    id: string;
    kind: string;
    provider: string;
    status: string;
    amountMinor: string;
    currency: string;
    createdAt: string;
  }[];
}

export interface FinanceView {
  profile: CareProfile | null;
  title: string;
  notice: string;
  disclosure: string;
  busy: boolean;
  cards: CareCard[];
  actions: CareAction[];
  form: CareForm | null;
}

const SANDBOX_DISCLOSURE =
  "স্যান্ডবক্স প্রিভিউ · Sandbox financial preview only. Displayed balances and loans are non-withdrawable ledger records; no real money is transferred.";

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

export function formatMinorBdt(minor: string): string {
  try {
    const n = BigInt(minor);
    const whole = n / 100n;
    const frac = (n % 100n).toString().padStart(2, "0");
    return `BDT ${whole.toString()}.${frac} (${minor} poisha)`;
  } catch {
    return `${minor} poisha`;
  }
}

export function financeInitialView(): FinanceView {
  return {
    profile: null,
    title: "স্যান্ডবক্স ঋণ ও লেজার · Lending & ledger sandbox",
    notice: "Sign in, then load your financial sandbox workspace.",
    disclosure: SANDBOX_DISCLOSURE,
    busy: false,
    cards: [],
    actions: [],
    form: null,
  };
}

/** Memory-only lending & ledger sandbox workspace with generation fencing. */
export class FinanceWorkspace {
  view: FinanceView = financeInitialView();
  private generation = 0;
  private keys = new Map<string, string>();
  private identity: string | null = null;
  private readonly transport: CareTransport;
  private readonly newKey: () => string;
  private readonly changed: (view: FinanceView) => void;

  constructor(
    transport: CareTransport,
    newKey: () => string,
    changed: (view: FinanceView) => void,
  ) {
    this.transport = transport;
    this.newKey = newKey;
    this.changed = changed;
  }

  private emit(patch: Partial<FinanceView>) {
    this.view = { ...this.view, ...patch };
    this.changed(this.view);
  }

  clear() {
    this.generation++;
    this.identity = null;
    this.keys.clear();
    this.emit({
      profile: null,
      cards: [],
      actions: [],
      form: null,
      busy: false,
      notice: "Reload after signing in.",
    });
  }

  private async request<T>(path: string, request?: CareRequest): Promise<T> {
    const epoch = this.generation;
    const expected = this.identity;
    const before = await this.transport<CareProfile>("/me");
    if (
      epoch !== this.generation ||
      (expected && before.userId !== expected)
    ) {
      this.clear();
      throw new CareFailure(401);
    }
    this.identity = before.userId;
    const result = await this.transport<T>(path, request);
    const after = await this.transport<CareProfile>("/me");
    if (epoch !== this.generation || after.userId !== before.userId) {
      this.clear();
      throw new CareFailure(401);
    }
    return result;
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
        ) {
          this.clear();
        }
        this.emit({
          notice:
            error instanceof Error
              ? error.message
              : "Sandbox request failed. Please retry.",
        });
      }
    } finally {
      if (epoch === this.generation) this.emit({ busy: false });
    }
  }

  private async write<T>(
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

  private action(label: string, work: () => Promise<void>): CareAction {
    return {
      label,
      run: () => {
        void this.act(work);
      },
    };
  }

  private openForm(
    title: string,
    fields: CareField[],
    submit: CareForm["submit"],
  ) {
    this.emit({ form: { title, fields, submit } });
  }

  dismiss() {
    this.emit({ form: null });
  }

  async submit(values: Record<string, string>) {
    const form = this.view.form;
    if (!form) return;
    await this.act(async () => {
      for (const field of form.fields) {
        if (!field.optional && field.type !== "check") {
          required(values, field.key);
        }
      }
      await form.submit(values);
      this.emit({ form: null, notice: "সংরক্ষিত · Saved in sandbox" });
    });
  }

  async home() {
    const profile = await this.request<CareProfile>("/me");
    const [wallet, loansPage, animalsPage] = await Promise.all([
      this.request<FinanceWallet>("/me/wallet"),
      this.request<CarePage<FinanceLoan>>("/loans?limit=25"),
      this.request<CarePage<CareAnimal>>("/animals?limit=25"),
    ]);
    const isBankStaff = profile.memberships.some(
      (m) => m.role === "BANK_STAFF",
    );
    const isAdmin = profile.memberships.some((m) => m.role === "ADMIN");

    this.emit({
      profile,
      title: "স্যান্ডবক্স ঋণ ও লেজার · Lending & ledger sandbox",
      disclosure: wallet.disclosure || SANDBOX_DISCLOSURE,
      notice:
        "All valuations, quotes, loans, and ledger entries operate in opt-in sandbox mode (70% LTV cap, maker/checker separation).",
      form: null,
      actions: [
        this.action("রিলোড · Refresh", () => this.home()),
        this.action(
          "বীমা ও দাবি স্যান্ডবক্স · Insurance & claims",
          () => this.insuranceHome(),
        ),
        ...(animalsPage.items.length
          ? [
              this.action(
                "জামানত যাচাই ও ঋণ কোট · Check collateral & quote",
                () => this.eligibilityList(animalsPage.items),
              ),
            ]
          : []),
        ...(isBankStaff
          ? [
              this.action(
                "নতুন জামানত মূল্যায়ন (ব্যাংক) · New bank valuation",
                async () => this.valuationForm(),
              ),
              this.action(
                "পশুর মূল্যায়ন ও ঝুঁকি যাচাই · Inspect animal valuation/risk",
                async () => this.inspectAnimalForm(),
              ),
            ]
          : []),
        ...(isAdmin
          ? [
              this.action(
                "লেজার সমন্বয় যাচাই · Reconcile ledger",
                async () => this.reconcileView(),
              ),
            ]
          : []),
      ],
      cards: [
        {
          id: "wallet-summary",
          title: `স্যান্ডবক্স ওয়ালেট · Sandbox ledger balance: ${formatMinorBdt(wallet.balanceMinor)}`,
          lines: [
            wallet.disclosure,
            `Account: ${wallet.accountCode} · Withdrawable: No`,
            `Recent ledger entries: ${wallet.entries.length} · Payment intents: ${wallet.paymentIntents.length}`,
          ],
          actions: [],
        },
        ...loansPage.items.map((loan) =>
          this.loanCard(loan, profile, isBankStaff),
        ),
        ...wallet.entries.slice(0, 5).map((entry) => ({
          id: entry.id,
          title: `লেজার এন্ট্রি · ${entry.direction} · ${formatMinorBdt(entry.amountMinor)}`,
          lines: [
            careTime(entry.createdAt),
            entry.transaction?.description ??
              entry.transaction?.referenceKind ??
              "Balanced double-entry leg",
          ],
          actions: [],
        })),
      ],
    });
  }

  private loanCard(
    loan: FinanceLoan,
    profile: CareProfile,
    isBankStaff: boolean,
  ): CareCard {
    const isBorrower = loan.farmerId === profile.userId;
    return {
      id: loan.id,
      title: `ঋণ · Loan · ${loan.status} · ${formatMinorBdt(loan.principalMinor)}`,
      lines: [
        `Purpose: ${loan.purpose} · Term: ${loan.termMonths} month(s) (${loan.termVersion})`,
        `Total payable: ${formatMinorBdt(loan.totalPayableMinor)} · Repaid: ${formatMinorBdt(loan.repaidMinor)} · Outstanding: ${formatMinorBdt(loan.outstandingMinor)}`,
        ...(loan.decisionNote ? [`Bank note: ${loan.decisionNote}`] : []),
      ],
      actions: [
        this.action("কিস্তির সূচি · Installments", () =>
          this.installmentsView(loan, isBankStaff),
        ),
        ...(isBankStaff && loan.status === "SUBMITTED"
          ? [
              this.action("Approve loan", async () =>
                this.decisionForm(loan, "approve"),
              ),
              this.action("Reject loan", async () =>
                this.decisionForm(loan, "reject"),
              ),
            ]
          : []),
        ...(isBankStaff && loan.status === "APPROVED"
          ? [
              this.action("Disburse (sandbox)", async () => {
                await this.write(
                  `/loans/${loan.id}/disburse`,
                  { provider: "SANDBOX_SIMULATOR" },
                  loan.version,
                );
                await this.home();
              }),
            ]
          : []),
        ...(isBorrower && loan.status === "ACTIVE"
          ? [
              this.action("Repay from sandbox wallet", async () =>
                this.repayForm(loan, "WALLET"),
              ),
              this.action("Create sandbox repayment intent", async () =>
                this.repayForm(loan, "SANDBOX_SIMULATOR"),
              ),
            ]
          : []),
      ],
    };
  }

  private async eligibilityList(animals: CareAnimal[]) {
    const results = await Promise.all(
      animals.map(async (animal) => ({
        animal,
        eligibility: await this.request<FinanceEligibility>(
          `/animals/${animal.id}/collateral-eligibility`,
        ),
      })),
    );
    this.emit({
      title: "জামানত যোগ্যতা · Collateral eligibility (70% LTV cap)",
      form: null,
      actions: [this.action("Back to finance sandbox", () => this.home())],
      cards: results.map(({ animal, eligibility }) => ({
        id: animal.id,
        title: `${animal.name} · ${animal.tag} · ${eligibility.eligible ? "Eligible" : eligibility.reason}`,
        lines: [
          `Farmer estimate (non-authoritative): ${formatMinorBdt(eligibility.farmerEstimatedValueMinor)}`,
          eligibility.latestApprovedValuation
            ? `Bank approved valuation: ${formatMinorBdt(eligibility.latestApprovedValuation.approvedValueMinor)} · 70% Max Loan Cap: ${formatMinorBdt(eligibility.latestApprovedValuation.maxLoanCap70Minor)}`
            : "No current approved bank valuation on file.",
        ],
        actions: eligibility.eligible && eligibility.latestApprovedValuation
          ? [
              this.action("Request loan quote", async () =>
                this.quoteForm(
                  animal,
                  eligibility.latestApprovedValuation!.id,
                  eligibility.latestApprovedValuation!.maxLoanCap70Minor,
                ),
              ),
            ]
          : [],
      })),
    });
  }

  private quoteForm(
    animal: CareAnimal,
    valuationId: string,
    maxCapMinor: string,
  ) {
    this.openForm(
      `ঋণ কোট · Request loan quote for ${animal.name} (Max: ${maxCapMinor} poisha)`,
      [
        f(
          "requestedPrincipalMinor",
          `Requested principal in poisha (<= ${maxCapMinor})`,
          maxCapMinor,
          "number",
        ),
        select("termMonths", "Term (months)", [
          { value: "3", label: "3 months" },
          { value: "6", label: "6 months" },
          { value: "12", label: "12 months" },
        ]),
        f("purpose", "Loan purpose", "Dairy feed and veterinary care"),
      ],
      async (v) => {
        const quote = await this.write<FinanceQuote>("/loans/quotes", {
          animalId: animal.id,
          valuationId,
          requestedPrincipalMinor: v.requestedPrincipalMinor,
          termMonths: Number(v.termMonths),
        });
        await this.write("/loans", {
          quoteId: quote.id,
          purpose: v.purpose,
        });
        await this.home();
      },
    );
  }

  private valuationForm() {
    this.openForm(
      "নতুন জামানত মূল্যায়ন · Create draft collateral valuation (Bank Staff)",
      [
        f("animalId", "Animal UUID"),
        f(
          "assessedValueMinor",
          "Assessed value (poisha; 100 = BDT 1)",
          "10000000",
          "number",
        ),
        f(
          "approvedValueMinor",
          "Approved value (poisha; <= assessed)",
          "10000000",
          "number",
        ),
        f("notes", "Inspection & valuation notes", "", "multiline"),
        f(
          "expiresAt",
          "Expiry UTC (e.g. 2030-01-01T00:00:00Z)",
          "2030-01-01T00:00:00Z",
        ),
      ],
      async (v) => {
        await this.write("/valuations", {
          animalId: v.animalId,
          assessedValueMinor: v.assessedValueMinor,
          approvedValueMinor: v.approvedValueMinor,
          notes: v.notes,
          expiresAt: v.expiresAt,
        });
        await this.animalValuationsView(v.animalId!);
      },
    );
  }

  private inspectAnimalForm() {
    this.openForm(
      "পশুর মূল্যায়ন ও ঝুঁকি যাচাই · Inspect animal valuations & redacted risk",
      [f("animalId", "Animal UUID")],
      async (v) => {
        await this.animalValuationsView(v.animalId!);
      },
    );
  }

  private async animalValuationsView(animalId: string) {
    const [valuations, risk] = await Promise.all([
      this.request<{ items: FinanceValuation[] }>(
        `/animals/${animalId}/valuations`,
      ),
      this.request<{
        animalId: string;
        species: string;
        breed: string;
        status: string;
        weightKg: string;
        verifiedVetVaccinationCount: number;
        verifiedVetCheckupCount: number;
        hasLiveCollateralReservation: boolean;
        clinicalDetailsRedacted: boolean;
      }>(`/animals/${animalId}/collateral-risk`),
    ]);
    this.emit({
      title: `পশুর জামানত ও ঝুঁকি · Collateral & risk (${animalId.slice(0, 8)})`,
      form: null,
      actions: [this.action("Back to finance sandbox", () => this.home())],
      cards: [
        {
          id: `risk-${animalId}`,
          title: `Redacted risk summary · ${risk.species} (${risk.breed})`,
          lines: [
            `Status: ${risk.status} · Weight: ${risk.weightKg} kg`,
            `Verified vet vaccinations: ${risk.verifiedVetVaccinationCount} · Checkups: ${risk.verifiedVetCheckupCount}`,
            `Live collateral reservation: ${risk.hasLiveCollateralReservation ? "Yes" : "No"} · Clinical notes redacted: ${risk.clinicalDetailsRedacted ? "Yes" : "No"}`,
          ],
          actions: [],
        },
        ...valuations.items.map((val) => ({
          id: val.id,
          title: `Valuation v${val.version} · ${val.status} · ${formatMinorBdt(val.approvedValueMinor)}`,
          lines: [
            `70% LTV Cap: ${formatMinorBdt(val.maxLoanCap70Minor)} · Expires: ${careTime(val.expiresAt)}`,
            val.notes,
          ],
          actions:
            val.status === "DRAFT"
              ? [
                  this.action(
                    "Approve valuation (maker/checker)",
                    async () => {
                      await this.write(
                        `/valuations/${val.id}/approve`,
                        {},
                        val.version,
                      );
                      await this.animalValuationsView(animalId);
                    },
                  ),
                ]
              : [],
        })),
      ],
    });
  }

  private decisionForm(loan: FinanceLoan, decision: "approve" | "reject") {
    this.openForm(
      `${decision === "approve" ? "Approve" : "Reject"} loan application`,
      [f("note", "Decision note", "", "multiline")],
      async (v) => {
        await this.write(
          `/loans/${loan.id}/decision`,
          { decision, note: v.note },
          loan.version,
        );
        await this.home();
      },
    );
  }

  private repayForm(
    loan: FinanceLoan,
    provider: "WALLET" | "SANDBOX_SIMULATOR",
  ) {
    this.openForm(
      `কিস্তি পরিশোধ · Repay loan (${provider})`,
      [
        f(
          "amountMinor",
          `Amount in poisha (<= ${loan.outstandingMinor})`,
          loan.outstandingMinor,
          "number",
        ),
      ],
      async (v) => {
        await this.write(`/loans/${loan.id}/repayment-intents`, {
          amountMinor: v.amountMinor,
          provider,
        });
        await this.home();
      },
    );
  }

  private async installmentsView(loan: FinanceLoan, isBankStaff: boolean) {
    const schedule = await this.request<{
      loanId: string;
      status: string;
      totalRepayableMinor: string;
      repaidMinor: string;
      outstandingMinor: string;
      items: FinanceInstallment[];
    }>(`/loans/${loan.id}/installments`);

    this.emit({
      title: `কিস্তির সূচি · Installments (${schedule.status})`,
      form: null,
      actions: [this.action("Back to finance sandbox", () => this.home())],
      cards: schedule.items.map((inst) => ({
        id: inst.id,
        title: `Installment #${inst.installmentNumber} · ${inst.status}`,
        lines: [
          `Due: ${careTime(inst.dueAt)}`,
          `Principal due: ${formatMinorBdt(inst.principalMinor)} · Paid: ${formatMinorBdt(inst.paidMinor)}`,
          ...(inst.graceReason ? [`Grace reason: ${inst.graceReason}`] : []),
        ],
        actions:
          isBankStaff && loan.status === "ACTIVE" && inst.status !== "PAID"
            ? [
                this.action("Grant grace extension", async () =>
                  this.openForm(
                    `Grant grace on installment #${inst.installmentNumber}`,
                    [
                      f("graceDays", "Grace days (1-90)", "14", "number"),
                      f(
                        "reason",
                        "Reviewed production-drop reason",
                        "",
                        "multiline",
                      ),
                    ],
                    async (v) => {
                      await this.write(
                        `/loans/${loan.id}/grace`,
                        {
                          installmentId: inst.id,
                          graceDays: Number(v.graceDays),
                          reason: v.reason,
                        },
                        loan.version,
                      );
                      await this.installmentsView(loan, isBankStaff);
                    },
                  ),
                ),
              ]
            : [],
      })),
    });
  }

  private async reconcileView() {
    const report = await this.request<{
      balanced: boolean;
      transactionCount: number;
      entryCount: number;
      totalDebitMinor: string;
      totalCreditMinor: string;
      unbalancedTransactionIds: string[];
    }>("/admin/ledger/reconciliation");
    this.emit({
      title: "লেজার সমন্বয় · Admin ledger reconciliation",
      form: null,
      actions: [this.action("Back to finance sandbox", () => this.home())],
      cards: [
        {
          id: "reconciliation",
          title: report.balanced
            ? "Balanced: All ledger transactions sum to zero"
            : "Unbalanced ledger detected",
          lines: [
            `Transactions: ${report.transactionCount} · Entries: ${report.entryCount}`,
            `Total debits: ${formatMinorBdt(report.totalDebitMinor)} · Total credits: ${formatMinorBdt(report.totalCreditMinor)}`,
          ],
          actions: [],
        },
      ],
    });
  }

  async insuranceHome() {
    const profile = await this.request<CareProfile>("/me");
    const [policiesPage, claimsPage] = await Promise.all([
      this.request<CarePage<FinancePolicy>>("/policies?limit=25"),
      this.request<CarePage<FinanceClaim>>("/claims?limit=25"),
    ]);
    const isInsurerStaff = profile.memberships.some(
      (m) => m.role === "INSURER_STAFF",
    );
    const isVet = profile.memberships.some((m) => m.role === "VET");

    this.emit({
      profile,
      title: "স্যান্ডবক্স বীমা ও দাবি · Insurance & claim settlement sandbox",
      notice:
        "Insurance sandbox (ins-sandbox-v1): policy activation requires confirmed premium; death claims require private READY evidence, review/referral, maker/checker separation, and debt-first ledger settlement.",
      form: null,
      actions: [
        this.action("Back to finance sandbox", () => this.home()),
        this.action("Refresh insurance", () => this.insuranceHome()),
        this.action("নতুন বীমা আবেদন · Apply for policy", async () =>
          this.applyPolicyForm(),
        ),
      ],
      cards: [
        ...policiesPage.items.map((policy) =>
          this.policyCard(policy, profile, isInsurerStaff),
        ),
        ...claimsPage.items.map((claim) =>
          this.claimCard(claim, profile, isInsurerStaff, isVet),
        ),
      ],
    });
  }

  private policyCard(
    policy: FinancePolicy,
    profile: CareProfile,
    isInsurerStaff: boolean,
  ): CareCard {
    const isOwner = policy.farmerId === profile.userId;
    return {
      id: policy.id,
      title: `বীমা পলিসি · Policy v${policy.policyVersion} · ${policy.status} · Coverage ${formatMinorBdt(policy.coverageMinor)}`,
      lines: [
        `Premium: ${formatMinorBdt(policy.premiumMinor)} · Term: ${policy.termMonths} month(s) (${policy.termVersion})`,
        policy.startsAt && policy.endsAt
          ? `Active window: ${careTime(policy.startsAt)} → ${careTime(policy.endsAt)}`
          : "Coverage window activates only after premium confirmation.",
        ...(policy.decisionNote ? [`Insurer note: ${policy.decisionNote}`] : []),
      ],
      actions: [
        ...(isInsurerStaff && policy.status === "SUBMITTED"
          ? [
              this.action("Approve policy (awaiting premium)", async () =>
                this.decidePolicyForm(policy, "approve"),
              ),
              this.action("Reject policy", async () =>
                this.decidePolicyForm(policy, "reject"),
              ),
            ]
          : []),
        ...(isOwner && policy.status === "APPROVED_AWAITING_PREMIUM"
          ? [
              this.action("Pay premium from sandbox wallet", async () => {
                await this.write(
                  `/policies/${policy.id}/premium-intents`,
                  { provider: "WALLET" },
                  policy.version,
                );
                await this.insuranceHome();
              }),
              this.action("Create sandbox premium intent", async () => {
                await this.write(
                  `/policies/${policy.id}/premium-intents`,
                  { provider: "SANDBOX_SIMULATOR" },
                  policy.version,
                );
                await this.insuranceHome();
              }),
            ]
          : []),
        ...(isOwner && policy.status === "ACTIVE"
          ? [
              this.action("Submit death claim", async () =>
                this.submitClaimForm(policy),
              ),
            ]
          : []),
        ...(isOwner && policy.status === "EXPIRED"
          ? [
              this.action("Renew policy", async () =>
                this.renewPolicyForm(policy),
              ),
            ]
          : []),
      ],
    };
  }

  private claimCard(
    claim: FinanceClaim,
    profile: CareProfile,
    isInsurerStaff: boolean,
    isVet: boolean,
  ): CareCard {
    const alloc = claim.settlementAllocation;
    return {
      id: claim.id,
      title: `বীমা দাবি · Claim (${claim.incidentKind}) · ${claim.status} · Claimed ${formatMinorBdt(claim.claimedAmountMinor)}`,
      lines: [
        `Incident: ${careTime(claim.incidentAt)} · 7-day review target: ${careTime(claim.reviewTargetAt)}`,
        `Description: ${claim.description}`,
        `Evidence files: ${claim.evidenceLinks?.length ?? 0} · Reviews/opinions: ${claim.reviews?.length ?? 0}`,
        ...(claim.approvedAmountMinor
          ? [`Approved payout: ${formatMinorBdt(claim.approvedAmountMinor)}`]
          : []),
        ...(alloc
          ? [
              `Debt-first settlement: Loan debt paid ${formatMinorBdt(alloc.debtAllocatedMinor)} · Farmer remainder ${formatMinorBdt(alloc.farmerAllocatedMinor)}`,
            ]
          : []),
      ],
      actions: [
        ...(isInsurerStaff &&
        ["SUBMITTED", "UNDER_REVIEW"].includes(claim.status)
          ? [
              this.action("Run advisory review check", async () => {
                await this.write(
                  `/claims/${claim.id}/review-requests`,
                  {},
                  claim.version,
                );
                await this.insuranceHome();
              }),
              this.action("Refer claim to verified vet", async () =>
                this.referClaimForm(claim),
              ),
            ]
          : []),
        ...(isVet && claim.status === "REFERRED_TO_VET"
          ? [
              this.action("Submit vet clinical opinion", async () =>
                this.vetOpinionForm(claim),
              ),
            ]
          : []),
        ...(isInsurerStaff &&
        ["UNDER_REVIEW", "VET_REVIEWED"].includes(claim.status)
          ? [
              this.action("Approve claim (maker/checker)", async () =>
                this.decideClaimForm(claim, "approve"),
              ),
              this.action("Reject claim", async () =>
                this.decideClaimForm(claim, "reject"),
              ),
            ]
          : []),
        ...(isInsurerStaff && claim.status === "APPROVED"
          ? [
              this.action("Settle claim (debt-first ledger)", async () => {
                await this.write(
                  `/claims/${claim.id}/settlements`,
                  { provider: "WALLET" },
                  claim.version,
                );
                await this.insuranceHome();
              }),
            ]
          : []),
      ],
    };
  }

  private applyPolicyForm() {
    this.openForm(
      "নতুন বীমা আবেদন · Apply for sandbox livestock insurance (ins-sandbox-v1)",
      [
        f("animalId", "Animal UUID"),
        f("insurerOrganizationId", "Insurer organization UUID"),
        f("coverageMinor", "Coverage amount in poisha", "8000000", "number"),
        f("premiumMinor", "Premium amount in poisha", "200000", "number"),
        select("termMonths", "Coverage term (months)", [
          { value: "6", label: "6 months" },
          { value: "12", label: "12 months" },
        ]),
        f("evidenceFileId", "Optional READY evidence file UUID", "", "text", true),
      ],
      async (v) => {
        await this.write("/policies", {
          animalId: v.animalId,
          insurerOrganizationId: v.insurerOrganizationId,
          coverageMinor: v.coverageMinor,
          premiumMinor: v.premiumMinor,
          termMonths: Number(v.termMonths),
          ...(v.evidenceFileId?.trim()
            ? { evidenceFileId: v.evidenceFileId.trim() }
            : {}),
          consent: true,
          consentVersion: "ins-sandbox-v1",
        });
        await this.insuranceHome();
      },
    );
  }

  private decidePolicyForm(
    policy: FinancePolicy,
    decision: "approve" | "reject",
  ) {
    this.openForm(
      `${decision === "approve" ? "Approve" : "Reject"} insurance policy`,
      [f("note", "Decision note", "", "multiline")],
      async (v) => {
        await this.write(
          `/policies/${policy.id}/decision`,
          { decision, note: v.note },
          policy.version,
        );
        await this.insuranceHome();
      },
    );
  }

  private renewPolicyForm(policy: FinancePolicy) {
    this.openForm(
      "পলিসি নবায়ন · Renew expired insurance policy (ins-sandbox-v1)",
      [
        f(
          "coverageMinor",
          "Coverage amount in poisha",
          policy.coverageMinor,
          "number",
        ),
        f(
          "premiumMinor",
          "Premium amount in poisha",
          policy.premiumMinor,
          "number",
        ),
        select("termMonths", "Coverage term (months)", [
          { value: "6", label: "6 months" },
          { value: "12", label: "12 months" },
        ]),
      ],
      async (v) => {
        await this.write(`/policies/${policy.id}/renewals`, {
          coverageMinor: v.coverageMinor,
          premiumMinor: v.premiumMinor,
          termMonths: Number(v.termMonths),
          consent: true,
          consentVersion: "ins-sandbox-v1",
        });
        await this.insuranceHome();
      },
    );
  }

  private submitClaimForm(policy: FinancePolicy) {
    this.openForm(
      "বীমা দাবি জমা · Submit mortality claim with READY private evidence",
      [
        f(
          "incidentAt",
          "Incident UTC timestamp (within active coverage)",
          new Date().toISOString(),
        ),
        f(
          "claimedAmountMinor",
          `Claimed amount in poisha (<= ${policy.coverageMinor})`,
          policy.coverageMinor,
          "number",
        ),
        f("evidenceFileId", "READY private evidence file UUID"),
        f("description", "Incident description", "", "multiline"),
      ],
      async (v) => {
        await this.write("/claims", {
          policyId: policy.id,
          incidentKind: "DEATH",
          incidentAt: v.incidentAt,
          claimedAmountMinor: v.claimedAmountMinor,
          description: v.description,
          evidenceFileIds: [v.evidenceFileId!.trim()],
        });
        await this.insuranceHome();
      },
    );
  }

  private referClaimForm(claim: FinanceClaim) {
    this.openForm(
      "পশুচিকিৎসকের কাছে রেফার · Refer claim to verified veterinarian",
      [
        f("vetId", "Verified veterinarian user UUID"),
        f("note", "Referral scope and instruction", "", "multiline"),
      ],
      async (v) => {
        await this.write(
          `/claims/${claim.id}/referrals`,
          { vetId: v.vetId, note: v.note, expiresInHours: 72 },
          claim.version,
        );
        await this.insuranceHome();
      },
    );
  }

  private vetOpinionForm(claim: FinanceClaim) {
    this.openForm(
      "ক্লিনিক্যাল মতামত · Submit referred veterinarian clinical opinion",
      [
        select("recommendation", "Clinical recommendation", [
          { value: "CONFIRM_MORTALITY", label: "Confirm mortality evidence" },
          { value: "INCONCLUSIVE", label: "Inconclusive evidence" },
          { value: "REJECT_EVIDENCE", label: "Reject inconsistent evidence" },
        ]),
        f("clinicalOpinion", "Signed clinical assessment", "", "multiline"),
      ],
      async (v) => {
        await this.write(
          `/claims/${claim.id}/opinions`,
          {
            recommendation: v.recommendation,
            clinicalOpinion: v.clinicalOpinion,
          },
          claim.version,
        );
        await this.insuranceHome();
      },
    );
  }

  private decideClaimForm(
    claim: FinanceClaim,
    decision: "approve" | "reject",
  ) {
    this.openForm(
      `${decision === "approve" ? "Approve" : "Reject"} insurance claim (maker/checker)`,
      [
        ...(decision === "approve"
          ? [
              f(
                "approvedAmountMinor",
                `Approved payout in poisha (<= ${claim.claimedAmountMinor})`,
                claim.claimedAmountMinor,
                "number",
              ),
            ]
          : []),
        f("reason", "Decision reason", "", "multiline"),
      ],
      async (v) => {
        await this.write(
          `/claims/${claim.id}/decision`,
          {
            decision,
            ...(decision === "approve"
              ? { approvedAmountMinor: v.approvedAmountMinor }
              : {}),
            reason: v.reason,
          },
          claim.version,
        );
        await this.insuranceHome();
      },
    );
  }
}
