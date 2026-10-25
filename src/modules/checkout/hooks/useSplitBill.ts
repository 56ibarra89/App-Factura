import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isSplitBillOrderItem, type OrderItem } from "../../orders";
import {
  calculateItemSplitTotals,
  createSplitBillAccounts,
  roundMoney,
  splitTotalEqually,
} from "../model/splitBillDomain";
import type {
  SplitBillAccount,
  SplitBillCheckoutSelection,
  SplitBillMode,
} from "../model/splitBill.types";

interface UseSplitBillOptions {
  items: OrderItem[];
  totalAmount: number;
}

function isSameSplitItem(a: OrderItem, b: OrderItem): boolean {
  if (a.id !== undefined && b.id !== undefined && a.id === b.id) return true;
  return (
    a.name === b.name &&
    a.price === b.price &&
    a.size === b.size &&
    JSON.stringify(a.extras || []) === JSON.stringify(b.extras || []) &&
    (a.note ?? "") === (b.note ?? "")
  );
}

function deriveUnassignedItems(
  sourceItems: readonly OrderItem[],
  accounts: readonly SplitBillAccount[],
): OrderItem[] {
  const remaining = sourceItems
    .filter((item) => !isSplitBillOrderItem(item))
    .map((item) => ({ ...item }));

  for (const assigned of accounts.flatMap((account) => account.items)) {
    let quantityToRemove = assigned.quantity;
    let giftsToRemove = assigned.giftQuantity ?? 0;
    for (let index = 0; index < remaining.length && quantityToRemove > 0; index += 1) {
      const candidate = remaining[index];
      if (!isSameSplitItem(candidate, assigned)) continue;
      const removedQuantity = Math.min(quantityToRemove, candidate.quantity);
      const removedGifts = Math.min(
        giftsToRemove,
        candidate.giftQuantity ?? 0,
        removedQuantity,
      );
      remaining[index] = normalizeSplitItemGift(
        candidate,
        candidate.quantity - removedQuantity,
        Math.max(0, (candidate.giftQuantity ?? 0) - removedGifts),
      );
      quantityToRemove -= removedQuantity;
      giftsToRemove -= removedGifts;
    }
  }

  return remaining.filter((item) => item.quantity > 0);
}

function normalizeSplitItemGift(
  item: OrderItem,
  quantity: number,
  giftQuantity: number,
): OrderItem {
  const safeGift = Math.min(quantity, Math.max(0, giftQuantity));
  const wasTwoForOne =
    item.giftReason === "happy-hour-2x1" || item.note === "2x1 Happy Hour";

  if (wasTwoForOne) {
    const validTwoForOneGift = Math.min(safeGift, Math.floor(quantity / 2));
    return {
      ...item,
      quantity,
      giftQuantity: validTwoForOneGift,
      giftReason: validTwoForOneGift > 0 ? "happy-hour-2x1" : undefined,
      note:
        validTwoForOneGift === 0 && item.note === "2x1 Happy Hour"
          ? undefined
          : item.note,
    };
  }

  return {
    ...item,
    quantity,
    giftQuantity: safeGift,
    giftReason: safeGift > 0 ? item.giftReason : undefined,
  };
}

function computeSplitStep(
  item: OrderItem,
  moveAll: boolean,
): { qtyToMove: number; giftToMove: number } {
  const totalQty = item.quantity;
  const totalGift = Math.min(totalQty, Math.max(0, item.giftQuantity ?? 0));

  if (moveAll || totalQty <= 1) {
    return { qtyToMove: totalQty, giftToMove: totalGift };
  }

  if (totalGift > 0 && totalQty <= 2 * totalGift) {
    const pairQty = Math.min(totalQty, 2);
    return { qtyToMove: pairQty, giftToMove: 1 };
  }

  return { qtyToMove: 1, giftToMove: 0 };
}

