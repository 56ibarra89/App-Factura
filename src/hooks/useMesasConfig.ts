import { useState, useEffect, useRef } from "react";
import { apiClient } from "../config/apiClient";

export interface FloorConfig {
  id: number;
  name: string;
  tableCount: number;
}

const DEFAULT_FLOORS: FloorConfig[] = [
  { id: 1, name: "Primera Planta", tableCount: 15 },
  { id: 2, name: "Segunda Planta", tableCount: 10 },
  { id: 3, name: "Tercera Planta", tableCount: 0 },
  { id: 4, name: "Cuarta Planta", tableCount: 0 },
  { id: 5, name: "Quinta Planta", tableCount: 0 },
  { id: 6, name: "Sexta Planta", tableCount: 0 },
  { id: 7, name: "Séptima Planta", tableCount: 0 },
  { id: 8, name: "Octava Planta", tableCount: 0 },
];

export function useMesasConfig() {
  const [floors, setFloors] = useState<FloorConfig[]>([]);
  const [initialFloors, setInitialFloors] = useState<FloorConfig[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchFloors = async () => {
    try {
      const data = await apiClient('/mesas/config');
      setFloors(data);
      setInitialFloors(data);
    } catch (e) {
      console.error('Error fetching floors config:', e);
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
    } catch (e) {
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
    error,
    clearError
  };
}
