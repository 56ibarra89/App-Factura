import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  addOrder: OrderCommands["addOrder"];
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
  addOrder,
}: UseMesaOrderActionsOptions) {
  const navigate = useNavigate();

  const handleEditOrder = useCallback(() => {
    if (!selectedMesaId) return;

    if (isReserved) {
      void releaseTable(selectedMesaId);
    }
    if (
      !tableStatusMap[selectedMesaId] ||
      tableStatusMap[selectedMesaId] === "disponible"
    ) {
      void setTableStatus(selectedMesaId, "ocupado");
    }

    navigate(`/facturacion?tableId=${selectedMesaId}`);
  }, [
    isReserved,
    navigate,
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

    void setTableStatus(selectedMesaId, "ocupado");
    void addOrder({
      items: [],
      total: 0,
      orderType: "local",
      tableId: selectedMesaId,
    });
  }, [
    addOrder,
    getOrderByTable,
    isTableBlocked,
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
