import { useCallback } from "react";
import { logService } from "../../services/logService";
import type { OrderQueries } from "../../types/order-context";
import type { ReservationInfo } from "../../types/mesa.types";

interface UseMesaReservationActionsOptions {
  selectedMesaId: string | null;
  isReserved: boolean;
  username: string;
  role: string | null;
  getOrderByTable: OrderQueries["getOrderByTable"];
  reserveTable(
    tableId: string,
    info: ReservationInfo,
  ): Promise<void>;
  releaseTable(tableId: string): Promise<void>;
  openReservation(): void;
}

export function useMesaReservationActions({
  selectedMesaId,
  isReserved,
  username,
  role,
  getOrderByTable,
  reserveTable,
  releaseTable,
  openReservation,
}: UseMesaReservationActionsOptions) {
  const handleReservar = useCallback(() => {
    if (!selectedMesaId) return;

    if (getOrderByTable(selectedMesaId)) {
      console.warn(
        "No se puede reservar una mesa con pedido activo.",
      );
      return;
    }

    if (isReserved) {
      void releaseTable(selectedMesaId);
      void logService.log(
        username,
        role,
        "CANCEL_RESERVATION",
        `Reserva cancelada para Mesa ${
          selectedMesaId.split("-M")[1]
        }`,
      );
      return;
    }

    openReservation();
  }, [
    getOrderByTable,
    isReserved,
    openReservation,
    releaseTable,
    role,
    selectedMesaId,
    username,
  ]);

  const handleConfirmReservation = useCallback(
    (
      nombre: string,
      monto: number,
      reservationTime: string,
      expirationTime: string,
      onDialogClose: () => void,
    ) => {
      if (!selectedMesaId) return;

      void reserveTable(selectedMesaId, {
        nombre,
        monto,
        reservationTime,
        expirationTime,
      });
      void logService.log(
        username,
        role,
        "CREATE_RESERVATION",
        `Nueva reserva para ${nombre} en Mesa ${
          selectedMesaId.split("-M")[1]
        } por monto: ${monto}`,
      );
      onDialogClose();
    },
    [
      reserveTable,
      role,
      selectedMesaId,
      username,
    ],
  );

  return {
    handleReservar,
    handleConfirmReservation,
  };
}
