import { useState, useEffect, useCallback } from 'react';
import {
  kitchensGateway,
  type CookAssignmentPayload,
  type CookUser,
  type KitchensGateway,
} from '../services/kitchens/kitchensGateway';

export type {
  CookKitchenAssignment,
  CookUser,
} from '../services/kitchens/kitchensGateway';

export function useCookAssignments(
  gateway: KitchensGateway = kitchensGateway,
) {
  const [cooks, setCooks] = useState<CookUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await gateway.listCookAssignments();
      setCooks(data);
    } catch (error) {
      console.error('Error fetching cook assignments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [gateway]);

  useEffect(() => {
    fetchCooks();
  }, [fetchCooks]);

  const updateAssignments = async (
    userId: string,
    assignments: CookAssignmentPayload[],
  ) => {
    try {
      await gateway.updateCookAssignments(userId, assignments);
      await fetchCooks(); // Refresh to get the latest data
    } catch (error) {
      console.error('Error updating assignments:', error);
      throw error;
    }
  };

  return { cooks, isLoading, fetchCooks, updateAssignments };
}
