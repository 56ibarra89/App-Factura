import { useState, useMemo, useCallback, useRef } from "react";
import { useOrderCommands, type Order, type OrderItem } from "../../orders";
import { useTaxConfig } from "../../settings";
import {
  useOrderPromotionRehydration,
  type AppliedPromotion,
} from "../../promotions";
import {
  buildSupplementalCartItems,
  buildOrderPromotionSelection,
  calculateCartTotals,
  extractCertificateSerials,
  type CheckoutFormValues,
  type SplitBillCheckoutSelection,
} from "../../checkout";
import { receiptPrinter, type ReceiptPrinter } from "../../../shared/printing";
import { printerDispatcherService } from "../../devices";

interface PendingMesaPrint {
  orderId: string;
  splitAccountId: string | null;
  invoiceNumber: string;
  isCash: boolean;
  printed: boolean;
}

export function useMesaCheckout(
  restoreFocus: () => void,
  printer: ReceiptPrinter = receiptPrinter,
) {
  const { finalizeOrder, updateOrderItems, splitCheckoutOrder } =
    useOrderCommands();
  const { taxes, isExonerated } = useTaxConfig();
  const pendingPrintRef = useRef<PendingMesaPrint | null>(null);

  const [checkoutOrder, setCheckoutOrder] = useState<Order | null>(null);
  const [isSubAccountCheckout, setIsSubAccountCheckout] = useState(false);
  const [splitSelection, setSplitSelection] =
    useState<SplitBillCheckoutSelection | null>(null);
  const [parentOrderId, setParentOrderId] = useState<string | null>(null);
  const [completedSplitCheckout, setCompletedSplitCheckout] = useState<{
    parentOrderId: string;
    selection: SplitBillCheckoutSelection;
  } | null>(null);
  const [checkoutPromotionState, setCheckoutPromotionState] =
    useState<AppliedPromotion | null>(null);
  const [promotionRemoved, setPromotionRemoved] = useState(false);
  const [createdInvoiceNumber, setCreatedInvoiceNumber] = useState<
    string | undefined
  >(undefined);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const rehydratedPromotion = useOrderPromotionRehydration(checkoutOrder);
  const checkoutPromotion = promotionRemoved
    ? null
    : (checkoutPromotionState ??
        (isSubAccountCheckout &&
        typeof checkoutOrder?.discountAmount === "number"
          ? null
          : rehydratedPromotion));

  const setCheckoutPromotion = useCallback(
    (promotion: AppliedPromotion | null) => {
      setCheckoutPromotionState(promotion);
      setPromotionRemoved(promotion === null);
    },
    [],
  );

  const checkoutCart: OrderItem[] = useMemo(() => {
    if (!checkoutOrder) return [];
    const stripHappyHourTwoForOne =
      promotionRemoved ||
      (checkoutPromotionState !== null &&
        checkoutPromotionState.discountType !== "2x1");
    if (!stripHappyHourTwoForOne) {
      return checkoutOrder.items;
    }
    return checkoutOrder.items.map((item) =>
      item.giftReason === "happy-hour-2x1" || item.note === "2x1 Happy Hour"
        ? {
            ...item,
            giftQuantity: 0,
            giftReason: undefined,
            note: item.note === "2x1 Happy Hour" ? "" : item.note,
          }
        : item,
    );
  }, [checkoutOrder, checkoutPromotionState, promotionRemoved]);

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

  const openCheckoutPreview = useCallback(
    (
      order: Order,
      options?: {
        isSubAccount?: boolean;
        splitSelection?: SplitBillCheckoutSelection;
        parentOrderId?: string;
      },
    ) => {
      pendingPrintRef.current = null;
      setCompletedSplitCheckout(null);
      setCheckoutOrder(order);
      setIsSubAccountCheckout(Boolean(options?.isSubAccount));
      setSplitSelection(options?.splitSelection ?? null);
      setParentOrderId(options?.parentOrderId ?? null);
      setCheckoutPromotionState(null);
      setPromotionRemoved(false);
      setCreatedInvoiceNumber(undefined);
      setIsPreviewOpen(true);
    },
    [],
  );

  const closeCheckoutPreview = useCallback(() => {
    pendingPrintRef.current = null;
    setIsPreviewOpen(false);
    setCheckoutOrder(null);
    setIsSubAccountCheckout(false);
    setSplitSelection(null);
    setParentOrderId(null);
    setCheckoutPromotionState(null);
    setPromotionRemoved(false);
    setCreatedInvoiceNumber(undefined);
    restoreFocus();
  }, [restoreFocus]);

  const handleFinalConfirm = useCallback(
    async (form: CheckoutFormValues) => {
      if (!checkoutOrder) return;

      const completePendingPrint = async (pending: PendingMesaPrint) => {
        setCreatedInvoiceNumber(pending.invoiceNumber);
        const cashierPrinter =
          await printerDispatcherService.getCashierPrinter();
        if (pending.isCash) {
          void printerDispatcherService.openCashDrawer(cashierPrinter);
          pending.isCash = false;
        }
        if (!pending.printed) {
          await printer.print({
            renderDelayMs: 500,
            settleDelayMs: 500,
            deviceName: cashierPrinter?.windowsDeviceName,
          });
          pending.printed = true;
        }
        pendingPrintRef.current = null;
      };

      const finishCheckoutUi = () => {
        setIsPreviewOpen(false);
        setCheckoutOrder(null);
        setIsSubAccountCheckout(false);
        setSplitSelection(null);
        setParentOrderId(null);
        setCheckoutPromotionState(null);
        setPromotionRemoved(false);
        setCreatedInvoiceNumber(undefined);
        restoreFocus();
      };

      const currentSplitAccountId = splitSelection?.accountId ?? null;
      if (pendingPrintRef.current) {
        if (
          pendingPrintRef.current.orderId === checkoutOrder.id &&
          pendingPrintRef.current.splitAccountId === currentSplitAccountId
        ) {
          await completePendingPrint(pendingPrintRef.current);
          finishCheckoutUi();
          return;
        }
        pendingPrintRef.current = null;
      }

      const supplementalItems = buildSupplementalCartItems(
        form.packagingItems,
        form.orderType === "delivery" ? form.deliveryCost : undefined,
        form.orderType === "delivery" ? form.deliveryZoneName : undefined,
        form.orderType === "delivery" ? form.deliveryDriverPayout : undefined,
        form.orderType === "delivery" ? form.isFreeDelivery : false,
      );
      const items = [...checkoutCart, ...supplementalItems];
      const preserveExistingPromotion =
        !checkoutPromotionState &&
        !promotionRemoved &&
        (isSubAccountCheckout ||
          Boolean(
            checkoutOrder.couponId ||
              checkoutOrder.discountId ||
              checkoutOrder.happyHourId ||
              checkoutOrder.promotionSource === "coupon" ||
              checkoutOrder.promotionSource === "discount" ||
              checkoutOrder.promotionSource === "happy-hour" ||
              items.some((item) => item.giftReason === "happy-hour-2x1"),
          ));

      const totals = calculateCartTotals(
        items,
        taxes,
        isExonerated,
        checkoutPromotion,
        preserveExistingPromotion && !checkoutPromotion
          ? checkoutOrder.discountAmount
          : undefined,
      );

      const promotionSelection = preserveExistingPromotion
        ? {}
        : buildOrderPromotionSelection(checkoutPromotion);

      let invoiceNumber: string | void;

      if (isSubAccountCheckout && splitSelection && parentOrderId) {
        invoiceNumber = await splitCheckoutOrder(parentOrderId, {
          mode: splitSelection.mode,
          accountName: splitSelection.accountName,
          subAccountAmount: splitSelection.amount,
          items,
          ...totals,
          expectedUpdatedAt: checkoutOrder.updatedAt?.toISOString(),
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
      } else {
        let snapshotUpdatedAt = checkoutOrder.updatedAt?.toISOString();
        if (
          supplementalItems.length > 0 ||
          checkoutCart !== checkoutOrder.items
        ) {
          const updatedFromItems = await updateOrderItems(
            checkoutOrder.id,
            items,
            totals.total,
            totals.subTotal,
            totals.taxAmount,
            totals.discountAmount,
            promotionSelection,
            snapshotUpdatedAt,
          );
          if (updatedFromItems?.updatedAt) {
            snapshotUpdatedAt = updatedFromItems.updatedAt.toISOString();
          }
        }

        invoiceNumber = await finalizeOrder(checkoutOrder.id, {
          ...totals,
          expectedUpdatedAt: snapshotUpdatedAt,
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
      }

      if (!invoiceNumber) {
        throw new Error("El backend no devolvió un número de factura.");
      }
      if (isSubAccountCheckout && splitSelection && parentOrderId) {
        setCompletedSplitCheckout({
          parentOrderId,
          selection: splitSelection,
        });
      }
      pendingPrintRef.current = {
        orderId: checkoutOrder.id,
        splitAccountId: splitSelection?.accountId ?? null,
        invoiceNumber,
        isCash:
          form.payments?.some((payment) => payment.method === "EFECTIVO") ??
          form.paymentMethod === "EFECTIVO",
        printed: false,
      };
      await completePendingPrint(pendingPrintRef.current);
      finishCheckoutUi();
    },
    [
      checkoutOrder,
      finalizeOrder,
      restoreFocus,
      checkoutCart,
      checkoutPromotion,
      checkoutPromotionState,
      isExonerated,
      isSubAccountCheckout,
      parentOrderId,
      printer,
      promotionRemoved,
      splitCheckoutOrder,
      splitSelection,
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
    completedSplitCheckout,
    openCheckoutPreview,
    closeCheckoutPreview,
    handleFinalConfirm,
  };
}
