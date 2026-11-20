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

type ActiveCashRegisterResponse = Omit<ActiveCashRegister, "startTime"> & {
  startTime: string;
};

export const adminDashboardGateway: AdminDashboardGateway = {
  getActiveCashRegisters: async () => {
    const rawData = await apiClient<ActiveCashRegisterResponse[]>(
      "/admin/dashboard/cajas-activas",
      {
        validateResponse: (value) => {
          if (!Array.isArray(value) || !value.every((row) =>
            typeof row?.id === "string" && typeof row.name === "string" &&
            typeof row.cashier === "string" && typeof row.startTime === "string" &&
            Number.isFinite(Date.parse(row.startTime)) &&
            Number.isFinite(row.revenueCash) && Number.isFinite(row.revenueCard) &&
            Number.isFinite(row.transactionsCompleted)
          )) {
            throw new Error("La respuesta de cajas activas no es válida.");
          }
          return value;
        },
      },
    );
    return rawData.map((item) => ({
      ...item,
      startTime: new Date(item.startTime),
    }));
  },
  getWaiterPerformance: () =>
    apiClient<WaiterPerformance[]>("/admin/dashboard/rendimiento-meseros", {
      validateResponse: (value) => {
        if (!Array.isArray(value) || !value.every((row) =>
          typeof row?.id === "string" && typeof row.name === "string" &&
          typeof row.avatarColor === "string" && Number.isFinite(row.revenueTotal) &&
          Number.isFinite(row.ordersServed)
        )) {
          throw new Error("La respuesta de rendimiento de meseros no es válida.");
        }
        return value;
      },
    }),
  getLiveKpis: () =>
    apiClient<LiveKpis>("/admin/dashboard/live-kpis", {
      validateResponse: (value) => {
        const kpis = value as Partial<LiveKpis> | null;
        if (!kpis || !Number.isFinite(kpis.totalSalesToday) ||
          !Number.isFinite(kpis.activeOccupiedTables) ||
          !Number.isFinite(kpis.pendingKitchenOrders) ||
          !Number.isFinite(kpis.activeDeliveryOrders)) {
          throw new Error("La respuesta de indicadores no es válida.");
        }
        return kpis as LiveKpis;
      },
    }),
};
