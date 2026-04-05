import { Order } from "../types/order.types";
import { ShiftSales } from "../types/shift.types";

/**
 * Mapa de acumuladores por método de pago.
 * Para agregar un nuevo método de pago, basta con añadir una entrada aquí
 * sin necesidad de modificar CajaContext ni ningún otro módulo. (OCP)
 */
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
      acc.cash += order.splitAmounts.efectivo;
      acc.card += order.splitAmounts.tarjeta;
    }
  },
};

/**
 * Acumula los totales de ventas de una sola orden en el acumulador dado.
 * Retorna el mismo objeto acumulador para facilitar el uso con reduce().
 */
function accumulateSales(acc: ShiftSales, order: Order): ShiftSales {
  const method = order.paymentMethod;
  if (method && PAYMENT_ACCUMULATORS[method]) {
    PAYMENT_ACCUMULATORS[method](acc, order);
  }
  acc.total += order.total;
  return acc;
}

/**
 * Calcula el resumen de ventas de un conjunto de órdenes.
 */
export function calculateShiftSales(orders: Order[]): ShiftSales {
  return orders.reduce(accumulateSales, { cash: 0, card: 0, app: 0, total: 0 });
}
