import { useCallback } from "react";
import type { MutableRefObject } from "react";
import {
  orderMutations,
} from "../../../services/order/orderDomain";
import type {
  OrderFinalizationGateway,
  OrderItemsGateway,
} from "../../../services/order/ordersGateway";
import type { OrderCommands } from "../../../types/order-context";
import type { Order } from "../../../types/order.types";
import type { OrderStateUpdater } from "../useOrderStore";

interface UseOrderFinalizationCommandOptions {
  ordersRef: MutableRefObject<Order[]>;
  updateOrders(updater: OrderStateUpdater): void;
  itemsGateway: OrderItemsGateway;
  finalizationGateway: OrderFinalizationGateway;
}

export function useOrderFinalizationCommand({
  ordersRef,
  updateOrders,
  itemsGateway,
  finalizationGateway,
}: UseOrderFinalizationCommandOptions) {
  const finalizeOrder = useCallback<
    OrderCommands["finalizeOrder"]
  >(
    async (orderId, command) => {
      const originalOrder = ordersRef.current.find(
        (order) => order.id === orderId,
      );
      let modifiedOrder: Order | undefined;

      updateOrders((current) => {
        const result = orderMutations.finalizeOrder(
          current,
          orderId,
          command,
        );
        modifiedOrder = result.modified;
        return result.orders;
      });

      if (!modifiedOrder) return;
      try {
        await itemsGateway.updateItems(modifiedOrder);
        const finalizedOrder =
          await finalizationGateway.finalize(
            modifiedOrder,
          );
        updateOrders((current) =>
          current.map((order) =>
            order.id === modifiedOrder?.id
              ? {
                  ...order,
                  status: "paid",
                  invoiceNumber:
                    finalizedOrder.invoiceNumber,
                }
              : order,
          ),
        );
        return finalizedOrder.invoiceNumber;
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
    [
      finalizationGateway,
      itemsGateway,
      ordersRef,
      updateOrders,
    ],
  );

  return { finalizeOrder };
}
