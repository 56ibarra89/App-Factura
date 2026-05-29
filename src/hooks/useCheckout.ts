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
    async (orderId?: string, tableId?: string) => {
      const { total, subTotal, taxAmount } = calculateCartTotals(cart, taxes, isExonerated, promotion);

      if (orderId) {
        // Actualizar orden existente
        await updateOrderItems(orderId, cart, total, subTotal, taxAmount);
        return orderId;
      } else {
        // Crear nueva orden para la mesa
        const invoiceNumber = await addOrder(cart, total, undefined, "local", undefined, tableId, undefined, undefined, subTotal, taxAmount, discountAmount, promotion?.code);
        // Note: the order ID is created synchronously locally, we can get it from the last added order or just not rely on it immediately. But wait, addOrder creates it internally.
        // Let's just await it to ensure backend sync is done before proceeding.
        return invoiceNumber;
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
