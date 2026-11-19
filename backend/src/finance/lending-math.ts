import { createHmac, timingSafeEqual } from "node:crypto";

export interface PlannedInstallment {
  installmentNumber: number;
  dueAt: Date;
  principalMinor: bigint;
  principalDueMinor: bigint;
}

export interface OpenInstallmentInput {
  id: string;
  installmentNumber: number;
  principalMinor?: bigint;
  feeMinor?: bigint;
  paidMinor?: bigint;
  principalDueMinor?: bigint;
  principalPaidMinor?: bigint;
}

export interface PlannedAllocation {
  installmentId: string;
  installmentNumber: number;
  amountMinor: bigint;
  newPaidMinor: bigint;
  fullyPaid: boolean;
}

/**
 * Computes the 70% LTV loan cap in integer minor units (paisa) without overflow:
 * floor(approvedValueMinor * 7 / 10) = (v / 10n) * 7n + ((v % 10n) * 7n) / 10n.
 */
export function maxLoanCap70(approvedValueMinor: bigint): bigint {
  if (approvedValueMinor <= 0n) {
    throw new RangeError("approvedValueMinor must be positive");
  }
  return (
    (approvedValueMinor / 10n) * 7n + ((approvedValueMinor % 10n) * 7n) / 10n
  );
}

/**
 * Adds N calendar months in UTC, clamping the day-of-month to the target month's length
 * so end-of-month dates (e.g. Jan 31 -> Feb 28/29) never overflow into the following month.
 */
export function addCalendarMonthsUtc(anchor: Date, months: number): Date {
  if (!Number.isInteger(months) || months < 1) {
    throw new RangeError("months must be a positive integer");
  }
  const year = anchor.getUTCFullYear();
  const monthIndex = anchor.getUTCMonth() + months;
  const targetYear = year + Math.floor(monthIndex / 12);
  const targetMonth = ((monthIndex % 12) + 12) % 12;
  const maxDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const clampedDay = Math.min(anchor.getUTCDate(), maxDay);
  return new Date(
    Date.UTC(
      targetYear,
      targetMonth,
      clampedDay,
      anchor.getUTCHours(),
      anchor.getUTCHours() === anchor.getUTCHours() ? anchor.getUTCMinutes() : 0,
      anchor.getUTCSeconds(),
      anchor.getUTCMilliseconds(),
    ),
  );
}

/**
 * Builds a deterministic installment schedule whose principalMinor values sum
 * to the exact principalMinor (remainder assigned to the final installment).
 */
export function buildInstallmentSchedule(
  principalMinor: bigint,
  termMonths: number,
  disbursedAt: Date,
): PlannedInstallment[] {
  if (principalMinor <= 0n) {
    throw new RangeError("principalMinor must be positive");
  }
  if (!Number.isInteger(termMonths) || termMonths < 1 || termMonths > 24) {
    throw new RangeError("termMonths must be an integer between 1 and 24");
  }
  const term = BigInt(termMonths);
  const base = principalMinor / term;
  const remainder = principalMinor % term;
  if (base === 0n && termMonths > 1) {
    throw new RangeError("principalMinor is too small for the requested termMonths");
  }
  const schedule: PlannedInstallment[] = [];
  for (let i = 1; i <= termMonths; i += 1) {
    const isLast = i === termMonths;
    const dueMinor = isLast ? base + remainder : base;
    schedule.push({
      installmentNumber: i,
      dueAt: addCalendarMonthsUtc(disbursedAt, i),
      principalMinor: dueMinor,
      principalDueMinor: dueMinor,
    });
  }
  return schedule;
}

/**
 * Allocates a repayment amount across open installments in ascending installmentNumber order.
 * Throws if amountMinor is non-positive or exceeds total unpaid balance across installments.
 */
export function allocateRepayment(
  installments: ReadonlyArray<OpenInstallmentInput>,
  amountMinor: bigint,
): PlannedAllocation[] {
  if (amountMinor <= 0n) {
    throw new RangeError("amountMinor must be positive");
  }
  const sorted = [...installments].sort(
    (a, b) => a.installmentNumber - b.installmentNumber,
  );
  let remaining = amountMinor;
  const allocations: PlannedAllocation[] = [];
  for (const inst of sorted) {
    if (remaining === 0n) break;
    const dueMinor =
      (inst.principalMinor ?? inst.principalDueMinor ?? 0n) +
      (inst.feeMinor ?? 0n);
    const paidMinor = inst.paidMinor ?? inst.principalPaidMinor ?? 0n;
    const unpaid = dueMinor - paidMinor;
    if (unpaid <= 0n) continue;
    const applied = remaining < unpaid ? remaining : unpaid;
    const newPaidMinor = paidMinor + applied;
    allocations.push({
      installmentId: inst.id,
      installmentNumber: inst.installmentNumber,
      amountMinor: applied,
      newPaidMinor,
      fullyPaid: newPaidMinor === dueMinor,
    });
    remaining -= applied;
  }
  if (remaining > 0n) {
    throw new RangeError(
      "Repayment amount exceeds remaining unpaid installment balance",
    );
  }
  return allocations;
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== undefined)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, canonicalize(v)]),
    );
  }
  return value;
}

export function canonicalWebhookJson(payload: unknown): string {
  return JSON.stringify(canonicalize(payload));
}

export function signWebhookPayload(secret: string, payload: unknown): string {
  return `sha256=${createHmac("sha256", secret).update(canonicalWebhookJson(payload)).digest("hex")}`;
}

export function verifyWebhookSignature(
  secret: string | undefined,
  payload: unknown,
  signatureHeader: string | undefined,
): boolean {
  if (!secret || secret.length < 16 || !signatureHeader) return false;
  const expected = Buffer.from(signWebhookPayload(secret, payload), "utf8");
  const provided = Buffer.from(signatureHeader.trim(), "utf8");
  if (expected.length !== provided.length) return false;
  return timingSafeEqual(expected, provided);
}

export interface ClaimSettlementSplit {
  debtPayoffMinor: bigint;
  farmerRemainderMinor: bigint;
  totalSettledMinor: bigint;
}

/**
 * Computes deterministic debt-first claim settlement allocation:
 * existing eligible debt on the insured animal is satisfied first (`min(approvedAmountMinor, currentDebtMinor)`),
 * and the exact non-negative remainder is allocated to the farmer (`approvedAmountMinor - debtPayoffMinor`).
 */
export function allocateClaimSettlement(
  approvedAmountMinor: bigint,
  currentDebtMinor: bigint,
): ClaimSettlementSplit {
  if (approvedAmountMinor <= 0n) {
    throw new RangeError("approvedAmountMinor must be positive");
  }
  if (currentDebtMinor < 0n) {
    throw new RangeError("currentDebtMinor cannot be negative");
  }
  const debtPayoffMinor =
    approvedAmountMinor < currentDebtMinor
      ? approvedAmountMinor
      : currentDebtMinor;
  const farmerRemainderMinor = approvedAmountMinor - debtPayoffMinor;
  return {
    debtPayoffMinor,
    farmerRemainderMinor,
    totalSettledMinor: approvedAmountMinor,
  };
}
