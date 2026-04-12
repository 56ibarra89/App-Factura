import { useState, useCallback } from 'react';

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
  }, []);

  return {
    config,
    updatePreference,
  };
};
