import { useCallback, useEffect, useRef, useState } from "react";
import { salesReportsGateway } from "../api/salesReportsGateway";
import type { SalesReportData } from "../model/salesReport.types";

export const useSalesReport = (startDate: Date, endDate: Date) => {
  const [data, setData] = useState<SalesReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeRequest = useRef<AbortController | null>(null);

  const fetchReportData = useCallback(async () => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    try {
      setIsLoading(true);
      setError(null);
      setData(null);
      const report = await salesReportsGateway.getSalesReport(startDate, endDate, controller.signal);
      if (!controller.signal.aborted && activeRequest.current === controller) setData(report);
    } catch (err) {
      if (controller.signal.aborted || activeRequest.current !== controller) return;
      console.error("Error cargando reporte:", err);
      setError("No se pudo cargar el reporte para las fechas seleccionadas.");
    } finally {
      if (!controller.signal.aborted && activeRequest.current === controller) setIsLoading(false);
    }
  }, [endDate, startDate]);

  useEffect(() => {
    void fetchReportData();
    return () => activeRequest.current?.abort();
  }, [fetchReportData]);

  return { data, isLoading, error, refetch: fetchReportData };
};

export type {
  ChannelSalesSummary,
  SalesByTime,
  SalesReportData,
  TopProduct,
} from "../model/salesReport.types";
