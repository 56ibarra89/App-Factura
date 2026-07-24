import { createContext, useContext } from "react";
import type { Shift, ShiftSales } from "../types/shift.types";

export interface CajaContextValue {
  currentShift: Shift | null;
  abrirCaja(amount: number, registerName?: string): Promise<void>;
  cerrarCaja(finalAmount: number, notes?: string): Promise<void>;
  calculateCurrentShiftSales(): ShiftSales;
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
