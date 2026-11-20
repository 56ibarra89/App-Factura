import {
  isDeliveryChargeOrderItem,
  isPackagingOrderItem,
  isSplitBillOrderItem,
  type OrderItem,
} from "../../orders";
import type {
  ActiveTwoForOnePromotion,
  AppliedPromotion,
} from "../../promotions";

export interface TaxLike {
  percentage: number;
}

function calculateSubtotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => {
    const giftQty = item.giftQuantity || 0;
    const paidQty = Math.max(0, item.quantity - giftQty);
    return sum + item.price * paidQty;
  }, 0);
}

function calculateTaxAmount(
  subTotal: number,
  taxes: TaxLike[] | undefined,
  isExonerated: boolean
): number {
  if (isExonerated) return 0;
  const activeTax = (taxes ?? []).reduce(
    (sum, tax) => sum + (Number(tax.percentage) || 0),
    0,
  );
  return subTotal * (activeTax / 100);
}

function isPromotionEligible(
  item: OrderItem,
  promotion: AppliedPromotion,
): boolean {
  const productIds = promotion.productIds ?? [];
  const categoryIds = promotion.categoryIds ?? [];

  if (productIds.length === 0 && categoryIds.length === 0) return true;

  return (
    (item.productId !== undefined && productIds.includes(item.productId)) ||
    (item.categoryId !== undefined && categoryIds.includes(item.categoryId))
  );
}

export function calculateCartTotals(
  items: OrderItem[],
  taxes: TaxLike[] | undefined,
  isExonerated: boolean,
  promotion?: AppliedPromotion | null,
  fallbackDiscountAmount?: number,
): { subTotal: number; discountAmount: number; taxAmount: number; total: number } {
  const subTotal = calculateSubtotal(items);

  let discountAmount = 0;
  if (promotion && promotion.discountType !== "2x1") {
    const discountableSubtotal = items.reduce((sum, item) => {
      const isPackaging = isPackagingOrderItem(item);
      const isDelivery = isDeliveryChargeOrderItem(item);
      if (
        isPackaging ||
        isDelivery ||
        isSplitBillOrderItem(item) ||
        !isPromotionEligible(item, promotion)
      ) {
        return sum;
      }

      const giftQty = item.giftQuantity || 0;
      const paidQty = Math.max(0, item.quantity - giftQty);
      return sum + item.price * paidQty;
    }, 0);

    if (promotion.discountType === "porcentaje") {
      discountAmount = discountableSubtotal * (promotion.discountValue / 100);
    } else {
      discountAmount = Math.min(
        promotion.discountValue,
        discountableSubtotal,
      );
    }
  } else if (
    !promotion &&
    typeof fallbackDiscountAmount === "number" &&
    fallbackDiscountAmount > 0
  ) {
    discountAmount = fallbackDiscountAmount;
  }

  discountAmount = Math.min(discountAmount, Math.max(0, subTotal));

  const subTotalAfterDiscount = Math.max(0, subTotal - discountAmount);
  const taxAmount = calculateTaxAmount(subTotalAfterDiscount, taxes, isExonerated);

  return { subTotal, discountAmount, taxAmount, total: Math.max(0, subTotalAfterDiscount + taxAmount) };
}

export function calculateDeliveryPromotionSubtotal(
  items: OrderItem[],
  promotion?: AppliedPromotion | null,
  fallbackDiscountAmount?: number,
): number {
  const products = items.filter((item) =>
    !isPackagingOrderItem(item) &&
    !isDeliveryChargeOrderItem(item) &&
    !isSplitBillOrderItem(item),
  );
  const totals = calculateCartTotals(products, [], true, promotion, fallbackDiscountAmount);
  return Math.max(0, totals.subTotal - totals.discountAmount);
}

