import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { logService } from "../services/logService";
import { useMesasConfig } from "./useMesasConfig";

interface FloorDialogData {
  id: number;
  name: string;
}

export function useAdminTableLayout() {
  const { username, role } = useAuth();
  const tableConfig = useMesasConfig();
  const [showSuccess, setShowSuccess] = useState(false);
  const [deleteCandidate, setDeleteCandidate] =
    useState<FloorDialogData | null>(null);
  const [editCandidate, setEditCandidate] =
    useState<FloorDialogData | null>(null);

  const updateTableCount = (floorId: number, value: string) => {
    const count = parseInt(value, 10) || 0;
    tableConfig.updateFloorTables(floorId, Math.max(0, count));
  };

  const addFloor = () => {
    tableConfig.addFloor(`Nueva Planta ${tableConfig.floorsConfig.length + 1}`);
  };

  const requestFloorDeletion = (id: number, name: string) => {
    setDeleteCandidate({ id, name });
  };

  const confirmFloorDeletion = () => {
    if (!deleteCandidate) return;
    tableConfig.removeFloor(deleteCandidate.id);
    setDeleteCandidate(null);
  };

  const requestFloorRename = (id: number, name: string) => {
    setEditCandidate({ id, name });
  };

  const updatePendingFloorName = (name: string) => {
    setEditCandidate((current) => (current ? { ...current, name } : null));
  };

  const confirmFloorRename = () => {
    if (!editCandidate) return;
    tableConfig.updateFloorName(editCandidate.id, editCandidate.name);
    setEditCandidate(null);
  };

  const save = async () => {
    const success = await tableConfig.saveAllChanges();
    if (!success) return;

    setShowSuccess(true);
    logService.log(
      username,
      role,
      "CONFIG_CHANGE",
      "Cambio en plano de mesas: Configuración actualizada manualmente",
    );
  };

  return {
    ...tableConfig,
    showSuccess,
    deleteCandidate,
    editCandidate,
    updateTableCount,
    addFloor,
    requestFloorDeletion,
    cancelFloorDeletion: () => setDeleteCandidate(null),
    confirmFloorDeletion,
    requestFloorRename,
    updatePendingFloorName,
    cancelFloorRename: () => setEditCandidate(null),
    confirmFloorRename,
    save,
    hideSuccess: () => setShowSuccess(false),
  };
}
