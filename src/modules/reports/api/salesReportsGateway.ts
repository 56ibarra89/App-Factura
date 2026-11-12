import { apiClient } from "../../../shared/api";
import type { SalesReportData } from "../model/salesReport.types";

export interface SalesReportsGateway {
  getSalesReport(startDate: Date, endDate: Date, signal?: AbortSignal): Promise<SalesReportData>;
}

export const salesReportsGateway: SalesReportsGateway = {
  getSalesReport(startDate, endDate, signal) {
    const query = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      timezoneOffsetMinutes: String(startDate.getTimezoneOffset()),
    });
    // Server transaction budget: 60 seconds; allow transport and serialization overhead.
    return apiClient(`/reports/sales?${query.toString()}`, { signal, timeoutMs: 75_000 });
  },
};
