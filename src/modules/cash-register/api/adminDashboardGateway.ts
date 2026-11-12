import { apiClient } from "../../../shared/api";

export interface ActiveCashRegister {
  id: string;
  name: string;
  cashierId?: string;
  cashier: string;
  cashierRole?: 'ADMIN' | 'CAJERO_PRINCIPAL' | 'CAJERO' | 'DESPACHADOR' | string;
  openingAmount?: number;
  revenueCash: number;
  revenueCard: number;
  revenueApp?: number;
  revenueTotal?: number;
  transactionsCompleted: number;
  startTime: Date;
}

export interface WaiterPerformance {
  id: string;
  name: string;
  revenueTotal: number;
  ordersServed: number;
  avatarColor: string;
}

export interface LiveKpis {
  totalSalesToday: number;
  activeOccupiedTables: number;
  pendingKitchenOrders: number;
  activeDeliveryOrders: number;
}

export interface AdminDashboardGateway {
  getActiveCashRegisters(): Promise<ActiveCashRegister[]>;
  getWaiterPerformance(): Promise<WaiterPerformance[]>;
  getLiveKpis(): Promise<LiveKpis>;
}

export const adminDashboardGateway: AdminDashboardGateway = {
  getActiveCashRegisters: async () => {
    const rawData = (await apiClient("/admin/dashboard/cajas-activas")) as
      | (Omit<ActiveCashRegister, "startTime"> & { startTime: string })[]
      | undefined;
    return (rawData || []).map((item) => ({
      ...item,
      startTime: new Date(item.startTime),
    }));
  },
  getWaiterPerformance: () =>
    apiClient("/admin/dashboard/rendimiento-meseros"),
  getLiveKpis: () =>
    apiClient("/admin/dashboard/live-kpis"),
};
