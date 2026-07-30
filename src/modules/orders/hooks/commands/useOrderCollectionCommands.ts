import { useCallback } from "react";
import type { MutableRefObject } from "react";
import {
  createOrder,
  orderMutations,
} from "../../model/orderDomain";
import type { OrderPreferencesGateway } from "../../api/orderPreferencesGateway";
import type { OrderCreationGateway } from "../../api/ordersGateway";
import type { OrderCommands } from "../../model/order-context.types";
import type { Order } from "../../model/order.types";
import type { OrderStateUpdater } from "../useOrderStore";

interface UseOrderCollectionCommandsOptions {
  username: string | null;
  ordersRef: MutableRefObject<Order[]>;
  updateOrders(updater: OrderStateUpdater): void;
  gateway: OrderCreationGateway;
  preferencesGateway: OrderPreferencesGateway;
}

export function useOrderCollectionCommands({
  username,
  ordersRef,
  updateOrders,
  gateway,
  preferencesGateway,
}: UseOrderCollectionCommandsOptions) {
  const addOrder = useCallback<OrderCommands["addOrder"]>(
    async (command) => {
      const newOrder = createOrder({
        ...command,
        username,
      });
      let persistedOrder: Order | undefined;

      updateOrders((current) => [newOrder, ...current]);
      try {
        const createdOrder = await gateway.create(newOrder);
        persistedOrder = createdOrder;
        const invoiceNumber = createdOrder.invoiceNumber;

        updateOrders((current) =>
          current.map((order) =>
            order.id === newOrder.id
              ? {
                  ...order,
                  invoiceNumber,
                  items:
                    createdOrder.items || order.items,
                }
              : order,
          ),
        );
        return invoiceNumber;
      } catch (error: unknown) {
        updateOrders((current) => {
          if (!persistedOrder) {
            return current.filter(
              (order) => order.id !== newOrder.id,
            );
          }
          const orderToRestore = persistedOrder;
          return current.map((order) =>
            order.id === newOrder.id
              ? orderToRestore
              : order,
          );
        });
        throw error;
      }
    },
    [gateway, updateOrders, username],
  );

  const removeOrder = useCallback<
    OrderCommands["removeOrder"]
  >(
    (orderId) => {
      updateOrders((current) =>
        current.filter((order) => order.id !== orderId),
      );
    },
    [updateOrders],
  );

  const clearHistory = useCallback<
    OrderCommands["clearHistory"]
  >(() => {
    const orderIdsToHide = ordersRef.current
      .filter(
        (order) =>
          order.status === "paid" ||
          order.status === "cancelled",
      )
      .map((order) => order.id);

    updateOrders(
      (current) =>
        orderMutations.clearHistory(current).orders,
    );
    if (orderIdsToHide.length > 0) {
      void preferencesGateway
        .hideOrderIds(orderIdsToHide)
        .catch((error: unknown) =>
          console.error(
            "Error saving order history preferences",
            error,
          ),
        );
    }
  }, [ordersRef, preferencesGateway, updateOrders]);

  return {
    addOrder,
    removeOrder,
    clearHistory,
  };
}
