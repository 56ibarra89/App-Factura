import {
  useState,
  useEffect,
  ReactNode,
  useCallback,
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

interface CajaProviderProps {
  children: ReactNode;
  repository?: IShiftRepository;
  expenseGateway?: CashExpenseGateway;
}

export const CajaProvider = ({
  children,
  repository = defaultShiftRepository,
  expenseGateway = defaultExpenseGateway,
}: CajaProviderProps) => {
  const { username, role } = useAuth();
  const { orders } = useOrderQueries();

  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [currentShiftExpenses, setCurrentShiftExpenses] = useState<
    CashExpense[]
  >([]);

  const refreshCurrentShiftExpenses = useCallback(async () => {
    if (!currentShift?.id) {
      setCurrentShiftExpenses([]);
      return;
    }
    try {
      const exps = await expenseGateway.listExpensesByShift(currentShift.id);
      setCurrentShiftExpenses(exps);
    } catch (err) {
      console.error("[CajaContext] Error al cargar gastos del turno:", err);
    }
  }, [currentShift?.id, expenseGateway]);

  useEffect(() => {
    if (currentShift) {
      if (!username || (role !== "admin" && currentShift.cashierName !== username)) {
        console.log(
          "[CajaContext] Usuario deslogueado o turno de otro usuario. Limpiando estado.",
        );
        setCurrentShift(null);
        setCurrentShiftExpenses([]);
      }
    }
  }, [username, role, currentShift]);

  useEffect(() => {
    let isMounted = true;
    if (username && role !== "motorizado") {
      repository
        .getActiveShiftForUser(username)
        .then((shift) => {
          if (isMounted && shift) {
            console.log(
              "[CajaContext] Turno activo recuperado del backend para:",
              username,
            );
            setCurrentShift(shift);
          }
        })
        .catch((err) =>
          console.error("Error al recuperar turno activo:", err),
        );
    }
    return () => {
      isMounted = false;
    };
  }, [username, repository, role]);

  useEffect(() => {
    if (currentShift?.id) {
      void refreshCurrentShiftExpenses();
    }
  }, [currentShift?.id, refreshCurrentShiftExpenses]);

  const calculateCurrentShiftSales = useCallback((): ShiftSales => {
    if (!currentShift) return { cash: 0, card: 0, app: 0, total: 0 };

    const shiftOrders = orders.filter(
      (o) =>
        o.status === "paid" &&
        o.cashierName === currentShift.cashierName &&
        new Date(o.timestamp).getTime() >=
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
      } catch (error) {
        console.error("Error al abrir caja en backend:", error);
        throw error;
      }
    },
    [username, repository],
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
        return closedShift;
      } catch (error) {
        console.error("Error closing shift:", error);
        throw error;
      }
    },
    [currentShift, repository],
  );

  return (
    <CajaContext.Provider
      value={{
        currentShift,
        currentShiftExpenses,
        abrirCaja,
        cerrarCaja,
        calculateCurrentShiftSales,
        calculateCurrentShiftExpenses,
        refreshCurrentShiftExpenses,
      }}
    >
      {children}
    </CajaContext.Provider>
  );
};
