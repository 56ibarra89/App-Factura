import { useState, useMemo, useCallback } from "react";
import { useOrderContext } from "../../context/OrderContext";
import { useImpuestosConfig } from "../../hooks/useImpuestosConfig";
import { calculateCartTotals } from "../../utils/cartTotals";
import { CartItemType } from "../../types/cart";
import { PaymentMethod, OrderType } from "../../types/order.types";
import { Order } from "../../types/order.types";
export function useMesaCheckout(restoreFocus: () => void) {
  const { finalizeOrder, updateOrderItems } = useOrderContext();
  const { taxes, isExonerated } = useImpuestosConfig();

  const [checkoutOrder, setCheckoutOrder] = useState<Order | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [checkoutPromotion, setCheckoutPromotion] = useState<any>(null);
  const [createdInvoiceNumber, setCreatedInvoiceNumber] = useState<string | undefined>(undefined);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const checkoutCart: CartItemType[] = useMemo(
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
    async (
      paymentMethod: PaymentMethod,
      splitAmounts?: { efectivo: number; tarjeta: number },
      customerName?: string,
      orderType?: OrderType,
      customerAddress?: string,
      packagingItems?: { name: string; price: number; quantity: number }[]
    ) => {
      if (!checkoutOrder) return;

      let finalCheckoutTotal = checkoutTotal;
      let finalCheckoutSubTotal = checkoutSubTotal;
      let finalCheckoutTaxAmount = checkoutTaxAmount;
      let finalCheckoutDiscountAmount = checkoutDiscountAmount;

      // Si hay empaques (llevar o delivery), debemos agregarlos a la orden antes de facturar
      if (packagingItems && packagingItems.length > 0) {
        const extraCartItems: CartItemType[] = packagingItems.map((pkg) => ({
          id: crypto.randomUUID(),
          name: `Empaque ${pkg.name}`,
          price: pkg.price,
          size: "único",
          quantity: pkg.quantity,
          extras: [],
        }));
        const fullCart = [...checkoutCart, ...extraCartItems];
        const newTotals = calculateCartTotals(fullCart, taxes, isExonerated, checkoutPromotion);
        finalCheckoutTotal = newTotals.total;
        finalCheckoutSubTotal = newTotals.subTotal;
        finalCheckoutTaxAmount = newTotals.taxAmount;
        finalCheckoutDiscountAmount = newTotals.discountAmount;

        await updateOrderItems(
          checkoutOrder.id,
          fullCart,
          finalCheckoutTotal,
          finalCheckoutSubTotal,
          finalCheckoutTaxAmount
        );
      }

      const invoiceNumber = await finalizeOrder(
        checkoutOrder.id,
        paymentMethod,
        splitAmounts,
        customerName,
        orderType,
        customerAddress,
        finalCheckoutTotal,
        finalCheckoutSubTotal,
        finalCheckoutTaxAmount,
        finalCheckoutDiscountAmount,
        checkoutPromotion?.code
      );

      setCreatedInvoiceNumber(invoiceNumber || "000001");

      setTimeout(() => {
        if (window.ipcRenderer) {
          window.ipcRenderer.send("print-silent");
          setTimeout(() => {
            setIsPreviewOpen(false);
            setCheckoutOrder(null);
            restoreFocus();
          }, 500);
        } else {
          window.print();
          setIsPreviewOpen(false);
          setCheckoutOrder(null);
          restoreFocus();
        }
      }, 500);
    },
    [
      checkoutOrder,
      finalizeOrder,
      checkoutTotal,
      restoreFocus,
      checkoutCart,
      checkoutDiscountAmount,
      checkoutPromotion,
      checkoutSubTotal,
      checkoutTaxAmount,
      isExonerated,
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
