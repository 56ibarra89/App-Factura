import { Order } from "../types/order.types";
import { IOrderRepository } from "../types/repositories";
import { initDB, STORES } from "./db.config";

/**
 * DIP: Implementación concreta de IOrderRepository usando IndexedDB.
 * Los contextos dependen de IOrderRepository (abstracción), no de esta clase.
 */
export class OrderRepository implements IOrderRepository {
  async save(order: Order): Promise<void> {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.ORDERS, "readwrite");
        const store = transaction.objectStore(STORES.ORDERS);

        // Serializar timestamp como número para compatibilidad con índices IDB
        const orderToSave = {
          ...order,
          timestamp:
            order.timestamp instanceof Date
              ? order.timestamp.getTime()
              : new Date(order.timestamp).getTime(),
        };

        const request = store.put(orderToSave);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Error guardando orden en DB:", error);
    }
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.ORDERS, "readonly");
        const store = transaction.objectStore(STORES.ORDERS);
        const index = store.index("timestamp");

        const range = IDBKeyRange.bound(
          startDate.getTime(),
          endDate.getTime()
        );
        const request = index.getAll(range);

        request.onsuccess = () => {
          const results = request.result.map(
            (item: Omit<Order, "timestamp"> & { timestamp: number }) => ({
              ...item,
              timestamp: new Date(item.timestamp),
            })
          );
          resolve(
            results.sort(
              (a: Order, b: Order) =>
                b.timestamp.getTime() - a.timestamp.getTime()
            )
          );
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Error obteniendo órdenes de DB:", error);
      return [];
    }
  }

  async getById(id: string): Promise<Order | null> {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.ORDERS, "readonly");
        const store = transaction.objectStore(STORES.ORDERS);
        const request = store.get(id);

        request.onsuccess = () => {
          if (request.result) {
            resolve({
              ...request.result,
              timestamp: new Date(request.result.timestamp),
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
  }
}

/** Instancia singleton por defecto (inyectable en contextos) */
export const orderRepository = new OrderRepository();
