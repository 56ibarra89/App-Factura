import { useCallback } from "react";
import {
  orderMutations,
} from "../../model/orderDomain";
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
  const updateOrderStatus = useCallback<
    OrderCommands["updateOrderStatus"]
  >(
    (
      orderId,
      status,
      cancelReason,
      adminPin,
      sentAt,
      kitchenId,
      itemId,
    ) => {
      updateOrders((current) => {
        const result =
          orderMutations.updateOrderStatus(
            current,
            orderId,
            status,
            sentAt,
            kitchenId,
            itemId,
          );
        return result.orders;
      });
      void statusGateway
        .updateStatus({
          orderId,
          status,
          cancelReason,
          adminPin,
          sentAt,
          kitchenId,
          itemId,
        })
        .catch((error: unknown) =>
          console.error(
            "Error updating order status",
            error,
          ),
        );
    },
    [statusGateway, updateOrders],
  );

  const markAsSentToKitchen = useCallback<
    OrderCommands["markAsSentToKitchen"]
  >(
    (orderId) => {
      let modifiedOrder: Order | undefined;
      updateOrders((current) => {
        const result =
          orderMutations.markAsSentToKitchen(
            current,
            orderId,
            Date.now(),
          );
        modifiedOrder = result.modified;
        return result.orders;
      });

      if (modifiedOrder) {
        void itemsGateway
          .updateItems(modifiedOrder)
          .catch((error: unknown) =>
            console.error(
              "Error marking order for kitchen",
              error,
            ),
          );
      }
    },
    [itemsGateway, updateOrders],
  );

  const markAsSentToKitchenByTable = useCallback<
    OrderCommands["markAsSentToKitchenByTable"]
  >(
    (tableId) => {
      let modifiedOrder: Order | undefined;
      updateOrders((current) => {
        const result =
          orderMutations.markAsSentToKitchenByTable(
            current,
            tableId,
            Date.now(),
          );
        modifiedOrder = result.modified;
        return result.orders;
      });

      if (modifiedOrder) {
        void itemsGateway
          .updateItems(modifiedOrder)
          .catch((error: unknown) =>
            console.error(
              "Error marking table order for kitchen",
              error,
            ),
          );
      }
    },
    [itemsGateway, updateOrders],
  );

  return {
    updateOrderStatus,
    markAsSentToKitchen,
    markAsSentToKitchenByTable,
  };
}
