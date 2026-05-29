// src/hooks/useCheckout.ts
import { useCallback } from "react";
import { CartItemType } from "../types/cart";
import { useOrderCommands } from "../context/OrderContext";
import { OrderType, PaymentMethod } from "../types/order.types";
import { useImpuestosConfig } from "./useImpuestosConfig";
import { calculateCartTotals, AppliedPromotion } from "../utils/cartTotals";

export function useCheckout(
  cart: CartItemType[],
  promotion: AppliedPromotion | null,
  discountAmount: number
) {
  const { taxes, isExonerated } = useImpuestosConfig();
  const { addOrder, updateOrderItems, finalizeOrder, markAsSentToKitchen } =
    useOrderCommands();

  const confirmFactura = useCallback(
    async (
      paymentMethod?: string,
      splitAmounts?: { efectivo: number; tarjeta: number },
      customerName?: string,
      orderType?: OrderType,
      customerAddress?: string
    ) => {
      const { total, subTotal, taxAmount } = calculateCartTotals(cart, taxes, isExonerated, promotion);

      // Crear y persistir la orden
      const invoiceNumber = await addOrder(
        cart,
        total,
        customerName,
        orderType,
        customerAddress,
        undefined,
        paymentMethod,
        splitAmounts,
        subTotal,
        taxAmount,
        discountAmount,
        promotion?.code
      );
      return invoiceNumber;
    },
    [cart, taxes, isExonerated, promotion, discountAmount, addOrder]
  );

  const saveTableOrder = useCallback(
    (orderId?: string, tableId?: string) => {
      const { total, subTotal, taxAmount } = calculateCartTotals(cart, taxes, isExonerated, promotion);

      if (orderId) {
        // Actualizar orden existente
        updateOrderItems(orderId, cart, total, subTotal, taxAmount);
      } else {
        // Crear nueva orden para la mesa
        addOrder(cart, total, undefined, "local", undefined, tableId, undefined, undefined, subTotal, taxAmount, discountAmount, promotion?.code);
      }
    },
    [cart, taxes, isExonerated, promotion, discountAmount, addOrder, updateOrderItems]
  );

  const finalizeTableOrder = useCallback(
    async (
      orderId: string,
      paymentMethod: PaymentMethod,
      splitAmounts?: { efectivo: number; tarjeta: number },
      customerName?: string,
      orderType?: OrderType,
      customerAddress?: string
    ) => {
      const { total, subTotal, taxAmount } = calculateCartTotals(cart, taxes, isExonerated, promotion);
      const invoiceNumber = await finalizeOrder(
        orderId,
        paymentMethod,
        splitAmounts,
        customerName,
        orderType,
        customerAddress,
        total,
        subTotal,
        taxAmount,
        discountAmount,
        promotion?.code
      );
      return invoiceNumber;
    },
    [cart, taxes, isExonerated, promotion, discountAmount, finalizeOrder]
  );

  return {
    confirmFactura,
    saveTableOrder,
    finalizeTableOrder,
    sendToKitchen: markAsSentToKitchen,
  };
}
