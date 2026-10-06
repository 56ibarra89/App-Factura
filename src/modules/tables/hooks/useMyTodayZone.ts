import { useState, useEffect } from "react";
import { useAuth } from "../../auth";
import { useUserDirectory } from "../../accounts";
import { waiterZonesGateway } from "../api/waiterZonesGateway";

const DAYS_MAP: Record<number, string> = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

export function useMyTodayZone() {
  const { username, role } = useAuth();
  const {
    users,
    loading: loadingUsers,
    error: usersError,
    refreshUsers,
  } = useUserDirectory();
  const [assignedFloorId, setAssignedFloorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function fetchMyZone() {
      if (role !== "mesero" || !username) {
        if (active) {
          setAssignedFloorId(null);
          setError(null);
          setLoading(false);
        }
        return;
      }

      if (loadingUsers) {
        setLoading(true);
        return;
      }

      if (usersError) {
        setAssignedFloorId(null);
        setError("No se pudo consultar el usuario para determinar su zona de mesas.");
        setLoading(false);
        return;
      }

      const currentUser = users.find((u) => u.username === username);
      if (!currentUser) {
        setAssignedFloorId(null);
        setError("No se encontró el usuario actual para determinar su zona de mesas.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const todayIndex = new Date().getDay();
        const todayStr = DAYS_MAP[todayIndex];

        const zones = await waiterZonesGateway.getZonesByUserId(currentUser.id);

        if (active) {
          setAssignedFloorId(zones?.[todayStr] ?? null);
        }
      } catch (cause: unknown) {
        console.error("Error al obtener mi zona de hoy:", cause);
        if (active) {
          setAssignedFloorId(null);
          setError(
            cause instanceof Error
              ? cause.message
              : "No se pudo obtener la zona de mesas asignada.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void fetchMyZone();

    return () => {
      active = false;
    };
  }, [loadingUsers, retryKey, role, username, users, usersError]);

  const retryZone = () => {
    setError(null);
    setLoading(true);
    if (usersError) void refreshUsers();
    setRetryKey((current) => current + 1);
  };

  return {
    assignedFloorId,
    loadingZone: loading,
    zoneError: error,
    retryZone,
  };
}
