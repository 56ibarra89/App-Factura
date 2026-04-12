import { useMemo } from 'react';

// Interfaces para los datos que enviaremos a la vista (SRP)
export interface CajaActiveMock {
  id: string;
  name: string;
  cashier: string;
  revenueCash: number;
  revenueCard: number;
  transactionsCompleted: number;
  startTime: Date;
}

export interface WaiterPerformanceMock {
  id: string;
  name: string;
  revenueTotal: number;
  ordersServed: number;
  avatarColor: string;
}

/**
 * MOCK DATA
 * En una aplicación final, esto se obtendría del backend o del estado global fusionando
 * turnos activos remotos. Por ahora proveemos datos demostrativos estructurados (OCP).
 */
export const useAdminCajasData = () => {
  const cajasActivas: CajaActiveMock[] = useMemo(() => [
    {
      id: "C-01",
      name: "Caja Principal",
      cashier: "Carlos admin",
      revenueCash: 450.50,
      revenueCard: 1280.00,
      transactionsCompleted: 42,
      startTime: new Date(new Date().setHours(8, 30, 0)),
    },
    {
      id: "C-02",
      name: "Caja Barra",
      cashier: "María López",
      revenueCash: 120.00,
      revenueCard: 560.25,
      transactionsCompleted: 15,
      startTime: new Date(new Date().setHours(12, 15, 0)),
    },
    {
      id: "C-03",
      name: "Caja Drive-Thru",
      cashier: "Juan Pérez",
      revenueCash: 680.00,
      revenueCard: 310.00,
      transactionsCompleted: 68,
      startTime: new Date(new Date().setHours(6, 45, 0)),
    }
  ], []);

  const waiterPerformance: WaiterPerformanceMock[] = useMemo(() => [
    {
      id: "W-01",
      name: "Ana García",
      revenueTotal: 840.50,
      ordersServed: 24,
      avatarColor: "#d32f2f", // primary
    },
    {
      id: "W-02",
      name: "Roberto Méndez",
      revenueTotal: 620.00,
      ordersServed: 18,
      avatarColor: "#1976d2", // info
    },
    {
      id: "W-03",
      name: "Lucía Soto",
      revenueTotal: 530.75,
      ordersServed: 12,
      avatarColor: "#2e7d32", // success
    },
    {
      id: "W-04",
      name: "Diego Franco",
      revenueTotal: 340.00,
      ordersServed: 9,
      avatarColor: "#ed6c02", // warning
    }
  ], []);

  return {
    cajasActivas,
    waiterPerformance
  };
};
