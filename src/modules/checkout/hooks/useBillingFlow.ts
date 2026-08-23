import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CheckoutFormValues } from "../model/checkout.types";
import type { Order } from "../../orders";
import {
  receiptPrinter,
  type ReceiptPrinter,
} from "../../../shared/printing";
import type { RunExclusiveAction } from "./useExclusiveAction";

interface UseBillingFlowOptions {
  tableId: string | null;
  isCheckoutMode: boolean;
  activeOrder?: Order | null;
  deliveryDriverId?: string;
  fromDeliveryPage?: boolean;
  confirmInvoice(
    form: CheckoutFormValues,
  ): Promise<string | void>;
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

export function useBillingFlow({
  tableId,
  isCheckoutMode,
  activeOrder,
  deliveryDriverId,
  fromDeliveryPage = false,
  confirmInvoice,
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

  const completeAndPrint = useCallback(
    async (invoiceNumber: string) => {
      setCreatedInvoiceNumber(invoiceNumber);
      await printer.print({
        renderDelayMs: 500,
        settleDelayMs: 500,
      });
      clearCart();
      closePreview();
    },
    [clearCart, closePreview, printer],
  );

  const handleFinalConfirm = useCallback(
    async (form: CheckoutFormValues) => {
      await runExclusive(async () => {
        if (tableId) {
          if (isCheckoutMode && activeOrder) {
            const invoiceNumber = await finalizeTableOrder(
              activeOrder.id,
              form,
            );
            if (!invoiceNumber) {
              throw new Error(
                "El backend no devolvió un número de factura.",
              );
            }

            await completeAndPrint(invoiceNumber);
            navigate("/mesas");
            return;
          }

          await saveTableOrder(activeOrder?.id, tableId);
          clearCart();
          closePreview();
          navigate("/mesas");
          return;
        }

        const invoiceNumber = await confirmInvoice({
          ...form,
          driverId: form.driverId || deliveryDriverId,
        });
        if (!invoiceNumber) {
          throw new Error(
            "El backend no devolvió un número de factura.",
          );
        }

        await completeAndPrint(invoiceNumber);
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
