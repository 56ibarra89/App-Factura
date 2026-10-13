import { useCallback, useEffect, useState } from "react";
import { salesReportsGateway } from "../api/salesReportsGateway";
import type { SalesReportData } from "../model/salesReport.types";

export const useSalesReport = (startDate: Date, endDate: Date) => {
  const [data, setData] = useState<SalesReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReportData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setData(await salesReportsGateway.getSalesReport(startDate, endDate));
    } catch (err) {
      console.error("Error cargando reporte:", err);
      setError("No se pudo cargar el reporte para las fechas seleccionadas.");
    } finally {
      setIsLoading(false);
    }
  }, [endDate, startDate]);

  useEffect(() => {
    void fetchReportData();
  }, [fetchReportData]);

  return { data, isLoading, error, refetch: fetchReportData };
};

export type {
  ChannelSalesSummary,
  SalesByTime,
  SalesReportData,
  TopProduct,
} from "../model/salesReport.types";
