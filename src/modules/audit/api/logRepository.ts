import type { SystemLog, LogLevel, AuditQueryParams } from "../model/audit.types";
import {
  apiClient,
  hasAccessToken,
} from "../../../shared/api";

export interface ILogRepository {
  add(
    user: string,
    role: string | null,
    action: string,
    details?: string,
    level?: LogLevel,
  ): Promise<void>;
  getRecent(params?: number | AuditQueryParams): Promise<SystemLog[]>;
}

class LogRepository implements ILogRepository {
  async add(
    user: string,
    role: string | null,
    action: string,
    details?: string,
    level: LogLevel = "info"
  ): Promise<void> {
    if (!hasAccessToken()) {
      return;
    }

    try {
      await apiClient("/system-logs", {
        method: "POST",
        body: JSON.stringify({
          user,
          role,
          action,
          details,
          level: (level || "info").toUpperCase() as LogLevel,
        }),
      });
    } catch (error) {
      console.error("Critical error saving to audit log:", error);
    }
  }

  async getRecent(params?: number | AuditQueryParams): Promise<SystemLog[]> {
    try {
      const searchParams = new URLSearchParams();
      if (typeof params === "number") {
        searchParams.set("limit", String(params));
      } else if (params) {
        if (params.limit) searchParams.set("limit", String(params.limit));
        if (params.user && params.user !== "ALL") searchParams.set("user", params.user);
        if (params.role && params.role !== "ALL") searchParams.set("role", params.role);
        if (params.action && params.action !== "ALL") searchParams.set("action", params.action);
        if (params.level && params.level !== "ALL") searchParams.set("level", params.level);
        if (params.startDate) searchParams.set("startDate", params.startDate);
        if (params.endDate) searchParams.set("endDate", params.endDate);
        if (params.search) searchParams.set("search", params.search);
      } else {
        searchParams.set("limit", "500");
      }

      const queryString = searchParams.toString();
      const endpoint = queryString ? `/system-logs?${queryString}` : "/system-logs";
      const logs = await apiClient(endpoint);
      return Array.isArray(logs) ? logs : [];
    } catch (error) {
      console.error("Error retrieving logs:", error);
      return [];
    }
  }
}

export const logRepository = new LogRepository();
