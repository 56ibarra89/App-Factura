import {
  useCallback,
  useMemo,
} from "react";
import {
  requiresKitchenPreparation,
  type OrderQueries,
} from "../../orders";
import type {
  Mesa,
  MesaEstado,
  ReservationInfo,
} from "../model/table.types";
import type { Order } from "../../orders";

interface UseMesaAvailabilityOptions {
  tableCount: number;
  selectedFloor: number;
  selectedMesaId: string | null;
  orders: Order[];
  getOrderByTable: OrderQueries["getOrderByTable"];
  tableStatusMap: Record<string, MesaEstado>;
  reservationDetails: Record<string, ReservationInfo>;
  role: string | null;
  username: string;
}

export function useMesaAvailability({
  tableCount,
  selectedFloor,
  selectedMesaId,
  orders,
  getOrderByTable,
  tableStatusMap,
  reservationDetails,
  role,
  username,
}: UseMesaAvailabilityOptions) {
  const blockedTableIds = useMemo(() => {
    const blocked = new Set<string>();
    for (const order of orders) {
      if (!order.items?.length || order.status === "cancelled") continue;
      const remainsOperationallyActive =
        order.status !== "paid" ||
        order.items.some(
          (item) =>
            requiresKitchenPreparation(item) &&
            item.isSentToKitchen &&
            item.kitchenStatus !== "delivered",
        );
      if (!remainsOperationallyActive) continue;
      if (order.tableId) blocked.add(order.tableId);
      for (const tableId of order.linkedTables ?? []) blocked.add(tableId);
    }
    return blocked;
  }, [orders]);

  const isTableBlocked = useCallback(
    (tableId: string) => blockedTableIds.has(tableId),
    [blockedTableIds],
  );

  const mesas = useMemo<Mesa[]>(
    () =>
      Array.from({ length: tableCount }).map(
        (_, index) => {
          const tableNumber = index + 1;
          const id = `F${selectedFloor}-M${tableNumber}`;
          return {
            id,
            estado: isTableBlocked(id)
              ? "ocupado"
              : tableStatusMap[id] || "disponible",
            floor: selectedFloor,
            reservationName:
              reservationDetails[id]?.nombre,
          };
        },
      ),
    [
      isTableBlocked,
      reservationDetails,
      selectedFloor,
      tableCount,
      tableStatusMap,
    ],
  );

  const selectedMesaStatus = selectedMesaId
    ? tableStatusMap[selectedMesaId] || "disponible"
    : null;
  const isReserved = selectedMesaStatus === "reservado";
  const activeOrder = useMemo(
    () =>
      selectedMesaId
        ? getOrderByTable(selectedMesaId)
        : null,
    [getOrderByTable, selectedMesaId],
  );
  const canModifyOrder = useMemo(() => {
    if (!activeOrder || activeOrder.items.length === 0) return true;
    if (role === "admin" || role === "cajero") {
      return true;
    }
    return activeOrder.cashierName === username;
  }, [activeOrder, role, username]);

  return {
    mesas,
    selectedMesaStatus,
    isReserved,
    activeOrder,
    canModifyOrder,
    isTableBlocked,
  };
}
