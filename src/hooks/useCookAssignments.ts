import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../config/apiClient';

export interface CookKitchenAssignment {
  id: string;
  userId: string;
  kitchenId: string;
  dayOfWeek: string;
}

export interface CookUser {
  id: string;
  firstName: string;
  lastName: string;
  workDays?: string[];
  kitchenAssignments: CookKitchenAssignment[];
}

export function useCookAssignments() {
  const [cooks, setCooks] = useState<CookUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient('/kitchens/cooks/assignments');
      setCooks(data);
    } catch (error) {
      console.error('Error fetching cook assignments:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCooks();
  }, [fetchCooks]);

  const updateAssignments = async (userId: string, assignments: { dayOfWeek: string; kitchenId: string | null }[]) => {
    try {
      await apiClient(`/kitchens/cooks/${userId}/assignments`, {
        method: 'PATCH',
        body: JSON.stringify({ assignments }),
      });
      await fetchCooks(); // Refresh to get the latest data
    } catch (error) {
      console.error('Error updating assignments:', error);
      throw error;
    }
  };

  return { cooks, isLoading, fetchCooks, updateAssignments };
}