export function useSplitBill({ items, totalAmount }: UseSplitBillOptions) {
  const nextAccountNumber = useRef(3);
  const nextEqualAccountNumber = useRef(3);
  const [mode, setMode] = useState<SplitBillMode>("items");
  const [equalAccountIdentities, setEqualAccountIdentities] = useState(() => [
    { id: "equal-account-1", name: "Persona 1" },
    { id: "equal-account-2", name: "Persona 2" },
  ]);
  const [accounts, setAccounts] = useState<SplitBillAccount[]>(() =>
    createSplitBillAccounts(),
  );
  const [activeAccountId, setActiveAccountId] = useState(
    "split-account-1",
  );
  const [unassignedItems, setUnassignedItems] = useState<OrderItem[]>(() =>
    deriveUnassignedItems(items, []),
  );

  useEffect(() => {
    setUnassignedItems(deriveUnassignedItems(items, accounts));
  }, [accounts, items]);

  const itemSplit = useMemo(
    () => calculateItemSplitTotals(accounts, unassignedItems, totalAmount),
    [accounts, totalAmount, unassignedItems],
  );
  const equalAccounts = useMemo(
    () => {
      if (equalAccountIdentities.length === 0) return [];
      return splitTotalEqually(totalAmount, equalAccountIdentities.length).map(
        (account, index) => ({
          ...account,
          ...equalAccountIdentities[index],
        }),
      );
    },
    [equalAccountIdentities, totalAmount],
  );
  const customAssignedTotal = useMemo(
    () => roundMoney(
      accounts.reduce(
        (sum, account) => sum + (account.customAmount ?? 0),
        0,
      ),
    ),
    [accounts],
  );
  const customRemaining = roundMoney(totalAmount - customAssignedTotal);
  const isCustomSplitValid =
    Math.abs(customRemaining) < 0.01 &&
    accounts.every((account) => (account.customAmount ?? 0) > 0);

  const addAccount = useCallback(() => {
    const accountNumber = nextAccountNumber.current;
    nextAccountNumber.current += 1;
    const account: SplitBillAccount = {
      id: `split-account-${accountNumber}`,
      name: `Persona ${accountNumber}`,
      items: [],
    };

    setAccounts((current) => [...current, account]);
    setActiveAccountId(account.id);
  }, []);

  const removeAccount = useCallback(
    (accountId: string) => {
      if (accounts.length <= 1) return;

      const account = accounts.find((candidate) => candidate.id === accountId);
      const remainingAccounts = accounts.filter(
        (candidate) => candidate.id !== accountId,
      );

      setAccounts(remainingAccounts);
      if (account?.items.length) {
        setUnassignedItems((current) => {
          const next = [...current];
          for (const returnedItem of account.items) {
            const existingIdx = next.findIndex((it) =>
              isSameSplitItem(it, returnedItem),
            );
            if (existingIdx >= 0) {
              const prev = next[existingIdx];
              next[existingIdx] = normalizeSplitItemGift(
                prev,
                prev.quantity + returnedItem.quantity,
                (prev.giftQuantity ?? 0) + (returnedItem.giftQuantity ?? 0),
              );
            } else {
              next.push({ ...returnedItem });
            }
          }
          return next;
        });
      }
      if (activeAccountId === accountId) {
        setActiveAccountId(remainingAccounts[0]?.id ?? "");
      }
    },
    [accounts, activeAccountId],
  );

  const assignItem = useCallback(
    (itemIndex: number, accountId: string, assignAll = false) => {
      const targetItem = unassignedItems[itemIndex];
      if (!targetItem) return;

      const { qtyToMove, giftToMove } = computeSplitStep(targetItem, assignAll);
      const remainingQty = targetItem.quantity - qtyToMove;
      const remainingGift = Math.max(
        0,
        (targetItem.giftQuantity ?? 0) - giftToMove,
      );

      setUnassignedItems((current) => {
        if (remainingQty <= 0) {
          return current.filter((_, index) => index !== itemIndex);
        }
        return current.map((it, index) =>
          index === itemIndex
            ? normalizeSplitItemGift(it, remainingQty, remainingGift)
            : it,
        );
      });

      setAccounts((current) =>
        current.map((account) => {
          if (account.id !== accountId) return account;

          const existingIndex = account.items.findIndex((it) =>
            isSameSplitItem(it, targetItem),
          );

          if (existingIndex >= 0) {
            const updatedItems = [...account.items];
            const prev = updatedItems[existingIndex];
            updatedItems[existingIndex] = normalizeSplitItemGift(
              targetItem,
              prev.quantity + qtyToMove,
              (prev.giftQuantity ?? 0) + giftToMove,
            );
            return { ...account, items: updatedItems };
          }

          const newItem = normalizeSplitItemGift(
            targetItem,
            qtyToMove,
            giftToMove,
          );
          return { ...account, items: [...account.items, newItem] };
        }),
      );
    },
    [unassignedItems],
  );

  const unassignItem = useCallback(
    (accountId: string, itemIndex: number, unassignAll = false) => {
      const account = accounts.find((candidate) => candidate.id === accountId);
      const targetItem = account?.items[itemIndex];
      if (!account || !targetItem) return;

      const { qtyToMove, giftToMove } = computeSplitStep(
        targetItem,
        unassignAll,
      );
      const remainingQty = targetItem.quantity - qtyToMove;
      const remainingGift = Math.max(
        0,
        (targetItem.giftQuantity ?? 0) - giftToMove,
      );

      setAccounts((current) =>
        current.map((candidate) => {
          if (candidate.id !== accountId) return candidate;

          if (remainingQty <= 0) {
            return {
              ...candidate,
              items: candidate.items.filter(
                (_, index) => index !== itemIndex,
              ),
            };
          }
          return {
            ...candidate,
            items: candidate.items.map((it, index) =>
              index === itemIndex
                ? normalizeSplitItemGift(it, remainingQty, remainingGift)
                : it,
            ),
          };
        }),
      );

      setUnassignedItems((current) => {
        const existingIndex = current.findIndex((it) =>
          isSameSplitItem(it, targetItem),
        );

        if (existingIndex >= 0) {
          const updated = [...current];
          const prev = updated[existingIndex];
          updated[existingIndex] = normalizeSplitItemGift(
            targetItem,
            prev.quantity + qtyToMove,
            (prev.giftQuantity ?? 0) + giftToMove,
          );
          return updated;
        }

        return [
          ...current,
          normalizeSplitItemGift(targetItem, qtyToMove, giftToMove),
        ];
      });
    },
    [accounts],
  );

  const setCustomAmount = useCallback((accountId: string, amount: number) => {
    const safeAmount = Number.isFinite(amount) ? Math.max(0, amount) : 0;
    setAccounts((current) =>
      current.map((account) =>
        account.id === accountId
          ? { ...account, customAmount: roundMoney(safeAmount) }
          : account,
      ),
    );
  }, []);

  const setEqualPeopleCount = useCallback((count: number) => {
    const safeCount = Math.min(100, Math.max(1, Math.trunc(count)));
    setEqualAccountIdentities((current) => {
      if (safeCount <= current.length) return current.slice(0, safeCount);
      const additions = Array.from(
        { length: safeCount - current.length },
        () => {
          const accountNumber = nextEqualAccountNumber.current;
          nextEqualAccountNumber.current += 1;
          return {
            id: `equal-account-${accountNumber}`,
            name: `Persona ${accountNumber}`,
          };
        },
      );
      return [...current, ...additions];
    });
  }, []);

  const completeCheckout = useCallback(
    (selection: SplitBillCheckoutSelection) => {
      if (selection.mode === "equal") {
        setEqualAccountIdentities((current) =>
          current.filter((account) => account.id !== selection.accountId),
        );
        return;
      }

      const remainingAccounts = accounts.filter(
        (account) => account.id !== selection.accountId,
      );
      setAccounts(remainingAccounts);
      setActiveAccountId((active) =>
        active === selection.accountId
          ? (remainingAccounts[0]?.id ?? "")
          : active,
      );
    },
    [accounts],
  );

  return {
    mode,
    setMode,
    equalPeopleCount: equalAccountIdentities.length,
    setEqualPeopleCount,
    accounts,
    itemAccountTotals: itemSplit.accounts,
    unassignedItems,
    unassignedTotal: itemSplit.unassignedTotal,
    activeAccountId,
    setActiveAccountId,
    equalAccounts,
    customAssignedTotal,
    customRemaining,
    isCustomSplitValid,
    addAccount,
    removeAccount,
    assignItem,
    unassignItem,
    setCustomAmount,
    completeCheckout,
  };
}
