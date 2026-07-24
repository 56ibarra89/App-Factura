import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { OrderCommands } from "../../types/order-context";
import type {
  Mesa,
  MesaEstado,
  TableSelectMode,
} from "../../types/mesa.types";
import type { Order } from "../../types/order.types";

interface UseMesaTransferActionsOptions {
  selectedMesaId: string | null;
  setSelectedMesaId: Dispatch<
    SetStateAction<string | null>
  >;
  activeOrder?: Order | null;
  mesas: Mesa[];
  tableStatusMap: Record<string, MesaEstado>;
  setTableStatus(
    tableId: string,
    status: MesaEstado,
  ): Promise<void>;
  moveOrder: OrderCommands["moveOrder"];
  unirMesas: OrderCommands["unirMesas"];
  openTableSelect(mode: TableSelectMode): void;
}

export function useMesaTransferActions({
  selectedMesaId,
  setSelectedMesaId,
  activeOrder,
  mesas,
  tableStatusMap,
  setTableStatus,
  moveOrder,
  unirMesas,
  openTableSelect,
}: UseMesaTransferActionsOptions) {
  const clearTableStatus = useCallback(
    (tablesToClear: string[]) => {
      tablesToClear.forEach((tableId) => {
        if (tableStatusMap[tableId] === "ocupado") {
          void setTableStatus(tableId, "disponible");
        }
      });
    },
    [setTableStatus, tableStatusMap],
  );

  const handleUnirMesas = useCallback(() => {
    if (selectedMesaId) {
      openTableSelect("unir");
    }
  }, [openTableSelect, selectedMesaId]);

  const handleMoverPedido = useCallback(() => {
    if (selectedMesaId) {
      openTableSelect("mover");
    }
  }, [openTableSelect, selectedMesaId]);

  const occupyTables = useCallback(
    (tableIds: string[]) => {
      tableIds.forEach((tableId) => {
        if (tableStatusMap[tableId] !== "ocupado") {
          void setTableStatus(tableId, "ocupado");
        }
      });
    },
    [setTableStatus, tableStatusMap],
  );

  const handleTableSelectConfirm = useCallback(
    (
      targetTableId: string | string[],
      mode: TableSelectMode,
      onDialogClose: () => void,
    ) => {
      if (!selectedMesaId) return;

      if (mode === "unir") {
        unirMesas(selectedMesaId, targetTableId);
        occupyTables(
          Array.isArray(targetTableId)
            ? targetTableId
            : [targetTableId],
        );
        onDialogClose();
        return;
      }

      const sourceTables: string[] = [];
      if (activeOrder) {
        if (activeOrder.tableId) {
          sourceTables.push(activeOrder.tableId);
        }
        if (activeOrder.linkedTables) {
          sourceTables.push(
            ...activeOrder.linkedTables,
          );
        }
      } else {
        sourceTables.push(selectedMesaId);
      }
      const uniqueSourceTables = Array.from(
        new Set(sourceTables),
      );

      let finalTarget = targetTableId;
      if (
        Array.isArray(targetTableId) &&
        targetTableId.length > uniqueSourceTables.length
      ) {
        finalTarget = targetTableId.slice(
          0,
          uniqueSourceTables.length,
        );
      }

      moveOrder(selectedMesaId, finalTarget);

      const newTables = Array.isArray(finalTarget)
        ? finalTarget
        : [finalTarget];
      clearTableStatus(
        uniqueSourceTables.filter(
          (tableId) => !newTables.includes(tableId),
        ),
      );
      occupyTables(newTables);
      setSelectedMesaId(newTables[0]);
      onDialogClose();
    },
    [
      activeOrder,
      clearTableStatus,
      moveOrder,
      occupyTables,
      selectedMesaId,
      setSelectedMesaId,
      unirMesas,
    ],
  );

  const getAvailableTables = useCallback(
    () =>
      mesas
        .filter(
          (mesa) =>
            mesa.estado === "disponible" &&
            mesa.id !== selectedMesaId,
        )
        .map((mesa) => ({
          id: mesa.id,
          label: `Planta ${mesa.floor} - Mesa ${
            mesa.id.split("-M")[1]
          }`,
        })),
    [mesas, selectedMesaId],
  );

  return {
    clearTableStatus,
    handleUnirMesas,
    handleMoverPedido,
    handleTableSelectConfirm,
    getAvailableTables,
  };
}
