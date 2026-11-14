import { useCallback } from "react";
import { logService } from "../../audit";
import type { OrderQueries } from "../../orders";
import type { ReservationInfo } from "../model/table.types";

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
  const handleReservar = useCallback(async () => {
    if (!selectedMesaId) return;

    if (getOrderByTable(selectedMesaId)) {
      console.warn(
        "No se puede reservar una mesa con pedido activo.",
      );
      return;
    }

    if (isReserved) {
      try {
        await releaseTable(selectedMesaId);
        void logService.log(
          username,
          role,
          "CANCEL_RESERVATION",
          `Reserva cancelada para Mesa ${
            selectedMesaId.split("-M")[1]
          }`,
        );
      } catch (error: unknown) {
        window.alert(
          error instanceof Error && error.message.trim().length > 0
            ? `No se pudo cancelar la reserva: ${error.message}`
            : "No se pudo cancelar la reserva.",
        );
      }
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
    async (
      nombre: string,
      monto: number,
      reservationTime: string | undefined,
      expirationTime: string | undefined,
      onDialogClose: () => void,
    ) => {
      if (!selectedMesaId) return;

      await reserveTable(selectedMesaId, {
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
