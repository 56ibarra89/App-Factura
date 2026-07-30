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
  const { users } = useUserDirectory();
  const [assignedFloorId, setAssignedFloorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyZone() {
      // Solo nos importa si es mesero
      if (role !== "mesero" || !username) {
        setLoading(false);
        return;
      }

      const currentUser = users.find((u) => u.username === username);
      if (!currentUser) {
        // Aún no cargan los usuarios
        return;
      }

      try {
        const todayIndex = new Date().getDay();
        const todayStr = DAYS_MAP[todayIndex];

        const zones = await waiterZonesGateway.getZonesByUserId(currentUser.id);
        
        if (zones && zones[todayStr]) {
          setAssignedFloorId(zones[todayStr]);
        } else {
          setAssignedFloorId(null);
        }
      } catch (error) {
        console.error("Error al obtener mi zona de hoy:", error);
        setAssignedFloorId(null);
      } finally {
        setLoading(false);
      }
    }

    fetchMyZone();
  }, [username, role, users]);

  return {
    assignedFloorId,
    loadingZone: loading,
  };
}
