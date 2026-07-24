import type {
  CloseShiftData,
  OpenShiftData,
  Shift,
} from "../types/shift.types";
import { IShiftRepository } from "../types/repositories";
import { apiClient } from "../config/apiClient";

class ShiftRepository implements IShiftRepository {
  private mapToFrontendShift(backendShift: BackendShift): Shift {
    return {
      id: backendShift.id,
      cashierName: backendShift.cashierSnapshotName,
      startTime: new Date(backendShift.startTime),
      endTime: backendShift.endTime ? new Date(backendShift.endTime) : undefined,
      openingAmount: Number(backendShift.openingAmount),
      closingAmount: backendShift.closingAmount ? Number(backendShift.closingAmount) : undefined,
      status: backendShift.status === "CLOSED" ? "closed" : "open",
      notes: backendShift.notes,
      cashRegisterName: backendShift.cashRegisterSnapshotName,
      totalSales: { cash: 0, card: 0, app: 0, total: 0 },
    };
  }

  async openShift(data: OpenShiftData): Promise<Shift> {
    try {
      const result: BackendShift = await apiClient("/shifts/open", {
        method: "POST",
        body: JSON.stringify(data)
      });
      return this.mapToFrontendShift(result);
    } catch (error) {
      console.error("Error opening shift on backend:", error);
      throw error;
    }
  }

  async closeShift(id: string, data: CloseShiftData): Promise<Shift> {
    try {
      const result: BackendShift = await apiClient(`/shifts/${id}/close`, {
        method: "POST",
        body: JSON.stringify(data)
      });
      return this.mapToFrontendShift(result);
    } catch (error) {
      console.error("Error closing shift on backend:", error);
      throw error;
    }
  }

  async getAll(): Promise<Shift[]> {
    try {
      const response: BackendShift[] = await apiClient("/shifts?limit=200");
      return response.map((shift) => this.mapToFrontendShift(shift));
    } catch (error) {
      console.error("Error obteniendo turnos de DB:", error);
      return [];
    }
  }

  async getActiveShiftForUser(username: string): Promise<Shift | null> {
    try {
      const response: BackendShift[] = await apiClient("/shifts?status=OPEN&limit=50");
      const openShifts = response.map((shift) =>
        this.mapToFrontendShift(shift),
      );
      const userShift = openShifts.find((s: Shift) => s.cashierName === username && s.status === 'open');
      return userShift || null;
    } catch (error) {
      console.error("Error obteniendo turno activo del backend:", error);
      return null;
    }
  }
}

interface BackendShift {
  id: string;
  cashierSnapshotName: string;
  startTime: string;
  endTime?: string | null;
  openingAmount: number | string;
  closingAmount?: number | string | null;
  status: "OPEN" | "CLOSED";
  notes?: string;
  cashRegisterSnapshotName?: string;
}

export const shiftRepository = new ShiftRepository();
