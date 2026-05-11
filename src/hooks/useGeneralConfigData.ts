import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { logService } from '../services/logService';
import { configRepository } from '../repositories/ConfigRepository';

const GENERAL_CONFIG_UPDATED_EVENT = 'appfactura:general-config-updated';

export interface GeneralConfigState {
  // Preferences
  theme: 'light' | 'dark';
  language: 'es' | 'en';
  // Currency
  currencyCode: string;
  currencySymbol: string;
  enableSecondaryCurrency: boolean;
  secondaryCurrencyCode: string;
  secondaryCurrencySymbol: string;
  exchangeRate: number;
  // Box Behavior
  requireExactOpeningAmount: boolean;
  autoPrintReceipt: boolean;
  blindCashCount: boolean;
}

export const useGeneralConfigData = () => {
  const { username, role } = useAuth();
  // Mock inicial
  const [config, setConfig] = useState<GeneralConfigState>({
    theme: 'light',
    language: 'es',
    currencyCode: 'NIO',
    currencySymbol: 'C$',
    enableSecondaryCurrency: true,
    secondaryCurrencyCode: 'USD',
    secondaryCurrencySymbol: '$',
    exchangeRate: 36.50,
    requireExactOpeningAmount: false,
    autoPrintReceipt: true,
    blindCashCount: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Mantener varias instancias del hook en sync (p.ej. Admin y Facturación)
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

  // Cargar configuración inicial
  useEffect(() => {
    let isMounted = true;
    const loadConfig = async () => {
      try {
        const savedConfig = await configRepository.getGeneralConfig();
        if (isMounted && savedConfig) {
          setConfig((prev) => ({ ...prev, ...savedConfig }));
        }
      } catch (error) {
        console.error("Error cargando configuración:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadConfig();
    return () => { isMounted = false; };
  }, []);

  const updatePreference = useCallback(<K extends keyof GeneralConfigState>(key: K, value: GeneralConfigState[K]) => {
    setConfig(prev => {
      const newConfig = { ...prev, [key]: value };
      
      // Guardar asíncronamente en IndexedDB
      configRepository.saveGeneralConfig(newConfig).catch(err => {
        console.error("Error guardando configuración:", err);
      });

      // Notificar a otras instancias del hook (misma ventana)
      window.dispatchEvent(new CustomEvent(GENERAL_CONFIG_UPDATED_EVENT, { detail: { [key]: value } as Partial<GeneralConfigState> }));
      
      return newConfig;
    });
    
    // Solo loggear cambios críticos para no saturar la bitácora
    const criticalKeys: (keyof GeneralConfigState)[] = [
      'currencyCode', 'exchangeRate', 'enableSecondaryCurrency', 
      'requireExactOpeningAmount', 'blindCashCount'
    ];

    if (criticalKeys.includes(key)) {
      logService.log(
        username, 
        role, 
        "CONFIG_CHANGE", 
        `Cambio en preferencia del sistema: ${String(key)} a ${String(value)}`
      );
    }
  }, [username, role]);

  const saveConfig = useCallback(async (override?: Partial<GeneralConfigState>) => {
    const configToSave = { ...configRef.current, ...(override ?? {}) };
    await configRepository.saveGeneralConfig(configToSave);

    // Verificación simple: volver a leer lo persistido (si falla, al menos mantenemos el estado local)
    const persisted = await configRepository.getGeneralConfig();
    const nextConfig = persisted ? { ...configToSave, ...persisted } : configToSave;
    setConfig(nextConfig);

    window.dispatchEvent(new CustomEvent(GENERAL_CONFIG_UPDATED_EVENT, { detail: override ?? configToSave }));
  }, []);

  return {
    config,
    isLoading,
    updatePreference,
    saveConfig,
  };
};
