import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CheckoutFormValues } from "../model/checkout.types";
import type { Order, OrderCreationResult } from "../../orders";
import { receiptPrinter, type ReceiptPrinter } from "../../../shared/printing";
import { printerDispatcherService } from "../../devices";
import type { RunExclusiveAction } from "./useExclusiveAction";

interface UseBillingFlowOptions {
  tableId: string | null;
  isCheckoutMode: boolean;
  isPreviewOpen: boolean;
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
  drawerOpened: boolean;
  afterPath: string;
};

export function useBillingFlow({
  tableId,
  isCheckoutMode,
  isPreviewOpen,
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

  useEffect(() => {
    // Al cerrar la vista previa tras un fallo de impresión después de emitir el cobro,
    // finalizamos la limpieza del carrito/cliente y navegamos para no dejar la orden cobrada en pantalla.
    if (!isPreviewOpen) {
      const pending = pendingPrintRef.current;
      pendingPrintRef.current = null;
      setCreatedInvoiceNumber(undefined);
      if (pending) {
        if (pending.sendToKitchen) {
          pending.sendToKitchen = false;
          void sendOrderToKitchen(pending.orderId).catch(() => {});
        }
        clearCart();
        if (pending.afterPath !== "/mesas") {
          resetDelivery();
        }
        navigate(pending.afterPath);
      }
    }
  }, [clearCart, isPreviewOpen, navigate, resetDelivery, sendOrderToKitchen]);

  const completeAndPrint = useCallback(
    async (pending: PendingPrint) => {
      const { orderId, invoiceNumber, isCash } = pending;
      setCreatedInvoiceNumber(invoiceNumber || `PED-${orderId.slice(-6).toUpperCase()}`);

      if (pending.sendToKitchen) {
        await sendOrderToKitchen(orderId);
        pending.sendToKitchen = false;
      }

      const cashierPrinter = await printerDispatcherService.getCashierPrinter();

      if (isCash && !pending.drawerOpened) {
        pending.drawerOpened = true;
        void printerDispatcherService.openCashDrawer(cashierPrinter);
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
      clearCart();
      closePreview();
      if (pending.afterPath !== "/mesas") {
        resetDelivery();
      }
      navigate(pending.afterPath);
    },
    [clearCart, closePreview, navigate, printer, resetDelivery, sendOrderToKitchen],
  );

  const handleFinalConfirm = useCallback(
    async (form: CheckoutFormValues) => {
      const isCash =
        form.payments?.some((payment) => payment.method === "EFECTIVO") ??
        form.paymentMethod === "EFECTIVO";

      await runExclusive(async () => {
        if (pendingPrintRef.current) {
          await completeAndPrint(pendingPrintRef.current);
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
              drawerOpened: false,
              afterPath: "/mesas",
            };
            await completeAndPrint(pendingPrintRef.current);
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
          drawerOpened: false,
          afterPath: fromDeliveryPage ? "/delivery" : "/home",
        };

        await completeAndPrint(pendingPrintRef.current);
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
