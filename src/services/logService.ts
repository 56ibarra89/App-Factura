import { initDB } from "./db";

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

const LOGS_STORE = "logs";

export const logService = {
  /**
   * Registra un evento en la bitácora del sistema
   */
  log: async (
    user: string,
    role: string | null,
    action: string,
    details?: string,
    level: LogLevel = "info"
  ): Promise<void> => {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(LOGS_STORE, "readwrite");
        const store = transaction.objectStore(LOGS_STORE);

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
      // Usamos console.error como backup si falla IndexedDB
      console.error("Critical error saving to audit log:", error);
    }
  },

  /**
   * Obtiene los logs filtrados por fecha (opcional)
   */
  getLogs: async (limit: number = 200): Promise<SystemLog[]> => {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(LOGS_STORE, "readonly");
        const store = transaction.objectStore(LOGS_STORE);
        const index = store.index("timestamp");
        
        const request = index.openCursor(null, "prev"); // Orden descendente (más recientes primero)
        const results: SystemLog[] = [];

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
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
};
