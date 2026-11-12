import { useState, useEffect, useCallback, useRef } from "react";
import {
  adminDashboardGateway,
  type ActiveCashRegister,
  type AdminDashboardGateway,
  type WaiterPerformance,
  type LiveKpis,
} from "../api/adminDashboardGateway";

const DEFAULT_KPIS: LiveKpis = {
  totalSalesToday: 0,
  activeOccupiedTables: 0,
  pendingKitchenOrders: 0,
  activeDeliveryOrders: 0,
};

export const useCashRegisterDashboard = (
  gateway: AdminDashboardGateway = adminDashboardGateway,
  autoRefreshIntervalMs: number = 30000,
) => {
  const [cajasActivas, setCajasActivas] = useState<ActiveCashRegister[]>([]);
  const [waiterPerformance, setWaiterPerformance] = useState<
    WaiterPerformance[]
  >([]);
  const [liveKpis, setLiveKpis] = useState<LiveKpis>(DEFAULT_KPIS);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const isMountedRef = useRef(true);

  const fetchDashboardData = useCallback(
    async (showLoading: boolean = false) => {
      try {
        if (showLoading) setLoading(true);
        setIsRefreshing(true);

        const [cajasRes, waitersRes, kpisRes] = await Promise.all([
          gateway.getActiveCashRegisters().catch(() => []),
          gateway.getWaiterPerformance().catch(() => []),
          gateway.getLiveKpis().catch(() => DEFAULT_KPIS),
        ]);

        if (isMountedRef.current) {
          setCajasActivas(cajasRes || []);
          setWaiterPerformance(waitersRes || []);
          setLiveKpis(kpisRes || DEFAULT_KPIS);
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error("Error al obtener datos del dashboard de cajas:", error);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [gateway],
  );

  useEffect(() => {
    isMountedRef.current = true;
    void fetchDashboardData(true);

    const intervalId = setInterval(() => {
      void fetchDashboardData(false);
    }, autoRefreshIntervalMs);

    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [fetchDashboardData, autoRefreshIntervalMs]);

  const reloadDashboard = useCallback(() => {
    return fetchDashboardData(false);
  }, [fetchDashboardData]);

  return {
    cajasActivas,
    waiterPerformance,
    liveKpis,
    loading,
    isRefreshing,
    lastUpdated,
    reloadDashboard,
  };
};
