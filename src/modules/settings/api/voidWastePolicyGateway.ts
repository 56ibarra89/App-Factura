import { apiClient, runtimeConfigGateway } from "../../../shared/api";
import {
  normalizeVoidWastePolicyConfig,
  type CancellationMetrics,
  type VoidWastePolicyConfig,
} from "../model/voidWastePolicy.types";

const CONFIG_KEY = "void_waste_policies";

export interface VoidWastePolicyGateway {
  load(): Promise<VoidWastePolicyConfig>;
  save(config: VoidWastePolicyConfig): Promise<void>;
  loadMetrics(startDate: Date, endDate: Date): Promise<CancellationMetrics>;
}

export const voidWastePolicyGateway: VoidWastePolicyGateway = {
  async load() {
    const saved =
      await runtimeConfigGateway.get<Partial<VoidWastePolicyConfig>>(
        CONFIG_KEY,
      );
    return normalizeVoidWastePolicyConfig(saved);
  },
  save: (config) =>
    runtimeConfigGateway.save(
      CONFIG_KEY,
      normalizeVoidWastePolicyConfig(config),
    ),
  loadMetrics: (startDate, endDate) =>
    apiClient(
      `/orders/cancellations/metrics?startDate=${encodeURIComponent(startDate.toISOString())}&endDate=${encodeURIComponent(endDate.toISOString())}`,
    ),
};
