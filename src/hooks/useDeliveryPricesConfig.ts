import { useState, useEffect, useCallback } from "react";
import { configRepository } from "../repositories/ConfigRepository";
import { useAuth } from "../context/AuthContext";
import { logService } from "../services/logService";

export function useDeliveryPricesConfig(open: boolean, onClose: () => void) {
  const { username, role } = useAuth();
  
  const [prices, setPrices] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({
    open: false,
    msg: "",
    severity: "success"
  });

  const showSnackbar = (msg: string, severity: "success" | "error") => {
    setSnackbar({ open: true, msg, severity });
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const loadPrices = useCallback(async () => {
    setLoading(true);
    try {
      const savedPrices = await configRepository.getDeliveryPricesConfig();
      if (savedPrices && Array.isArray(savedPrices)) {
        // Asegurar que siempre hay 6 espacios
        const newPrices = [...savedPrices];
        while (newPrices.length < 6) newPrices.push("");
        setPrices(newPrices.slice(0, 6));
      } else {
        setPrices(["30.00", "50.00", "", "", "", ""]); // Valores por defecto
      }
    } catch (error) {
      console.error(error);
      showSnackbar("Error al cargar los precios de delivery", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadPrices();
    }
  }, [open, loadPrices]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await configRepository.saveDeliveryPricesConfig(prices);
      logService.log(username, role, "CONFIG_CHANGE", `Actualizó los precios de delivery rápidos.`);
      showSnackbar("Precios actualizados correctamente", "success");
      onClose();
    } catch (error) {
      console.error(error);
      showSnackbar("Error al guardar los precios", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    const newPrices = [...prices];
    newPrices[index] = value;
    setPrices(newPrices);
  };

  return {
    prices,
    loading,
    saving,
    snackbar,
    closeSnackbar,
    handleSave,
    handleChange
  };
}
