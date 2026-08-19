import {
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { Shift, ShiftSales } from "./cash-register.types";
import {
  shiftRepository as defaultShiftRepository,
  type IShiftRepository,
} from "../api/shiftRepository";
import { useOrderQueries } from "../../orders";
import { useAuth } from "../../auth";
import { calculateShiftSales } from "./shiftDomain";
import { CajaContext } from "./CajaContext";

interface CajaProviderProps {
  children: ReactNode;

  repository?: IShiftRepository;
}

export const CajaProvider = ({
  children,
  repository = defaultShiftRepository,
}: CajaProviderProps) => {
  const { username, role } = useAuth();
  const { orders } = useOrderQueries();

  const [currentShift, setCurrentShift] = useState<Shift | null>(null);

  useEffect(() => {
    if (currentShift) {

      if (!username || currentShift.cashierName !== username) {
        console.log("[CajaContext] Usuario deslogueado o turno de otro usuario. Limpiando estado.");
        setCurrentShift(null);
      }
    }
  }, [username, currentShift]);

  useEffect(() => {
    let isMounted = true;
    if (username && role !== "motorizado") {
      repository.getActiveShiftForUser(username).then((shift) => {
        if (isMounted && shift) {
          console.log("[CajaContext] Turno activo recuperado del backend para:", username);
          setCurrentShift(shift);
        }
      }).catch(err => console.error("Error al recuperar turno activo:", err));
    }
    return () => { isMounted = false; };
  }, [username, repository, role]);

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
    async (amount: number, registerName?: string) => {
      console.log("[CajaContext] Intentando abrir caja con monto:", amount, registerName);
      try {
        const newShift = await repository.openShift({
          cashierName: username || "Sistema",
          openingAmount: amount,
          cashRegisterName: registerName
        });
        console.log("[CajaContext] Nuevo turno creado en backend:", newShift);
        setCurrentShift(newShift);
      } catch (error) {
        console.error("Error al abrir caja en backend:", error);
        throw error;
      }
    },
    [username, repository]
  );

  const cerrarCaja = useCallback(
    async (finalAmount: number, notes?: string) => {
      if (!currentShift) return;

      try {
        await repository.closeShift(currentShift.id, {
          closingAmount: finalAmount,
          notes
        });

        setCurrentShift(null);
      } catch (error) {
        console.error("Error closing shift:", error);
        throw error;
      }
    },
    [currentShift, repository]
  );

  return (
    <CajaContext.Provider
      value={{ currentShift, abrirCaja, cerrarCaja, calculateCurrentShiftSales }}
    >
      {children}
    </CajaContext.Provider>
  );
};

