import { useCallback } from "react";
import type { MutableRefObject } from "react";
import {
  orderMutations,
} from "../../model/orderDomain";
import type {
  OrderFinalizationGateway,
  OrderItemsGateway,
} from "../../api/ordersGateway";
import type { OrderCommands } from "../../model/order-context.types";
import type { Order } from "../../model/order.types";
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
        const updatedOrder = await itemsGateway.updateItems(modifiedOrder);
        const orderToFinalize: Order = {
          ...modifiedOrder,
          subTotal: updatedOrder.subTotal ?? modifiedOrder.subTotal,
          discountAmount:
            updatedOrder.discountAmount ?? modifiedOrder.discountAmount,
          taxAmount: updatedOrder.taxAmount ?? modifiedOrder.taxAmount,
          total: updatedOrder.total ?? modifiedOrder.total,
          payments:
            modifiedOrder.payments?.length === 1 &&
            Math.abs(modifiedOrder.payments[0].amount - modifiedOrder.total) <
              0.01
              ? [
                  {
                    ...modifiedOrder.payments[0],
                    amount: updatedOrder.total ?? modifiedOrder.total,
                  },
                ]
              : modifiedOrder.payments,
        };
        const finalizedOrder =
          await finalizationGateway.finalize(
            orderToFinalize,
          );
        updateOrders((current) =>
          current.map((order) =>
            order.id === modifiedOrder?.id
              ? {
                  ...order,
                  status: "paid",
                  paidAt: finalizedOrder.paidAt ?? order.paidAt,
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
