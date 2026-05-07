import { CartItemType } from "../types/cart";

export interface TaxLike {
  percentage: number;
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
  isExonerated: boolean
): { subTotal: number; taxAmount: number; total: number } {
  const subTotal = calculateSubtotal(items);
  const taxAmount = calculateTaxAmount(subTotal, taxes, isExonerated);
  return { subTotal, taxAmount, total: subTotal + taxAmount };
}
