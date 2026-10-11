import type { Order, OrderPaymentDetail } from "./order.types";

export interface PaymentBreakdownRow {
  id: string;
  name: string;
  type: string;
  currency: string;
  amount: number;
  originalAmount?: number;
  transactionCount: number;
}

const legacyType = (method: OrderPaymentDetail["method"]) => {
  if (method === "EFECTIVO") return "CASH";
  if (method === "TARJETA") return "CARD_POS";
  return "BANK_TRANSFER";
};

const legacyName = (method: OrderPaymentDetail["method"]) => {
  if (method === "EFECTIVO") return "Efectivo";
  if (method === "TARJETA") return "POS Tarjeta";
  return "App / Transferencia";
};

export function getOrderPaymentDetails(order: Order): OrderPaymentDetail[] {
  if (order.payments?.length) return order.payments;

  if (order.paymentMethod === "MIXTO" && order.splitAmounts) {
    return ([
      ["EFECTIVO", order.splitAmounts.efectivo],
      ["TARJETA", order.splitAmounts.tarjeta],
      ["APP", order.splitAmounts.app],
    ] as const).flatMap(([method, amount]) =>
      amount && amount > 0 ? [{ method, amount }] : [],
    );
  }

  const method =
    order.paymentMethod && order.paymentMethod !== "MIXTO"
      ? order.paymentMethod
      : "EFECTIVO";
  return [{ method, amount: order.total }];
}

export function getPaymentDisplayName(payment: OrderPaymentDetail): string {
  return payment.methodSnapshotName?.trim() || legacyName(payment.method);
}

export function getPaymentFilterId(payment: OrderPaymentDetail): string {
  return payment.methodConfigId || `legacy:${payment.method}`;
}

export function aggregateOrderPayments(
  orders: readonly Order[],
): PaymentBreakdownRow[] {
  const rows = new Map<string, PaymentBreakdownRow>();

  orders.forEach((order) => {
    getOrderPaymentDetails(order).forEach((payment) => {
      const id = getPaymentFilterId(payment);
      const current = rows.get(id) ?? {
        id,
        name: getPaymentDisplayName(payment),
        type: payment.methodType || legacyType(payment.method),
        currency: payment.currency || "NIO",
        amount: 0,
        originalAmount: undefined,
        transactionCount: 0,
      };
      current.amount += payment.amount;
      current.transactionCount += 1;
      if (payment.originalAmount !== undefined) {
        current.originalAmount =
          (current.originalAmount ?? 0) + payment.originalAmount;
      }
      rows.set(id, current);
    });
  });

  return [...rows.values()].sort((a, b) => b.amount - a.amount);
}
