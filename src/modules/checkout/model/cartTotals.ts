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

export function calculateCartTotals(
  items: OrderItem[],
  taxes: TaxLike[] | undefined,
  isExonerated: boolean,
  promotion?: AppliedPromotion | null
): { subTotal: number; discountAmount: number; taxAmount: number; total: number } {
  const subTotal = calculateSubtotal(items);
  
  let discountAmount = 0;
  if (promotion) {
    if (promotion.discountType === "porcentaje") {
      // Calculate discountable subtotal by excluding packaging and delivery
      const discountableSubtotal = items.reduce((sum, item) => {
        const isPackaging = item.name.toLowerCase().startsWith('empaque');
        const isDelivery = item.name.toLowerCase() === 'delivery';
        if (isPackaging || isDelivery) return sum;
        
        const giftQty = item.giftQuantity || 0;
        const paidQty = Math.max(0, item.quantity - giftQty);
        return sum + item.price * paidQty;
      }, 0);
      
      discountAmount = discountableSubtotal * (promotion.discountValue / 100);
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
