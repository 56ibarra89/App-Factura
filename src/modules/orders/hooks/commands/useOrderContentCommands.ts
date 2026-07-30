import { useCallback } from "react";
import type { MutableRefObject } from "react";
import {
  orderMutations,
} from "../../model/orderDomain";
import type { OrderItemsGateway } from "../../api/ordersGateway";
import type { OrderCommands } from "../../model/order-context.types";
import type { Order } from "../../model/order.types";
import type { OrderStateUpdater } from "../useOrderStore";

interface UseOrderContentCommandsOptions {
  ordersRef: MutableRefObject<Order[]>;
  updateOrders(updater: OrderStateUpdater): void;
  gateway: OrderItemsGateway;
}

export function useOrderContentCommands({
  ordersRef,
  updateOrders,
  gateway,
}: UseOrderContentCommandsOptions) {
  const updateOrderItems = useCallback<
    OrderCommands["updateOrderItems"]
  >(
    async (
      orderId,
      items,
      total,
      subTotal,
      taxAmount,
    ) => {
      const originalOrder = ordersRef.current.find(
        (order) => order.id === orderId,
      );
      let modifiedOrder: Order | undefined;

      updateOrders((current) => {
        const result = orderMutations.updateOrderItems(
          current,
          orderId,
          items,
          total,
        );
        if (result.modified) {
          if (typeof subTotal === "number") {
            result.modified.subTotal = subTotal;
          }
          if (typeof taxAmount === "number") {
            result.modified.taxAmount = taxAmount;
          }
          modifiedOrder = result.modified;
        }
        return result.orders;
      });

      if (!modifiedOrder) return;
      try {
        const updatedOrder =
          await gateway.updateItems(modifiedOrder);
        updateOrders((current) =>
          current.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  items:
                    updatedOrder.items || order.items,
                }
              : order,
          ),
        );
      } catch (error: unknown) {
        if (originalOrder) {
          updateOrders((current) =>
            current.map((order) =>
              order.id === orderId
                ? originalOrder
                : order,
            ),
          );
        }
        throw error;
      }
    },
    [gateway, ordersRef, updateOrders],
  );

  return { updateOrderItems };
}
