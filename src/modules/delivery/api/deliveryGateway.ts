import { apiClient } from "../../../shared/api";
import type { DeliveryDriver, DeliveryStat } from "../model/delivery.types";
import type { Order, OrderPaymentDetail } from "../../orders";
import { mapBackendOrderToFrontend } from "../../orders/api/backendSync";

const WEEK_DAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

function toLocalDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function isDriverAvailable(user: DeliveryDriver, date: Date): boolean {
  if (user.role !== "motorizado") return false;
  const dateKey = toLocalDateKey(date);
  const day = WEEK_DAYS[date.getDay()];
  return Boolean(
    user.workDays?.includes(day) ||
    user.extraDays?.some((extraDay) => extraDay.date.startsWith(dateKey)),
  );
}

export interface DeliveryGateway {
  listAvailableDrivers(date?: Date): Promise<DeliveryDriver[]>;
  getStats(date: Date): Promise<DeliveryStat[]>;
  getDriverOrdersToday(driverId: string): Promise<Order[]>;
  finalizeOrder(
    orderId: string,
    paymentMethod: string,
    total: number,
    splitAmounts?: { efectivo?: number; tarjeta?: number; app?: number },
    customPayments?: OrderPaymentDetail[],
    certificateSerials?: string[],
  ): Promise<void>;
}

export const deliveryGateway: DeliveryGateway = {
  async listAvailableDrivers(date = new Date()) {
    const users: DeliveryDriver[] = await apiClient("/users");
    return users.filter((user) => isDriverAvailable(user, date));
  },

  getStats(date) {
    return apiClient(
      `/users/motorizados/delivery-stats?date=${toLocalDateKey(date)}`,
    );
  },

  async getDriverOrdersToday(driverId) {
    const orders: Parameters<typeof mapBackendOrderToFrontend>[0][] =
      await apiClient(`/orders/driver/${driverId}/today`);
    return orders.map(mapBackendOrderToFrontend);
  },

  async finalizeOrder(
    orderId,
    paymentMethod,
    total,
    splitAmounts,
    customPayments,
    certificateSerials,
  ) {
    let payments: OrderPaymentDetail[] = [];
    if (customPayments && customPayments.length > 0) {
      payments = customPayments.filter((p) => p.amount > 0);
    } else if (paymentMethod === "MIXTO" && splitAmounts) {
      payments = [
        { method: "EFECTIVO" as const, amount: splitAmounts.efectivo || 0 },
        { method: "TARJETA" as const, amount: splitAmounts.tarjeta || 0 },
        { method: "APP" as const, amount: splitAmounts.app || 0 },
      ].filter((p) => p.amount > 0);
    } else {
      payments = [
        {
          method: paymentMethod as OrderPaymentDetail["method"],
          amount: total,
        },
      ];
    }

    await apiClient(`/orders/${orderId}/finalize`, {
      method: "PATCH",
      body: JSON.stringify({
        status: "paid",
        payments,
        certificateSerials,
      }),
    });
  },
};
