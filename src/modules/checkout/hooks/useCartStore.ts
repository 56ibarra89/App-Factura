import { useCallback, useMemo, useState, useEffect } from "react";
import type { OrderItem, OrderItemInput } from "../../orders";
import type { SelectedExtra } from "../../catalog";
import { useTaxConfig } from "../../settings";
import { calculateCartTotals } from "../model/cartTotals";
import {
  useAutomaticPromotions,
  type AppliedPromotion,
} from "../../promotions";

const extrasKey = (extras: SelectedExtra[]) =>
  extras.map((e) => e.name).sort().join("|");

export function useCartStore() {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [manualPromotion, setPromotion] = useState<AppliedPromotion | null>(null);
  const { taxes, isExonerated } = useTaxConfig();
  const { activeHappyHour, active2x1 } = useAutomaticPromotions();

  useEffect(() => {
    setCart((prev) => {
      let changed = false;
      const newCart = prev.map(item => {

        if (item.note?.startsWith("Vale: ")) return item;

        const hasStructuredTargets = Boolean(
          active2x1?.productIds?.length || active2x1?.categoryIds?.length,
        );
        const matchesStructuredTarget = Boolean(
          (item.productId && active2x1?.productIds?.includes(item.productId)) ||
          (item.categoryId && active2x1?.categoryIds?.includes(item.categoryId)),
        );
        const matchesLegacyTarget = Boolean(
          active2x1 &&
            (!active2x1.appliesTo ||
              active2x1.appliesTo === "Todos" ||
              item.name === active2x1.appliesTo),
        );
        const appliesTwoForOne = Boolean(
          !manualPromotion &&
            active2x1 &&
            (hasStructuredTargets
              ? matchesStructuredTarget
              : matchesLegacyTarget),
        );

        if (appliesTwoForOne) {
          const expectedGift = Math.floor(item.quantity / 2);
          if (
            item.giftQuantity !== expectedGift ||
            item.giftReason !== "happy-hour-2x1"
          ) {
            changed = true;
            return {
              ...item,
              giftQuantity: expectedGift,
              giftReason: "happy-hour-2x1",
              note: item.note || "2x1 Happy Hour",
            };
          }
        } else if (
          item.giftReason === "happy-hour-2x1" ||
          item.note === "2x1 Happy Hour"
        ) {

          changed = true;
          return {
            ...item,
            giftQuantity: 0,
            giftReason: undefined,
            note: item.note === "2x1 Happy Hour" ? "" : item.note,
          };
        }

        return item;
      });
      return changed ? newCart : prev;
    });
  }, [active2x1, cart, manualPromotion]);

  const automaticPromotion: AppliedPromotion | null = activeHappyHour ??
    (active2x1
      ? {
          source: "happy-hour",
          id: active2x1.id,
          code: `AUTO-${active2x1.name.toUpperCase().replace(/\s+/g, "")}`,
          discountType: "2x1",
          discountValue: 0,
          productIds: active2x1.productIds,
          categoryIds: active2x1.categoryIds,
        }
      : null);
  const promotion = manualPromotion ?? automaticPromotion;

  const addItem = useCallback(
    (newItem: OrderItemInput) => {
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

