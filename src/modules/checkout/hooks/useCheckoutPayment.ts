import { useEffect, useMemo, useState } from "react";
import type {
  OrderPaymentDetail,
  PaymentMethod,
  SplitPaymentAmounts,
} from "../../orders";
import { paymentMethodsGateway } from "../../settings/api/paymentMethodsGateway";
import {
  DEFAULT_PAYMENT_METHODS_CONFIG,
  toLegacyPaymentMethod,
  type ConfiguredPaymentMethod,
} from "../../settings/model/paymentMethods.types";
import { isCheckoutPaymentValid } from "../model/checkoutFormDomain";

interface UseCheckoutPaymentOptions {
  open: boolean;
  baseTotal: number;
  finalTotal: number;
  exchangeRate: number;
  isTableMode: boolean;
  initialCustomerTendered?: number;
}

export function useCheckoutPayment({
  open,
  baseTotal,
  finalTotal,
  exchangeRate,
  isTableMode,
  initialCustomerTendered,
}: UseCheckoutPaymentOptions) {
  const [methods, setMethods] = useState<ConfiguredPaymentMethod[]>(
    DEFAULT_PAYMENT_METHODS_CONFIG.methods,
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("EFECTIVO");
  const [selectedMethodId, setSelectedMethodId] = useState("cash-nio");
  const [mixedMethodIds, setMixedMethodIds] = useState<[string, string]>([
    "cash-nio",
    "card-generic",
  ]);
  const [paymentReferences, setPaymentReferences] = useState<
    Record<string, string>
  >({});
  const [splitAmounts, setSplitAmounts] = useState<SplitPaymentAmounts>({
    efectivo: 0,
    tarjeta: 0,
  });
  const [receivedLocal, setReceivedLocal] = useState<number | "">("");
  const [receivedSecondary, setReceivedSecondary] = useState<number | "">("");

  useEffect(() => {
    if (!open) return;
    void paymentMethodsGateway.load().then((config) => {
      const active = config.methods.filter((method) => method.isActive);
      if (!active.length) return;
      setMethods(active);
      const primary =
        active.find(
          (method) => method.type === "CASH" && method.currency === "NIO",
        ) ?? active[0];
      const secondary =
        active.find((method) => method.id !== primary.id) ?? primary;
      setSelectedMethodId(primary.id);
      setPaymentMethod(toLegacyPaymentMethod(primary));
      setMixedMethodIds([primary.id, secondary.id]);
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setSplitAmounts({ efectivo: 0, tarjeta: baseTotal });
    setReceivedLocal(initialCustomerTendered ?? "");
    setReceivedSecondary("");
    setPaymentReferences({});
  }, [baseTotal, initialCustomerTendered, open]);

  const selectedMethod =
    methods.find((method) => method.id === selectedMethodId) ?? methods[0];
  const mixedMethods = mixedMethodIds.map(
    (id) => methods.find((method) => method.id === id) ?? methods[0],
  );

  const referencesValid = useMemo(() => {
    const selected =
      paymentMethod === "MIXTO" ? mixedMethods : [selectedMethod];
    return selected.every(
      (method) =>
        method &&
        (!method.requiresReference ||
          (paymentReferences[method.id]?.trim().length ?? 0) >= 4),
    );
  }, [mixedMethods, paymentMethod, paymentReferences, selectedMethod]);

  const isPaymentValid = useMemo(
    () =>
      referencesValid &&
      isCheckoutPaymentValid({
        isTableMode,
        paymentMethod,
        splitAmounts,
        receivedLocal,
        receivedSecondary,
        exchangeRate,
        finalTotal,
      }),
    [
      exchangeRate,
      finalTotal,
      isTableMode,
      paymentMethod,
      receivedLocal,
      receivedSecondary,
      referencesValid,
      splitAmounts,
    ],
  );

  const payments = useMemo<OrderPaymentDetail[]>(() => {
    const build = (
      method: ConfiguredPaymentMethod | undefined,
      amount: number,
    ): OrderPaymentDetail | null => {
      if (!method || amount <= 0) return null;
      const rate = method.currency === "USD" ? exchangeRate : 1;
      return {
        method: toLegacyPaymentMethod(method),
        amount: Math.round(amount * 100) / 100,
        reference: paymentReferences[method.id]?.trim() || undefined,
        methodConfigId: method.id,
        originalAmount: Math.round((amount / rate) * 100) / 100,
        exchangeRate: rate,
      };
    };

    if (paymentMethod === "MIXTO") {
      return [
        build(mixedMethods[0], splitAmounts.efectivo),
        build(mixedMethods[1], splitAmounts.tarjeta),
      ].filter((payment): payment is OrderPaymentDetail => Boolean(payment));
    }
    const payment = build(selectedMethod, finalTotal);
    return payment ? [payment] : [];
  }, [
    exchangeRate,
    finalTotal,
    mixedMethods,
    paymentMethod,
    paymentReferences,
    selectedMethod,
    splitAmounts,
  ]);

  return {
    methods,
    paymentMethod,
    setPaymentMethod,
    selectedMethodId,
    setSelectedMethodId,
    mixedMethodIds,
    setMixedMethodIds,
    paymentReferences,
    setPaymentReferences,
    payments,
    splitAmounts,
    setSplitAmounts,
    receivedLocal,
    setReceivedLocal,
    receivedSecondary,
    setReceivedSecondary,
    isPaymentValid,
  };
}
