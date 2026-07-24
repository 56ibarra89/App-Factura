import { apiClient } from "../../config/apiClient";
import { deliveryPricingGateway } from "../config/deliveryPricingGateway";
import { packagingConfigGateway } from "../config/packagingConfigGateway";
import type { RedeemableCertificate } from "../../types/checkout";
import type { PackagingSizeConfig } from "../../types/product";
import type { UserAccount } from "../../types/user";

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
  findCertificate(serial: string): Promise<RedeemableCertificate>;
}

interface BackendCertificate {
  id: number;
  serial: string;
  status: string;
  items: Array<{ productId: string; quantity: number }>;
  description?: string;
  amount?: number | string;
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

  async findCertificate(serial) {
    const certificate: BackendCertificate = await apiClient(
      `/promotions/certificates/${serial.trim().toUpperCase()}`,
    );

    return {
      id: certificate.id,
      serial: certificate.serial,
      status: certificate.status,
      items: certificate.items,
      description: certificate.description,
      amount:
        certificate.amount === undefined
          ? undefined
          : Number(certificate.amount),
    };
  },
};
