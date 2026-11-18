import type {
  OrderType,
  PaymentMethod,
  SplitPaymentAmounts,
} from "../../orders";

export interface CheckoutCostSummary {
  deliveryCharge: number;
  extraCostsSubtotal: number;
  extraCostsTax: number;
  finalTotal: number;
  finalTotalSecondary: number;
}

interface CalculateCheckoutCostsInput {
  baseTotal: number;
  totalPackagingCost: number;
  deliveryCost: number;
  orderType: OrderType;
  taxPercentage: number;
  exchangeRate: number;
}

export function calculateCheckoutCosts({
  baseTotal,
  totalPackagingCost,
  deliveryCost,
  orderType,
  taxPercentage,
  exchangeRate,
}: CalculateCheckoutCostsInput): CheckoutCostSummary {
  const deliveryCharge = orderType === "delivery" ? deliveryCost : 0;
  const extraCostsSubtotal = totalPackagingCost + deliveryCharge;
  const extraCostsTax = extraCostsSubtotal * (taxPercentage / 100);
  const finalTotal = baseTotal + extraCostsSubtotal + extraCostsTax;

  return {
    deliveryCharge,
    extraCostsSubtotal,
    extraCostsTax,
    finalTotal,
    finalTotalSecondary: exchangeRate > 0 ? finalTotal / exchangeRate : 0,
  };
}

interface ValidatePaymentInput {
  isTableMode: boolean;
  paymentMethod: PaymentMethod;
  splitAmounts: SplitPaymentAmounts;
  receivedLocal: number | "";
  receivedSecondary: number | "";
  exchangeRate: number;
  finalTotal: number;
}

export function isCheckoutPaymentValid({
  isTableMode,
  paymentMethod,
  splitAmounts,
  receivedLocal,
  receivedSecondary,
  exchangeRate,
  finalTotal,
}: ValidatePaymentInput): boolean {
  if (isTableMode) return true;

  if (paymentMethod === "EFECTIVO") {
    const received =
      Number(receivedLocal || 0) +
      Number(receivedSecondary || 0) * exchangeRate;
    return received >= finalTotal - 0.01;
  }

  if (paymentMethod === "MIXTO") {
    const received = splitAmounts.efectivo + splitAmounts.tarjeta;
    return Math.abs(received - finalTotal) < 0.01;
  }

  return true;
}

interface CanSubmitCheckoutInput {
  isPaymentValid: boolean;
  orderType: OrderType;
  customerAddress: string;
  selectedDriverId: string;
  deliveryCost: number;
  isFreeDelivery?: boolean;
  hasAvailableDrivers?: boolean;
  packagingIsConfigured: boolean;
  hasSelectedPackaging: boolean;
}

export function canSubmitCheckout({
  isPaymentValid,
  orderType,
  customerAddress,
  selectedDriverId,
  deliveryCost,
  isFreeDelivery = false,
  hasAvailableDrivers = true,
  packagingIsConfigured,
  hasSelectedPackaging,
}: CanSubmitCheckoutInput): boolean {
  if (!isPaymentValid) return false;

  if (orderType === "delivery") {
    if (!customerAddress.trim()) return false;
    if (hasAvailableDrivers && !selectedDriverId) return false;
    if (!isFreeDelivery && deliveryCost < 0) return false;
  }

  const requiresPackaging =
    orderType === "llevar" || orderType === "delivery";
  if (
    requiresPackaging &&
    packagingIsConfigured &&
    !hasSelectedPackaging
  ) {
    return false;
  }

  return true;
}

export interface MixedCashMethodDescriptor {
  type?: string;
  currency?: string;
}

export interface MixedCashEntry {
  currency: "NIO" | "USD";
  due: number;
  received: number;
  isSufficient: boolean;
}

export interface MixedCashSummary {
  entries: MixedCashEntry[];
  isAllCashSufficient: boolean;
}

interface SummarizeMixedCashInput {
  mixedMethods: ReadonlyArray<MixedCashMethodDescriptor | undefined>;
  mixedAmounts: SplitPaymentAmounts;
  receivedLocal: number | "";
  receivedSecondary: number | "";
  exchangeRate: number;
}

export function summarizeMixedCashPayments({
  mixedMethods,
  mixedAmounts,
  receivedLocal,
  receivedSecondary,
  exchangeRate,
}: SummarizeMixedCashInput): MixedCashSummary {
  const slotDues = [mixedAmounts.efectivo, mixedAmounts.tarjeta];
  const entriesByCurrency = new Map<"NIO" | "USD", MixedCashEntry>();

  mixedMethods.forEach((method, index) => {
    if (method?.type !== "CASH") {
      return;
    }

    const currency: "NIO" | "USD" = method.currency === "USD" ? "USD" : "NIO";
    const due = slotDues[index] ?? 0;
    const received =
      currency === "USD"
        ? Number(receivedSecondary || 0) * exchangeRate
        : Number(receivedLocal || 0);

    const existing = entriesByCurrency.get(currency);
    if (existing) {
      const combinedDue = existing.due + due;
      existing.due = combinedDue;
      existing.isSufficient = existing.received >= combinedDue - 0.01;
      return;
    }

    entriesByCurrency.set(currency, {
      currency,
      due,
      received,
      isSufficient: received >= due - 0.01,
    });
  });

  const entries = Array.from(entriesByCurrency.values());
  return {
    entries,
    isAllCashSufficient: entries.every((entry) => entry.isSufficient),
  };
}
