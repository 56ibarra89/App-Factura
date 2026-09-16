import { apiClient, runtimeConfigGateway } from "../../../shared/api";
import {
  normalizeServiceSlaConfig,
  type ServiceSlaConfig,
  type ServiceSlaMetrics,
} from "../model/serviceSla.types";

const SERVICE_SLA_CONFIG_KEY = "service_slas";

export interface ServiceSlaGateway {
  load(): Promise<ServiceSlaConfig>;
  save(config: ServiceSlaConfig): Promise<void>;
  loadMetrics(days?: number): Promise<ServiceSlaMetrics>;
}

export const serviceSlaGateway: ServiceSlaGateway = {
  async load() {
    const saved = await runtimeConfigGateway.get<Partial<ServiceSlaConfig>>(
      SERVICE_SLA_CONFIG_KEY,
    );
    return normalizeServiceSlaConfig(saved);
  },
  save: (config) =>
    runtimeConfigGateway.save(
      SERVICE_SLA_CONFIG_KEY,
      normalizeServiceSlaConfig(config),
    ),
  loadMetrics: (days = 30) =>
    apiClient(`/orders/sla/metrics?days=${encodeURIComponent(days)}`),
};
