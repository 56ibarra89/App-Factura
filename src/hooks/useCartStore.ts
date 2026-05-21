import { useCallback, useMemo, useState } from "react";
import { CartItemType } from "../types/cart";
import { SelectedExtra } from "../types/extras";
import { ProductSize } from "../types/product";
import { useImpuestosConfig } from "./useImpuestosConfig";
import { calculateCartTotals, AppliedPromotion } from "../utils/cartTotals";
import { useAutomaticPromotions } from "./useAutomaticPromotions";

/** Compara extras para determinar si dos items del carrito son iguales */
const extrasKey = (extras: SelectedExtra[]) =>
  extras.map((e) => e.name).sort().join("|");

export function useCartStore() {
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [manualPromotion, setPromotion] = useState<AppliedPromotion | null>(null);
  const { taxes, isExonerated } = useImpuestosConfig();
  const { activeHappyHour } = useAutomaticPromotions();

  const promotion = manualPromotion || activeHappyHour;

  const addItem = useCallback(
    (newItem: { name: string; price: number; size: ProductSize; extras: SelectedExtra[]; note?: string; giftQuantity?: number }) => {
      // Sanitización y Validación (ISO 27001)
      const sanitizedPrice = Math.max(0, newItem.price);
      const sanitizedNote = newItem.note ? newItem.note.substring(0, 200).replace(/[<>]/g, "") : "";

      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (item) =>
            item.name === newItem.name &&
            item.size === newItem.size &&
            extrasKey(item.extras) === extrasKey(newItem.extras) &&
            item.note === sanitizedNote &&
            !item.isSentToKitchen // No fusionar si ya se envió a cocina
        );

        if (existingIndex !== -1 && !newItem.giftQuantity) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + 1,
          };
          return updated;
        }

        const extrasTotal = newItem.extras.reduce((sum, e) => sum + Math.max(0, e.price), 0);
        return [
          ...prev,
          {
            ...newItem,
            price: sanitizedPrice + extrasTotal,
            note: sanitizedNote,
            quantity: Math.max(1, newItem.giftQuantity || 1),
            giftQuantity: newItem.giftQuantity || 0,
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
      if (!prev[index]) return prev;
      const updated = [...prev];
      // Limitar cantidad máxima por seguridad operativa
      const newQuantity = Math.max(1, Math.min(999, quantity));
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

  const { subTotal, discountAmount, taxAmount, total } = useMemo(
    () => calculateCartTotals(cart, taxes, isExonerated, promotion),
    [cart, taxes, isExonerated, promotion]
  );

  const applyPromotion = useCallback((promo: AppliedPromotion) => {
    setPromotion(promo);
  }, []);

  const removePromotion = useCallback(() => {
    setPromotion(null);
  }, []);

  return {
    cart,
    promotion,
    subTotal,
    discountAmount,
    taxAmount,
    total,
    addItem,
    removeItem,
    changeQuantity,
    changeGiftQuantity,
    clearCart,
    setCart,
    applyPromotion,
    removePromotion,
  };
}
