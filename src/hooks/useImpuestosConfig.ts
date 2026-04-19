import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { logService } from '../services/logService';

export interface Tax {
  id: string;
  name: string;
  percentage: number;
}

export const useImpuestosConfig = () => {
  const { username, role } = useAuth();

  // Estado base falso para impuestos
  const [taxes, setTaxes] = useState<Tax[]>([
    { id: '1', name: 'Módulo Principal de ITBMS/IVA', percentage: 15 }
  ]);
  
  // Estado para la exoneración global
  const [isExonerated, setIsExonerated] = useState<boolean>(false);

  const toggleExoneration = useCallback(() => {
    setIsExonerated(prev => {
      const next = !prev;
      logService.log(
        username, 
        role, 
        "CONFIG_CHANGE", 
        `Exoneración de impuestos ${next ? "ACTIVADA" : "DESACTIVADA"}`
      );
      return next;
    });
  }, [username, role]);

  const updateTaxRate = useCallback((id: string, newPercentage: number) => {
    setTaxes(prev => {
      const tax = prev.find(t => t.id === id);
      if (tax) {
        logService.log(
          username, 
          role, 
          "CONFIG_CHANGE", 
          `Cambio de tasa de '${tax.name}' a ${newPercentage}%`
        );
      }
      return prev.map(tax => 
        tax.id === id ? { ...tax, percentage: newPercentage } : tax
      );
    });
  }, [username, role]);

  return {
    taxes,
    isExonerated,
    toggleExoneration,
    updateTaxRate
  };
};
