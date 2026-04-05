import { useState, useEffect } from "react";

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
    const saved = localStorage.getItem("app_factura_floors_config");
    if (saved) {
      try {
        setFloors(JSON.parse(saved));
      } catch (e) {
        setFloors(DEFAULT_FLOORS);
      }
    } else {
      setFloors(DEFAULT_FLOORS);
      localStorage.setItem("app_factura_floors_config", JSON.stringify(DEFAULT_FLOORS));
    }
  }, []);

  const updateFloorTables = (floorId: number, count: number) => {
    const updated = floors.map(floor => 
      floor.id === floorId ? { ...floor, tableCount: count } : floor
    );
    setFloors(updated);
    localStorage.setItem("app_factura_floors_config", JSON.stringify(updated));
  };

  return {
    floorsConfig: floors,
    updateFloorTables
  };
}
