import {
  useEffect,
  useMemo,
  useState,
} from "react";
import type { FloorConfig } from "../../types/mesa.types";

interface UseMesaSelectionOptions {
  floorsConfig: FloorConfig[];
  role: string | null;
  assignedFloorId: number | null;
}

export function useMesaSelection({
  floorsConfig,
  role,
  assignedFloorId,
}: UseMesaSelectionOptions) {
  const activeFloors = useMemo(() => {
    const configuredFloors = floorsConfig.filter(
      (floor) => floor.tableCount > 0,
    );
    if (role !== "mesero" || assignedFloorId === null) {
      return configuredFloors;
    }
    return configuredFloors.filter(
      (floor) => floor.id === assignedFloorId,
    );
  }, [assignedFloorId, floorsConfig, role]);

  const floors = useMemo(
    () =>
      activeFloors.map((floor) => ({
        id: floor.id,
        name: floor.name,
      })),
    [activeFloors],
  );
  const [selectedFloor, setSelectedFloor] = useState(
    activeFloors[0]?.id || 1,
  );
  const [selectedMesaId, setSelectedMesaId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (
      activeFloors.length > 0 &&
      !activeFloors.some(
        (floor) => floor.id === selectedFloor,
      )
    ) {
      setSelectedFloor(activeFloors[0].id);
    }
  }, [activeFloors, selectedFloor]);

  const tableCount =
    activeFloors.find(
      (floor) => floor.id === selectedFloor,
    )?.tableCount ?? 0;

  return {
    activeFloors,
    floors,
    selectedFloor,
    setSelectedFloor,
    selectedMesaId,
    setSelectedMesaId,
    tableCount,
  };
}
