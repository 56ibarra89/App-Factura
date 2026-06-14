import { useState, useEffect } from "react";
import { configRepository } from "../repositories/ConfigRepository";
import { PackagingSizeConfig } from "../types/product";

export function usePackagingSizesConfig(open: boolean, onClose: () => void) {
  const [sizes, setSizes] = useState<PackagingSizeConfig[]>([
    { name: "familiar", price: 0 },
    { name: "mediana", price: 0 },
    { name: "personal", price: 0 },
    { name: "único", price: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({
    open: false,
    msg: "",
    severity: "success"
  });

  useEffect(() => {
    if (open) {
      loadSizes();
    }
  }, [open]);

  const loadSizes = async () => {
    setLoading(true);
    try {
      const data = await configRepository.getPackagingSizesConfig();
      if (data && data.length > 0) {
        setSizes(data);
      } else {
        setSizes([
          { name: "familiar", price: 0 },
          { name: "mediana", price: 0 },
          { name: "personal", price: 0 },
          { name: "único", price: 0 }
        ]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Filtrar vacíos
      const finalSizes = sizes
        .map(s => ({ name: s.name.trim(), price: Number(s.price) || 0 }))
        .filter(s => s.name !== "");
      if (finalSizes.length === 0) {
        setSnackbar({ open: true, msg: "Debe haber al menos un empaque.", severity: "error" });
        setSaving(false);
        return;
      }
      await configRepository.savePackagingSizesConfig(finalSizes);
      setSnackbar({ open: true, msg: "Empaques guardados correctamente.", severity: "success" });
      setTimeout(() => {
        onClose();
        window.location.reload(); // Recargar para aplicar cambios en todos los formularios
      }, 1000);
    } catch (error) {
      setSnackbar({ open: true, msg: "Error al guardar los empaques.", severity: "error" });
      setSaving(false);
    }
  };

  const closeSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  const handleChangeName = (index: number, val: string) => {
    const newSizes = [...sizes];
    newSizes[index].name = val;
    setSizes(newSizes);
  };

  const handleChangePrice = (index: number, val: string | number) => {
    const newSizes = [...sizes];
    newSizes[index] = { ...newSizes[index], price: val as number };
    setSizes(newSizes);
  };

  const handleAdd = () => {
    setSizes([...sizes, { name: "", price: 0 }]);
  };

  const handleRemove = (index: number) => {
    const newSizes = [...sizes];
    newSizes.splice(index, 1);
    setSizes(newSizes);
  };

  return {
    sizes,
    loading,
    saving,
    snackbar,
    closeSnackbar,
    handleSave,
    handleChangeName,
    handleChangePrice,
    handleAdd,
    handleRemove
  };
}
