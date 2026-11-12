import { useState, useEffect, useCallback } from "react";
import {
  tablesGateway,
  type TableReservationGateway,
  type TableStateGateway,
} from "../api/tablesGateway";
import type {
  MesaEstado as TableStatus,
  ReservationInfo,
} from "../model/table.types";

export type {
  MesaEstado as TableStatus,
  ReservationInfo,
} from "../model/table.types";

export interface TableReservationsGateways {
  state: TableStateGateway;
  reservation: TableReservationGateway;
}

export function useTableReservations({
  state = tablesGateway,
  reservation = tablesGateway,
}: Partial<TableReservationsGateways> = {}) {
  const [tableStatusMap, setTableStatusMap] = useState<Record<string, TableStatus>>({});
  const [reservationDetails, setReservationDetails] = useState<Record<string, ReservationInfo>>({});

  const fetchMesas = useCallback(async () => {
    try {
      const mesas = await state.list();

      const newStatusMap: Record<string, TableStatus> = {};
      const newReservationDetails: Record<string, ReservationInfo> = {};

      mesas.forEach((mesa) => {
        const status = mesa.estado.toLowerCase() as TableStatus;
        newStatusMap[mesa.id] = status;

        if (mesa.estado === "RESERVADO" && mesa.reservationName) {
          newReservationDetails[mesa.id] = {
            nombre: mesa.reservationName,
            monto: mesa.reservationAmount !== null ? Number(mesa.reservationAmount) : 0,
          };
        }
      });

      setTableStatusMap(newStatusMap);
      setReservationDetails(newReservationDetails);
    } catch (err) {
      console.error("Error al cargar estado de mesas:", err);
    }
  }, [state]);

  useEffect(() => {
    fetchMesas();
  }, [fetchMesas]);

  const setTableStatus = useCallback(
    async (tableId: string, status: TableStatus) => {
      let prevStatus: TableStatus | undefined;
      setTableStatusMap((prev) => {
        prevStatus = prev[tableId];
        return { ...prev, [tableId]: status };
      });

      try {
        const backendStatus = status.toUpperCase();
        await state.updateStatus(tableId, backendStatus);
      } catch (err) {
        console.error("Error updating table status:", err);
        setTableStatusMap((prev) => {
          if (prevStatus === undefined) {
            const next = { ...prev };
            delete next[tableId];
            return next;
          }
          return { ...prev, [tableId]: prevStatus };
        });
      }
    },
    [state],
  );

  const releaseTable = useCallback(
    async (tableId: string) => {
      let prevStatus: TableStatus | undefined;
      let prevReservation: ReservationInfo | undefined;

      setTableStatusMap((prev) => {
        prevStatus = prev[tableId];
        return { ...prev, [tableId]: "disponible" };
      });
      setReservationDetails((prev) => {
        prevReservation = prev[tableId];
        const next = { ...prev };
        delete next[tableId];
        return next;
      });

      try {
        await reservation.release(tableId);
      } catch (err) {
        console.error("Error releasing table:", err);
        setTableStatusMap((prev) => {
          if (prevStatus === undefined) {
            const next = { ...prev };
            delete next[tableId];
            return next;
          }
          return { ...prev, [tableId]: prevStatus };
        });
        setReservationDetails((prev) => {
          if (prevReservation === undefined) {
            const next = { ...prev };
            delete next[tableId];
            return next;
          }
          return { ...prev, [tableId]: prevReservation };
        });
      }
    },
    [reservation],
  );

  const reserveTable = useCallback(
    async (tableId: string, info: ReservationInfo) => {
      let prevStatus: TableStatus | undefined;
      let prevReservation: ReservationInfo | undefined;

      setTableStatusMap((prev) => {
        prevStatus = prev[tableId];
        return { ...prev, [tableId]: "reservado" };
      });
      setReservationDetails((prev) => {
        prevReservation = prev[tableId];
        return { ...prev, [tableId]: info };
      });

      try {
        await reservation.reserve(tableId, {
          reservationName: info.nombre,
          reservationAmount: info.monto,
          reservationTime: info.reservationTime,
          expirationTime: info.expirationTime,
        });
      } catch (err) {
        console.error("Error reserving table:", err);
        setTableStatusMap((prev) => {
          if (prevStatus === undefined) {
            const next = { ...prev };
            delete next[tableId];
            return next;
          }
          return { ...prev, [tableId]: prevStatus };
        });
        setReservationDetails((prev) => {
          if (prevReservation === undefined) {
            const next = { ...prev };
            delete next[tableId];
            return next;
          }
          return { ...prev, [tableId]: prevReservation };
        });
      }
    },
    [reservation],
  );

  return {
    tableStatusMap,
    reservationDetails,
    reserveTable,
    releaseTable,
    setTableStatus,
    refreshMesas: fetchMesas,
  };
}
