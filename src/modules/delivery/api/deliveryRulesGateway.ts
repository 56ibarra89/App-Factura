import {
  runtimeConfigGateway,
  type RuntimeConfigGateway,
} from "../../../shared/api";
import { localStore } from "../../../shared/storage/storage";
import type { DeliveryRulesConfig } from "../model/delivery.types";
import { deliveryPricingGateway } from "./deliveryPricingGateway";

export const DELIVERY_RULES_KEY = "delivery_rules";

export const DEFAULT_DELIVERY_RULES: DeliveryRulesConfig = {
  freeDeliveryEnabled: false,
  freeDeliveryMinAmount: 0,
  zones: [],
};

export interface DeliveryRulesGateway {
  load(): Promise<DeliveryRulesConfig>;
  save(config: DeliveryRulesConfig): Promise<void>;
}

export function createDeliveryRulesGateway(
  runtime: RuntimeConfigGateway = runtimeConfigGateway,
): DeliveryRulesGateway {
  return {
    async load(): Promise<DeliveryRulesConfig> {
      try {
        const payload = await runtime.get<DeliveryRulesConfig>(DELIVERY_RULES_KEY);
        if (payload && Array.isArray(payload.zones)) {
          return {
            freeDeliveryEnabled:
              typeof payload.freeDeliveryEnabled === "boolean"
                ? payload.freeDeliveryEnabled
                : false,
            freeDeliveryMinAmount:
              typeof payload.freeDeliveryMinAmount === "number"
                ? payload.freeDeliveryMinAmount
                : 0,
            zones: payload.zones,
          };
        }
      } catch (error) {
        console.warn("No se pudo cargar reglas de delivery desde runtime, verificando localStore:", error);
      }

      // Respaldo en localStore si el servidor aún no tiene la clave
      try {
        const localData = localStore.getItem(DELIVERY_RULES_KEY);
        if (localData) {
          const parsed = JSON.parse(localData) as DeliveryRulesConfig;
          if (parsed && Array.isArray(parsed.zones)) {
            return {
              freeDeliveryEnabled: Boolean(parsed.freeDeliveryEnabled),
              freeDeliveryMinAmount: Number(parsed.freeDeliveryMinAmount) || 0,
              zones: parsed.zones,
            };
          }
        }
      } catch {
        // ignore
      }

      return DEFAULT_DELIVERY_RULES;
    },

    async save(config: DeliveryRulesConfig): Promise<void> {
      try {
        localStore.setItem(DELIVERY_RULES_KEY, JSON.stringify(config));
      } catch {
        // ignore
      }

      // Sincronizar con backend AppConfig
      await runtime.save(DELIVERY_RULES_KEY, config);

      // Mantener sincronizado el gateway clásico de 6 precios para compatibilidad con vistas legacy
      try {
        const activePrices = config.zones
          .filter((z) => z.isActive)
          .map((z) => String(z.price));
        await deliveryPricingGateway.save(activePrices);
      } catch {
        // ignore
      }
    },
  };
}

export const deliveryRulesGateway = createDeliveryRulesGateway();
