import { apiClient } from "../../../shared/api";
import type { FloorConfig } from "../model/table.types";

export interface BackendTable {
  id: string;
  floor: number;
  number: number;
  estado: "DISPONIBLE" | "RESERVADO" | "OCUPADO";
  reservationName: string | null;
  reservationAmount: number | null;
}

export interface TableReservationPayload {
  reservationName: string;
  reservationAmount: number;
  reservationTime?: string;
  expirationTime?: string;
}

export interface FloorConfigurationGateway {
  getFloorConfig(): Promise<FloorConfig[]>;
  saveFloorConfig(floors: FloorConfig[]): Promise<void>;
}

export interface TableStateGateway {
  list(): Promise<BackendTable[]>;
  updateStatus(tableId: string, status: string): Promise<void>;
}

export interface TableReservationGateway {
  release(tableId: string): Promise<void>;
  reserve(tableId: string, payload: TableReservationPayload): Promise<void>;
}

type TablesHttpAdapter = FloorConfigurationGateway &
  TableStateGateway &
  TableReservationGateway;

export const tablesGateway: TablesHttpAdapter = {
  getFloorConfig: () => apiClient("/mesas/config"),

  async saveFloorConfig(floors) {
    await apiClient("/mesas/config", {
      method: "POST",
      body: JSON.stringify(floors),
    });
  },

  list: () => apiClient("/mesas"),

  async updateStatus(tableId, status) {
    await apiClient(`/mesas/${tableId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ estado: status }),
    });
  },

  async release(tableId) {
    await apiClient(`/mesas/${tableId}/release`, { method: "PATCH" });
  },

  async reserve(tableId, payload) {
    await apiClient(`/mesas/${tableId}/reserve`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};
