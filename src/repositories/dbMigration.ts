import { initDB, STORES } from "./db.config";

/**
 * Migra todas las referencias de un nombre de usuario a uno nuevo en toda la base de datos (Órdenes, Turnos, Logs).
 * Útil cuando un administrador cambia el nombre de usuario (Usuario de Login) de un empleado
 * para mantener la integridad histórica.
 */
export const migrateUsernameInDB = async (oldUsername: string, newUsername: string): Promise<void> => {
  try {
    const db = await initDB();
    
    // Migrar ORDERS
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORES.ORDERS, "readwrite");
      const store = transaction.objectStore(STORES.ORDERS);
      
      const request = store.openCursor();
      request.onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          const order = cursor.value;
          if (order.cashierName === oldUsername) {
            order.cashierName = newUsername;
            cursor.update(order);
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });

    // Migrar SHIFTS
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORES.SHIFTS, "readwrite");
      const store = transaction.objectStore(STORES.SHIFTS);
      
      const request = store.openCursor();
      request.onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          const shift = cursor.value;
          if (shift.cashierName === oldUsername) {
            shift.cashierName = newUsername;
            cursor.update(shift);
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });

    // Migrar LOGS
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORES.LOGS, "readwrite");
      const store = transaction.objectStore(STORES.LOGS);
      
      const request = store.openCursor();
      request.onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          const log = cursor.value;
          if (log.user === oldUsername) {
            log.user = newUsername;
            cursor.update(log);
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });

    console.log(`[dbMigration] Se ha migrado exitosamente de ${oldUsername} a ${newUsername}`);
  } catch (error) {
    console.error("[dbMigration] Error migrando nombre de usuario en BD:", error);
    throw error;
  }
};
