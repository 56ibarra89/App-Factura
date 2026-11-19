import { apiClient, runtimeConfigGateway } from "../../../shared/api";
import {
  normalizePaymentMethodsConfig,
  resolveOperationalPaymentMethods,
  type PaymentMethodsConfig,
  type PaymentMetrics,
} from "../model/paymentMethods.types";

const CONFIG_KEY = "payment_methods";
export type PaymentMethodsGateway = typeof paymentMethodsGateway;

export const paymentMethodsGateway = {
  async load() {
    const saved =
      await runtimeConfigGateway.get<Partial<PaymentMethodsConfig>>(CONFIG_KEY);
    return normalizePaymentMethodsConfig(saved);
  },
  async loadOperational() {
    const [methods, general] = await Promise.all([
      this.load(),
      runtimeConfigGateway.get<{ enableSecondaryCurrency?: boolean; secondaryCurrencyCode?: string; exchangeRate?: number }>("general_config"),
    ]);
    return resolveOperationalPaymentMethods(methods, general);
  },
  save(config: PaymentMethodsConfig) {
    return runtimeConfigGateway.save(
      CONFIG_KEY,
      normalizePaymentMethodsConfig(config),
    );
  },
  metrics(startDate: Date, endDate: Date): Promise<PaymentMetrics> {
    return apiClient(
      `/orders/payments/metrics?startDate=${encodeURIComponent(startDate.toISOString())}&endDate=${encodeURIComponent(endDate.toISOString())}`,
    );
  },
};
