import { apiClient } from "../../../shared/api";
import type { SalesReportData } from "../model/salesReport.types";

export interface SalesReportsGateway {
  getSalesReport(startDate: Date, endDate: Date): Promise<SalesReportData>;
}

export const salesReportsGateway: SalesReportsGateway = {
  getSalesReport(startDate, endDate) {
    const query = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      timezoneOffsetMinutes: String(startDate.getTimezoneOffset()),
    });
    return apiClient(`/reports/sales?${query.toString()}`);
  },
};
