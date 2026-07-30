import { useState, useMemo, useCallback } from "react";
import {
  useOrderCommands,
  type Order,
  type OrderItem,
} from "../../orders";
import { useTaxConfig } from "../../settings";
import type {
  AppliedPromotion,
} from "../../promotions";
import {
  buildSupplementalCartItems,
  calculateCartTotals,
  extractCertificateSerials,
  type CheckoutFormValues,
} from "../../checkout";
import {
  receiptPrinter,
  type ReceiptPrinter,
} from "../../../shared/printing";

export function useMesaCheckout(
  restoreFocus: () => void,
  printer: ReceiptPrinter = receiptPrinter,
) {
  const { finalizeOrder, updateOrderItems } =
    useOrderCommands();
  const { taxes, isExonerated } = useTaxConfig();

  const [checkoutOrder, setCheckoutOrder] = useState<Order | null>(null);
  const [checkoutPromotion, setCheckoutPromotion] =
    useState<AppliedPromotion | null>(null);
  const [createdInvoiceNumber, setCreatedInvoiceNumber] = useState<string | undefined>(undefined);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const checkoutCart: OrderItem[] = useMemo(
    () => (checkoutOrder ? checkoutOrder.items : []),
    [checkoutOrder]
  );

  const {
    subTotal: checkoutSubTotal,
    taxAmount: checkoutTaxAmount,
    total: checkoutTotal,
    discountAmount: checkoutDiscountAmount,
  } = useMemo(
    () => calculateCartTotals(checkoutCart, taxes, isExonerated, checkoutPromotion),
    [checkoutCart, taxes, isExonerated, checkoutPromotion]
  );

  const openCheckoutPreview = useCallback((order: Order) => {
    setCheckoutOrder(order);
    setCreatedInvoiceNumber(undefined);
    setIsPreviewOpen(true);
  }, []);

  const closeCheckoutPreview = useCallback(() => {
    setIsPreviewOpen(false);
    setCheckoutOrder(null);
    setCheckoutPromotion(null);
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
      const totals = calculateCartTotals(
        items,
        taxes,
        isExonerated,
        checkoutPromotion,
      );

      if (supplementalItems.length > 0) {
        await updateOrderItems(
          checkoutOrder.id,
          items,
          totals.total,
          totals.subTotal,
          totals.taxAmount,
        );
      }

      const invoiceNumber = await finalizeOrder(checkoutOrder.id, {
        ...totals,
        paymentMethod: form.paymentMethod,
        splitAmounts: form.splitAmounts,
        customerName: form.customerName,
        orderType: form.orderType,
        customerAddress: form.customerAddress,
        promotionCode: checkoutPromotion?.code,
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
      taxes,
      updateOrderItems,
    ]
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
