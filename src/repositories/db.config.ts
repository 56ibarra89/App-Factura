/**
/**
 * Configuración compartida de IndexedDB.
 * Centraliza los nombres de stores y la inicialización de la base de datos
 * para que los repositorios no dupliquen esta lógica.
 */

const DB_NAME = "AppFacturaDB";
const DB_VERSION = 7;

export const STORES = {
  ORDERS: "orders",
  SHIFTS: "shifts",
  LOGS: "logs",
  CORRELATIVOS: "correlativos",
  CUSTOMERS: "customers",
} as const;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    // Timeout para evitar cuelgues si la DB está bloqueada
    const timeout = setTimeout(() => {
      console.error("Database connection timeout - likely blocked");
      reject(
        new Error(
          "La base de datos está bloqueada por otra sesión. Por favor, cierra y vuelve a abrir la aplicación."
        )
      );
    }, 5000);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      clearTimeout(timeout);
      console.error("Error abriendo IndexedDB:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      clearTimeout(timeout);
      resolve(request.result);
    };

    request.onblocked = () => {
      console.warn("La actualización de la base de datos está bloqueada.");
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = (event.target as IDBOpenDBRequest).transaction;

      db.onversionchange = () => {
        db.close();
        console.warn("La base de datos cambió de versión. Recargando...");
        // NOTE: el reload es un side-effect de infraestructura aceptable aquí,
        // ya que esta capa de config es la única responsable de gestionar la DB.
        window.location.reload();
      };

      if (!db.objectStoreNames.contains(STORES.ORDERS)) {
        const store = db.createObjectStore(STORES.ORDERS, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("customerName", "customerName", { unique: false });
        store.createIndex("status", "status", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.SHIFTS)) {
        const store = db.createObjectStore(STORES.SHIFTS, { keyPath: "id" });
        store.createIndex("cashierName", "cashierName", { unique: false });
        store.createIndex("startTime", "startTime", { unique: false });
        store.createIndex("status", "status", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.LOGS)) {
        const store = db.createObjectStore(STORES.LOGS, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("user", "user", { unique: false });
        store.createIndex("action", "action", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.CORRELATIVOS)) {
        const store = db.createObjectStore(STORES.CORRELATIVOS, { keyPath: "id" });
        store.createIndex("documentType", "documentType", { unique: false });
        store.createIndex("status", "status", { unique: false });
      }

      // Store de clientes: 'id' es la clave primaria.
      // Implementación segura: no borra datos si el store ya existe.
      if (db.objectStoreNames.contains(STORES.CUSTOMERS)) {
        if (transaction) {
          const store = transaction.objectStore(STORES.CUSTOMERS);
          if (!store.indexNames.contains("nameLower")) {
            store.createIndex("nameLower", "nameLower", { unique: false });
          }
          if (!store.indexNames.contains("name")) {
            store.createIndex("name", "name", { unique: false });
          }
          if (!store.indexNames.contains("updatedAt")) {
            store.createIndex("updatedAt", "updatedAt", { unique: false });
          }
        }
      } else {
        const store = db.createObjectStore(STORES.CUSTOMERS, { keyPath: "id" });
        store.createIndex("nameLower", "nameLower", { unique: false });
        store.createIndex("name", "name", { unique: false });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
    };
  });
};
