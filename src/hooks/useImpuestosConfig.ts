import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { logService } from '../services/logService';
import {
  runtimeConfigGateway,
  type RuntimeConfigGateway,
} from '../services/config/runtimeConfigGateway';

export interface Tax {
  id: string;
  name: string;
  percentage: number;
}

export interface TaxConfig {
  taxes: Tax[];
  isExonerated: boolean;
}

const TAX_STORAGE_KEY = 'app_factura_tax_config';

const defaultTaxes: Tax[] = [
  { id: '1', name: 'Módulo Principal de ITBMS/IVA', percentage: 15 }
];

const defaultConfig: TaxConfig = { taxes: defaultTaxes, isExonerated: false };

// Pequeño caché global y listeners para sincronizar las instancias del hook
let globalConfigCache: TaxConfig | null = null;
const listeners = new Set<(config: TaxConfig) => void>();

export const useImpuestosConfig = (
  gateway: RuntimeConfigGateway = runtimeConfigGateway,
) => {
  const { username, role } = useAuth();
  const [config, setConfigState] = useState<TaxConfig>(globalConfigCache || defaultConfig);

  // Guardar configuración en estado global, notificar y enviar al backend
  const setConfigAndSave = useCallback((newConfig: TaxConfig | ((prev: TaxConfig) => TaxConfig)) => {
    const nextConfig = typeof newConfig === 'function' ? newConfig(config) : newConfig;
    
    globalConfigCache = nextConfig;
    listeners.forEach(listener => listener(nextConfig));
    
    gateway
      .save(TAX_STORAGE_KEY, nextConfig)
      .catch(err => console.error("Error saving tax config:", err));
  }, [config, gateway]);

  // Cargar del backend en la primera instancia
  useEffect(() => {
    const listener = (newConfig: TaxConfig) => setConfigState(newConfig);
    listeners.add(listener);

    if (!globalConfigCache) {
      gateway.get<TaxConfig>(TAX_STORAGE_KEY)
        .then(res => {
          if (res && Array.isArray(res.taxes)) {
            globalConfigCache = res;
            listeners.forEach(l => l(res));
          } else {
            // Guardar default inicial en DB si no existe data formateada
            globalConfigCache = defaultConfig;
            listeners.forEach(l => l(defaultConfig));
          }
        })
        .catch(err => console.error("Error loading tax config:", err));
    }

    return () => {
      listeners.delete(listener);
    };
  }, [gateway]);

  const taxes: Tax[] = config.taxes;
  const isExonerated: boolean = config.isExonerated;

  const toggleExoneration = useCallback(() => {
    setConfigAndSave((prev) => {
      const next = !prev.isExonerated;
      logService.log(
        username, 
        role, 
        "CONFIG_CHANGE", 
        `Exoneración de impuestos ${next ? "ACTIVADA" : "DESACTIVADA"}`
      );
      return { ...prev, isExonerated: next };
    });
  }, [username, role, setConfigAndSave]);

  const updateTaxRate = useCallback((id: string, newPercentage: number) => {
    setConfigAndSave((prev) => {
      const tax = prev.taxes.find((t: Tax) => t.id === id);
      if (tax) {
        logService.log(
          username, 
          role, 
          "CONFIG_CHANGE", 
          `Cambio de tasa de '${tax.name}' a ${newPercentage}%`
        );
      }
      return {
        ...prev,
        taxes: prev.taxes.map((tax: Tax) => 
          tax.id === id ? { ...tax, percentage: newPercentage } : tax
        )
      };
    });
  }, [username, role, setConfigAndSave]);

  return {
    taxes,
    isExonerated,
    toggleExoneration,
    updateTaxRate
  };
};
