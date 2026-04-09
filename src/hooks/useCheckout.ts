// src/hooks/useCheckout.ts
import { useCallback } from "react";
import { CartItemType } from "../types/cart";
import { useOrderContext } from "../context/OrderContext";
import { OrderType, PaymentMethod } from "../types/order.types";

export function useCheckout(
  cart: CartItemType[],
  clearCart: () => void,
  navigate?: (path: string) => void
) {
  const { addOrder, updateOrderItems, finalizeOrder } = useOrderContext();

  const confirmFactura = useCallback(
    (
      paymentMethod?: string,
      splitAmounts?: { efectivo: number; tarjeta: number },
      customerName?: string,
      orderType?: OrderType,
      customerAddress?: string
    ) => {
      // Calcular total descontando regalos
      const total = cart.reduce(
        (acc, item) =>
          acc + item.price * (item.quantity - (item.giftQuantity || 0)),
        0
      );

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
    [cart, navigate, clearCart, addOrder]
  );

  const saveTableOrder = useCallback(
    (orderId?: string, tableId?: string) => {
      const total = cart.reduce(
        (acc, item) =>
          acc + item.price * (item.quantity - (item.giftQuantity || 0)),
        0
      );

      if (orderId) {
        // Actualizar orden existente
        updateOrderItems(orderId, cart, total);
      } else {
        // Crear nueva orden para la mesa
        addOrder(cart, total, "Mesa", "local", undefined, tableId);
      }

      clearCart();
      if (navigate) navigate("/mesas");
    },
    [cart, addOrder, updateOrderItems, clearCart, navigate]
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
      finalizeOrder(
        orderId,
        paymentMethod,
        splitAmounts,
        customerName,
        orderType,
        customerAddress
      );
      clearCart();
      if (navigate) navigate("/mesas");
    },
    [finalizeOrder, clearCart, navigate]
  );

  return {
    confirmFactura,
    saveTableOrder,
    finalizeTableOrder,
  };
}
