import { useCallback } from "react";
import type {
  OrderCommands,
  OrderQueries,
} from "../../orders";
import type { MesaEstado } from "../model/table.types";

interface UseMesaOrderActionsOptions {
  selectedMesaId: string | null;
  selectedMesaStatus: MesaEstado | null;
  isReserved: boolean;
  tableStatusMap: Record<string, MesaEstado>;
  isTableBlocked(tableId: string): boolean;
  getOrderByTable: OrderQueries["getOrderByTable"];
  setTableStatus(
    tableId: string,
    status: MesaEstado,
  ): Promise<void>;
  releaseTable(tableId: string): Promise<void>;
  updateOrderStatus: OrderCommands["updateOrderStatus"];
}

export function useMesaOrderActions({
  selectedMesaId,
  selectedMesaStatus,
  isReserved,
  tableStatusMap,
  isTableBlocked,
  getOrderByTable,
  setTableStatus,
  releaseTable,
  updateOrderStatus,
}: UseMesaOrderActionsOptions) {
  const openOrderEditor = useCallback(() => {
    if (!selectedMesaId) return;

    window.location.hash = `/facturacion?tableId=${encodeURIComponent(selectedMesaId)}`;
  }, [selectedMesaId]);

  const handleEditOrder = useCallback(() => {
    if (!selectedMesaId) return;

    openOrderEditor();

    window.setTimeout(() => {
      if (isReserved) {
        void releaseTable(selectedMesaId).catch((error: unknown) => {
          console.error("Error liberando reserva al abrir pedido:", error);
          window.alert(
            error instanceof Error && error.message.trim().length > 0
              ? `No se pudo liberar la reserva de la mesa: ${error.message}`
              : "No se pudo liberar la reserva de la mesa.",
          );
        });
        void setTableStatus(selectedMesaId, "ocupado").catch(
          (error: unknown) => {
            console.error("Error ocupando mesa reservada al abrir pedido:", error);
          },
        );
        return;
      }

      if (
        !tableStatusMap[selectedMesaId] ||
        tableStatusMap[selectedMesaId] === "disponible"
      ) {
        void setTableStatus(selectedMesaId, "ocupado").catch(
          (error: unknown) => {
            console.error("Error ocupando mesa al abrir pedido:", error);
            window.alert(
              error instanceof Error && error.message.trim().length > 0
                ? `No se pudo ocupar la mesa: ${error.message}`
                : "No se pudo ocupar la mesa.",
            );
          },
        );
      }
    }, 0);
  }, [
    isReserved,
    openOrderEditor,
    releaseTable,
    selectedMesaId,
    setTableStatus,
    tableStatusMap,
  ]);

  const handleToggleOccupancy = useCallback(async () => {
    if (!selectedMesaId) return;

    if (isTableBlocked(selectedMesaId)) {
      window.alert(
        "No se puede liberar la mesa porque hay cuentas pendientes o pedidos sin entregar.",
      );
      return;
    }

    if (
      selectedMesaStatus === "ocupado" ||
      selectedMesaStatus === "reservado"
    ) {
      const activeOrder =
        getOrderByTable(selectedMesaId);
      if (
        activeOrder &&
        (!activeOrder.items ||
          activeOrder.items.length === 0)
      ) {
        try {
          await updateOrderStatus(
            activeOrder.id,
            "cancelled",
            "Mesa liberada sin consumo",
            undefined,
            undefined,
            undefined,
            undefined,
            "error-comanda-mesero",
            activeOrder.updatedAt?.toISOString(),
          );
        } catch (error: unknown) {
          window.alert(
            error instanceof Error
              ? `No se pudo anular la orden vacía: ${error.message}`
              : "No se pudo anular la orden vacía. La mesa permanece ocupada.",
          );
          return;
        }
      }

      try {
        if (selectedMesaStatus === "reservado") {
          await releaseTable(selectedMesaId);
        } else {
          await setTableStatus(selectedMesaId, "disponible");
        }
      } catch (error: unknown) {
        window.alert(
          error instanceof Error
            ? `No se pudo liberar la mesa: ${error.message}`
            : "No se pudo liberar la mesa. Inténtalo nuevamente.",
        );
      }
      return;
    }

    openOrderEditor();
    window.setTimeout(() => {
      void setTableStatus(selectedMesaId, "ocupado").catch(
        (error: unknown) => {
          console.error("Error ocupando mesa:", error);
          window.alert(
            error instanceof Error && error.message.trim().length > 0
              ? `No se pudo ocupar la mesa: ${error.message}`
              : "No se pudo ocupar la mesa.",
          );
        },
      );
    }, 0);
  }, [
    getOrderByTable,
    isTableBlocked,
    openOrderEditor,
    releaseTable,
    selectedMesaId,
    selectedMesaStatus,
    setTableStatus,
    updateOrderStatus,
  ]);

  return {
    handleEditOrder,
    handleToggleOccupancy,
  };
}
