import { logRepository } from "./logRepository";
import type { LogLevel, SystemLog, AuditQueryParams } from "../model/audit.types";

export type { LogLevel, SystemLog, AuditQueryParams };

export const logService = {

  log: (
    user: string,
    role: string | null,
    action: string,
    details?: string,
    level: LogLevel = "info"
  ): Promise<void> =>
    logRepository
      .add(user, role, action, details, level)
      .catch((err) => console.error("[logService] Error guardando log:", err)),

  getLogs: (params: number | AuditQueryParams = 500): Promise<SystemLog[]> =>
    logRepository
      .getRecent(params)
      .catch((err) => {
        console.error("[logService] Error obteniendo logs:", err);
        return [];
      }),
};

