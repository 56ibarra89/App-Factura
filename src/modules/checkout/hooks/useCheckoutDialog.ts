import { useCallback, useEffect, useMemo, useState } from "react";
import type { Customer } from "../../customers";
import type { CheckoutFormValues } from "../model/checkout.types";
import type { OrderType } from "../../orders";
import {
  checkoutGateway,
  type CheckoutGateway,
} from "../api/checkoutGateway";
import {
  calculateCheckoutCosts,
  canSubmitCheckout,
} from "../model/checkoutFormDomain";
import { useCheckoutPayment } from "./useCheckoutPayment";
import { useCustomerDeliveryForm } from "./useCustomerDeliveryForm";
import { usePackagingSelection } from "./usePackagingSelection";
import { useGeneralSettings, useTaxConfig } from "../../settings";

interface UseCheckoutDialogOptions {
  open: boolean;
  total: number;
  isTableMode: boolean;
  initialCustomer: Customer | null;
  initialPhone: string;
  initialAddress?: string;
  initialOrderType: OrderType;
  initialDriverId: string;
  initialDeliveryCost: number;
  initialCustomerTendered?: number;
  onConfirm: (values: CheckoutFormValues) => void | Promise<void>;
  gateway?: CheckoutGateway;
}

export function useCheckoutDialog({
  open,
  total,
  isTableMode,
  initialCustomer,
  initialPhone,
  initialAddress,
  initialOrderType,
  initialDriverId,
  initialDeliveryCost,
  initialCustomerTendered,
  onConfirm,
  gateway = checkoutGateway,
}: UseCheckoutDialogOptions) {
  const [toastOpen, setToastOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { config } = useGeneralSettings();
  const { taxes, isExonerated } = useTaxConfig();
  const exchangeRate = config.exchangeRate > 0 ? config.exchangeRate : 36.5;

  const customerDelivery = useCustomerDeliveryForm({
    open,
    initialCustomer,
    initialPhone,
    initialAddress,
    initialOrderType,
    initialDriverId,
    initialDeliveryCost,
    gateway,
  });
  const packaging = usePackagingSelection({
    open,
    orderType: customerDelivery.orderType,
    gateway,
  });

  const taxPercentage = isExonerated
    ? 0
    : (taxes[0]?.percentage ?? 0);
  const costs = useMemo(
    () =>
      calculateCheckoutCosts({
        baseTotal: total,
        totalPackagingCost: packaging.totalPackagingCost,
        deliveryCost: customerDelivery.deliveryCost,
        orderType: customerDelivery.orderType,
        taxPercentage,
        exchangeRate,
      }),
    [
      customerDelivery.deliveryCost,
      customerDelivery.orderType,
      exchangeRate,
      packaging.totalPackagingCost,
      taxPercentage,
      total,
    ],
  );
  const payment = useCheckoutPayment({
    open,
    baseTotal: total,
    finalTotal: costs.finalTotal,
    exchangeRate,
    isTableMode,
    initialCustomerTendered,
  });

  const canConfirm = useMemo(
    () =>
      canSubmitCheckout({
        isPaymentValid: payment.isPaymentValid,
        orderType: customerDelivery.orderType,
        customerAddress: customerDelivery.customerAddress,
        selectedDriverId: customerDelivery.selectedDriverId,
        deliveryCost: customerDelivery.deliveryCost,
        packagingIsConfigured: packaging.packagingConfig.length > 0,
        hasSelectedPackaging: packaging.packagingItems.length > 0,
      }),
    [
      customerDelivery.customerAddress,
      customerDelivery.deliveryCost,
      customerDelivery.orderType,
      customerDelivery.selectedDriverId,
      packaging.packagingConfig.length,
      packaging.packagingItems.length,
      payment.isPaymentValid,
    ],
  );

  useEffect(() => {
    if (!open) return;
    setSubmitError("");
    setIsSubmitting(false);
  }, [open]);

  const handleConfirm = useCallback(async () => {
    if (!canConfirm || isSubmitting) return;

    setSubmitError("");
    setIsSubmitting(true);
    try {
      const isNewCustomer = await customerDelivery.persistCustomer();
      if (isNewCustomer) setToastOpen(true);

      await onConfirm({
        paymentMethod: payment.paymentMethod,
        splitAmounts:
          payment.paymentMethod === "MIXTO"
            ? payment.splitAmounts
            : undefined,
        customerName:
          customerDelivery.customerName.trim() ||
          (customerDelivery.customerPhone.trim()
            ? `Cliente ${customerDelivery.customerPhone.trim()}`
            : undefined),
        customerPhone: customerDelivery.customerPhone.trim() || undefined,
        orderType: customerDelivery.orderType,
        customerAddress:
          customerDelivery.orderType === "delivery"
            ? customerDelivery.customerAddress
            : undefined,
        packagingItems: packaging.packagingItems,
        customerTendered:
          payment.paymentMethod === "EFECTIVO"
            ? Number(payment.receivedLocal) || undefined
            : undefined,
        driverId:
          customerDelivery.orderType === "delivery"
            ? customerDelivery.selectedDriverId
            : undefined,
        deliveryCost:
          customerDelivery.orderType === "delivery"
            ? customerDelivery.deliveryCost
            : undefined,
      });
    } catch (error: unknown) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo completar el cobro. Inténtalo nuevamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    canConfirm,
    customerDelivery,
    isSubmitting,
    onConfirm,
    packaging.packagingItems,
    payment.paymentMethod,
    payment.receivedLocal,
    payment.splitAmounts,
  ]);

  return {
    ...payment,
    ...customerDelivery,
    ...packaging,
    ...costs,
    config,
    exchangeRate,
    canConfirm,
    handleConfirm,
    isSubmitting,
    submitError,
    toastOpen,
    setToastOpen,
  };
}
