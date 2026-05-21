import { CartItemType } from "../types/cart";

export interface TaxLike {
  percentage: number;
}

export interface AppliedPromotion {
  code: string;
  discountType: "porcentaje" | "monto_fijo";
  discountValue: number;
}

export function calculateSubtotal(items: CartItemType[]): number {
  return items.reduce((sum, item) => {
    const giftQty = item.giftQuantity || 0;
    const paidQty = Math.max(0, item.quantity - giftQty);
    return sum + item.price * paidQty;
  }, 0);
}

export function calculateTaxAmount(
  subTotal: number,
  taxes: TaxLike[] | undefined,
  isExonerated: boolean
): number {
  if (isExonerated) return 0;
  const activeTax = taxes?.[0]?.percentage ?? 0;
  return subTotal * (activeTax / 100);
}

export function calculateCartTotals(
  items: CartItemType[],
  taxes: TaxLike[] | undefined,
  isExonerated: boolean,
  promotion?: AppliedPromotion | null
): { subTotal: number; discountAmount: number; taxAmount: number; total: number } {
  const subTotal = calculateSubtotal(items);
  
  let discountAmount = 0;
  if (promotion) {
    if (promotion.discountType === "porcentaje") {
      discountAmount = subTotal * (promotion.discountValue / 100);
    } else {
      discountAmount = promotion.discountValue;
    }
  }
  
  // Ensure discount doesn't exceed subtotal
  discountAmount = Math.min(discountAmount, subTotal);
  
  const subTotalAfterDiscount = subTotal - discountAmount;
  const taxAmount = calculateTaxAmount(subTotalAfterDiscount, taxes, isExonerated);
  
  return { subTotal, discountAmount, taxAmount, total: subTotalAfterDiscount + taxAmount };
}
