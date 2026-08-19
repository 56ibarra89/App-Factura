import { logRepository } from "./logRepository";
import type { LogLevel, SystemLog } from "../model/audit.types";

export type { LogLevel, SystemLog };

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

  getLogs: (limit = 200): Promise<SystemLog[]> =>
    logRepository
      .getRecent(limit)
      .catch((err) => {
        console.error("[logService] Error obteniendo logs:", err);
        return [];
      }),
};

