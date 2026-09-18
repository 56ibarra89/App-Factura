import { apiClient, runtimeConfigGateway } from "../../../shared/api";
import {
  normalizePaymentMethodsConfig,
  type PaymentMethodsConfig,
  type PaymentMetrics,
} from "../model/paymentMethods.types";

const CONFIG_KEY = "payment_methods";

export const paymentMethodsGateway = {
  async load() {
    const saved =
      await runtimeConfigGateway.get<Partial<PaymentMethodsConfig>>(CONFIG_KEY);
    return normalizePaymentMethodsConfig(saved);
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
