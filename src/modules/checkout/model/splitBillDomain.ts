import type { OrderItem } from "../../orders";
import type {
  SplitBillAccount,
  SplitBillAccountTotal,
} from "./splitBill.types";

export function createSplitBillAccounts(count = 2): SplitBillAccount[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `split-account-${index + 1}`,
    name: `Persona ${index + 1}`,
    items: [],
  }));
}

export function calculateOrderItemAmount(item: OrderItem): number {
  const giftQuantity = Math.min(
    item.quantity,
    Math.max(0, item.giftQuantity ?? 0),
  );
  return item.price * Math.max(0, item.quantity - giftQuantity);
}

function allocateMoney(total: number, weights: number[]): number[] {
  if (weights.length === 0) return [];

  const totalCents = Math.max(0, Math.round(total * 100));
  const normalizedWeights = weights.map((weight) => Math.max(0, weight));
  const totalWeight = normalizedWeights.reduce((sum, weight) => sum + weight, 0);
  const effectiveWeights = totalWeight > 0
    ? normalizedWeights
    : normalizedWeights.map(() => 1);
  const effectiveTotalWeight = effectiveWeights.reduce(
    (sum, weight) => sum + weight,
    0,
  );

  const exactShares = effectiveWeights.map(
    (weight) => (totalCents * weight) / effectiveTotalWeight,
  );
  const allocatedCents = exactShares.map(Math.floor);
  let pendingCents = totalCents - allocatedCents.reduce((sum, value) => sum + value, 0);

  const remainderOrder = exactShares
    .map((share, index) => ({ index, remainder: share - Math.floor(share) }))
    .sort((left, right) => right.remainder - left.remainder || left.index - right.index);

  for (let index = 0; index < remainderOrder.length && pendingCents > 0; index += 1) {
    allocatedCents[remainderOrder[index].index] += 1;
    pendingCents -= 1;
  }

  return allocatedCents.map((amount) => amount / 100);
}

export function calculateItemSplitTotals(
  accounts: SplitBillAccount[],
  unassignedItems: OrderItem[],
  orderTotal: number,
): { accounts: SplitBillAccountTotal[]; unassignedTotal: number } {
  const accountWeights = accounts.map((account) =>
    account.items.reduce(
      (sum, item) => sum + calculateOrderItemAmount(item),
      0,
    ),
  );
  const unassignedWeight = unassignedItems.reduce(
    (sum, item) => sum + calculateOrderItemAmount(item),
    0,
  );
  const allocations = allocateMoney(orderTotal, [
    ...accountWeights,
    unassignedWeight,
  ]);

  return {
    accounts: accounts.map((account, index) => ({
      ...account,
      total: allocations[index] ?? 0,
    })),
    unassignedTotal: allocations[accounts.length] ?? 0,
  };
}

export function splitTotalEqually(total: number, peopleCount: number) {
  const safePeopleCount = Math.max(1, Math.trunc(peopleCount));
  const amounts = allocateMoney(
    total,
    Array.from({ length: safePeopleCount }, () => 1),
  );

  return amounts.map((amount, index) => ({
    id: `equal-account-${index + 1}`,
    name: `Persona ${index + 1}`,
    amount,
  }));
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
