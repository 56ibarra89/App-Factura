import { useMemo } from 'react';
import { useAccountManager } from './useAccountManager';
import { useOrderQueries } from '../context/OrderContext';

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
  const { users } = useAccountManager();
  const { orders } = useOrderQueries();

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

  const waiterPerformance: WaiterPerformanceMock[] = useMemo(() => {
    // Filtrar solo a los usuarios con rol de mesero
    const meseros = users.filter((u) => u.role === 'mesero');
    
    // Si no hay meseros, retornar arreglo vacío
    if (meseros.length === 0) return [];

    // Colores para alternar en las barras
    const colors = ["#d32f2f", "#1976d2", "#2e7d32", "#ed6c02", "#9c27b0", "#0288d1"];

    return meseros.map((mesero, index) => {
      // Calcular métricas reales a partir de las órdenes donde este mesero fue el cajero/creador
      const waiterOrders = orders.filter(
        (o) => o.cashierName === mesero.username && o.status === 'paid'
      );
      
      const realRevenue = waiterOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const realOrdersCount = waiterOrders.length;

      return {
        id: mesero.id,
        name: `${mesero.firstName} ${mesero.lastName}`,
        revenueTotal: realRevenue,
        ordersServed: realOrdersCount,
        avatarColor: colors[index % colors.length],
      };
    });
  }, [users, orders]);

  return {
    cajasActivas,
    waiterPerformance
  };
};
