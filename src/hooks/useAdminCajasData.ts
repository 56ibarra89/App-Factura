import { useState, useEffect } from 'react';
import {
  adminDashboardGateway,
  type ActiveCashRegister,
  type AdminDashboardGateway,
  type WaiterPerformance,
} from '../services/admin/adminDashboardGateway';

export type CajaActiveMock = ActiveCashRegister;
export type WaiterPerformanceMock = WaiterPerformance;

/**
 * MOCK DATA
 * En una aplicación final, esto se obtendría del backend o del estado global fusionando
 * turnos activos remotos. Por ahora proveemos datos demostrativos estructurados (OCP).
 */
export const useAdminCajasData = (
  gateway: AdminDashboardGateway = adminDashboardGateway,
) => {
  const [cajasActivas, setCajasActivas] = useState<CajaActiveMock[]>([]);
  const [waiterPerformance, setWaiterPerformance] = useState<WaiterPerformanceMock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [cajasRes, waitersRes] = await Promise.all([
          gateway.getActiveCashRegisters().catch(() => []),
          gateway.getWaiterPerformance().catch(() => [])
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
  }, [gateway]);

  return {
    cajasActivas,
    waiterPerformance,
    loading
  };
};
