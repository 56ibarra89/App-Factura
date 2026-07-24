import { useEffect, useMemo, useState } from "react";
import type {
  SplitPaymentAmounts,
} from "../../types/checkout";
import type { PaymentMethod } from "../../types/order.types";
import { isCheckoutPaymentValid } from "../../services/checkout/checkoutFormDomain";

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
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("EFECTIVO");
  const [splitAmounts, setSplitAmounts] = useState<SplitPaymentAmounts>({
    efectivo: 0,
    tarjeta: 0,
  });
  const [receivedLocal, setReceivedLocal] = useState<number | "">("");
  const [receivedSecondary, setReceivedSecondary] = useState<number | "">(
    "",
  );

  useEffect(() => {
    if (!open) return;

    setPaymentMethod("EFECTIVO");
    setSplitAmounts({ efectivo: 0, tarjeta: baseTotal });
    setReceivedLocal(initialCustomerTendered ?? "");
    setReceivedSecondary("");
  }, [baseTotal, initialCustomerTendered, open]);

  const isPaymentValid = useMemo(
    () =>
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
      splitAmounts,
    ],
  );

  return {
    paymentMethod,
    setPaymentMethod,
    splitAmounts,
    setSplitAmounts,
    receivedLocal,
    setReceivedLocal,
    receivedSecondary,
    setReceivedSecondary,
    isPaymentValid,
  };
}
