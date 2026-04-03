import { Order } from "../types/order.types";
import { Shift } from "../types/shift.types";

const DB_NAME = "AppFacturaDB";
const DB_VERSION = 3;
const STORE_NAME = "orders";
const SHIFTS_STORE = "shifts";

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    // Timeout para evitar cuelgues si la DB está bloqueada
    const timeout = setTimeout(() => {
      console.error("Database connection timeout - likely blocked");
      reject(new Error("La base de datos está bloqueada por otra sesión. Por favor, cierra y vuelve a abrir la aplicación."));
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
      
      db.onversionchange = () => {
        db.close();
        console.warn("La base de datos cambió de versión. Recargando...");
        window.location.reload();
      };

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("customerName", "customerName", { unique: false });
        store.createIndex("status", "status", { unique: false });
      }

      if (!db.objectStoreNames.contains(SHIFTS_STORE)) {
        const store = db.createObjectStore(SHIFTS_STORE, { keyPath: "id" });
        store.createIndex("cashierName", "cashierName", { unique: false });
        store.createIndex("startTime", "startTime", { unique: false });
        store.createIndex("status", "status", { unique: false });
      }
    };
  });
};

export const saveOrderDB = async (order: Order): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      
      // Asegurarse de que el Date sea string o numérico para mejor indexado, 
      // pero Order ya usa el objeto Date o string (dependiendo de la conversión).
      // En OrderContext, la persistencia podría haberlo cambiado. 
      // Vamos a guardar una copia sanitizada
      const orderToSave = {
        ...order,
        timestamp: order.timestamp instanceof Date ? order.timestamp.getTime() : new Date(order.timestamp).getTime()
      };

      const request = store.put(orderToSave);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error guardando orden en DB:", error);
  }
};

export const getOrdersByDateRange = async (startDate: Date, endDate: Date): Promise<Order[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("timestamp");
      
      const start = startDate.getTime();
      const end = endDate.getTime();
      const range = IDBKeyRange.bound(start, end);
      
      const request = index.getAll(range);

      request.onsuccess = () => {
        // Convertir timestamps numéricos de vuelta a Date objects
        const results = request.result.map((item: Omit<Order, 'timestamp'> & { timestamp: number }) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        // Sort descending
        resolve(results.sort((a: Order, b: Order) => b.timestamp.getTime() - a.timestamp.getTime()));
      };
      
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error obteniendo órdenes de DB:", error);
    return [];
  }
};

export const getOrderById = async (id: string): Promise<Order | null> => {
   try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        if (request.result) {
          resolve({
            ...request.result,
            timestamp: new Date(request.result.timestamp)
          });
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error obteniendo orden por ID:", error);
    return null;
  }
};
export const saveShiftDB = async (shift: Shift): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SHIFTS_STORE, "readwrite");
      const store = transaction.objectStore(SHIFTS_STORE);
      
      const shiftToSave = {
        ...shift,
        startTime: shift.startTime instanceof Date ? shift.startTime.getTime() : new Date(shift.startTime).getTime(),
        endTime: shift.endTime ? (shift.endTime instanceof Date ? shift.endTime.getTime() : new Date(shift.endTime).getTime()) : null
      };

      const request = store.put(shiftToSave);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error guardando turno en DB:", error);
  }
};

export const getAllShiftsDB = async (): Promise<Shift[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SHIFTS_STORE, "readonly");
      const store = transaction.objectStore(SHIFTS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result.map((item: Shift) => ({
          ...item,
          startTime: new Date(item.startTime),
          endTime: item.endTime ? new Date(item.endTime) : undefined
        }));
        // Sort descending by start time
        resolve(results.sort((a: Shift, b: Shift) => b.startTime.getTime() - a.startTime.getTime()));
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error obteniendo turnos de DB:", error);
    return [];
  }
};
