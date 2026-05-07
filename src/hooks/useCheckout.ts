// src/hooks/useCheckout.ts
import { useCallback } from "react";
import { CartItemType } from "../types/cart";
import { useOrderCommands } from "../context/OrderContext";
import { OrderType, PaymentMethod } from "../types/order.types";
import { useImpuestosConfig } from "./useImpuestosConfig";
import { calculateCartTotals } from "../utils/cartTotals";

export function useCheckout(
  cart: CartItemType[],
  clearCart: () => void,
  navigate?: (path: string) => void
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
      const { total } = calculateCartTotals(cart, taxes, isExonerated);

      // Crear y persistir la orden
      addOrder(
        cart,
        total,
        customerName,
        orderType,
        customerAddress,
        undefined,
        paymentMethod,
        splitAmounts
      );

      clearCart();

      // Navegar al inicio después de facturar
      if (navigate) navigate("/home");
    },
    [cart, taxes, isExonerated, navigate, clearCart, addOrder]
  );

  const saveTableOrder = useCallback(
    (orderId?: string, tableId?: string) => {
      const { total } = calculateCartTotals(cart, taxes, isExonerated);

      if (orderId) {
        // Actualizar orden existente
        updateOrderItems(orderId, cart, total);
      } else {
        // Crear nueva orden para la mesa
        addOrder(cart, total, undefined, "local", undefined, tableId);
      }

      clearCart();
      if (navigate) navigate("/mesas");
    },
    [cart, taxes, isExonerated, addOrder, updateOrderItems, clearCart, navigate]
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
      const { total } = calculateCartTotals(cart, taxes, isExonerated);
      finalizeOrder(
        orderId,
        paymentMethod,
        splitAmounts,
        customerName,
        orderType,
        customerAddress,
        total
      );
      clearCart();
      if (navigate) navigate("/mesas");
    },
    [cart, taxes, isExonerated, finalizeOrder, clearCart, navigate]
  );

  return {
    confirmFactura,
    saveTableOrder,
    finalizeTableOrder,
    sendToKitchen: markAsSentToKitchen,
  };
}