export function matchesTwoForOneRule(
  item: OrderItem,
  rule: ActiveTwoForOnePromotion,
): boolean {
  if (
    item.note?.startsWith("Vale: ") ||
    isPackagingOrderItem(item) ||
    isDeliveryChargeOrderItem(item) ||
    isSplitBillOrderItem(item)
  ) {
    return false;
  }

  const hasStructuredTargets = Boolean(
    rule.productIds?.length || rule.categoryIds?.length,
  );
  if (hasStructuredTargets) {
    return Boolean(
      (item.productId !== undefined &&
        rule.productIds?.includes(item.productId)) ||
        (item.categoryId !== undefined &&
          rule.categoryIds?.includes(item.categoryId)),
    );
  }

  return Boolean(
    !rule.appliesTo || rule.appliesTo === "Todos" || item.name === rule.appliesTo,
  );
}

function toAppliedTwoForOnePromotion(
  rule: ActiveTwoForOnePromotion,
): AppliedPromotion {
  return {
    source: "happy-hour",
    id: rule.id,
    code: `AUTO-${rule.name.toUpperCase().replace(/\s+/g, "")}`,
    discountType: "2x1",
    discountValue: 0,
    productIds: rule.productIds,
    categoryIds: rule.categoryIds,
  };
}

export function resolveAutomaticHappyHourSelection(
  items: readonly OrderItem[],
  active2x1Rules: readonly ActiveTwoForOnePromotion[],
  activeDiscountHappyHours: readonly AppliedPromotion[],
): {
  twoForOneRule: ActiveTwoForOnePromotion | null;
  promotion: AppliedPromotion | null;
} {
  let best2x1Rule: ActiveTwoForOnePromotion | null = null;
  let best2x1Savings = 0;

  for (const rule of active2x1Rules) {
    const savings = items.reduce((sum, item) => {
      if (!matchesTwoForOneRule(item, rule)) return sum;
      return sum + Math.floor(item.quantity / 2) * item.price;
    }, 0);
    if (savings > best2x1Savings) {
      best2x1Savings = savings;
      best2x1Rule = rule;
    }
  }

  let bestDiscountPromo: AppliedPromotion | null = null;
  let bestDiscountSavings = 0;

  for (const promo of activeDiscountHappyHours) {
    const discountableSubtotal = items.reduce((sum, item) => {
      if (
        item.note?.startsWith("Vale: ") ||
        isPackagingOrderItem(item) ||
        isDeliveryChargeOrderItem(item) ||
        isSplitBillOrderItem(item) ||
        !isPromotionEligible(item, promo)
      ) {
        return sum;
      }
      const nonPromoGiftQty =
        item.giftReason === "happy-hour-2x1" ? 0 : item.giftQuantity || 0;
      const qty = Math.max(0, item.quantity - nonPromoGiftQty);
      return sum + item.price * qty;
    }, 0);

    const savings =
      promo.discountType === "porcentaje"
        ? discountableSubtotal * (promo.discountValue / 100)
        : Math.min(promo.discountValue, discountableSubtotal);

    if (savings > bestDiscountSavings) {
      bestDiscountSavings = savings;
      bestDiscountPromo = promo;
    }
  }

  if (best2x1Rule && best2x1Savings > 0 && best2x1Savings >= bestDiscountSavings) {
    return {
      twoForOneRule: best2x1Rule,
      promotion: toAppliedTwoForOnePromotion(best2x1Rule),
    };
  }

  if (bestDiscountPromo && bestDiscountSavings > 0) {
    return {
      twoForOneRule: null,
      promotion: bestDiscountPromo,
    };
  }

  if (activeDiscountHappyHours.length > 0) {
    return {
      twoForOneRule: null,
      promotion: activeDiscountHappyHours[0],
    };
  }

  if (active2x1Rules.length > 0) {
    return {
      twoForOneRule: active2x1Rules[0],
      promotion: toAppliedTwoForOnePromotion(active2x1Rules[0]),
    };
  }

  return { twoForOneRule: null, promotion: null };
}

