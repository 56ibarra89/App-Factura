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

  const confirmFactura = useCallback(() => {
    // Calcular total
    const total = cart.reduce((acc, item) => acc + item.price * (item.quantity - (item.giftQuantity || 0)), 0);
    
    // Crear orden
    addOrder(cart, total);

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
