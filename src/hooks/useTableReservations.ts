import { useState, useEffect } from "react";

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
    const savedStatus = localStorage.getItem(STORAGE_KEY_STATUS);
    const savedDetails = localStorage.getItem(STORAGE_KEY_DETAILS);

    if (savedStatus) {
      try {
        setTableStatusMap(JSON.parse(savedStatus));
      } catch (e) {
        console.error("Error cargando estados de mesas:", e);
      }
    }

    if (savedDetails) {
      try {
        setReservationDetails(JSON.parse(savedDetails));
      } catch (e) {
        console.error("Error cargando detalles de reservas:", e);
      }
    }
  }, []);

  const setTableStatus = (tableId: string, status: "disponible" | "reservado" | "ocupado") => {
    setTableStatusMap(prev => {
      const next = { ...prev, [tableId]: status };
      localStorage.setItem(STORAGE_KEY_STATUS, JSON.stringify(next));
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
      localStorage.setItem(STORAGE_KEY_DETAILS, JSON.stringify(next));
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
