import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { logService } from '../services/logService';
import { configRepository } from '../repositories/ConfigRepository';

export interface EmpresaConfigState {
  logoUrl: string;
  businessName: string;
  address: string;
  phone: string;
  ticketFooter: string;
}

export const useEmpresaConfig = () => {
  const { username, role } = useAuth();
  const defaultConfig: EmpresaConfigState = {
    logoUrl: '',
    businessName: 'Mi Negocio',
    address: 'Av. Principal 123, Ciudad',
    phone: '+1 234 567 8900',
    ticketFooter: '¡Gracias por su compra! Vuelva pronto.',
  };

  const [config, setConfig] = useState<EmpresaConfigState>(defaultConfig);

  useEffect(() => {
    configRepository.getEmpresaConfig().then((data) => {
      if (data && Object.keys(data).length > 0) {
        setConfig(prev => ({ ...prev, ...data }));
      }
    });
  }, []);

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

    // Guardar en backend a través del repositorio
    return configRepository.saveEmpresaConfig(sanitizedConfig)
      .then(() => {
        console.log('Configuración de empresa guardada:', sanitizedConfig);
        setConfig(sanitizedConfig); // Actualizar el estado con los valores sanitizados
        
        logService.log(
          username, 
          role, 
          "CONFIG_CHANGE", 
          `Actualización de datos de identidad de la empresa (${sanitizedConfig.businessName})`
        );
        return true;
      })
      .catch((error) => {
        console.error('Error al guardar la configuración:', error);
        return false;
      });
  }, [config, username, role]);

  const resetConfig = useCallback(() => {
    return configRepository.saveEmpresaConfig(defaultConfig)
      .then(() => {
        setConfig(defaultConfig);
        logService.log(username, role, "CONFIG_CHANGE", "Identidad de la empresa restablecida a valores por defecto");
        return true;
      })
      .catch((error) => {
        console.error('Error al restablecer la configuración:', error);
        return false;
      });
  }, [username, role]);

  return {
    config,
    updateField,
    saveConfig,
    resetConfig
  };
};
