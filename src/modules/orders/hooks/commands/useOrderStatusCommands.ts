import { useCallback } from "react";
import { orderMutations } from "../../model/orderDomain";
import type {
  OrderItemsGateway,
  OrderStatusGateway,
} from "../../api/ordersGateway";
import type { OrderCommands } from "../../model/order-context.types";
import type { Order } from "../../model/order.types";
import type { OrderStateUpdater } from "../useOrderStore";

interface UseOrderStatusCommandsOptions {
  updateOrders(updater: OrderStateUpdater): void;
  statusGateway: OrderStatusGateway;
  itemsGateway: OrderItemsGateway;
}

export function useOrderStatusCommands({
  updateOrders,
  statusGateway,
  itemsGateway,
}: UseOrderStatusCommandsOptions) {
  const updateOrderStatus = useCallback<OrderCommands["updateOrderStatus"]>(
    async (
      orderId,
      status,
      cancelReason,
      adminPin,
      sentAt,
      kitchenId,
      itemId,
      cancelReasonId,
    ) => {
      await statusGateway.updateStatus({
        orderId,
        status,
        cancelReason,
        adminPin,
        sentAt,
        kitchenId,
        itemId,
        cancelReasonId,
      });
      updateOrders((current) => {
        const result = orderMutations.updateOrderStatus(
          current,
          orderId,
          status,
          sentAt,
          kitchenId,
          itemId,
        );
        return result.orders;
      });
    },
    [statusGateway, updateOrders],
  );

  const markAsSentToKitchen = useCallback<OrderCommands["markAsSentToKitchen"]>(
    async (orderId) => {
      let modifiedOrder: Order | undefined;
      let previousOrder: Order | undefined;
      updateOrders((current) => {
        previousOrder = current.find((order) => order.id === orderId);
        const result = orderMutations.markAsSentToKitchen(
          current,
          orderId,
          Date.now(),
        );
        modifiedOrder = result.modified;
        return result.orders;
      });

      if (modifiedOrder) {
        try {
          const saved = await itemsGateway.updateItems(modifiedOrder);
          updateOrders((current) => current.map((order) =>
            order.id === saved.id && order === modifiedOrder ? saved : order,
          ));
        } catch (error) {
          if (previousOrder) {
            const snapshot = previousOrder;
            updateOrders((current) => current.map((order) =>
              order.id === snapshot.id && order === modifiedOrder ? snapshot : order,
            ));
          }
          throw error;
        }
      }
    },
    [itemsGateway, updateOrders],
  );

  const markAsSentToKitchenByTable = useCallback<
    OrderCommands["markAsSentToKitchenByTable"]
  >(
    async (tableId) => {
      let modifiedOrder: Order | undefined;
      let previousOrder: Order | undefined;
      updateOrders((current) => {
        const result = orderMutations.markAsSentToKitchenByTable(
          current,
          tableId,
          Date.now(),
        );
        modifiedOrder = result.modified;
        if (result.modified) {
          previousOrder = current.find(
            (order) => order.id === result.modified?.id,
          );
        }
        return result.orders;
      });

      if (!modifiedOrder) return undefined;

      try {
        const updatedOrder = await itemsGateway.updateItems(modifiedOrder);
        if (updatedOrder.items) {
          updateOrders((current) =>
            current.map((order) =>
              order.id === modifiedOrder?.id && order === modifiedOrder
                ? updatedOrder
                : order,
            ),
          );
          return updatedOrder.items;
        }
      } catch (error: unknown) {
        if (previousOrder) {
          const snapshot = previousOrder;
          updateOrders((current) =>
            current.map((order) =>
              order.id === snapshot.id && order === modifiedOrder ? snapshot : order,
            ),
          );
        }
        console.error("Error marking table order for kitchen", error);
        throw error;
      }

      return modifiedOrder.items;
    },
    [itemsGateway, updateOrders],
  );

  return {
    updateOrderStatus,
    markAsSentToKitchen,
    markAsSentToKitchenByTable,
  };
}
