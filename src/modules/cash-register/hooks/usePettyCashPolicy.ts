import { useState, useEffect, useCallback } from "react";
import {
  pettyCashPolicyGateway,
  type PettyCashPolicyGateway,
} from "../api/pettyCashPolicyGateway";
import {
  DEFAULT_PETTY_CASH_POLICY,
  CASH_EXPENSE_CATEGORY_LABELS,
  type PettyCashPolicy,
  type CashExpenseCategory,
  type CategoryPolicyConfig,
} from "../model/cash-expense.types";

export interface ExpenseValidationResult {
  allowed: boolean;
  needsPin: boolean;
  pinReason?: string;
  error?: string;
}

export function usePettyCashPolicy(
  gateway: PettyCashPolicyGateway = pettyCashPolicyGateway,
) {
  const [policy, setPolicy] = useState<PettyCashPolicy>(DEFAULT_PETTY_CASH_POLICY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicy = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loaded = await gateway.load();
      setPolicy(loaded);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Error al cargar las políticas de caja chica.";
      setError(errorMsg);
      setPolicy(DEFAULT_PETTY_CASH_POLICY);
    } finally {
      setLoading(false);
    }
  }, [gateway]);

  useEffect(() => {
    void fetchPolicy();
  }, [fetchPolicy]);

  const savePolicy = useCallback(
    async (newPolicy: PettyCashPolicy): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        await gateway.save(newPolicy);
        setPolicy(newPolicy);
        return true;
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Error al guardar las políticas de caja chica.";
        setError(errorMsg);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [gateway],
  );

  const updateCategoryPolicy = useCallback(
    (category: CashExpenseCategory, partial: Partial<CategoryPolicyConfig>) => {
      setPolicy((prev) => ({
        ...prev,
        categoryPolicies: {
          ...prev.categoryPolicies,
          [category]: {
            ...prev.categoryPolicies[category],
            ...partial,
          },
        },
      }));
    },
    [],
  );

  const updatePolicyField = useCallback(
    <K extends keyof PettyCashPolicy>(field: K, value: PettyCashPolicy[K]) => {
      setPolicy((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  const isVoucherRequired = useCallback(
    (amount: number): boolean => {
      if (policy.requireVoucherAlways) return true;
      if (policy.requireVoucherOver > 0 && amount >= policy.requireVoucherOver) {
        return true;
      }
      return false;
    },
    [policy.requireVoucherAlways, policy.requireVoucherOver],
  );

  const validateExpense = useCallback(
    (
      amount: number,
      category: CashExpenseCategory,
      currentShiftTotal?: number,
    ): ExpenseValidationResult => {
      const catConfig = policy.categoryPolicies[category];

      // 1. Verificar si la categoría está habilitada
      if (catConfig && !catConfig.enabled) {
        const catName = CASH_EXPENSE_CATEGORY_LABELS[category]?.label || category;
        return {
          allowed: false,
          needsPin: false,
          error: `La categoría "${catName}" se encuentra deshabilitada según las políticas de caja chica.`,
        };
      }

      // 2. Verificar límite acumulado por turno
      if (
        currentShiftTotal != null &&
        policy.maxShiftTotal > 0 &&
        currentShiftTotal + amount > policy.maxShiftTotal
      ) {
        return {
          allowed: true,
          needsPin: true,
          pinReason: `El gasto acumulado del turno superará el límite permitido de C$ ${policy.maxShiftTotal.toFixed(
            2,
          )}. Requiere autorización con PIN de Administrador.`,
        };
      }

      // 3. Verificar si la categoría exige PIN obligatorio
      if (catConfig?.requiresPin) {
        const catName = CASH_EXPENSE_CATEGORY_LABELS[category]?.label || category;
        return {
          allowed: true,
          needsPin: true,
          pinReason: `Los egresos de "${catName}" requieren autorización obligatoria con PIN de Administrador.`,
        };
      }

      // 4. Verificar si el monto excede el umbral libre
      if (policy.maxAmountWithoutAuth > 0 && amount > policy.maxAmountWithoutAuth) {
        return {
          allowed: true,
          needsPin: true,
          pinReason: `El monto de C$ ${amount.toFixed(
            2,
          )} excede el límite máximo sin autorización (C$ ${policy.maxAmountWithoutAuth.toFixed(
            2,
          )}). Requiere PIN de Administrador.`,
        };
      }

      return {
        allowed: true,
        needsPin: false,
      };
    },
    [policy],
  );

  return {
    policy,
    setPolicy,
    loading,
    saving,
    error,
    fetchPolicy,
    savePolicy,
    updateCategoryPolicy,
    updatePolicyField,
    isVoucherRequired,
    validateExpense,
  };
}
