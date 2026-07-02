import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../config/apiClient';

export interface Kitchen {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useKitchens() {
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchKitchens = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient('/kitchens');
      setKitchens(data);
    } catch (error) {
      console.error('Error fetching kitchens:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKitchens();
  }, [fetchKitchens]);

  const addKitchen = async (name: string, isActive: boolean = true) => {
    await apiClient('/kitchens', {
      method: 'POST',
      body: JSON.stringify({ name, isActive }),
    });
    await fetchKitchens();
  };

  const updateKitchen = async (id: string, name: string, isActive?: boolean) => {
    await apiClient(`/kitchens/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name, isActive }),
    });
    await fetchKitchens();
  };

  const deleteKitchen = async (id: string) => {
    await apiClient(`/kitchens/${id}`, {
      method: 'DELETE',
    });
    await fetchKitchens();
  };

  return { kitchens, isLoading, fetchKitchens, addKitchen, updateKitchen, deleteKitchen };
}
