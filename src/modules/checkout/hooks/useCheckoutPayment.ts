import { useEffect, useMemo, useState } from "react";
import type {
  OrderPaymentDetail,
  PaymentMethod,
  SplitPaymentAmounts,
} from "../../orders";
import { paymentMethodsGateway } from "../../settings/api/paymentMethodsGateway";
import {
  DEFAULT_PAYMENT_METHODS_CONFIG,
  isValidPosReference,
  toLegacyPaymentMethod,
  type ConfiguredPaymentMethod,
} from "../../settings/model/paymentMethods.types";
import { isCheckoutPaymentValid } from "../model/checkoutFormDomain";

interface UseCheckoutPaymentOptions {
  open: boolean;
  baseTotal?: number;
  finalTotal: number;
  exchangeRate: number;
  isTableMode: boolean;
  initialCustomerTendered?: number;
}

export function useCheckoutPayment({
  open,
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
  const [mixedAmounts, setMixedAmounts] = useState<SplitPaymentAmounts>({
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
        active.find(
          (method) => method.type !== "CASH" && method.id !== primary.id,
        ) ??
        active.find((method) => method.id !== primary.id) ??
        primary;
      setSelectedMethodId(primary.id);
      setPaymentMethod(toLegacyPaymentMethod(primary));
      setMixedMethodIds([primary.id, secondary.id]);
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setMixedAmounts({
      efectivo: 0,
      tarjeta: Number(Math.max(0, finalTotal).toFixed(2)),
    });
    setReceivedLocal(initialCustomerTendered ?? "");
    setReceivedSecondary("");
    setPaymentReferences({});
    // Solo reiniciar los campos al abrir el diálogo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCustomerTendered, open]);

  useEffect(() => {
    if (!open) return;
    setMixedAmounts((current) => {
      const first = Math.min(finalTotal, Math.max(0, current.efectivo));
      const second = Number(Math.max(0, finalTotal - first).toFixed(2));
      if (current.efectivo === first && current.tarjeta === second) {
        return current;
      }
      return {
        efectivo: first,
        tarjeta: second,
      };
    });
  }, [finalTotal, open]);

  const selectedMethod =
    methods.find((method) => method.id === selectedMethodId) ?? methods[0];
  const mixedMethods = mixedMethodIds.map(
    (id) => methods.find((method) => method.id === id) ?? methods[0],
  );
  const mixedCashIndex = mixedMethods.findIndex(
    (method) => method?.type === "CASH",
  );
  const mixedCashMethod =
    mixedCashIndex >= 0 ? mixedMethods[mixedCashIndex] : undefined;
  const mixedCashDue =
    mixedCashIndex === 0
      ? mixedAmounts.efectivo
      : mixedCashIndex === 1
        ? mixedAmounts.tarjeta
        : 0;
  const mixedCashReceived =
    mixedCashMethod?.currency === "USD"
      ? Number(receivedSecondary || 0) * exchangeRate
      : Number(receivedLocal || 0);

  const referencesValid = useMemo(() => {
    const selected =
      paymentMethod === "MIXTO" ? mixedMethods : [selectedMethod];
    return selected.every(
      (method) =>
        method &&
        (!method.requiresReference ||
          (method.type === "CARD_POS"
            ? isValidPosReference(paymentReferences[method.id] ?? "")
            : (paymentReferences[method.id]?.trim().length ?? 0) >= 4)),
    );
  }, [mixedMethods, paymentMethod, paymentReferences, selectedMethod]);

  const isPaymentValid = useMemo(
    () =>
      referencesValid &&
      (paymentMethod !== "MIXTO" ||
        !mixedCashMethod ||
        mixedCashReceived >= mixedCashDue - 0.01) &&
      isCheckoutPaymentValid({
        isTableMode,
        paymentMethod,
        splitAmounts: mixedAmounts,
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
      mixedCashDue,
      mixedCashMethod,
      mixedCashReceived,
      receivedLocal,
      receivedSecondary,
      referencesValid,
      mixedAmounts,
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
        build(mixedMethods[0], mixedAmounts.efectivo),
        build(mixedMethods[1], mixedAmounts.tarjeta),
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
    mixedAmounts,
  ]);

  const splitAmounts = useMemo<SplitPaymentAmounts>(() => {
    const grouped: SplitPaymentAmounts = {
      efectivo: 0,
      tarjeta: 0,
      app: 0,
    };
    payments.forEach((payment) => {
      if (payment.method === "EFECTIVO") grouped.efectivo += payment.amount;
      else if (payment.method === "TARJETA") grouped.tarjeta += payment.amount;
      else grouped.app = (grouped.app ?? 0) + payment.amount;
    });
    return grouped;
  }, [payments]);

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
    mixedAmounts,
    setMixedAmounts,
    receivedLocal,
    setReceivedLocal,
    receivedSecondary,
    setReceivedSecondary,
    isPaymentValid,
  };
}
