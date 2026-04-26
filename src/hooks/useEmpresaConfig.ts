import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { logService } from '../services/logService';

export interface EmpresaConfigState {
  logoUrl: string;
  businessName: string;
  address: string;
  phone: string;
  ticketFooter: string;
}

export const useEmpresaConfig = () => {
  const { username, role } = useAuth();
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
    // Sanitización proactiva (ISO 27001 A.12.2.1)
    const sanitize = (text: string, limit: number) => {
      return text
        .replace(/<[^>]*>?/gm, "") // Remover etiquetas HTML
        .substring(0, limit)
        .trim();
    };

    const sanitizedConfig = {
      ...config,
      businessName: sanitize(config.businessName, 100),
      address: sanitize(config.address, 200),
      phone: sanitize(config.phone, 20),
      ticketFooter: sanitize(config.ticketFooter, 300)
    };

    // Aquí se enviaría a la API o se guardaría en local
    console.log('Configuración de empresa guardada:', sanitizedConfig);
    
    logService.log(
      username, 
      role, 
      "CONFIG_CHANGE", 
      `Actualización de datos de identidad de la empresa (${sanitizedConfig.businessName})`
    );

    return Promise.resolve(true); 
  }, [config, username, role]);

  return {
    config,
    updateField,
    saveConfig
  };
};
