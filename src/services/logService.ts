import { logRepository } from "../repositories/LogRepository";
import type { LogLevel, SystemLog } from "../types/log.types";

// Re-export para mantener imports existentes si los hubiera.
export type { LogLevel, SystemLog };

/**
 * DIP: logService ahora delega en ILogRepository (LogRepository) en lugar
 * de llamar a initDB() directamente. La fuente de persistencia es intercambiable.
 */
export const logService = {
  /**
   * Registra un evento en la bitácora del sistema
   */
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

  /**
   * Obtiene los logs más recientes
   */
  getLogs: (limit = 200): Promise<SystemLog[]> =>
    logRepository
      .getRecent(limit)
      .catch((err) => {
        console.error("[logService] Error obteniendo logs:", err);
        return [];
      }),
};
