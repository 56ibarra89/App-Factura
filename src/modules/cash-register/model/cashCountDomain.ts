import type { CashDenominationCount } from "./cash-register.types";

export const CASH_DENOMINATIONS = [
  1000, 500, 200, 100, 50, 20, 10, 5, 1, 0.5,
] as const;

export function calculateDenominationTotal(
  entries: CashDenominationCount[],
): number {
  const cents = entries.reduce(
    (total, entry) =>
      total + Math.round(entry.denomination * 100) * entry.quantity,
    0,
  );
  return cents / 100;
}

export function createEmptyDenominationBreakdown(): CashDenominationCount[] {
  return CASH_DENOMINATIONS.map((denomination) => ({
    denomination,
    quantity: 0,
  }));
}
