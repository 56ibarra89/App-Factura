import { useCallback, useEffect, useMemo, useState } from "react";
import { customerRepository, type Customer } from "../../customers";
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
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [matchedCustomer, setMatchedCustomer] = useState<Customer | null>(null);

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
    setMatchDialogOpen(false);
    setMatchedCustomer(null);
  }, [open]);

  const executeFinalSubmission = useCallback(
    async (
      targetCustomerId?: string,
      targetCustomerName?: string,
      targetCustomerPhone?: string,
      targetCustomerAddress?: string,
    ) => {
      await onConfirm({
        paymentMethod: payment.paymentMethod,
        splitAmounts:
          payment.paymentMethod === "MIXTO"
            ? payment.splitAmounts
            : undefined,
        customerId: targetCustomerId,
        customerName:
          targetCustomerName?.trim() ||
          customerDelivery.customerName.trim() ||
          (customerDelivery.customerPhone.trim()
            ? `Cliente ${customerDelivery.customerPhone.trim()}`
            : undefined),
        customerPhone:
          targetCustomerPhone?.trim() ||
          customerDelivery.customerPhone.trim() ||
          undefined,
        orderType: customerDelivery.orderType,
        customerAddress:
          customerDelivery.orderType === "delivery"
            ? targetCustomerAddress || customerDelivery.customerAddress
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
    },
    [
      customerDelivery.customerAddress,
      customerDelivery.customerName,
      customerDelivery.customerPhone,
      customerDelivery.deliveryCost,
      customerDelivery.orderType,
      customerDelivery.selectedDriverId,
      onConfirm,
      packaging.packagingItems,
      payment.paymentMethod,
      payment.receivedLocal,
      payment.splitAmounts,
    ],
  );

  const handleConfirm = useCallback(async () => {
    if (!canConfirm || isSubmitting) return;

    setSubmitError("");
    const name = customerDelivery.customerName.trim();
    const phone = customerDelivery.customerPhone.trim();

    // Detección de homónimos / coincidencia de cliente
    if (name.length >= 2) {
      try {
        const matches = await customerRepository.searchByName(name);
        const exactMatch = matches.find(
          (c) => c.name.trim().toLowerCase() === name.toLowerCase(),
        );

        if (exactMatch) {
          const knownPhones = [
            exactMatch.phone,
            ...(exactMatch.phones?.map((p) => p.phone) ?? []),
          ]
            .filter(Boolean)
            .map((p) => p!.trim());

          const isKnownPhone = !phone || knownPhones.includes(phone);

          if (!isKnownPhone) {
            // Existe un cliente registrado con ese nombre, pero el teléfono es nuevo
            setMatchedCustomer(exactMatch);
            setMatchDialogOpen(true);
            return;
          }
        }
      } catch (err) {
        console.error("Error verificando coincidencia de cliente:", err);
      }
    }

    setIsSubmitting(true);
    try {
      const isNewCustomer = await customerDelivery.persistCustomer();
      if (isNewCustomer) setToastOpen(true);

      await executeFinalSubmission(customerDelivery.selectedCustomer?.id);
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
    executeFinalSubmission,
    isSubmitting,
  ]);

  const handleConfirmAsNewCustomer = useCallback(async () => {
    if (!matchedCustomer) return;
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const name = customerDelivery.customerName.trim();
      const phone = customerDelivery.customerPhone.trim();
      const address = customerDelivery.customerAddress?.trim();

      const newCustomer = await customerRepository.createCustomer(
        name,
        customerDelivery.orderType === "delivery" ? address : undefined,
        phone || undefined,
      );

      setToastOpen(true);
      setMatchDialogOpen(false);
      await executeFinalSubmission(newCustomer.id, newCustomer.name, phone, address);
    } catch (error: unknown) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo crear el nuevo cliente. Inténtalo de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    customerDelivery.customerAddress,
    customerDelivery.customerName,
    customerDelivery.customerPhone,
    customerDelivery.orderType,
    executeFinalSubmission,
    matchedCustomer,
  ]);

  const handleConfirmAsExistingCustomer = useCallback(async () => {
    if (!matchedCustomer) return;
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const name = customerDelivery.customerName.trim();
      const phone = customerDelivery.customerPhone.trim();
      const address = customerDelivery.customerAddress?.trim();

      await customerRepository.update({
        id: matchedCustomer.id,
        name,
        phone: phone || undefined,
        address: customerDelivery.orderType === "delivery" ? address : undefined,
      });

      setToastOpen(true);
      setMatchDialogOpen(false);
      await executeFinalSubmission(matchedCustomer.id, name, phone, address);
    } catch (error: unknown) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el cliente existente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    customerDelivery.customerAddress,
    customerDelivery.customerName,
    customerDelivery.customerPhone,
    customerDelivery.orderType,
    executeFinalSubmission,
    matchedCustomer,
  ]);

  return {
    ...payment,
    ...customerDelivery,
    ...packaging,
    ...costs,
    config,
    exchangeRate,
    canConfirm,
    submitError,
    isSubmitting,
    toastOpen,
    setToastOpen,
    handleConfirm,
    matchDialogOpen,
    setMatchDialogOpen,
    matchedCustomer,
    handleConfirmAsNewCustomer,
    handleConfirmAsExistingCustomer,
  };
}
