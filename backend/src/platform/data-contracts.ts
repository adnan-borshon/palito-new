export const MAX_MINOR_UNITS = 9223372036854775807n;

export function parseMinorUnits(value: unknown): bigint {
  if (typeof value !== 'string' || !/^(0|[1-9]\d*)$/.test(value) || value.length > 19) throw new Error('Invalid minor units');
  const amount = BigInt(value);
  if (amount > MAX_MINOR_UNITS) throw new Error('Minor units exceed storage range');
  return amount;
}

export function wholeBdtToMinor(value: number): bigint {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('Expected safe whole BDT');
  return parseMinorUnits((BigInt(value) * 100n).toString());
}

export function moneyJson(amount: bigint) {
  return { currency: 'BDT' as const, amountMinor: parseMinorUnits(amount.toString()).toString() };
}

export function dateOnly(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Expected date-only value');
  const result = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(result.valueOf()) || result.toISOString().slice(0, 10) !== value || value.startsWith('0000')) throw new Error('Invalid calendar date');
  return result;
}
