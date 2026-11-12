import { apiClient } from "../../../shared/api";
import { deliveryPricingGateway } from "../../delivery";
import { packagingConfigGateway } from "../../catalog";
import type { PackagingSizeConfig } from "../../catalog";
import type { UserAccount } from "../../accounts";

export interface DeliveryDriverStats {
  userId: string;
  todayDeliveries: number;
}

export interface DeliveryDriverOptions {
  drivers: UserAccount[];
  stats: DeliveryDriverStats[];
}

export interface CheckoutGateway {
  getPackagingSizes(): Promise<PackagingSizeConfig[]>;
  getDeliveryPrices(): Promise<string[]>;
  getDeliveryDrivers(date: Date): Promise<DeliveryDriverOptions>;
}

const WEEK_DAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

function formatLocalDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export const checkoutGateway: CheckoutGateway = {
  async getPackagingSizes() {
    return (await packagingConfigGateway.load()) ?? [];
  },

  async getDeliveryPrices() {
    const prices = (await deliveryPricingGateway.load()) ?? [];
    return prices.filter((price) => price.trim() !== "");
  },

  async getDeliveryDrivers(date) {
    const dateString = formatLocalDate(date);
    const day = WEEK_DAYS[date.getDay()];
    const users: UserAccount[] = await apiClient("/users");
    const drivers = users.filter((user) => {
      if (user.role !== "motorizado") return false;

      const isScheduled = user.workDays?.includes(day) ?? false;
      const hasExtraDay =
        user.extraDays?.some((extraDay) =>
          extraDay.date.startsWith(dateString),
        ) ?? false;
      return isScheduled || hasExtraDay;
    });
    const stats: DeliveryDriverStats[] = await apiClient(
      `/users/motorizados/delivery-stats?date=${dateString}`,
    );

    return { drivers, stats };
  },
};
