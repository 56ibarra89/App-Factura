import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CheckoutFormValues } from "../model/checkout.types";
import type { Order, OrderCreationResult } from "../../orders";
import { receiptPrinter, type ReceiptPrinter } from "../../../shared/printing";
import { printerDispatcherService } from "../../devices";
import type { RunExclusiveAction } from "./useExclusiveAction";

interface UseBillingFlowOptions {
  tableId: string | null;
  isCheckoutMode: boolean;
  activeOrder?: Order | null;
  deliveryDriverId?: string;
  fromDeliveryPage?: boolean;
  confirmInvoice(form: CheckoutFormValues): Promise<OrderCreationResult>;
  sendOrderToKitchen(orderId: string): Promise<void>;
  saveTableOrder(orderId?: string, tableId?: string): Promise<unknown>;
  finalizeTableOrder(
    orderId: string,
    form: CheckoutFormValues,
  ): Promise<string | void>;
  clearCart(): void;
  resetDelivery(): void;
  closePreview(): void;
  runExclusive: RunExclusiveAction;
  printer?: ReceiptPrinter;
}

type PendingPrint = OrderCreationResult & {
  isCash: boolean;
  printed: boolean;
  sendToKitchen: boolean;
};

export function useBillingFlow({
  tableId,
  isCheckoutMode,
  activeOrder,
  deliveryDriverId,
  fromDeliveryPage = false,
  confirmInvoice,
  sendOrderToKitchen,
  saveTableOrder,
  finalizeTableOrder,
  clearCart,
  resetDelivery,
  closePreview,
  runExclusive,
  printer = receiptPrinter,
}: UseBillingFlowOptions) {
  const navigate = useNavigate();
  const [createdInvoiceNumber, setCreatedInvoiceNumber] = useState<
    string | undefined
  >();
  const pendingPrintRef = useRef<PendingPrint | null>(null);

  const completeAndPrint = useCallback(
    async (pending: PendingPrint) => {
      const { orderId, invoiceNumber, isCash } = pending;
      setCreatedInvoiceNumber(invoiceNumber || `PED-${orderId.slice(-6).toUpperCase()}`);
      const cashierPrinter = await printerDispatcherService.getCashierPrinter();

      if (!pending.printed) {
        await printer.print({
          renderDelayMs: 500,
          settleDelayMs: 500,
          deviceName: cashierPrinter?.windowsDeviceName,
        });
        pending.printed = true;
      }
      if (pending.sendToKitchen) {
        await sendOrderToKitchen(orderId);
      }

      if (isCash) {
        void printerDispatcherService.openCashDrawer(cashierPrinter);
      }

      pendingPrintRef.current = null;
      clearCart();
      closePreview();
    },
    [clearCart, closePreview, printer, sendOrderToKitchen],
  );

  const handleFinalConfirm = useCallback(
    async (form: CheckoutFormValues) => {
      const isCash =
        form.payments?.some((payment) => payment.method === "EFECTIVO") ??
        form.paymentMethod === "EFECTIVO";

      await runExclusive(async () => {
        if (pendingPrintRef.current) {
          await completeAndPrint(pendingPrintRef.current);
          if (tableId) {
            navigate("/mesas");
          } else {
            resetDelivery();
            navigate(fromDeliveryPage ? "/delivery" : "/home");
          }
          return;
        }

        if (tableId) {
          if (isCheckoutMode && activeOrder) {
            const invoiceNumber = await finalizeTableOrder(
              activeOrder.id,
              form,
            );
            if (!invoiceNumber) {
              throw new Error("El backend no devolvió un número de factura.");
            }

            pendingPrintRef.current = {
              orderId: activeOrder.id,
              invoiceNumber,
              isCash,
              printed: false,
              sendToKitchen: false,
            };
            await completeAndPrint(pendingPrintRef.current);
            navigate("/mesas");
            return;
          }

          await saveTableOrder(activeOrder?.id, tableId);
          clearCart();
          closePreview();
          navigate("/mesas");
          return;
        }

        const createdOrder = await confirmInvoice({
          ...form,
          driverId: form.driverId || deliveryDriverId,
        });
        const isPendingDelivery = form.orderType === "delivery";
        if (!isPendingDelivery && !createdOrder.invoiceNumber) {
          throw new Error("El backend no devolvió un número de factura.");
        }
        pendingPrintRef.current = {
          ...createdOrder,
          isCash: isCash && !isPendingDelivery,
          printed: false,
          sendToKitchen: true,
        };

        await completeAndPrint(pendingPrintRef.current);

        resetDelivery();
        if (fromDeliveryPage) {
          navigate("/delivery");
        } else {
          navigate("/home");
        }
      });
    },
    [
      activeOrder,
      clearCart,
      closePreview,
      completeAndPrint,
      confirmInvoice,
      deliveryDriverId,
      finalizeTableOrder,
      fromDeliveryPage,
      isCheckoutMode,
      navigate,
      resetDelivery,
      runExclusive,
      saveTableOrder,
      tableId,
    ],
  );

  return {
    createdInvoiceNumber,
    handleFinalConfirm,
  };
}
