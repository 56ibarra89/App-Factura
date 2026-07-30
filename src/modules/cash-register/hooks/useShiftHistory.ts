import { useState, useEffect, useCallback } from "react";
import type { Shift } from "../model/cash-register.types";
import { shiftRepository } from "../api/shiftRepository";

export function useShiftHistory() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadShifts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await shiftRepository.getAll();
      setShifts(data);
    } catch (err) {
      console.error("Error loading shifts:", err);
      setError("Error al cargar el historial de turnos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  return {
    shifts,
    loading,
    error,
    reload: loadShifts,
  };
}
