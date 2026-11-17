import { useCallback } from "react";
import { ApiClientError } from "../../../../shared/api";
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
import {
  shouldApplyOrderUpdateResponse,
  shouldRollbackOrderUpdate,
} from "../../model/orderCommandReconciliation";
import type { OrderStateUpdater } from "../useOrderStore";

interface UseOrderFinalizationCommandOptions {
  ordersRef: MutableRefObject<Order[]>;
  updateOrders(updater: OrderStateUpdater): void;
  itemsGateway: OrderItemsGateway;
  finalizationGateway: OrderFinalizationGateway;
}

const MAX_PAYMENT_ROUNDING_ADJUSTMENT = 0.01;

function reconcileFinalizationPayments(
  order: Order,
  targetTotal: number,
): Order["payments"] {
  const basePayments: Order["payments"] = order.payments?.length
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

  // Solo se reconcilian diferencias de hasta 1 centavo por redondeo en pagos
  // en efectivo (moneda local). Nunca se alteran montos de tarjeta, transferencia
  // o moneda extranjera ni se desincroniza originalAmount respecto a amount.
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
    .find(
      ({ payment }) =>
        payment.method === "EFECTIVO" &&
        (!payment.currency || payment.currency === "NIO") &&
        payment.amount + delta > 0,
    )?.index;

  if (adjustIndex === undefined) {
    return basePayments;
  }

  return basePayments.map((payment, index) => {
    if (index !== adjustIndex) return payment;
    const adjustedAmount = Number((payment.amount + delta).toFixed(2));
    return {
      ...payment,
      amount: adjustedAmount,
      ...(payment.originalAmount !== undefined
        ? { originalAmount: adjustedAmount }
        : {}),
    };
  });
}

export function useOrderFinalizationCommand({
  ordersRef,
  updateOrders,
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
      const optimisticOrder = modifiedOrder;
      try {
        const resolvedTotal = optimisticOrder.total;
        const resolvedExpectedUpdatedAt = command.expectedUpdatedAt
          ? new Date(command.expectedUpdatedAt)
          : (originalOrder?.updatedAt ?? optimisticOrder.updatedAt);
        const orderToFinalize: Order = {
          ...optimisticOrder,
          updatedAt: resolvedExpectedUpdatedAt,
          payments: reconcileFinalizationPayments(
            optimisticOrder,
            resolvedTotal,
          ),
        };
        const finalizedOrder =
          await finalizationGateway.finalize(
            orderToFinalize,
          );
        updateOrders((current) =>
          current.map((order) =>
            order.id === optimisticOrder.id
              ? {
                  ...order,
                  status: "paid",
                  updatedAt: finalizedOrder.updatedAt ?? order.updatedAt,
                  paidAt: finalizedOrder.paidAt ?? order.paidAt,
                  subTotal:
                    finalizedOrder.subTotal ?? orderToFinalize.subTotal,
                  discountAmount:
                    finalizedOrder.discountAmount ??
                    orderToFinalize.discountAmount,
                  taxAmount:
                    finalizedOrder.taxAmount ?? orderToFinalize.taxAmount,
                  total: finalizedOrder.total ?? orderToFinalize.total,
                  payments:
                    finalizedOrder.payments ?? orderToFinalize.payments,
                  items: finalizedOrder.items?.length
                    ? finalizedOrder.items
                    : order.items,
                  linkedTables:
                    finalizedOrder.linkedTables !== undefined
                      ? finalizedOrder.linkedTables
                      : order.linkedTables,
                  tableId: finalizedOrder.tableId,
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
              order.id === orderId &&
              shouldRollbackOrderUpdate(order, optimisticOrder)
                ? originalOrder
                : order,
            ),
          );
        }
        if (error instanceof ApiClientError && error.status === 409 && finalizationGateway.getById) {
          try {
            const refreshed = await finalizationGateway.getById(orderId);
            updateOrders((current) => current.map((order) =>
              order.id === orderId
                ? refreshed : order,
            ));
          } catch (refreshError) {
            console.error("No se pudo actualizar la orden tras el conflicto de cobro", refreshError);
          }
        }
        throw error;
      }
    },
    [
      finalizationGateway,
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
      const initialParent = ordersRef.current.find((order) => order.id === parentOrderId);

      let result: Awaited<ReturnType<NonNullable<OrderFinalizationGateway["splitCheckout"]>>>;
      try {
        result = await finalizationGateway.splitCheckout(parentOrderId, {
          ...command,
          expectedUpdatedAt:
            command.expectedUpdatedAt ?? initialParent?.updatedAt?.toISOString(),
        });
      } catch (error) {
        if (error instanceof ApiClientError && error.status === 409 && finalizationGateway.getById) {
          try {
            const refreshed = await finalizationGateway.getById(parentOrderId);
            updateOrders((current) => current.map((order) =>
              order.id === parentOrderId
                ? refreshed : order,
            ));
          } catch (refreshError) {
            console.error("No se pudo actualizar la mesa tras el conflicto de división", refreshError);
          }
        }
        throw error;
      }

      updateOrders((current) => {
        const updatedList = current.map((order) =>
          order.id === result.parentOrder.id &&
          (!initialParent ||
            shouldApplyOrderUpdateResponse(
              order,
              initialParent,
              result.parentOrder,
            ))
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
    [finalizationGateway, finalizeOrder, ordersRef, updateOrders],
  );

  return { finalizeOrder, splitCheckoutOrder };
}
