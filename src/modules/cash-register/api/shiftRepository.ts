import type {
  CloseShiftData,
  OpenShiftData,
  Shift,
  ShiftClosePreview,
} from "../model/cash-register.types";
import type { CashExpense } from "../model/cash-expense.types";
import { apiClient } from "../../../shared/api";

export interface IShiftRepository {
  openShift(data: OpenShiftData): Promise<Shift>;
  closeShift(id: string, data: CloseShiftData): Promise<Shift>;
  getClosePreview(
    id: string,
    counted?: { cash?: number; card?: number; app?: number } | number,
  ): Promise<ShiftClosePreview>;
  getAll(): Promise<Shift[]>;
  getActiveShiftForUser(username: string): Promise<Shift | null>;
}

class ShiftRepository implements IShiftRepository {
  private mapToFrontendShift(backendShift: BackendShift): Shift {
    return {
      id: backendShift.id,
      cashierName: backendShift.cashierSnapshotName,
      startTime: new Date(backendShift.startTime),
      endTime: backendShift.endTime ? new Date(backendShift.endTime) : undefined,
      openingAmount: Number(backendShift.openingAmount),
      closingAmount:
        backendShift.closingAmount !== undefined &&
        backendShift.closingAmount !== null
          ? Number(backendShift.closingAmount)
          : undefined,
      status: backendShift.status === "CLOSED" ? "closed" : "open",
      notes: backendShift.notes,
      cashRegisterName: backendShift.cashRegisterSnapshotName,
      totalSales: {
        cash: Number(backendShift.cashSales || 0),
        card: Number(backendShift.cardSales || 0),
        app: Number(backendShift.appSales || 0),
        total: Number(backendShift.totalSales || 0),
      },
      totalExpenses:
        backendShift.totalExpenses !== undefined
          ? Number(backendShift.totalExpenses)
          : (backendShift.expenses || []).reduce(
              (acc, e) => acc + Number(e.amount),
              0,
            ),
      expenses: backendShift.expenses,
      totalExpensesSnapshot:
        backendShift.totalExpensesSnapshot === undefined
          ? undefined
          : Number(backendShift.totalExpensesSnapshot),
      expectedCash:
        backendShift.expectedCash === undefined
          ? undefined
          : Number(backendShift.expectedCash),
      cashDifference:
        backendShift.cashDifference === undefined ||
        backendShift.cashDifference === null
          ? undefined
          : Number(backendShift.cashDifference),
      declaredCardAmount:
        backendShift.declaredCardAmount === undefined ||
        backendShift.declaredCardAmount === null
          ? undefined
          : Number(backendShift.declaredCardAmount),
      cardDifference:
        backendShift.cardDifference === undefined ||
        backendShift.cardDifference === null
          ? undefined
          : Number(backendShift.cardDifference),
      declaredAppAmount:
        backendShift.declaredAppAmount === undefined ||
        backendShift.declaredAppAmount === null
          ? undefined
          : Number(backendShift.declaredAppAmount),
      appDifference:
        backendShift.appDifference === undefined ||
        backendShift.appDifference === null
          ? undefined
          : Number(backendShift.appDifference),
      totalDeclaredAmount:
        backendShift.totalDeclaredAmount === undefined ||
        backendShift.totalDeclaredAmount === null
          ? undefined
          : Number(backendShift.totalDeclaredAmount),
      totalDifference:
        backendShift.totalDifference === undefined ||
        backendShift.totalDifference === null
          ? undefined
          : Number(backendShift.totalDifference),
      discrepancyReason: backendShift.discrepancyReason,
      authorizedById: backendShift.authorizedById,
      authorizedByName: backendShift.authorizedBySnapshotName,
      authorizedByRole: backendShift.authorizedByRole,
      denominationBreakdown: backendShift.denominationBreakdown,
    };
  }

  async openShift(data: OpenShiftData): Promise<Shift> {
    try {
      const result: BackendShift = await apiClient("/shifts/open", {
        method: "POST",
        body: JSON.stringify(data),
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
        body: JSON.stringify(data),
      });
      return this.mapToFrontendShift(result);
    } catch (error) {
      console.error("Error closing shift on backend:", error);
      throw error;
    }
  }

  async getClosePreview(
    id: string,
    counted?: { cash?: number; card?: number; app?: number } | number,
  ): Promise<ShiftClosePreview> {
    const params = new URLSearchParams();
    if (typeof counted === "number") {
      params.set("countedCash", counted.toFixed(2));
    } else if (counted) {
      if (counted.cash !== undefined)
        params.set("countedCash", counted.cash.toFixed(2));
      if (counted.card !== undefined)
        params.set("countedCard", counted.card.toFixed(2));
      if (counted.app !== undefined)
        params.set("countedApp", counted.app.toFixed(2));
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    return apiClient(`/shifts/${id}/close-preview${query}`);
  }

  async getAll(): Promise<Shift[]> {
    try {
      const response: BackendShift[] = await apiClient("/shifts?limit=500");
      return response.map((shift) => this.mapToFrontendShift(shift));
    } catch (error) {
      console.error("Error obteniendo turnos de DB:", error);
      return [];
    }
  }

  async getActiveShiftForUser(username: string): Promise<Shift | null> {
    try {
      const response: BackendShift[] = await apiClient(
        "/shifts?status=OPEN&limit=50",
      );
      const openShifts = response.map((shift) =>
        this.mapToFrontendShift(shift),
      );
      const userShift = openShifts.find(
        (s: Shift) => s.cashierName === username && s.status === "open",
      );
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
  cashSales?: number | string;
  cardSales?: number | string;
  appSales?: number | string;
  totalSales?: number | string;
  totalExpenses?: number | string;
  totalExpensesSnapshot?: number | string;
  expectedCash?: number | string;
  cashDifference?: number | string;
  declaredCardAmount?: number | string | null;
  cardDifference?: number | string | null;
  declaredAppAmount?: number | string | null;
  appDifference?: number | string | null;
  totalDeclaredAmount?: number | string | null;
  totalDifference?: number | string | null;
  discrepancyReason?: string;
  authorizedById?: string;
  authorizedBySnapshotName?: string;
  authorizedByRole?: string;
  denominationBreakdown?: Array<{
    denomination: number;
    quantity: number;
  }>;
  expenses?: CashExpense[];
  status: "OPEN" | "CLOSED";
  notes?: string;
  cashRegisterSnapshotName?: string;
}

export const shiftRepository = new ShiftRepository();
