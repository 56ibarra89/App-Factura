import { apiClient } from "../../../shared/api";
import { BUSINESS_TIMEZONE_OFFSET_MINUTES } from "../../../shared/format";
import type { SalesReportData } from "../model/salesReport.types";

export interface SalesReportsGateway {
  getSalesReport(startDate: Date, endDate: Date, signal?: AbortSignal): Promise<SalesReportData>;
}

export const salesReportsGateway: SalesReportsGateway = {
  getSalesReport(startDate, endDate, signal) {
    const query = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      timezoneOffsetMinutes: String(BUSINESS_TIMEZONE_OFFSET_MINUTES),
    });
    // Server transaction budget: 60 seconds; allow transport and serialization overhead.
    return apiClient(`/reports/sales?${query.toString()}`, { signal, timeoutMs: 75_000 });
  },
};
