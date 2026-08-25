import type { Order } from "../../orders";
import type { ShiftSales } from "./cash-register.types";

const PAYMENT_ACCUMULATORS: Record<string, (acc: ShiftSales, order: Order) => void> = {
  EFECTIVO: (acc, order) => {
    acc.cash += order.total;
  },
  TARJETA: (acc, order) => {
    acc.card += order.total;
  },
  APP: (acc, order) => {
    acc.app += order.total;
  },
  MIXTO: (acc, order) => {
    if (order.splitAmounts) {
      acc.cash += order.splitAmounts.efectivo || 0;
      acc.card += order.splitAmounts.tarjeta || 0;
      acc.app += order.splitAmounts.app || 0;
    }
  },
};

function accumulateSales(acc: ShiftSales, order: Order): ShiftSales {
  const method = order.paymentMethod;
  if (method && PAYMENT_ACCUMULATORS[method]) {
    PAYMENT_ACCUMULATORS[method](acc, order);
  }
  acc.total += order.total;
  return acc;
}

export function calculateShiftSales(orders: Order[]): ShiftSales {
  return orders.reduce(accumulateSales, { cash: 0, card: 0, app: 0, total: 0 });
}

