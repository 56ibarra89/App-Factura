import {
  useCallback,
  useEffect,
  useSyncExternalStore,
} from "react";
import {
  cashRegisterConfigGateway,
  type CashRegisterConfigGateway,
} from "../api/cashRegisterConfigGateway";
import {
  cashRegisterConfigStore,
} from "../model/cashRegisterConfigStore";
import type {
  CashRegisterConfig,
  CashRegisterType,
  ShiftProfileConfig,
} from "../model/cash-register.types";

export function useCashRegisterConfig(
  gateway: CashRegisterConfigGateway = cashRegisterConfigGateway,
) {
  const config = useSyncExternalStore(
    cashRegisterConfigStore.subscribe,
    cashRegisterConfigStore.getSnapshot,
    cashRegisterConfigStore.getSnapshot,
  );
  const cajas = config.cashRegisters;
  const turnos = config.shiftProfiles;

  useEffect(() => {
    void cashRegisterConfigStore
      .ensureLoaded(() => gateway.load())
      .catch((error) =>
        console.error("Error cargando configuración de cajas:", error),
      );
  }, [gateway]);

  const saveCajas = useCallback(
    (cashRegisters: CashRegisterConfig[]) => {
      const current = cashRegisterConfigStore.getSnapshot();
      cashRegisterConfigStore.set({
        ...current,
        cashRegisters,
      });
      void gateway
        .saveCashRegisters(cashRegisters)
        .catch((error) =>
          console.error("Error guardando cajas:", error),
        );
    },
    [gateway],
  );

  const saveTurnos = useCallback(
    (shiftProfiles: ShiftProfileConfig[]) => {
      const current = cashRegisterConfigStore.getSnapshot();
      cashRegisterConfigStore.set({
        ...current,
        shiftProfiles,
      });
      void gateway
        .saveShiftProfiles(shiftProfiles)
        .catch((error) =>
          console.error("Error guardando turnos:", error),
        );
    },
    [gateway],
  );

  const addCaja = useCallback(
    (
      name: string,
      defaultOpeningAmount: number,
      type?: CashRegisterType,
      assignedUserIds?: string[],
      assignedUserNames?: string[],
    ) => {
      const newCaja: CashRegisterConfig = {
        id: `C-${Date.now()}`,
        name,
        defaultOpeningAmount,
        type,
        assignedUserIds,
        assignedUserNames,
      };
      saveCajas([...cajas, newCaja]);
    },
    [cajas, saveCajas],
  );

  const updateCaja = useCallback(
    (
      id: string,
      name: string,
      defaultOpeningAmount: number,
      type?: CashRegisterType,
      assignedUserIds?: string[],
      assignedUserNames?: string[],
    ) => {
      saveCajas(
        cajas.map((caja) =>
          caja.id === id
            ? {
                ...caja,
                name,
                defaultOpeningAmount,
                type,
                assignedUserIds,
                assignedUserNames,
              }
            : caja,
        ),
      );
    },
    [cajas, saveCajas],
  );

  const deleteCaja = useCallback(
    (id: string) => {
      saveCajas(cajas.filter((caja) => caja.id !== id));
    },
    [cajas, saveCajas],
  );

  const addTurno = useCallback(
    (
      name: string,
      startTime: string,
      endTime: string,
      description?: string,
      assignedRole?: string,
      assignedUserIds?: string[],
      assignedUserNames?: string[],
      daysOfWeek?: number[],
    ) => {
      const newTurno: ShiftProfileConfig = {
        id: `T-${Date.now()}`,
        name,
        startTime,
        endTime,
        description,
        assignedRole,
        assignedUserIds,
        assignedUserNames,
        daysOfWeek,
      };
      saveTurnos([...turnos, newTurno]);
    },
    [saveTurnos, turnos],
  );

  const updateTurno = useCallback(
    (
      id: string,
      name: string,
      startTime: string,
      endTime: string,
      description?: string,
      assignedRole?: string,
      assignedUserIds?: string[],
      assignedUserNames?: string[],
      daysOfWeek?: number[],
    ) => {
      saveTurnos(
        turnos.map((turno) =>
          turno.id === id
            ? {
                ...turno,
                name,
                startTime,
                endTime,
                description,
                assignedRole,
                assignedUserIds,
                assignedUserNames,
                daysOfWeek,
              }
            : turno,
        ),
      );
    },
    [saveTurnos, turnos],
  );

  const deleteTurno = useCallback(
    (id: string) => {
      saveTurnos(turnos.filter((turno) => turno.id !== id));
    },
    [saveTurnos, turnos],
  );

  return {
    cajas,
    turnos,
    addCaja,
    updateCaja,
    deleteCaja,
    addTurno,
    updateTurno,
    deleteTurno,
  };
}
