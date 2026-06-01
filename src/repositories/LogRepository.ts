import { ILogRepository } from "../types/repositories";
import type { SystemLog, LogLevel } from "../types/log.types";
import { apiClient } from "../config/apiClient";

class LogRepository implements ILogRepository {
  async add(
    user: string,
    role: string | null,
    action: string,
    details?: string,
    level: LogLevel = "INFO"
  ): Promise<void> {
    try {
      await apiClient("/system-logs", {
        method: "POST",
        body: JSON.stringify({
          user,
          role,
          action,
          details,
          level,
        }),
      });
    } catch (error) {
      console.error("Critical error saving to audit log:", error);
    }
  }

  async getRecent(limit = 200): Promise<SystemLog[]> {
    try {
      const logs = await apiClient("/system-logs");
      return logs.slice(0, limit);
    } catch (error) {
      console.error("Error retrieving logs:", error);
      return [];
    }
  }
}

export const logRepository = new LogRepository();
