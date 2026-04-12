import { useState, useCallback } from 'react';

export interface Tax {
  id: string;
  name: string;
  percentage: number;
}

export const useImpuestosConfig = () => {
  // Estado base falso para impuestos
  const [taxes, setTaxes] = useState<Tax[]>([
    { id: '1', name: 'Módulo Principal de ITBMS/IVA', percentage: 15 }
  ]);
  
  // Estado para la exoneración global
  const [isExonerated, setIsExonerated] = useState<boolean>(false);

  const toggleExoneration = useCallback(() => {
    setIsExonerated(prev => !prev);
  }, []);

  const updateTaxRate = useCallback((id: string, newPercentage: number) => {
    setTaxes(prev => prev.map(tax => 
      tax.id === id ? { ...tax, percentage: newPercentage } : tax
    ));
  }, []);

  return {
    taxes,
    isExonerated,
    toggleExoneration,
    updateTaxRate
  };
};
