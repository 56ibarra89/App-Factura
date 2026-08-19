import type { OrderItem } from "../../orders";
import type { AppliedPromotion } from "../../promotions";

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
  const activeTax = taxes?.[0]?.percentage ?? 0;
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
  promotion?: AppliedPromotion | null
): { subTotal: number; discountAmount: number; taxAmount: number; total: number } {
  const subTotal = calculateSubtotal(items);

  let discountAmount = 0;
  if (promotion && promotion.discountType !== "2x1") {
    const discountableSubtotal = items.reduce((sum, item) => {
      const isPackaging = item.name.toLowerCase().startsWith("empaque");
      const isDelivery = item.name.toLowerCase() === "delivery";
      if (
        isPackaging ||
        isDelivery ||
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
  }

  discountAmount = Math.min(discountAmount, subTotal);

  const subTotalAfterDiscount = subTotal - discountAmount;
  const taxAmount = calculateTaxAmount(subTotalAfterDiscount, taxes, isExonerated);

  return { subTotal, discountAmount, taxAmount, total: subTotalAfterDiscount + taxAmount };
}

