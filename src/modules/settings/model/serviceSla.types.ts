export interface ServiceSlaConfig {
  kitchenWarningMinutes: number;
  kitchenCriticalMinutes: number;
  deliveryMaxMinutes: number;
  deliveryAlertsEnabled: boolean;
}

export interface SlaMetricSummary {
  completed: number;
  averageMinutes: number;
  onTimeCount: number;
  onTimePercent: number;
}

export interface ServiceSlaMetrics {
  days: number;
  config: ServiceSlaConfig;
  kitchen: SlaMetricSummary;
  delivery: SlaMetricSummary;
}

export const DEFAULT_SERVICE_SLA_CONFIG: ServiceSlaConfig = {
  kitchenWarningMinutes: 12,
  kitchenCriticalMinutes: 18,
  deliveryMaxMinutes: 35,
  deliveryAlertsEnabled: true,
};

const clamp = (value: unknown, fallback: number, min: number, max: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
};

export function normalizeServiceSlaConfig(
  value?: Partial<ServiceSlaConfig> | null,
): ServiceSlaConfig {
  const warning = clamp(
    value?.kitchenWarningMinutes,
    DEFAULT_SERVICE_SLA_CONFIG.kitchenWarningMinutes,
    1,
    240,
  );
  const critical = clamp(
    value?.kitchenCriticalMinutes,
    DEFAULT_SERVICE_SLA_CONFIG.kitchenCriticalMinutes,
    2,
    360,
  );
  return {
    kitchenWarningMinutes: warning,
    kitchenCriticalMinutes: Math.max(warning + 1, critical),
    deliveryMaxMinutes: clamp(
      value?.deliveryMaxMinutes,
      DEFAULT_SERVICE_SLA_CONFIG.deliveryMaxMinutes,
      5,
      720,
    ),
    deliveryAlertsEnabled:
      typeof value?.deliveryAlertsEnabled === "boolean"
        ? value.deliveryAlertsEnabled
        : DEFAULT_SERVICE_SLA_CONFIG.deliveryAlertsEnabled,
  };
}
