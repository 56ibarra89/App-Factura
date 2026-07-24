import {
  runtimeConfigGateway,
  type RuntimeConfigGateway,
} from "./runtimeConfigGateway";

const DELIVERY_PRICES_KEY = "delivery_prices";

interface DeliveryPricesPayload {
  prices?: string[];
}

export interface DeliveryPricingGateway {
  load(): Promise<string[] | null>;
  save(prices: string[]): Promise<void>;
}

export function createDeliveryPricingGateway(
  runtime: RuntimeConfigGateway,
): DeliveryPricingGateway {
  return {
    async load() {
      try {
        const payload =
          await runtime.get<DeliveryPricesPayload>(DELIVERY_PRICES_KEY);
        return payload?.prices ?? null;
      } catch (error) {
        console.error("Error obteniendo precios de delivery:", error);
        return null;
      }
    },

    save: (prices) => runtime.save(DELIVERY_PRICES_KEY, { prices }),
  };
}

export const deliveryPricingGateway =
  createDeliveryPricingGateway(runtimeConfigGateway);
