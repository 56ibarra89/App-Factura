/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Shift, ShiftSales } from "../types/shift.types";
import { saveShiftDB } from "../services/db";
import { useOrderContext } from "./OrderContext";
import { useAuth } from "./AuthContext";
import { calculateShiftSales } from "../utils/shiftUtils";

interface CajaContextType {
  currentShift: Shift | null;
  abrirCaja: (amount: number) => void;
  cerrarCaja: (finalAmount: number, notes?: string) => Promise<void>;
  calculateCurrentShiftSales: () => ShiftSales;
}

const CajaContext = createContext<CajaContextType | undefined>(undefined);

export const useCaja = () => {
  const context = useContext(CajaContext);
  if (!context) throw new Error("useCaja debe usarse dentro de <CajaProvider>");
  return context;
};

export const CajaProvider = ({ children }: { children: ReactNode }) => {
  const { username } = useAuth();
  const { orders } = useOrderContext();
  
  const [currentShift, setCurrentShift] = useState<Shift | null>(() => {
    const saved = localStorage.getItem("currentShift");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          startTime: new Date(parsed.startTime),
          endTime: parsed.endTime ? new Date(parsed.endTime) : undefined
        };
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (currentShift) {
      localStorage.setItem("currentShift", JSON.stringify(currentShift));
    } else {
      localStorage.removeItem("currentShift");
    }
  }, [currentShift]);

  const calculateCurrentShiftSales = useCallback((): ShiftSales => {
    if (!currentShift) return { cash: 0, card: 0, app: 0, total: 0 };

    // Solo órdenes 'delivered' (pagadas) del cajero actual desde que abrió turno
    const shiftOrders = orders.filter(o =>
      o.status === 'delivered' &&
      o.cashierName === currentShift.cashierName &&
      new Date(o.timestamp).getTime() >= new Date(currentShift.startTime).getTime()
    );

    return calculateShiftSales(shiftOrders);
  }, [currentShift, orders]);

  const abrirCaja = useCallback((amount: number) => {
    const newShift: Shift = {
      id: `SHIFT-${Date.now()}`,
      cashierName: username || "Sistema",
      startTime: new Date(),
      openingAmount: amount,
      totalSales: { cash: 0, card: 0, app: 0, total: 0 },
      status: 'open',
    };
    setCurrentShift(newShift);
  }, [username]);

  const cerrarCaja = useCallback(async (finalAmount: number, notes?: string) => {
    if (!currentShift) return;

    try {
      const sales = calculateCurrentShiftSales();
      const closedShift: Shift = {
        ...currentShift,
        endTime: new Date(),
        closingAmount: finalAmount,
        totalSales: sales,
        status: 'closed',
        notes
      };

      await saveShiftDB(closedShift);
      setCurrentShift(null);
    } catch (error) {
      console.error("Error closing shift:", error);
      throw error;
    }
  }, [currentShift, calculateCurrentShiftSales]);

  return (
    <CajaContext.Provider value={{ 
      currentShift, 
      abrirCaja, 
      cerrarCaja, 
      calculateCurrentShiftSales 
    }}>
      {children}
    </CajaContext.Provider>
  );
};
