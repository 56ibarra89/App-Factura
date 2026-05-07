import { useState, useEffect } from "react";
import { localStore, setJson, tryGetJson } from "../services/storage/storage";

export interface ReservationInfo {
  nombre: string;
  monto: number;
}

const STORAGE_KEY_STATUS = "app_factura_table_status";
const STORAGE_KEY_DETAILS = "app_factura_reservation_details";

export function useTableReservations() {
  const [tableStatusMap, setTableStatusMap] = useState<Record<string, "disponible" | "reservado" | "ocupado">>({});
  const [reservationDetails, setReservationDetails] = useState<Record<string, ReservationInfo>>({});

  // Cargar datos iniciales
  useEffect(() => {
    const status = tryGetJson<Record<string, "disponible" | "reservado" | "ocupado">>(
      localStore,
      STORAGE_KEY_STATUS,
    );
    const details = tryGetJson<Record<string, ReservationInfo>>(
      localStore,
      STORAGE_KEY_DETAILS,
    );

    if (status) setTableStatusMap(status);
    if (details) setReservationDetails(details);
  }, []);

  const setTableStatus = (tableId: string, status: "disponible" | "reservado" | "ocupado") => {
    setTableStatusMap(prev => {
      const next = { ...prev, [tableId]: status };
      setJson(localStore, STORAGE_KEY_STATUS, next);
      return next;
    });
  };

  const setReservation = (tableId: string, info: ReservationInfo | null) => {
    setReservationDetails(prev => {
      const next = { ...prev };
      if (info) {
        next[tableId] = info;
      } else {
        delete next[tableId];
      }
      setJson(localStore, STORAGE_KEY_DETAILS, next);
      return next;
    });
  };

  const releaseTable = (tableId: string) => {
    setTableStatus(tableId, "disponible");
    setReservation(tableId, null);
  };

  const reserveTable = (tableId: string, info: ReservationInfo) => {
    setTableStatus(tableId, "reservado");
    setReservation(tableId, info);
  };

  return {
    tableStatusMap,
    reservationDetails,
    reserveTable,
    releaseTable,
    setTableStatus
  };
}
