// src/hooks/useCheckout.ts
import { useCallback } from "react";
import { CartItemType } from "../types/cart";
import { useOrderContext } from "../context/OrderContext";

export function useCheckout(
  cart: CartItemType[],
  clearCart: () => void,
  navigate?: (path: string) => void
) {
  const { addOrder } = useOrderContext();

  const confirmFactura = useCallback((paymentMethod?: string, splitAmounts?: { efectivo: number; tarjeta: number }) => {
    // Calcular total descontando regalos
    const total = cart.reduce((acc, item) => acc + item.price * (item.quantity - (item.giftQuantity || 0)), 0);

    // Crear y persistir la orden
    addOrder(cart, total, undefined, undefined, paymentMethod, splitAmounts);

    clearCart();

    // Navegar al inicio después de facturar
    if (navigate) navigate("/home");
  }, [cart, navigate, clearCart, addOrder]);

  return {
    confirmFactura,
  };
}
