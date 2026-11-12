import { getOrderPaymentDetails, type Order } from "../../orders";
import type { ShiftSales } from "./cash-register.types";

function accumulateSales(acc: ShiftSales, order: Order): ShiftSales {
  getOrderPaymentDetails(order).forEach((payment) => {
    if (payment.method === "EFECTIVO") acc.cash += payment.amount;
    else if (payment.method === "TARJETA") acc.card += payment.amount;
    else acc.app += payment.amount;
  });
  acc.total += order.total;
  return acc;
}

export function calculateShiftSales(orders: Order[]): ShiftSales {
  return orders.reduce(accumulateSales, { cash: 0, card: 0, app: 0, total: 0 });
}

