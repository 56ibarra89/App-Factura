import { useState } from "react";
import { useKitchens } from "./useKitchens";

export const useAdminCocinas = () => {
  const { kitchens, addKitchen, updateKitchen, deleteKitchen } = useKitchens();
  
  const [newKitchenName, setNewKitchenName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingActive, setEditingActive] = useState(true);

  const handleAdd = () => {
    if (newKitchenName.trim()) {
      addKitchen(newKitchenName.trim());
      setNewKitchenName("");
    }
  };

  const handleEditSave = () => {
    if (editingId && editingName.trim()) {
      updateKitchen(editingId, editingName.trim(), editingActive);
      setEditingId(null);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar esta cocina?")) {
      deleteKitchen(id);
    }
  };

  const handleEditStart = (id: string, name: string, isActive: boolean) => {
    setEditingId(id);
    setEditingName(name);
    setEditingActive(isActive);
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  return {
    kitchens,
    newKitchenName,
    setNewKitchenName,
    editingId,
    editingName,
    setEditingName,
    editingActive,
    setEditingActive,
    handleAdd,
    handleEditSave,
    handleDelete,
    handleEditStart,
    handleEditCancel,
  };
};
