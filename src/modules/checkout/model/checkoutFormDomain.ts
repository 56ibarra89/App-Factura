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
    finalTotalSecondary: finalTotal / exchangeRate,
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
