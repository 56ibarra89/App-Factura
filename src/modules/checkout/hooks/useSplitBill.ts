import { useCallback, useMemo, useRef, useState } from "react";
import type { OrderItem } from "../../orders";
import {
  calculateItemSplitTotals,
  createSplitBillAccounts,
  roundMoney,
  splitTotalEqually,
} from "../model/splitBillDomain";
import type {
  SplitBillAccount,
  SplitBillMode,
} from "../model/splitBill.types";

interface UseSplitBillOptions {
  items: OrderItem[];
  totalAmount: number;
}

export function useSplitBill({ items, totalAmount }: UseSplitBillOptions) {
  const nextAccountNumber = useRef(3);
  const [mode, setMode] = useState<SplitBillMode>("items");
  const [equalPeopleCount, setEqualPeopleCount] = useState(2);
  const [accounts, setAccounts] = useState<SplitBillAccount[]>(() =>
    createSplitBillAccounts(),
  );
  const [activeAccountId, setActiveAccountId] = useState(
    "split-account-1",
  );
  const [unassignedItems, setUnassignedItems] = useState<OrderItem[]>(() =>
    items.map((item) => ({ ...item })),
  );

  const itemSplit = useMemo(
    () => calculateItemSplitTotals(accounts, unassignedItems, totalAmount),
    [accounts, totalAmount, unassignedItems],
  );
  const equalAccounts = useMemo(
    () => splitTotalEqually(totalAmount, equalPeopleCount),
    [equalPeopleCount, totalAmount],
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
        setUnassignedItems((current) => [...current, ...account.items]);
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

      const qtyToMove = assignAll ? targetItem.quantity : 1;
      const remainingQty = targetItem.quantity - qtyToMove;

      setUnassignedItems((current) => {
        if (remainingQty <= 0) {
          return current.filter((_, index) => index !== itemIndex);
        }
        return current.map((it, index) =>
          index === itemIndex ? { ...it, quantity: remainingQty } : it,
        );
      });

      setAccounts((current) =>
        current.map((account) => {
          if (account.id !== accountId) return account;

          const existingIndex = account.items.findIndex(
            (it) =>
              it.name === targetItem.name &&
              it.price === targetItem.price &&
              it.size === targetItem.size &&
              JSON.stringify(it.extras || []) ===
                JSON.stringify(targetItem.extras || []),
          );

          if (existingIndex >= 0) {
            const updatedItems = [...account.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + qtyToMove,
            };
            return { ...account, items: updatedItems };
          }

          const newItem: OrderItem = { ...targetItem, quantity: qtyToMove };
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

      const qtyToMove = unassignAll ? targetItem.quantity : 1;
      const remainingQty = targetItem.quantity - qtyToMove;

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
              index === itemIndex ? { ...it, quantity: remainingQty } : it,
            ),
          };
        }),
      );

      setUnassignedItems((current) => {
        const existingIndex = current.findIndex(
          (it) =>
            it.name === targetItem.name &&
            it.price === targetItem.price &&
            it.size === targetItem.size &&
            JSON.stringify(it.extras || []) ===
              JSON.stringify(targetItem.extras || []),
        );

        if (existingIndex >= 0) {
          const updated = [...current];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + qtyToMove,
          };
          return updated;
        }

        return [...current, { ...targetItem, quantity: qtyToMove }];
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

  return {
    mode,
    setMode,
    equalPeopleCount,
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
  };
}
