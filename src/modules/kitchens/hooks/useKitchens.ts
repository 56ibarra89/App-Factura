import { useState, useEffect, useCallback } from 'react';
import {
  kitchensGateway,
  type Kitchen,
  type KitchensGateway,
} from '../api/kitchensGateway';

export type { Kitchen } from '../api/kitchensGateway';

export function useKitchens(gateway: KitchensGateway = kitchensGateway) {
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchKitchens = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await gateway.list();
      setKitchens(data);
    } catch (error) {
      console.error('Error fetching kitchens:', error);
    } finally {
      setIsLoading(false);
    }
  }, [gateway]);

  useEffect(() => {
    fetchKitchens();
  }, [fetchKitchens]);

  const addKitchen = async (name: string, isActive: boolean = true) => {
    await gateway.create(name, isActive);
    await fetchKitchens();
  };

  const updateKitchen = async (id: string, name: string, isActive?: boolean) => {
    await gateway.update(id, name, isActive);
    await fetchKitchens();
  };

  const deleteKitchen = async (id: string) => {
    await gateway.delete(id);
    await fetchKitchens();
  };

  return { kitchens, isLoading, fetchKitchens, addKitchen, updateKitchen, deleteKitchen };
}
