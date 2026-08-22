import { createContext, useContext } from "react";
import type {
  CloseShiftData,
  Shift,
  ShiftSales,
} from "./cash-register.types";
import type { CashExpense } from "./cash-expense.types";

export interface CajaContextValue {
  currentShift: Shift | null;
  currentShiftExpenses: CashExpense[];
  abrirCaja(amount: number, registerName?: string): Promise<void>;
  cerrarCaja(data: CloseShiftData): Promise<Shift>;
  calculateCurrentShiftSales(): ShiftSales;
  calculateCurrentShiftExpenses(): number;
  refreshCurrentShiftExpenses(): Promise<void>;
}

export const CajaContext = createContext<CajaContextValue | undefined>(
  undefined,
);

export function useCaja(): CajaContextValue {
  const context = useContext(CajaContext);
  if (!context) {
    throw new Error("useCaja debe usarse dentro de <CajaProvider>");
  }
  return context;
}
