import { useCallback, useMemo, useState } from "react";
import { CartItemType } from "../types/cart";
import { SelectedExtra } from "../types/extras";
import { ProductSize } from "../types/product";

/** Compara extras para determinar si dos items del carrito son iguales */
const extrasKey = (extras: SelectedExtra[]) =>
  extras.map((e) => e.name).sort().join("|");

export function useCartStore() {
  const [cart, setCart] = useState<CartItemType[]>([]);

  const addItem = useCallback(
    (newItem: { name: string; price: number; size: ProductSize; extras: SelectedExtra[]; note?: string }) => {
      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (item) =>
            item.name === newItem.name &&
            item.size === newItem.size &&
            extrasKey(item.extras) === extrasKey(newItem.extras) &&
            item.note === newItem.note
        );

        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + 1,
          };
          return updated;
        }

        const extrasTotal = newItem.extras.reduce((sum, e) => sum + e.price, 0);
        return [
          ...prev,
          {
            ...newItem,
            price: newItem.price + extrasTotal,
            quantity: 1,
          },
        ];
      });
    },
    []
  );

  const removeItem = useCallback((index: number) => {
    setCart((prev) => {
      const updated = [...prev];
      if (updated[index].quantity > 1) {
        updated[index].quantity -= 1;
        return updated;
      }
      return updated.filter((_, i) => i !== index);
    });
  }, []);

  const changeQuantity = useCallback((index: number, quantity: number) => {
    setCart((prev) => {
      const updated = [...prev];
      const newQuantity = Math.max(1, quantity);
      const currentGiftQuantity = updated[index].giftQuantity || 0;
      updated[index] = {
        ...updated[index],
        quantity: newQuantity,
        giftQuantity: Math.min(newQuantity, currentGiftQuantity),
      };
      return updated;
    });
  }, []);

  const changeGiftQuantity = useCallback((index: number, giftQuantity: number) => {
    setCart((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        giftQuantity: Math.max(0, Math.min(updated[index].quantity, giftQuantity)),
      };
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const total = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const giftQty = item.giftQuantity || 0;
        const paidQty = Math.max(0, item.quantity - giftQty);
        return sum + item.price * paidQty;
      }, 0),
    [cart]
  );

  return {
    cart,
    total,
    addItem,
    removeItem,
    changeQuantity,
    changeGiftQuantity,
    clearCart,
    setCart,
  };
}
