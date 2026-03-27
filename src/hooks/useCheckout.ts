import { useCallback } from "react";
import { CartItemType } from "../types/cart";
import { SaleItem } from "../types/sales";

export function useCheckout(
  cart: CartItemType[],
  clearCart: () => void,
  addSale?: (item: SaleItem) => void,
  navigate?: (path: string) => void
) {
  const confirmFactura = useCallback(() => {
    cart.forEach((item) => addSale && addSale(item));
    clearCart();
    if (navigate) navigate("/home");
  }, [cart, addSale, navigate, clearCart]);

  return {
    confirmFactura,
  };
}
