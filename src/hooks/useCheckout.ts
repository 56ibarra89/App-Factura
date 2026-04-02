import { useCallback } from "react";
import { CartItemType } from "../types/cart";
import { SaleItem } from "../types/sales";
import { useOrderContext } from "../context/OrderContext";

export function useCheckout(
  cart: CartItemType[],
  clearCart: () => void,
  addSale?: (item: SaleItem) => void,
  navigate?: (path: string) => void
) {
  const { addOrder } = useOrderContext();

  const confirmFactura = useCallback((paymentMethod?: string, splitAmounts?: { efectivo: number; tarjeta: number }) => {
    // Calcular total
    const total = cart.reduce((acc, item) => acc + item.price * (item.quantity - (item.giftQuantity || 0)), 0);
    
    // Crear orden (sin tabla ni cliente para venta directa en módulo de facturación)
    addOrder(cart, total, undefined, undefined, paymentMethod, splitAmounts);

    // Registrar ventas individuales (compatibilidad con lógica existente)
    cart.forEach((item) => addSale && addSale(item));
    
    clearCart();
    
    // Navegar al inicio después de facturar
    if (navigate) navigate("/home");
  }, [cart, addSale, navigate, clearCart, addOrder]);

  return {
    confirmFactura,
  };
}
