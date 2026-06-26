import { useState, useEffect } from "react";
import { apiClient } from "../config/apiClient";

export interface FloorConfig {
  id: number;
  name: string;
  tableCount: number;
}


export function useMesasConfig() {
  const [floors, setFloors] = useState<FloorConfig[]>([]);
  const [initialFloors, setInitialFloors] = useState<FloorConfig[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFloors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient('/mesas/config');
      setFloors(data);
      setInitialFloors(data);
    } catch (e: unknown) {
      console.error('Error fetching floors config:', e);
      setError('Error al cargar la configuración de mesas. El servidor podría estar ocupado.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFloors();
  }, []);

  const updateFloorTables = (floorId: number, count: number) => {
    setFloors(prev => prev.map(floor => 
      floor.id === floorId ? { ...floor, tableCount: count } : floor
    ));
  };

  const addFloor = (name: string) => {
    const newId = floors.length > 0 ? Math.max(...floors.map(f => f.id)) + 1 : 1;
    setFloors(prev => [...prev, { id: newId, name, tableCount: 0 }]);
  };

  const removeFloor = (floorId: number) => {
    setFloors(prev => prev.filter(f => f.id !== floorId));
  };

  const updateFloorName = (floorId: number, name: string) => {
    setFloors(prev => prev.map(floor => 
      floor.id === floorId ? { ...floor, name } : floor
    ));
  };

  const saveAllChanges = async () => {
    setIsSaving(true);
    try {
      await apiClient('/mesas/config', {
        method: 'POST',
        body: JSON.stringify(floors),
      });
      setInitialFloors(floors); // Reset unsaved changes tracking
      return true;
    } catch (e: unknown) {
      console.error('Error updating floors config:', e);
      const errorMessage = e instanceof Error ? e.message : 'Error guardando la configuración de mesas.';
      setError(errorMessage);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const clearError = () => setError(null);

  const hasUnsavedChanges = JSON.stringify(floors) !== JSON.stringify(initialFloors);

  return {
    floorsConfig: floors,
    updateFloorTables,
    addFloor,
    removeFloor,
    updateFloorName,
    saveAllChanges,
    hasUnsavedChanges,
    isSaving,
    isLoading,
    error,
    clearError,
    retryFetch: fetchFloors
  };
}
