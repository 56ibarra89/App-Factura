import { useState, useCallback } from 'react';

export interface EmpresaConfigState {
  logoUrl: string;
  businessName: string;
  address: string;
  phone: string;
  ticketFooter: string;
}

export const useEmpresaConfig = () => {
  const [config, setConfig] = useState<EmpresaConfigState>({
    logoUrl: '',
    businessName: 'Mi Negocio',
    address: 'Av. Principal 123, Ciudad',
    phone: '+1 234 567 8900',
    ticketFooter: '¡Gracias por su compra! Vuelva pronto.',
  });

  const updateField = useCallback(<K extends keyof EmpresaConfigState>(key: K, value: EmpresaConfigState[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const saveConfig = useCallback(() => {
    // Aquí se enviaría a la API o se guardaría en local
    console.log('Configuración de empresa guardada:', config);
    return Promise.resolve(true); 
  }, [config]);

  return {
    config,
    updateField,
    saveConfig
  };
};
