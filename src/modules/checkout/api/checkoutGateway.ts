import { apiClient } from "../../../shared/api";
import { getBusinessDateString } from "../../../shared/format";
import { deliveryPricingGateway } from "../../delivery";
import type { DeliveryDriver } from "../../delivery";
import { packagingConfigGateway } from "../../catalog";
import type { PackagingSizeConfig } from "../../catalog";

export interface DeliveryDriverStats {
  userId: string;
  todayDeliveries: number;
}

export interface DeliveryDriverOptions {
  drivers: DeliveryDriver[];
  stats: DeliveryDriverStats[];
}

export interface CheckoutGateway {
  getPackagingSizes(): Promise<PackagingSizeConfig[]>;
  getDeliveryPrices(): Promise<string[]>;
  getDeliveryDrivers(date: Date): Promise<DeliveryDriverOptions>;
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
    const dateString = getBusinessDateString(date);
    const [drivers, stats] = await Promise.all([
      apiClient<DeliveryDriver[]>(`/users/drivers?date=${dateString}`),
      apiClient<DeliveryDriverStats[]>(
        `/users/motorizados/delivery-stats?date=${dateString}`,
      ).catch(() => [] as DeliveryDriverStats[]),
    ]);

    return { drivers, stats };
  },
};
