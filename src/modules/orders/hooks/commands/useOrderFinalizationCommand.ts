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

const MAX_PAYMENT_ROUNDING_ADJUSTMENT = 1;

function reconcileFinalizationPayments(
  order: Order,
  targetTotal: number,
): Order["payments"] {
  const basePayments = order.payments?.length
    ? order.payments
    : order.paymentMethod === "MIXTO" && order.splitAmounts
      ? [
          {
            method: "EFECTIVO" as const,
            amount: order.splitAmounts.efectivo || 0,
          },
          {
            method: "TARJETA" as const,
            amount: order.splitAmounts.tarjeta || 0,
          },
          {
            method: "APP" as const,
            amount: order.splitAmounts.app || 0,
          },
        ].filter((p) => p.amount > 0)
      : undefined;

  if (!basePayments?.length) {
    return order.payments;
  }

  const currentSum = basePayments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  // Solo se reconcilian los pagos que cuadraban con el total calculado en el
  // cliente y cuya diferencia con el backend es de redondeo. Una diferencia
  // mayor significa que el cajero cobró otro monto: no se altera el pago
  // registrado y el backend rechazará la finalización con un mensaje claro.
  if (Math.abs(currentSum - order.total) >= 0.01) {
    return basePayments;
  }

  const delta = Number((targetTotal - currentSum).toFixed(2));
  if (
    Math.abs(delta) < 0.01 ||
    Math.abs(delta) > MAX_PAYMENT_ROUNDING_ADJUSTMENT
  ) {
    return basePayments;
  }

  const adjustIndex = [...basePayments]
    .map((payment, index) => ({ payment, index }))
    .reverse()
    .find(({ payment }) => payment.amount + delta > 0)?.index;

  if (adjustIndex === undefined) {
    return basePayments;
  }

  return basePayments.map((payment, index) =>
    index === adjustIndex
      ? {
          ...payment,
          amount: Number((payment.amount + delta).toFixed(2)),
        }
      : payment,
  );
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
        const resolvedTotal = updatedOrder.total ?? modifiedOrder.total;
        const orderToFinalize: Order = {
          ...modifiedOrder,
          subTotal: updatedOrder.subTotal ?? modifiedOrder.subTotal,
          discountAmount:
            updatedOrder.discountAmount ?? modifiedOrder.discountAmount,
          taxAmount: updatedOrder.taxAmount ?? modifiedOrder.taxAmount,
          total: resolvedTotal,
          payments: reconcileFinalizationPayments(
            modifiedOrder,
            resolvedTotal,
          ),
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
                  subTotal: orderToFinalize.subTotal,
                  discountAmount: orderToFinalize.discountAmount,
                  taxAmount: orderToFinalize.taxAmount,
                  total: orderToFinalize.total,
                  payments: orderToFinalize.payments,
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

  const splitCheckoutOrder = useCallback<
    OrderCommands["splitCheckoutOrder"]
  >(
    async (parentOrderId, command) => {
      if (!finalizationGateway.splitCheckout) {
        return finalizeOrder(parentOrderId, command);
      }

      const result = await finalizationGateway.splitCheckout(
        parentOrderId,
        command,
      );

      updateOrders((current) => {
        const updatedList = current.map((order) =>
          order.id === result.parentOrder.id
            ? result.parentOrder
            : order.id === result.paidOrder.id
              ? result.paidOrder
              : order,
        );
        const hasPaidOrder = updatedList.some(
          (order) => order.id === result.paidOrder.id,
        );
        return hasPaidOrder
          ? updatedList
          : [result.paidOrder, ...updatedList];
      });

      return result.paidOrder.invoiceNumber;
    },
    [finalizationGateway, finalizeOrder, updateOrders],
  );

  return { finalizeOrder, splitCheckoutOrder };
}
