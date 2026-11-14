import { useCallback, useMemo, useState, useEffect } from "react";
import type { Order, OrderItem, OrderItemInput } from "../../orders";
import type { SelectedExtra } from "../../catalog";
import {
  useTaxConfig,
  type KitchenModifierSelection,
} from "../../settings";
import {
  calculateCartTotals,
  matchesTwoForOneRule,
  resolveAutomaticHappyHourSelection,
} from "../model/cartTotals";
import {
  useAutomaticPromotions,
  useOrderPromotionRehydration,
  type AppliedPromotion,
} from "../../promotions";

const extrasKey = (extras: SelectedExtra[]) =>
  extras
    .map((e) => e.name)
    .sort()
    .join("|");

const modifiersKey = (modifiers?: KitchenModifierSelection[]) =>
  (modifiers ?? [])
    .map((modifier) => modifier.id)
    .sort()
    .join("|");

const comboSelectionsKey = (item: OrderItemInput | OrderItem) =>
  JSON.stringify(item.comboSelections ?? []);

export function useCartStore(activeOrder?: Order | null) {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [manualPromotion, setPromotion] = useState<AppliedPromotion | null>(
    null,
  );
  const [promotionRemoved, setPromotionRemoved] = useState(false);
  const [promotionChanged, setPromotionChanged] = useState(false);
  const { taxes, isExonerated } = useTaxConfig();
  const {
    activeDiscountHappyHours,
    active2x1Rules,
    happyHours,
  } = useAutomaticPromotions();
  const rehydratedOrderPromotion = useOrderPromotionRehydration(
    activeOrder,
    happyHours,
  );

  const hasExistingOrderPromotion = Boolean(
    activeOrder &&
      (activeOrder.couponId ||
        activeOrder.discountId ||
        activeOrder.happyHourId ||
        activeOrder.promotionSource === "coupon" ||
        activeOrder.promotionSource === "discount" ||
        activeOrder.promotionSource === "happy-hour" ||
        activeOrder.items.some((item) => item.giftReason === "happy-hour-2x1")),
  );
  const preserveExistingTwoForOne = Boolean(
    !promotionRemoved &&
      !promotionChanged &&
      !manualPromotion &&
      rehydratedOrderPromotion?.discountType === "2x1",
  );
  const preserved2x1Rule = useMemo(
    () =>
      preserveExistingTwoForOne
        ? (active2x1Rules.find((rule) => rule.id === activeOrder?.happyHourId) ??
          null)
        : null,
    [active2x1Rules, activeOrder?.happyHourId, preserveExistingTwoForOne],
  );
  const canAutoApplyTwoForOne = Boolean(
    !hasExistingOrderPromotion ||
      promotionChanged ||
      (preserveExistingTwoForOne &&
        (!activeOrder?.happyHourId || Boolean(preserved2x1Rule))),
  );

  const syncTwoForOneItems = useCallback(
    (items: OrderItem[]): OrderItem[] => {
      const target2x1 = preserveExistingTwoForOne
        ? preserved2x1Rule
        : resolveAutomaticHappyHourSelection(
            items,
            active2x1Rules,
            activeDiscountHappyHours,
          ).twoForOneRule;

      let changed = false;
      const newCart = items.map((item) => {
        if (item.note?.startsWith("Vale: ")) return item;

        const appliesTwoForOne = Boolean(
          !manualPromotion &&
            !promotionRemoved &&
            canAutoApplyTwoForOne &&
            target2x1 &&
            matchesTwoForOneRule(item, target2x1),
        );

        const expectedGift = Math.floor(item.quantity / 2);

        if (appliesTwoForOne && expectedGift > 0) {
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
          ((!item.isSentToKitchen && !preserveExistingTwoForOne) ||
            expectedGift === 0 ||
            promotionRemoved ||
            Boolean(manualPromotion)) &&
          (item.giftReason === "happy-hour-2x1" ||
            item.note === "2x1 Happy Hour")
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
      return changed ? newCart : items;
    },
    [
      active2x1Rules,
      activeDiscountHappyHours,
      canAutoApplyTwoForOne,
      manualPromotion,
      preserveExistingTwoForOne,
      preserved2x1Rule,
      promotionRemoved,
    ],
  );

  useEffect(() => {
    setCart((prev) => syncTwoForOneItems(prev));
  }, [syncTwoForOneItems, promotionChanged]);

  const automaticPromotion: AppliedPromotion | null = useMemo(() => {
    if (manualPromotion || promotionRemoved) return null;
    if (!promotionChanged && hasExistingOrderPromotion) return null;
    return resolveAutomaticHappyHourSelection(
      cart,
      active2x1Rules,
      activeDiscountHappyHours,
    ).promotion;
  }, [
    active2x1Rules,
    activeDiscountHappyHours,
    cart,
    hasExistingOrderPromotion,
    manualPromotion,
    promotionChanged,
    promotionRemoved,
  ]);
  const promotion = promotionRemoved
    ? null
    : (manualPromotion ??
      (!promotionChanged && hasExistingOrderPromotion
        ? rehydratedOrderPromotion
        : automaticPromotion));

  const addItem = useCallback(
    (newItem: OrderItemInput) => {
      // Sanitización y Validación (ISO 27001)
      const sanitizedPrice = Math.max(0, newItem.price);
      const sanitizedNote = newItem.note
        ? newItem.note.substring(0, 200).replace(/[<>]/g, "")
        : "";

      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (item) =>
            item.name === newItem.name &&
            item.size === newItem.size &&
            extrasKey(item.extras) === extrasKey(newItem.extras) &&
            modifiersKey(item.kitchenModifiers) ===
              modifiersKey(newItem.kitchenModifiers) &&
            comboSelectionsKey(item) === comboSelectionsKey(newItem) &&
            item.note === sanitizedNote &&
            !item.isSentToKitchen, // No fusionar si ya se envió a cocina
        );

        if (existingIndex !== -1 && !newItem.giftQuantity) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + 1,
          };
          return syncTwoForOneItems(updated);
        }

        const extrasTotal = newItem.extras.reduce(
          (sum, e) => sum + Math.max(0, e.price),
          0,
        );
        return syncTwoForOneItems([
          ...prev,
          {
            ...newItem,
            price: sanitizedPrice + extrasTotal,
            note: sanitizedNote,
            quantity: Math.max(1, newItem.giftQuantity || 1),
            giftQuantity: newItem.giftQuantity || 0,
          },
        ]);
      });
    },
    [syncTwoForOneItems],
  );

  const removeItem = useCallback(
    (index: number) => {
      setCart((prev) => {
        if (!prev[index]) return prev;
        const updated = [...prev];
        if (updated[index].quantity > 1) {
          const item = updated[index];
          const newQuantity = item.quantity - 1;
          if (item.giftReason === "happy-hour-2x1") {
            const nextGiftQuantity = Math.min(
              item.giftQuantity || 0,
              Math.floor(newQuantity / 2),
            );
            updated[index] = {
              ...item,
              quantity: newQuantity,
              giftQuantity: nextGiftQuantity,
              giftReason: nextGiftQuantity > 0 ? "happy-hour-2x1" : undefined,
              note:
                nextGiftQuantity === 0 && item.note === "2x1 Happy Hour"
                  ? ""
                  : item.note,
            };
            return syncTwoForOneItems(updated);
          }
          updated[index] = {
            ...item,
            quantity: newQuantity,
            giftQuantity: Math.min(newQuantity, item.giftQuantity || 0),
          };
          return syncTwoForOneItems(updated);
        }
        return syncTwoForOneItems(updated.filter((_, i) => i !== index));
      });
    },
    [syncTwoForOneItems],
  );

  const changeQuantity = useCallback(
    (index: number, quantity: number) => {
      setCart((prev) => {
        if (!prev[index]) return prev;
        const updated = [...prev];
        // Limitar cantidad máxima por seguridad operativa
        const newQuantity = Math.max(1, Math.min(999, quantity));
        const item = updated[index];
        if (item.giftReason === "happy-hour-2x1") {
          const nextGiftQuantity = Math.min(
            item.giftQuantity || 0,
            Math.floor(newQuantity / 2),
          );
          updated[index] = {
            ...item,
            quantity: newQuantity,
            giftQuantity: nextGiftQuantity,
            giftReason: nextGiftQuantity > 0 ? "happy-hour-2x1" : undefined,
            note:
              nextGiftQuantity === 0 && item.note === "2x1 Happy Hour"
                ? ""
                : item.note,
          };
          return syncTwoForOneItems(updated);
        }
        const currentGiftQuantity = item.giftQuantity || 0;
        updated[index] = {
          ...item,
          quantity: newQuantity,
          giftQuantity: Math.min(newQuantity, currentGiftQuantity),
        };
        return syncTwoForOneItems(updated);
      });
    },
    [syncTwoForOneItems],
  );

  const changeGiftQuantity = useCallback(
    (index: number, giftQuantity: number) => {
      setCart((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          giftQuantity: Math.max(
            0,
            Math.min(updated[index].quantity, giftQuantity),
          ),
        };
        return updated;
      });
    },
    [],
  );

  const changeKitchenInstructions = useCallback(
    (
      index: number,
      kitchenModifiers: KitchenModifierSelection[],
      note: string,
    ) => {
      setCart((prev) => {
        if (!prev[index]) return prev;
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          kitchenModifiers: kitchenModifiers.slice(0, 30),
          note: note.slice(0, 200).replace(/[<>]/g, ""),
        };
        return updated;
      });
    },
    [],
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setPromotion(null);
    setPromotionRemoved(false);
    setPromotionChanged(false);
  }, []);

  const replaceCart = useCallback(
    (items: OrderItem[]) => {
      setCart(syncTwoForOneItems(items));
    },
    [syncTwoForOneItems],
  );

  const preservedDiscountAmount =
    !promotion &&
    !promotionRemoved &&
    !promotionChanged &&
    hasExistingOrderPromotion &&
    typeof activeOrder?.discountAmount === "number"
      ? activeOrder.discountAmount
      : undefined;

  const { subTotal, discountAmount, taxAmount, total } = useMemo(
    () =>
      calculateCartTotals(
        cart,
        taxes,
        isExonerated,
        promotion,
        preservedDiscountAmount,
      ),
    [cart, taxes, isExonerated, promotion, preservedDiscountAmount],
  );

  const applyPromotion = useCallback((promo: AppliedPromotion) => {
    setPromotion(promo);
    setPromotionRemoved(false);
    setPromotionChanged(true);
  }, []);

  const removePromotion = useCallback(() => {
    setPromotion(null);
    setPromotionRemoved(true);
    setPromotionChanged(true);
  }, []);

  return {
    cart,
    promotion,
    promotionChanged,
    subTotal,
    discountAmount,
    taxAmount,
    total,
    addItem,
    removeItem,
    changeQuantity,
    changeGiftQuantity,
    changeKitchenInstructions,
    clearCart,
    setCart: replaceCart,
    applyPromotion,
    removePromotion,
  };
}
