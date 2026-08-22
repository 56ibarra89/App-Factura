import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from "../../auth";
import { logService } from '../../audit';
import {
  generalConfigGateway,
  type GeneralConfigGateway,
} from '../api/generalConfigGateway';
import {
  DEFAULT_GENERAL_CONFIG,
  type GeneralConfigState,
} from '../model/settings.types';

const GENERAL_CONFIG_UPDATED_EVENT = 'appfactura:general-config-updated';

export type { GeneralConfigState } from '../model/settings.types';

export const useGeneralSettings = (
  gateway: GeneralConfigGateway = generalConfigGateway,
) => {
  const { username, role } = useAuth();
  const [config, setConfig] =
    useState<GeneralConfigState>(DEFAULT_GENERAL_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    const onUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<Partial<GeneralConfigState>>;
      const next = customEvent.detail;
      if (!next) return;
      setConfig(prev => ({ ...prev, ...next }));
    };

    window.addEventListener(GENERAL_CONFIG_UPDATED_EVENT, onUpdated);
    return () => window.removeEventListener(GENERAL_CONFIG_UPDATED_EVENT, onUpdated);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadConfig = async () => {
      try {
        const savedConfig = await gateway.load();
        if (isMounted && savedConfig) {
          setConfig((prev) => ({ ...prev, ...savedConfig }));

          window.dispatchEvent(new CustomEvent(GENERAL_CONFIG_UPDATED_EVENT, { detail: savedConfig }));
        }
      } catch (error) {
        console.error("Error cargando configuración:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadConfig();
    return () => { isMounted = false; };
  }, [gateway]);

  const updatePreference = useCallback(<K extends keyof GeneralConfigState>(key: K, value: GeneralConfigState[K]) => {
    setConfig(prev => {
      const newConfig = { ...prev, [key]: value };

      gateway.save(newConfig).catch(err => {
        console.error("Error guardando configuración:", err);
      });

      window.dispatchEvent(new CustomEvent(GENERAL_CONFIG_UPDATED_EVENT, { detail: { [key]: value } as Partial<GeneralConfigState> }));

      return newConfig;
    });

    const criticalKeys: (keyof GeneralConfigState)[] = [
      'currencyCode', 'exchangeRate', 'enableSecondaryCurrency',
      'requireExactOpeningAmount', 'blindCashCount',
      'cashDiscrepancyThreshold'
    ];

    if (criticalKeys.includes(key)) {
      logService.log(
        username,
        role,
        "CONFIG_CHANGE",
        `Cambio en preferencia del sistema: ${String(key)} a ${String(value)}`
      );
    }
  }, [gateway, username, role]);

  const saveConfig = useCallback(async (override?: Partial<GeneralConfigState>) => {
    const configToSave = { ...configRef.current, ...(override ?? {}) };
    await gateway.save(configToSave);

    // Verificación simple: volver a leer lo persistido (si falla, al menos mantenemos el estado local)
    const persisted = await gateway.load();
    const nextConfig = persisted ? { ...configToSave, ...persisted } : configToSave;
    setConfig(nextConfig);

    window.dispatchEvent(new CustomEvent(GENERAL_CONFIG_UPDATED_EVENT, { detail: override ?? configToSave }));
  }, [gateway]);

  return {
    config,
    isLoading,
    updatePreference,
    saveConfig,
  };
};
