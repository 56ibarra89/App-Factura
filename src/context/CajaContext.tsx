/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { Shift, ShiftSales } from "../types/shift.types";
import { IShiftRepository } from "../types/repositories";
import { shiftRepository as defaultShiftRepository } from "../repositories/ShiftRepository";
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

interface CajaProviderProps {
  children: ReactNode;
  /** DIP: permite inyectar un repositorio alternativo (e.g. mock para tests) */
  repository?: IShiftRepository;
}

export const CajaProvider = ({
  children,
  repository = defaultShiftRepository,
}: CajaProviderProps) => {
  const { username } = useAuth();
  const { orders } = useOrderContext();

  const [currentShift, setCurrentShift] = useState<Shift | null>(() => {
    const saved = localStorage.getItem("currentShift");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log("[CajaContext] Restaurando turno desde localStorage:", parsed);

        const startTime = new Date(parsed.startTime);
        if (isNaN(startTime.getTime())) {
          console.error("[CajaContext] Fecha de inicio inválida. Limpiando localStorage.");
          localStorage.removeItem("currentShift");
          return null;
        }

        return {
          ...parsed,
          startTime,
          endTime: parsed.endTime ? new Date(parsed.endTime) : undefined,
        };
      } catch (e) {
        console.error("[CajaContext] Error al parsear shift guardado:", e);
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (currentShift) {
      console.log("[CajaContext] Guardando turno en localStorage:", currentShift.id);
      localStorage.setItem("currentShift", JSON.stringify(currentShift));
    } else {
      console.log("[CajaContext] Limpiando turno de localStorage");
      localStorage.removeItem("currentShift");
    }
  }, [currentShift]);

  const calculateCurrentShiftSales = useCallback((): ShiftSales => {
    if (!currentShift) return { cash: 0, card: 0, app: 0, total: 0 };

    console.log(
      "[CajaContext] Calculando ventas para el turno actual de:",
      currentShift.cashierName
    );
    const shiftOrders = orders.filter(
      (o) =>
        o.status === "paid" &&
        o.cashierName === currentShift.cashierName &&
        new Date(o.timestamp).getTime() >= new Date(currentShift.startTime).getTime()
    );

    return calculateShiftSales(shiftOrders);
  }, [currentShift, orders]);

  const abrirCaja = useCallback(
    (amount: number) => {
      console.log("[CajaContext] Intentando abrir caja con monto:", amount);
      const newShift: Shift = {
        id: `SHIFT-${Date.now()}`,
        cashierName: username || "Sistema",
        startTime: new Date(),
        openingAmount: amount,
        totalSales: { cash: 0, card: 0, app: 0, total: 0 },
        status: "open",
      };
      console.log("[CajaContext] Nuevo turno creado:", newShift);
      setCurrentShift(newShift);
    },
    [username]
  );

  const cerrarCaja = useCallback(
    async (finalAmount: number, notes?: string) => {
      if (!currentShift) return;

      try {
        const sales = calculateCurrentShiftSales();
        const closedShift: Shift = {
          ...currentShift,
          endTime: new Date(),
          closingAmount: finalAmount,
          totalSales: sales,
          status: "closed",
          notes,
        };

        await repository.save(closedShift);
        setCurrentShift(null);
      } catch (error) {
        console.error("Error closing shift:", error);
        throw error;
      }
    },
    [currentShift, calculateCurrentShiftSales, repository]
  );

  return (
    <CajaContext.Provider
      value={{ currentShift, abrirCaja, cerrarCaja, calculateCurrentShiftSales }}
    >
      {children}
    </CajaContext.Provider>
  );
};
