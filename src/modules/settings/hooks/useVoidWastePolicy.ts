import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth";
import {
  getBusinessDateString,
  getBusinessMonthStartString,
  parseBusinessDayEnd,
  parseBusinessDayStart,
} from "../../../shared/format";
import {
  voidWastePolicyGateway,
  type VoidWastePolicyGateway,
} from "../api/voidWastePolicyGateway";
import {
  DEFAULT_VOID_WASTE_POLICY_CONFIG,
  normalizeVoidWastePolicyConfig,
  type CancellationMetrics,
  type VoidWastePolicyConfig,
} from "../model/voidWastePolicy.types";

export function useVoidWastePolicy(
  gateway: VoidWastePolicyGateway = voidWastePolicyGateway,
) {
  const { role, hasPermission } = useAuth();
  const canReadMetrics = role === "admin" && hasPermission("reports.read", "orders.read");
  const [config, setConfig] = useState<VoidWastePolicyConfig>(
    DEFAULT_VOID_WASTE_POLICY_CONFIG,
  );
  const [metrics, setMetrics] = useState<CancellationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadMetrics = useCallback(
    async (startDate: Date, endDate: Date) => {
      setLoadError(null);
      if (!canReadMetrics) {
        setMetrics(null);
        return;
      }
      setMetrics(await gateway.loadMetrics(startDate, endDate));
    },
    [canReadMetrics, gateway],
  );

  useEffect(() => {
    let active = true;
    const now = new Date();
    const start =
      parseBusinessDayStart(getBusinessMonthStartString(now)) ?? now;
    const end = parseBusinessDayEnd(getBusinessDateString(now)) ?? now;
    setLoadError(null);
    gateway.load()
      .then((loadedConfig) => {
        if (!active) return;
        setConfig(loadedConfig);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las políticas de anulación.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    if (canReadMetrics) {
      void gateway.loadMetrics(start, end)
        .then((loadedMetrics) => { if (active) setMetrics(loadedMetrics); })
        .catch(() => { if (active) setMetrics(null); });
    }
    return () => {
      active = false;
    };
  }, [canReadMetrics, gateway]);

  const save = useCallback(async () => {
    setIsSaving(true);
    try {
      const normalized = normalizeVoidWastePolicyConfig(config);
      await gateway.save(normalized);
      setConfig(normalized);
    } finally {
      setIsSaving(false);
    }
  }, [config, gateway]);

  return {
    canReadMetrics,
    config,
    setConfig,
    metrics,
    isLoading,
    isSaving,
    loadError,
    save,
    loadMetrics,
  };
}
