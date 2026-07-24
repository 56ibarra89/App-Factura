import {
  useCallback,
  useMemo,
} from "react";
import type { OrderQueries } from "../../types/order-context";
import type {
  Mesa,
  MesaEstado,
  ReservationInfo,
} from "../../types/mesa.types";
import type { Order } from "../../types/order.types";

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
  const isTableBlocked = useCallback(
    (tableId: string) =>
      orders.some((order) => {
        if (!order.items || order.items.length === 0) {
          return false;
        }

        const belongsToTable =
          order.tableId === tableId ||
          order.linkedTables?.includes(tableId);
        return (
          belongsToTable &&
          order.status !== "cancelled" &&
          (order.status !== "paid" ||
            order.items.some(
              (item) =>
                item.isSentToKitchen &&
                item.kitchenStatus !== "delivered",
            ))
        );
      }),
    [orders],
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
    if (!activeOrder) return true;
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
