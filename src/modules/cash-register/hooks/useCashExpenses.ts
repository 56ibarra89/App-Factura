import { useState, useCallback, useEffect, useMemo } from "react";
import {
  cashExpenseGateway,
  type CashExpenseGateway,
} from "../api/cashExpenseGateway";
import type {
  CashExpense,
  CreateCashExpenseDto,
  ListCashExpensesQuery,
} from "../model/cash-expense.types";

export function useCashExpenses(
  initialFilters?: ListCashExpensesQuery,
  gateway: CashExpenseGateway = cashExpenseGateway,
) {
  const [expenses, setExpenses] = useState<CashExpense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(
    async (filters?: ListCashExpensesQuery) => {
      setLoading(true);
      setError(null);
      try {
        const data = await gateway.listExpenses(filters || initialFilters);
        setExpenses(data);
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los gastos de caja.";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [gateway, initialFilters],
  );

  useEffect(() => {
    void fetchExpenses();
  }, [fetchExpenses]);

  const createExpense = useCallback(
    async (data: CreateCashExpenseDto): Promise<CashExpense> => {
      setLoading(true);
      setError(null);
      try {
        const created = await gateway.createExpense(data);
        setExpenses((prev) => [created, ...prev]);
        return created;
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "No se pudo registrar el gasto de caja.";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [gateway],
  );

  const totalAmount = useMemo(
    () => expenses.reduce((acc, curr) => acc + curr.amount, 0),
    [expenses],
  );

  return {
    expenses,
    loading,
    error,
    totalAmount,
    fetchExpenses,
    createExpense,
  };
}
