import { apiClient } from "../../config/apiClient";
import type { DeliveryStat } from "../../types/delivery";
import type { Order } from "../../types/order.types";
import type { UserAccount } from "../../types/user";

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

function isDriverAvailable(user: UserAccount, date: Date): boolean {
  if (user.role !== "motorizado") return false;
  const dateKey = toLocalDateKey(date);
  const day = WEEK_DAYS[date.getDay()];
  return Boolean(
    user.workDays?.includes(day) ||
      user.extraDays?.some((extraDay) => extraDay.date.startsWith(dateKey)),
  );
}

export interface DeliveryGateway {
  listAvailableDrivers(date?: Date): Promise<UserAccount[]>;
  getStats(date: Date): Promise<DeliveryStat[]>;
  getDriverOrdersToday(driverId: string): Promise<Order[]>;
  finalizeOrder(
    orderId: string,
    paymentMethod: string,
    total: number,
  ): Promise<void>;
}

export const deliveryGateway: DeliveryGateway = {
  async listAvailableDrivers(date = new Date()) {
    const users: UserAccount[] = await apiClient("/users");
    return users.filter((user) => isDriverAvailable(user, date));
  },

  getStats(date) {
    return apiClient(
      `/users/motorizados/delivery-stats?date=${toLocalDateKey(date)}`,
    );
  },

  getDriverOrdersToday: (driverId) =>
    apiClient(`/orders/driver/${driverId}/today`),

  async finalizeOrder(orderId, paymentMethod, total) {
    await apiClient(`/orders/${orderId}/finalize`, {
      method: "PATCH",
      body: JSON.stringify({
        status: "paid",
        payments: [{ method: paymentMethod, amount: total }],
      }),
    });
  },
};
