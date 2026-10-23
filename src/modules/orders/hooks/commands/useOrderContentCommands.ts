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
      discountAmount,
      promotion,
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
          if (typeof discountAmount === "number") {
            result.modified.discountAmount = discountAmount;
          }
          if (promotion && promotion.promotionSource !== undefined) {
            result.modified.promotionSource = promotion.promotionSource;
            result.modified.promotionCode = promotion.promotionCode;
            result.modified.couponId = promotion.couponId;
            result.modified.discountId = promotion.discountId;
            result.modified.happyHourId = promotion.happyHourId;
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
                  total: updatedOrder.total ?? order.total,
                  subTotal: updatedOrder.subTotal ?? order.subTotal,
                  discountAmount:
                    updatedOrder.discountAmount ?? order.discountAmount,
                  taxAmount: updatedOrder.taxAmount ?? order.taxAmount,
                  promotionSource:
                    updatedOrder.promotionSource ?? order.promotionSource,
                  promotionCode:
                    updatedOrder.promotionCode ??
                    ((updatedOrder.promotionSource ?? order.promotionSource) ===
                    "coupon"
                      ? order.promotionCode
                      : undefined),
                  couponId:
                    updatedOrder.promotionSource !== undefined
                      ? updatedOrder.couponId
                      : (updatedOrder.couponId ?? order.couponId),
                  discountId:
                    updatedOrder.promotionSource !== undefined
                      ? updatedOrder.discountId
                      : (updatedOrder.discountId ?? order.discountId),
                  happyHourId:
                    updatedOrder.promotionSource !== undefined
                      ? updatedOrder.happyHourId
                      : (updatedOrder.happyHourId ?? order.happyHourId),
                  certificateSerials:
                    updatedOrder.certificateSerials ?? order.certificateSerials,
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
