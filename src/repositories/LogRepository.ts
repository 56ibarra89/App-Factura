import { ILogRepository } from "../types/repositories";
import { SystemLog, LogLevel } from "../services/logService";
import { initDB, STORES } from "./db.config";

/**
 * DIP: Implementación concreta de ILogRepository usando IndexedDB.
 */
class LogRepository implements ILogRepository {
  async add(
    user: string,
    role: string | null,
    action: string,
    details?: string,
    level: LogLevel = "info"
  ): Promise<void> {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.LOGS, "readwrite");
        const store = transaction.objectStore(STORES.LOGS);

        const logEntry: SystemLog = {
          timestamp: Date.now(),
          user,
          role,
          action,
          details,
          level,
        };

        const request = store.add(logEntry);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Critical error saving to audit log:", error);
    }
  }

  async getRecent(limit = 200): Promise<SystemLog[]> {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.LOGS, "readonly");
        const store = transaction.objectStore(STORES.LOGS);
        const index = store.index("timestamp");

        // Cursor descendente (más recientes primero)
        const request = index.openCursor(null, "prev");
        const results: SystemLog[] = [];

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>)
            .result;
          if (cursor && results.length < limit) {
            results.push(cursor.value);
            cursor.continue();
          } else {
            resolve(results);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Error retrieving logs:", error);
      return [];
    }
  }
}

/** Instancia singleton por defecto */
export const logRepository = new LogRepository();
