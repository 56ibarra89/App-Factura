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
  /** DIP: permite inyectar un repositorio alternativo (e.g. mock para tests) */
  repository?: IShiftRepository;
}

export const CajaProvider = ({
  children,
  repository = defaultShiftRepository,
}: CajaProviderProps) => {
  const { username } = useAuth();
  const { orders } = useOrderQueries();

  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  // Limpiar el turno si el usuario logueado cambia o cierra sesión
  useEffect(() => {
    if (currentShift) {
      // Si no hay usuario logueado (cerró sesión) o si el turno le pertenece a otro usuario
      if (!username || currentShift.cashierName !== username) {
        console.log("[CajaContext] Usuario deslogueado o turno de otro usuario. Limpiando estado.");
        setCurrentShift(null);
      }
    }
  }, [username, currentShift]);

  // Recuperar el turno activo desde el backend cuando el usuario inicia sesión
  useEffect(() => {
    let isMounted = true;
    if (username) {
      repository.getActiveShiftForUser(username).then((shift) => {
        if (isMounted && shift) {
          console.log("[CajaContext] Turno activo recuperado del backend para:", username);
          setCurrentShift(shift);
        }
      }).catch(err => console.error("Error al recuperar turno activo:", err));
    }
    return () => { isMounted = false; };
  }, [username, repository]);



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
