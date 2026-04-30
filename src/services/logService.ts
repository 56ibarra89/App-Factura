import { logRepository } from "../repositories/LogRepository";

export type LogLevel = "info" | "warn" | "error";

export interface SystemLog {
  id?: number;
  timestamp: number;
  user: string;
  role: string | null;
  action: string;
  details?: string;
  level: LogLevel;
}

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
    logRepository.add(user, role, action, details, level),

  /**
   * Obtiene los logs más recientes
   */
  getLogs: (limit = 200): Promise<SystemLog[]> =>
    logRepository.getRecent(limit),
};
