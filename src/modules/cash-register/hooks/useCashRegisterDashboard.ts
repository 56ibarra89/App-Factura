import { useState, useEffect, useCallback, useRef } from "react";
import {
  adminDashboardGateway,
  type ActiveCashRegister,
  type AdminDashboardGateway,
  type WaiterPerformance,
  type LiveKpis,
} from "../api/adminDashboardGateway";

export const useCashRegisterDashboard = (
  gateway: AdminDashboardGateway = adminDashboardGateway,
  autoRefreshIntervalMs: number = 30000,
) => {
  const [cajasActivas, setCajasActivas] = useState<ActiveCashRegister[] | null>(null);
  const [waiterPerformance, setWaiterPerformance] = useState<
    WaiterPerformance[] | null
  >(null);
  const [liveKpis, setLiveKpis] = useState<LiveKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [failedSections, setFailedSections] = useState<string[]>([]);
  const currentRequest = useRef<symbol | null>(null);

  const fetchDashboardData = useCallback(
    async (showLoading: boolean = false) => {
      if (currentRequest.current) return;
      const request = Symbol();
      currentRequest.current = request;
      if (showLoading) setLoading(true);
      setIsRefreshing(true);

      const [cajas, meseros, indicadores] = await Promise.allSettled([
        gateway.getActiveCashRegisters(),
        gateway.getWaiterPerformance(),
        gateway.getLiveKpis(),
      ]);
      if (currentRequest.current !== request) return;

      const errors: string[] = [];
      if (cajas.status === "fulfilled") setCajasActivas(cajas.value);
      else errors.push("cajas activas");
      if (meseros.status === "fulfilled") setWaiterPerformance(meseros.value);
      else errors.push("desempeño de meseros");
      if (indicadores.status === "fulfilled") setLiveKpis(indicadores.value);
      else errors.push("indicadores");

      if (errors.length === 0) setLastUpdated(new Date());
      setFailedSections(errors);
      currentRequest.current = null;
      setLoading(false);
      setIsRefreshing(false);
    },
    [gateway],
  );

  useEffect(() => {
    void fetchDashboardData(true);

    const intervalId = setInterval(() => {
      void fetchDashboardData(false);
    }, autoRefreshIntervalMs);

    return () => {
      currentRequest.current = null;
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
    failedSections,
    reloadDashboard,
  };
};
