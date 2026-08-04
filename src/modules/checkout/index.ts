export {
  checkoutGateway,
} from "./api/checkoutGateway";
export type {
  CheckoutGateway,
  DeliveryDriverOptions,
  DeliveryDriverStats,
} from "./api/checkoutGateway";
export { useCheckout } from "./hooks/useCheckout";
export { default as useCart } from "./hooks/useCart";
export { useProductSelection } from "./hooks/useProductSelection";
export { calculateCartTotals } from "./model/cartTotals";
export {
  buildOrderPromotionSelection,
  buildSupplementalCartItems,
  extractCertificateSerials,
} from "./model/checkoutDomain";
export type {
  CheckoutFormValues,
  PackagingItem,
} from "./model/checkout.types";
export type {
  SplitBillCheckoutSelection,
  SplitBillMode,
} from "./model/splitBill.types";
export { default as FacturaPreviewDialog } from "./ui/FacturaPreviewDialog";
export { default as SplitBillDialog } from "./ui/split-bill/SplitBillDialog";

type CheckoutPageModule = typeof import("./pages/CheckoutPage");

let checkoutPagePromise: Promise<CheckoutPageModule> | undefined;

export function preloadCheckoutPage(): Promise<CheckoutPageModule> {
  checkoutPagePromise ??= import("./pages/CheckoutPage").catch((error) => {
    checkoutPagePromise = undefined;
    throw error;
  });
  return checkoutPagePromise;
}
