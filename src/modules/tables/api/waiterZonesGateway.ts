import { apiClient } from "../../../shared/api";

export interface WaiterZone {
  day: string;
  floor: number;
}

export const waiterZonesGateway = {

  async getZonesByUserId(userId: string): Promise<Record<string, number>> {
    const data = await apiClient(`/users/${userId}/zones`);
    const zonesMap: Record<string, number> = {};
    data.forEach((z: WaiterZone) => {
      zonesMap[z.day] = z.floor;
    });
    return zonesMap;
  },

  /**
   * Guarda o actualiza las zonas asignadas a un mesero
   */
  async saveZonesByUserId(userId: string, zonesMap: Record<string, number>): Promise<void> {
    const zonesArray = Object.entries(zonesMap).map(([day, floor]) => ({ day, floor }));
    await apiClient(`/users/${userId}/zones`, {
      method: "PUT",
      body: JSON.stringify({ zones: zonesArray })
    });
  }
};

