import { apiClient } from "../../../shared/api";

export interface ActiveCashRegister {
  id: string;
  name: string;
  cashier: string;
  revenueCash: number;
  revenueCard: number;
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

export interface AdminDashboardGateway {
  getActiveCashRegisters(): Promise<ActiveCashRegister[]>;
  getWaiterPerformance(): Promise<WaiterPerformance[]>;
}

export const adminDashboardGateway: AdminDashboardGateway = {
  getActiveCashRegisters: () =>
    apiClient("/admin/dashboard/cajas-activas"),
  getWaiterPerformance: () =>
    apiClient("/admin/dashboard/rendimiento-meseros"),
};
