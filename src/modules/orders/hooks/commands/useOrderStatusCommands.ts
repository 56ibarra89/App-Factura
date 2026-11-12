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
      updateOrders((current) => {
        const result = orderMutations.markAsSentToKitchen(
          current,
          orderId,
          Date.now(),
        );
        modifiedOrder = result.modified;
        return result.orders;
      });

      if (modifiedOrder) {
        await itemsGateway.updateItems(modifiedOrder);
      }
    },
    [itemsGateway, updateOrders],
  );

  const markAsSentToKitchenByTable = useCallback<
    OrderCommands["markAsSentToKitchenByTable"]
  >(
    async (tableId) => {
      let modifiedOrder: Order | undefined;
      updateOrders((current) => {
        const result = orderMutations.markAsSentToKitchenByTable(
          current,
          tableId,
          Date.now(),
        );
        modifiedOrder = result.modified;
        return result.orders;
      });

      if (!modifiedOrder) return undefined;

      try {
        const updatedOrder = await itemsGateway.updateItems(modifiedOrder);
        if (updatedOrder.items) {
          updateOrders((current) =>
            current.map((order) =>
              order.id === modifiedOrder?.id
                ? {
                    ...order,
                    items: updatedOrder.items || order.items,
                  }
                : order,
            ),
          );
          return updatedOrder.items;
        }
      } catch (error: unknown) {
        console.error("Error marking table order for kitchen", error);
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
