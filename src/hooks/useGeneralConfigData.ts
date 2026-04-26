import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { logService } from '../services/logService';

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

  const updatePreference = useCallback(<K extends keyof GeneralConfigState>(key: K, value: GeneralConfigState[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    
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

  return {
    config,
    updatePreference,
  };
};
