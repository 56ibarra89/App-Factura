import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../config/apiClient";

export interface ReservationInfo {
  nombre: string;
  monto: number;
  reservationTime?: string;
  expirationTime?: string;
}

export type TableStatus = "disponible" | "reservado" | "ocupado";

interface BackendMesa {
  id: string;
  floor: number;
  number: number;
  estado: "DISPONIBLE" | "RESERVADO" | "OCUPADO";
  reservationName: string | null;
  reservationAmount: number | null;
}

export function useTableReservations() {
  const [tableStatusMap, setTableStatusMap] = useState<Record<string, TableStatus>>({});
  const [reservationDetails, setReservationDetails] = useState<Record<string, ReservationInfo>>({});

  // Cargar datos iniciales del servidor
  const fetchMesas = useCallback(async () => {
    try {
      const mesas: BackendMesa[] = await apiClient("/mesas");
      
      const newStatusMap: Record<string, TableStatus> = {};
      const newReservationDetails: Record<string, ReservationInfo> = {};

      mesas.forEach(mesa => {
        // Map backend enum to frontend type
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
  }, []);

  useEffect(() => {
    fetchMesas();
  }, [fetchMesas]);

  const setTableStatus = async (tableId: string, status: TableStatus) => {
    // Optimistic UI update
    const prevMap = { ...tableStatusMap };
    setTableStatusMap(prev => ({ ...prev, [tableId]: status }));

    try {
      const backendStatus = status.toUpperCase();
      await apiClient(`/mesas/${tableId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ estado: backendStatus }),
      });
    } catch (err) {
      console.error("Error updating table status:", err);
      // Revert if failed
      setTableStatusMap(prevMap);
    }
  };

  const releaseTable = async (tableId: string) => {
    // Optimistic UI update
    const prevStatusMap = { ...tableStatusMap };
    const prevDetails = { ...reservationDetails };
    
    setTableStatusMap(prev => ({ ...prev, [tableId]: "disponible" }));
    setReservationDetails(prev => {
      const next = { ...prev };
      delete next[tableId];
      return next;
    });

    try {
      await apiClient(`/mesas/${tableId}/release`, {
        method: "PATCH",
      });
    } catch (err) {
      console.error("Error releasing table:", err);
      // Revert if failed
      setTableStatusMap(prevStatusMap);
      setReservationDetails(prevDetails);
    }
  };

  const reserveTable = async (tableId: string, info: ReservationInfo) => {
    // Optimistic UI update
    const prevStatusMap = { ...tableStatusMap };
    const prevDetails = { ...reservationDetails };

    setTableStatusMap(prev => ({ ...prev, [tableId]: "reservado" }));
    setReservationDetails(prev => ({ ...prev, [tableId]: info }));

    try {
      await apiClient(`/mesas/${tableId}/reserve`, {
        method: "PATCH",
        body: JSON.stringify({
          reservationName: info.nombre,
          reservationAmount: info.monto,
          reservationTime: info.reservationTime,
          expirationTime: info.expirationTime,
        }),
      });
    } catch (err) {
      console.error("Error reserving table:", err);
      // Revert if failed
      setTableStatusMap(prevStatusMap);
      setReservationDetails(prevDetails);
    }
  };

  return {
    tableStatusMap,
    reservationDetails,
    reserveTable,
    releaseTable,
    setTableStatus,
    refreshMesas: fetchMesas,
  };
}
