import { Shift } from "../types/shift.types";
import { IShiftRepository } from "../types/repositories";
import { apiClient } from "../config/apiClient";

class ShiftRepository implements IShiftRepository {
  private mapToFrontendShift(backendShift: any): Shift {
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

  async openShift(data: any): Promise<Shift> {
    try {
      const result = await apiClient("/shifts/open", {
        method: "POST",
        body: JSON.stringify(data)
      });
      return this.mapToFrontendShift(result);
    } catch (error) {
      console.error("Error opening shift on backend:", error);
      throw error;
    }
  }

  async closeShift(id: string, data: any): Promise<Shift> {
    try {
      const result = await apiClient(`/shifts/${id}/close`, {
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
      const response = await apiClient("/shifts?limit=200");
      return response.map((s: any) => this.mapToFrontendShift(s));
    } catch (error) {
      console.error("Error obteniendo turnos de DB:", error);
      return [];
    }
  }

  async getActiveShiftForUser(username: string): Promise<Shift | null> {
    try {
      const response = await apiClient("/shifts?status=OPEN&limit=50");
      const openShifts = response.map((s: any) => this.mapToFrontendShift(s));
      const userShift = openShifts.find(s => s.cashierName === username && s.status === 'open');
      return userShift || null;
    } catch (error) {
      console.error("Error obteniendo turno activo del backend:", error);
      return null;
    }
  }
}

export const shiftRepository = new ShiftRepository();
