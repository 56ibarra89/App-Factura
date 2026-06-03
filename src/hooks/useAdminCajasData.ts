import { useState, useEffect } from 'react';
import { apiClient } from '../config/apiClient';

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
  const [cajasActivas, setCajasActivas] = useState<CajaActiveMock[]>([]);
  const [waiterPerformance, setWaiterPerformance] = useState<WaiterPerformanceMock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [cajasRes, waitersRes] = await Promise.all([
          apiClient('/admin/dashboard/cajas-activas').catch(() => []),
          apiClient('/admin/dashboard/rendimiento-meseros').catch(() => [])
        ]);
        setCajasActivas(cajasRes || []);
        setWaiterPerformance(waitersRes || []);
      } catch (error) {
        console.error("Error al obtener datos del dashboard de cajas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return {
    cajasActivas,
    waiterPerformance,
    loading
  };
};
