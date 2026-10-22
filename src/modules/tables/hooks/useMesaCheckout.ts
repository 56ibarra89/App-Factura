import { useState, useMemo, useCallback } from "react";
import { useOrderCommands, type Order, type OrderItem } from "../../orders";
import { useTaxConfig } from "../../settings";
import type { AppliedPromotion } from "../../promotions";
import {
  buildSupplementalCartItems,
  buildOrderPromotionSelection,
  calculateCartTotals,
  extractCertificateSerials,
  type CheckoutFormValues,
} from "../../checkout";
import { receiptPrinter, type ReceiptPrinter } from "../../../shared/printing";

export function useMesaCheckout(
  restoreFocus: () => void,
  printer: ReceiptPrinter = receiptPrinter,
) {
  const { finalizeOrder, updateOrderItems } = useOrderCommands();
  const { taxes, isExonerated } = useTaxConfig();

  const [checkoutOrder, setCheckoutOrder] = useState<Order | null>(null);
  const [checkoutPromotion, setCheckoutPromotionState] =
    useState<AppliedPromotion | null>(null);
  const [promotionRemoved, setPromotionRemoved] = useState(false);
  const [createdInvoiceNumber, setCreatedInvoiceNumber] = useState<
    string | undefined
  >(undefined);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const setCheckoutPromotion = useCallback(
    (promotion: AppliedPromotion | null) => {
      setCheckoutPromotionState(promotion);
      setPromotionRemoved(promotion === null);
    },
    [],
  );

  const checkoutCart: OrderItem[] = useMemo(
    () => (checkoutOrder ? checkoutOrder.items : []),
    [checkoutOrder],
  );

  const {
    subTotal: checkoutSubTotal,
    taxAmount: checkoutTaxAmount,
    total: checkoutTotal,
    discountAmount: checkoutDiscountAmount,
  } = useMemo(
    () =>
      calculateCartTotals(
        checkoutCart,
        taxes,
        isExonerated,
        checkoutPromotion,
        !checkoutPromotion && !promotionRemoved
          ? checkoutOrder?.discountAmount
          : undefined,
      ),
    [
      checkoutCart,
      checkoutOrder,
      checkoutPromotion,
      isExonerated,
      promotionRemoved,
      taxes,
    ],
  );

  const openCheckoutPreview = useCallback((order: Order) => {
    setCheckoutOrder(order);
    setCheckoutPromotionState(null);
    setPromotionRemoved(false);
    setCreatedInvoiceNumber(undefined);
    setIsPreviewOpen(true);
  }, []);

  const closeCheckoutPreview = useCallback(() => {
    setIsPreviewOpen(false);
    setCheckoutOrder(null);
    setCheckoutPromotionState(null);
    setPromotionRemoved(false);
    setCreatedInvoiceNumber(undefined);
    restoreFocus();
  }, [restoreFocus]);

  const handleFinalConfirm = useCallback(
    async (form: CheckoutFormValues) => {
      if (!checkoutOrder) return;

      const supplementalItems = buildSupplementalCartItems(
        form.packagingItems,
        form.orderType === "delivery" ? form.deliveryCost : undefined,
      );
      const items = [...checkoutCart, ...supplementalItems];
      const preserveExistingPromotion =
        !checkoutPromotion &&
        !promotionRemoved &&
        Boolean(
          checkoutOrder.couponId ||
            checkoutOrder.discountId ||
            checkoutOrder.happyHourId ||
            checkoutOrder.promotionSource === "coupon" ||
            checkoutOrder.promotionSource === "discount" ||
            checkoutOrder.promotionSource === "happy-hour" ||
            items.some((item) => item.giftReason === "happy-hour-2x1"),
        );

      const totals = calculateCartTotals(
        items,
        taxes,
        isExonerated,
        checkoutPromotion,
        preserveExistingPromotion ? checkoutOrder.discountAmount : undefined,
      );

      const promotionSelection = preserveExistingPromotion
        ? {}
        : buildOrderPromotionSelection(checkoutPromotion);

      if (supplementalItems.length > 0) {
        await updateOrderItems(
          checkoutOrder.id,
          items,
          totals.total,
          totals.subTotal,
          totals.taxAmount,
          totals.discountAmount,
          promotionSelection,
        );
      }

      const invoiceNumber = await finalizeOrder(checkoutOrder.id, {
        ...totals,
        customerId: form.customerId,
        paymentMethod: form.paymentMethod,
        splitAmounts: form.splitAmounts,
        payments: form.payments,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        orderType: form.orderType,
        customerAddress: form.customerAddress,
        ...promotionSelection,
        certificateSerials: extractCertificateSerials(items),
      });

      if (!invoiceNumber) {
        throw new Error("El backend no devolvió un número de factura.");
      }
      setCreatedInvoiceNumber(invoiceNumber);

      await printer.print({
        renderDelayMs: 500,
        settleDelayMs: 500,
      });
      setIsPreviewOpen(false);
      setCheckoutOrder(null);
      restoreFocus();
    },
    [
      checkoutOrder,
      finalizeOrder,
      restoreFocus,
      checkoutCart,
      checkoutPromotion,
      isExonerated,
      printer,
      promotionRemoved,
      taxes,
      updateOrderItems,
    ],
  );

  return {
    checkoutOrder,
    checkoutPromotion,
    setCheckoutPromotion,
    createdInvoiceNumber,
    isPreviewOpen,
    checkoutCart,
    checkoutSubTotal,
    checkoutTaxAmount,
    checkoutTotal,
    checkoutDiscountAmount,
    openCheckoutPreview,
    closeCheckoutPreview,
    handleFinalConfirm,
  };
}
