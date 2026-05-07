import { useState, useEffect } from "react";
import { localStore, setJson, tryGetJson } from "../services/storage/storage";

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

  // Cargar configuración local.
  useEffect(() => {
    const key = "app_factura_floors_config";
    const saved = tryGetJson<FloorConfig[]>(localStore, key);
    if (saved) {
      setFloors(saved);
      return;
    }

    setFloors(DEFAULT_FLOORS);
    setJson(localStore, key, DEFAULT_FLOORS);
  }, []);

  const updateFloorTables = (floorId: number, count: number) => {
    const updated = floors.map(floor => 
      floor.id === floorId ? { ...floor, tableCount: count } : floor
    );
    setFloors(updated);
    setJson(localStore, "app_factura_floors_config", updated);
  };

  return {
    floorsConfig: floors,
    updateFloorTables
  };
}
