import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CheckoutFormValues } from "../model/checkout.types";
import {
  requiresKitchenPreparation,
  type Order,
  type OrderItem,
} from "../../orders";
import {
  receiptPrinter,
  type ReceiptPrinter,
} from "../../../shared/printing";
import { printerDispatcherService } from "../../devices";
import type { RunExclusiveAction } from "./useExclusiveAction";

interface UseBillingFlowOptions {
  tableId: string | null;
  isCheckoutMode: boolean;
  activeOrder?: Order | null;
  deliveryDriverId?: string;
  fromDeliveryPage?: boolean;
  cart?: OrderItem[];
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
  cart,
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
    async (invoiceNumber: string, isCash = false) => {
      setCreatedInvoiceNumber(invoiceNumber);
      const cashierPrinter = await printerDispatcherService.getCashierPrinter();

      if (isCash) {
        void printerDispatcherService.openCashDrawer(cashierPrinter);
      }

      await printer.print({
        renderDelayMs: 500,
        settleDelayMs: 500,
        deviceName: cashierPrinter?.windowsDeviceName,
      });
      clearCart();
      closePreview();
    },
    [clearCart, closePreview, printer],
  );

  const handleFinalConfirm = useCallback(
    async (form: CheckoutFormValues) => {
      const isCash = form.paymentMethod === "EFECTIVO";

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

            await completeAndPrint(invoiceNumber, isCash);
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

        await completeAndPrint(invoiceNumber, isCash);

        // Si es comanda directa (Llevar o Delivery), enviar automáticamente los ítems a cocina
        if (cart && cart.length > 0) {
          const kitchenItems = cart.filter(
            (item) => requiresKitchenPreparation(item) && !item.isSentToKitchen,
          );
          if (kitchenItems.length > 0) {
            void printerDispatcherService.printKitchenComanda({
              orderId: invoiceNumber,
              orderType:
                form.orderType === "delivery"
                  ? "DELIVERY"
                  : form.orderType === "local"
                    ? "LOCAL"
                    : "LLEVAR",
              items: kitchenItems.map((k) => ({
                name: k.name,
                quantity: k.quantity,
                size: k.size,
                note: k.note,
                extras: k.extras,
                isCombo: k.isCombo,
                comboSelections: k.comboSelections,
              })),
              timestamp: Date.now(),
            });
          }
        }

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
      cart,
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
