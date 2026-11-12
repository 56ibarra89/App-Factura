import { useCallback, useEffect, useState } from "react";
import {
  serviceSlaGateway,
  type ServiceSlaGateway,
} from "../api/serviceSlaGateway";
import {
  DEFAULT_SERVICE_SLA_CONFIG,
  normalizeServiceSlaConfig,
  type ServiceSlaConfig,
  type ServiceSlaMetrics,
} from "../model/serviceSla.types";

export function useServiceSlaConfig(
  options: { loadMetrics?: boolean; pollMs?: number } = {},
  gateway: ServiceSlaGateway = serviceSlaGateway,
) {
  const [config, setConfig] = useState<ServiceSlaConfig>(
    DEFAULT_SERVICE_SLA_CONFIG,
  );
  const [metrics, setMetrics] = useState<ServiceSlaMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const loaded = await gateway.load();
      setConfig(loaded);
      if (options.loadMetrics) {
        try {
          setMetrics(await gateway.loadMetrics(30));
        } catch {
          setMetrics(null);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [gateway, options.loadMetrics]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const pollMs = options.pollMs ?? 60000;
    if (pollMs <= 0) return;
    const timer = window.setInterval(() => {
      void gateway
        .load()
        .then(setConfig)
        .catch(() => undefined);
    }, pollMs);
    return () => window.clearInterval(timer);
  }, [gateway, options.pollMs]);

  const update = useCallback(
    <K extends keyof ServiceSlaConfig>(key: K, value: ServiceSlaConfig[K]) => {
      setConfig((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const save = useCallback(async () => {
    const normalized = normalizeServiceSlaConfig(config);
    setIsSaving(true);
    try {
      await gateway.save(normalized);
      setConfig(normalized);
      if (options.loadMetrics) {
        try {
          setMetrics(await gateway.loadMetrics(30));
        } catch {
          setMetrics(null);
        }
      }
    } finally {
      setIsSaving(false);
    }
  }, [config, gateway, options.loadMetrics]);

  return { config, metrics, isLoading, isSaving, update, save, reload };
}
