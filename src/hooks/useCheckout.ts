// src/hooks/useCheckout.ts
import { useCallback } from "react";
import { CartItemType } from "../types/cart";
import { useOrderCommands } from "../context/OrderContext";
import { OrderType, PaymentMethod } from "../types/order.types";
import { useImpuestosConfig } from "./useImpuestosConfig";
import { calculateCartTotals } from "../utils/cartTotals";

export function useCheckout(
  cart: CartItemType[]
) {
  const { taxes, isExonerated } = useImpuestosConfig();
  const { addOrder, updateOrderItems, finalizeOrder, markAsSentToKitchen } =
    useOrderCommands();

  const confirmFactura = useCallback(
    (
      paymentMethod?: string,
      splitAmounts?: { efectivo: number; tarjeta: number },
      customerName?: string,
      orderType?: OrderType,
      customerAddress?: string
    ) => {
      const { total, subTotal, taxAmount } = calculateCartTotals(cart, taxes, isExonerated);

      // Crear y persistir la orden
      addOrder(
        cart,
        total,
        customerName,
        orderType,
        customerAddress,
        undefined,
        paymentMethod,
        splitAmounts,
        subTotal,
        taxAmount
      );
    },
    [cart, taxes, isExonerated, addOrder]
  );

  const saveTableOrder = useCallback(
    (orderId?: string, tableId?: string) => {
      const { total, subTotal, taxAmount } = calculateCartTotals(cart, taxes, isExonerated);

      if (orderId) {
        // Actualizar orden existente
        updateOrderItems(orderId, cart, total, subTotal, taxAmount);
      } else {
        // Crear nueva orden para la mesa
        addOrder(cart, total, undefined, "local", undefined, tableId, undefined, undefined, subTotal, taxAmount);
      }
    },
    [cart, taxes, isExonerated, addOrder, updateOrderItems]
  );

  const finalizeTableOrder = useCallback(
    (
      orderId: string,
      paymentMethod: PaymentMethod,
      splitAmounts?: { efectivo: number; tarjeta: number },
      customerName?: string,
      orderType?: OrderType,
      customerAddress?: string
    ) => {
      const { total, subTotal, taxAmount } = calculateCartTotals(cart, taxes, isExonerated);
      finalizeOrder(
        orderId,
        paymentMethod,
        splitAmounts,
        customerName,
        orderType,
        customerAddress,
        total,
        subTotal,
        taxAmount
      );
    },
    [cart, taxes, isExonerated, finalizeOrder]
  );

  return {
    confirmFactura,
    saveTableOrder,
    finalizeTableOrder,
    sendToKitchen: markAsSentToKitchen,
  };
}
