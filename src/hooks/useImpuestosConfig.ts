import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { logService } from '../services/logService';
import { localStore, setJson, tryGetJson } from "../services/storage/storage";

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

export const useImpuestosConfig = () => {
  const { username, role } = useAuth();

  const loadInitialConfig = (): TaxConfig => {
    const stored = tryGetJson<TaxConfig>(localStore, TAX_STORAGE_KEY);
    return stored ?? { taxes: defaultTaxes, isExonerated: false };
  };

  const [config, setConfig] = useState<TaxConfig>(loadInitialConfig());

  useEffect(() => {
    setJson(localStore, TAX_STORAGE_KEY, config);
  }, [config]);

  const taxes: Tax[] = config.taxes;
  const isExonerated: boolean = config.isExonerated;

  const toggleExoneration = useCallback(() => {
    setConfig((prev) => {
      const next = !prev.isExonerated;
      logService.log(
        username, 
        role, 
        "CONFIG_CHANGE", 
        `Exoneración de impuestos ${next ? "ACTIVADA" : "DESACTIVADA"}`
      );
      return { ...prev, isExonerated: next };
    });
  }, [username, role]);

  const updateTaxRate = useCallback((id: string, newPercentage: number) => {
    setConfig((prev) => {
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
  }, [username, role]);

  return {
    taxes,
    isExonerated,
    toggleExoneration,
    updateTaxRate
  };
};
