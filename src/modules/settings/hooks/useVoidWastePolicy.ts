import { useCallback, useEffect, useState } from "react";
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
  const [config, setConfig] = useState<VoidWastePolicyConfig>(
    DEFAULT_VOID_WASTE_POLICY_CONFIG,
  );
  const [metrics, setMetrics] = useState<CancellationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadMetrics = useCallback(
    async (startDate: Date, endDate: Date) => {
      setMetrics(await gateway.loadMetrics(startDate, endDate));
    },
    [gateway],
  );

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    Promise.all([gateway.load(), gateway.loadMetrics(start, now)])
      .then(([loadedConfig, loadedMetrics]) => {
        setConfig(loadedConfig);
        setMetrics(loadedMetrics);
      })
      .finally(() => setIsLoading(false));
  }, [gateway]);

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
    config,
    setConfig,
    metrics,
    isLoading,
    isSaving,
    save,
    loadMetrics,
  };
}
