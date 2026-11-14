/** Platform-independent validation. All monetary values are integer BDT amounts. */
export const isBangladeshPhone = (value: string): boolean =>
  /^(?:\+?88)?01[3-9]\d{8}$/.test(value.replace(/[\s()-]/g, ''));

export const normalizePhone = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  return digits.startsWith('88') ? `+${digits}` : `+88${digits}`;
};

export const isPositiveMoney = (value: number): boolean =>
  Number.isSafeInteger(value) && value > 0;

export const isNonNegativeMoney = (value: number): boolean =>
  Number.isSafeInteger(value) && value >= 0;

export const hasText = (value: unknown, min = 1, max = 1000): value is string =>
  typeof value === 'string' && value.trim().length >= min && value.trim().length <= max;

export const isValidDate = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)?$/.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === value.slice(0, 10);
};

/** UC-003: a loan may never exceed 70% of verified collateral value. */
export const maximumLoanAmount = (verifiedValue: number, ratio = 0.7): number => {
  if (!isNonNegativeMoney(verifiedValue) || !Number.isFinite(ratio) || ratio < 0) return 0;
  // Avoid floating-point rounding past the cap when dealing with large integers.
  const cap = Math.floor(verifiedValue / 10) * 7 + Math.floor((verifiedValue % 10) * 7 / 10);
  return ratio >= 0.7 ? cap : Math.min(cap, Math.floor(verifiedValue * ratio));
};

export const uniqueIds = (ids: readonly string[]): boolean =>
  new Set(ids).size === ids.length;

export const isoAfter = (iso: string, minutes: number): string =>
  new Date(Date.parse(iso) + minutes * 60_000).toISOString();

export const elapsedHours = (start: string, end: string): number =>
  (Date.parse(end) - Date.parse(start)) / 3_600_000;
