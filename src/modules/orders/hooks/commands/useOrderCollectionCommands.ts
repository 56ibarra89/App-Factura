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
                  updatedAt: createdOrder.updatedAt ?? order.updatedAt,
                  paidAt: createdOrder.paidAt ?? order.paidAt,
                  subTotal: createdOrder.subTotal ?? order.subTotal,
                  discountAmount:
                    createdOrder.discountAmount ?? order.discountAmount,
                  taxAmount: createdOrder.taxAmount ?? order.taxAmount,
                  total: createdOrder.total ?? order.total,
                  promotionSource:
                    createdOrder.promotionSource ?? order.promotionSource,
                  couponId: createdOrder.couponId ?? order.couponId,
                  discountId: createdOrder.discountId ?? order.discountId,
                  happyHourId: createdOrder.happyHourId ?? order.happyHourId,
                  certificateSerials:
                    createdOrder.certificateSerials ?? order.certificateSerials,
                  waiterId: createdOrder.waiterId ?? order.waiterId,
                  waiterName: createdOrder.waiterName ?? order.waiterName,
                  items:
                    createdOrder.items || order.items,
                }
              : order,
          ),
        );
        return {
          orderId: createdOrder.id,
          invoiceNumber,
        };
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
  >(async () => {
    const ordersToRestore = ordersRef.current.filter(
      (order) =>
        order.status === "paid" ||
        order.status === "cancelled",
    );
    const orderIdsToHide = ordersToRestore.map(
      (order) => order.id,
    );

    if (orderIdsToHide.length === 0) {
      updateOrders(
        (current) =>
          orderMutations.clearHistory(current).orders,
      );
      return;
    }

    updateOrders(
      (current) =>
        orderMutations.clearHistory(current).orders,
    );

    try {
      await preferencesGateway.hideOrderIds(orderIdsToHide);
    } catch (error: unknown) {
      const hiddenIdSet = new Set(orderIdsToHide);
      const restoreById = new Map(
        ordersToRestore.map((order) => [order.id, order] as const),
      );
      updateOrders((current) => {
        const existingIds = new Set(current.map((order) => order.id));
        const restored = ordersToRestore.filter(
          (order) =>
            hiddenIdSet.has(order.id) &&
            !existingIds.has(order.id) &&
            restoreById.has(order.id),
        );
        return restored.length > 0 ? [...current, ...restored] : current;
      });
      throw error;
    }
  }, [ordersRef, preferencesGateway, updateOrders]);

  return {
    addOrder,
    removeOrder,
    clearHistory,
  };
}
