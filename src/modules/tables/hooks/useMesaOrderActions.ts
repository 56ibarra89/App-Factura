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
        void releaseTable(selectedMesaId);
        return;
      }

      if (
        !tableStatusMap[selectedMesaId] ||
        tableStatusMap[selectedMesaId] === "disponible"
      ) {
        void setTableStatus(selectedMesaId, "ocupado");
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

  const handleToggleOccupancy = useCallback(() => {
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
        updateOrderStatus(
          activeOrder.id,
          "cancelled",
        );
      }

      if (selectedMesaStatus === "reservado") {
        void releaseTable(selectedMesaId);
      } else {
        void setTableStatus(
          selectedMesaId,
          "disponible",
        );
      }
      return;
    }

    openOrderEditor();
    window.setTimeout(() => {
      void setTableStatus(selectedMesaId, "ocupado");
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
