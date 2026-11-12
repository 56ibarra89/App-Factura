import {
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";
import type {
  CloseShiftData,
  Shift,
  ShiftSales,
} from "./cash-register.types";
import type { CashExpense } from "./cash-expense.types";
import {
  shiftRepository as defaultShiftRepository,
  type IShiftRepository,
} from "../api/shiftRepository";
import {
  cashExpenseGateway as defaultExpenseGateway,
  type CashExpenseGateway,
} from "../api/cashExpenseGateway";
import { useOrderQueries } from "../../orders";
import { useAuth } from "../../auth";
import { calculateShiftSales } from "./shiftDomain";
import { CajaContext } from "./CajaContext";

const SHIFT_SYNC_POLL_INTERVAL_MS = 15_000;

interface CajaProviderProps {
  children: ReactNode;
  repository?: IShiftRepository;
  expenseGateway?: CashExpenseGateway;
  pollIntervalMs?: number;
}

export const CajaProvider = ({
  children,
  repository = defaultShiftRepository,
  expenseGateway = defaultExpenseGateway,
  pollIntervalMs = SHIFT_SYNC_POLL_INTERVAL_MS,
}: CajaProviderProps) => {
  const { username, role, hasPermission } = useAuth();
  const { orders } = useOrderQueries();

  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [currentShiftExpenses, setCurrentShiftExpenses] = useState<
    CashExpense[]
  >([]);
  const isFetchingShiftRef = useRef(false);
  const expenseRequestRef = useRef(0);
  const sessionGenerationRef = useRef(0);

  const canReadCashStatus = Boolean(username && hasPermission("cash.status"));
  const canReadExpenses = Boolean(
    username &&
      role &&
      ["admin", "cajero_principal", "cajero", "despachador"].includes(role) &&
      hasPermission("cash.expenses"),
  );

  const invalidateInFlightShiftRequests = useCallback(() => {
    sessionGenerationRef.current += 1;
    expenseRequestRef.current += 1;
  }, []);

  const fetchShiftExpenses = useCallback(
    async (shiftId?: string) => {
      const request = ++expenseRequestRef.current;
      if (!shiftId || !canReadExpenses) {
        setCurrentShiftExpenses([]);
        return;
      }
      try {
        const exps = await expenseGateway.listExpensesByShift(shiftId);
        if (request === expenseRequestRef.current) setCurrentShiftExpenses(exps);
      } catch (err) {
        console.error("[CajaContext] Error al cargar gastos del turno:", err);
      }
    },
    [expenseGateway, canReadExpenses],
  );

  const refreshCurrentShiftExpenses = useCallback(
    () => fetchShiftExpenses(currentShift?.id),
    [currentShift?.id, fetchShiftExpenses],
  );

  const syncActiveShift = useCallback(async (): Promise<Shift | null> => {
    if (!canReadCashStatus) {
      return null;
    }
    if (isFetchingShiftRef.current) {
      return null;
    }
    isFetchingShiftRef.current = true;
    const generation = sessionGenerationRef.current;
    try {
      const shift = await repository.getActiveShift();
      if (generation !== sessionGenerationRef.current) return null;
      setCurrentShift((prevShift) => {
        const changed =
          prevShift?.id !== shift?.id || prevShift?.status !== shift?.status;
        if (changed) {
          console.log(
            "[CajaContext] Estado de caja global sincronizado:",
            shift ? `ABIERTA por ${shift.cashierName}` : "CERRADA",
          );
        }
        return shift;
      });
      void fetchShiftExpenses(shift?.id);
      return shift;
    } catch (err) {
      console.error(
        "[CajaContext] Error al recuperar turno activo global:",
        err,
      );
      return null;
    } finally {
      isFetchingShiftRef.current = false;
    }
  }, [canReadCashStatus, repository, fetchShiftExpenses]);

  useEffect(() => {
    if (!username) {
      expenseRequestRef.current++;
      console.log("[CajaContext] Usuario deslogueado. Limpiando estado.");
      setCurrentShift(null);
      setCurrentShiftExpenses([]);
    }
  }, [username]);

  useEffect(() => {
    if (!canReadCashStatus) {
      return;
    }

    let active = true;

    const triggerSync = () => {
      if (!active) return;
      void syncActiveShift();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        triggerSync();
      }
    };

    triggerSync();

    const intervalId = window.setInterval(triggerSync, pollIntervalMs);
    window.addEventListener("focus", triggerSync);
    window.addEventListener("appfactura:shift-changed", triggerSync);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      invalidateInFlightShiftRequests();
      window.clearInterval(intervalId);
      window.removeEventListener("focus", triggerSync);
      window.removeEventListener("appfactura:shift-changed", triggerSync);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    username,
    canReadCashStatus,
    pollIntervalMs,
    syncActiveShift,
    invalidateInFlightShiftRequests,
  ]);

  useEffect(() => {
    if (!currentShift?.id || !canReadExpenses) {
      expenseRequestRef.current++;
      setCurrentShiftExpenses([]);
    }
  }, [currentShift?.id, canReadExpenses]);

  const calculateCurrentShiftSales = useCallback((): ShiftSales => {
    if (!currentShift) return { cash: 0, card: 0, app: 0, total: 0 };

    const shiftOrders = orders.filter(
      (o) =>
        o.status === "paid" &&
        new Date(o.paidAt ?? o.timestamp).getTime() >=
          new Date(currentShift.startTime).getTime(),
    );

    return calculateShiftSales(shiftOrders);
  }, [currentShift, orders]);

  const calculateCurrentShiftExpenses = useCallback((): number => {
    return currentShiftExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [currentShiftExpenses]);

  const abrirCaja = useCallback(
    async (amount: number, registerName?: string) => {
      try {
        const newShift = await repository.openShift({
          cashierName: username || "Sistema",
          openingAmount: amount,
          cashRegisterName: registerName,
        });
        setCurrentShift(newShift);
        setCurrentShiftExpenses([]);
        window.dispatchEvent(new CustomEvent("appfactura:shift-changed"));
      } catch (error) {
        console.error("Error al abrir caja en backend:", error);
        void syncActiveShift();
        throw error;
      }
    },
    [username, repository, syncActiveShift],
  );

  const cerrarCaja = useCallback(
    async (data: CloseShiftData): Promise<Shift> => {
      if (!currentShift) {
        throw new Error("No hay un turno abierto para cerrar.");
      }

      try {
        const closedShift = await repository.closeShift(currentShift.id, data);

        setCurrentShift(null);
        setCurrentShiftExpenses([]);
        window.dispatchEvent(new CustomEvent("appfactura:shift-changed"));
        return closedShift;
      } catch (error) {
        console.error("Error closing shift:", error);
        void syncActiveShift();
        throw error;
      }
    },
    [currentShift, repository, syncActiveShift],
  );

  const contextValue = useMemo(
    () => ({
      currentShift,
      currentShiftExpenses,
      abrirCaja,
      cerrarCaja,
      calculateCurrentShiftSales,
      calculateCurrentShiftExpenses,
      refreshCurrentShiftExpenses,
    }),
    [
      currentShift,
      currentShiftExpenses,
      abrirCaja,
      cerrarCaja,
      calculateCurrentShiftSales,
      calculateCurrentShiftExpenses,
      refreshCurrentShiftExpenses,
    ],
  );

  return (
    <CajaContext.Provider value={contextValue}>
      {children}
    </CajaContext.Provider>
  );
};
