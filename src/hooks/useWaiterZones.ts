import { useState, useCallback } from "react";
import { WaiterZonesService } from "../services/waiterZonesService";

export function useWaiterZones() {
  const [currentZones, setCurrentZones] = useState<Record<string, number>>({});
  const [loadingZones, setLoadingZones] = useState(false);
  const [savingZones, setSavingZones] = useState(false);
  
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchZones = useCallback(async (userId: string) => {
    setLoadingZones(true);
    try {
      const zonesMap = await WaiterZonesService.getZonesByUserId(userId);
      setCurrentZones(zonesMap);
    } catch (error) {
      console.error("Error fetching zones", error);
      setToast({ open: true, message: "Error al cargar zonas asignadas", severity: "error" });
    } finally {
      setLoadingZones(false);
    }
  }, []);

  const saveZones = useCallback(async (userId: string, zones: Record<string, number>) => {
    setSavingZones(true);
    try {
      await WaiterZonesService.saveZonesByUserId(userId, zones);
      setToast({ open: true, message: "Zonas asignadas correctamente", severity: "success" });
      return true;
    } catch (error) {
      console.error("Error saving zones", error);
      setToast({ open: true, message: "Error al guardar asignaciones", severity: "error" });
      return false;
    } finally {
      setSavingZones(false);
    }
  }, []);

  const closeToast = useCallback(() => {
    setToast(prev => ({ ...prev, open: false }));
  }, []);

  const setZone = useCallback((day: string, floor: number) => {
    setCurrentZones(prev => ({ ...prev, [day]: floor }));
  }, []);

  const clearZones = useCallback(() => {
    setCurrentZones({});
  }, []);

  return {
    currentZones,
    loadingZones,
    savingZones,
    toast,
    fetchZones,
    saveZones,
    closeToast,
    setZone,
    clearZones
  };
}
