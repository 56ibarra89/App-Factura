import { useCallback } from "react";
import type { MutableRefObject } from "react";
import { orderMutations } from "../../model/orderDomain";
import type {
  OrderItemsGateway,
  OrderStatusGateway,
} from "../../api/ordersGateway";
import type { OrderCommands } from "../../model/order-context.types";
import type { Order } from "../../model/order.types";
import {
  shouldApplyOrderUpdateResponse,
  shouldRollbackOrderUpdate,
} from "../../model/orderCommandReconciliation";
import type { OrderStateUpdater } from "../useOrderStore";

interface UseOrderStatusCommandsOptions {
  ordersRef?: MutableRefObject<Order[]>;
  updateOrders(updater: OrderStateUpdater): void;
  statusGateway: OrderStatusGateway;
  itemsGateway: OrderItemsGateway;
}

export function useOrderStatusCommands({
  ordersRef,
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
      expectedUpdatedAt,
    ) => {
      const currentOrder = ordersRef?.current.find(
        (order) => order.id === orderId,
      );
      const shouldDefaultExpectedUpdatedAt =
        sentAt === undefined &&
        (status === "cancelled" || status === "paid");
      const resolvedExpectedUpdatedAt =
        expectedUpdatedAt ??
        (shouldDefaultExpectedUpdatedAt
          ? currentOrder?.updatedAt?.toISOString()
          : undefined);
      const serverOrder = await statusGateway.updateStatus({
        orderId,
        status,
        cancelReason,
        adminPin,
        sentAt,
        kitchenId,
        itemId,
        cancelReasonId,
        expectedUpdatedAt: resolvedExpectedUpdatedAt,
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
        if (!serverOrder?.updatedAt) {
          return result.orders;
        }
        return result.orders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                updatedAt: serverOrder.updatedAt ?? order.updatedAt,
              }
            : order,
        );
      });
    },
    [ordersRef, statusGateway, updateOrders],
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
        const optimisticOrder = modifiedOrder;
        try {
          const saved = await itemsGateway.updateItems(optimisticOrder);
          updateOrders((current) =>
            current.map((order) =>
              order.id === saved.id &&
              shouldApplyOrderUpdateResponse(order, optimisticOrder, saved)
                ? saved
                : order,
            ),
          );
        } catch (error) {
          if (previousOrder) {
            const snapshot = previousOrder;
            updateOrders((current) =>
              current.map((order) =>
                order.id === snapshot.id &&
                shouldRollbackOrderUpdate(order, optimisticOrder)
                  ? snapshot
                  : order,
              ),
            );
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
      const optimisticOrder = modifiedOrder;

      try {
        const updatedOrder = await itemsGateway.updateItems(optimisticOrder);
        if (updatedOrder.items) {
          updateOrders((current) =>
            current.map((order) =>
              order.id === optimisticOrder.id &&
              shouldApplyOrderUpdateResponse(
                order,
                optimisticOrder,
                updatedOrder,
              )
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
              order.id === snapshot.id &&
              shouldRollbackOrderUpdate(order, optimisticOrder)
                ? snapshot
                : order,
            ),
          );
        }
        console.error("Error marking table order for kitchen", error);
        throw error;
      }

      return optimisticOrder.items;
    },
    [itemsGateway, updateOrders],
  );

  return {
    updateOrderStatus,
    markAsSentToKitchen,
    markAsSentToKitchenByTable,
  };
}
