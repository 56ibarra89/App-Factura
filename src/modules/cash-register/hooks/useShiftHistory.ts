import { useState, useEffect, useCallback } from "react";
import type { Shift } from "../model/cash-register.types";
import { shiftRepository } from "../api/shiftRepository";
import { usersGateway, type UserAccount } from "../../accounts";

export function useShiftHistory() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [shiftsData, usersData] = await Promise.all([
        shiftRepository.getAll(),
        usersGateway.list().catch((e) => {
          console.warn("Could not fetch user directory:", e);
          return [] as UserAccount[];
        }),
      ]);
      setShifts(shiftsData);
      setUsers(usersData);
    } catch (err) {
      console.error("Error loading shifts or users:", err);
      setError("Error al cargar el historial de turnos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    shifts,
    users,
    loading,
    error,
    reload: loadData,
  };
}
