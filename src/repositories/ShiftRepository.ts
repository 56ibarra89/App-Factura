import { Shift } from "../types/shift.types";
import { IShiftRepository } from "../types/repositories";
import { initDB, STORES } from "./db.config";

/**
 * DIP: Implementación concreta de IShiftRepository usando IndexedDB.
 */
class ShiftRepository implements IShiftRepository {
  async save(shift: Shift): Promise<void> {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.SHIFTS, "readwrite");
        const store = transaction.objectStore(STORES.SHIFTS);

        const shiftToSave = {
          ...shift,
          startTime:
            shift.startTime instanceof Date
              ? shift.startTime.getTime()
              : new Date(shift.startTime).getTime(),
          endTime: shift.endTime
            ? shift.endTime instanceof Date
              ? shift.endTime.getTime()
              : new Date(shift.endTime).getTime()
            : null,
        };

        const request = store.put(shiftToSave);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Error guardando turno en DB:", error);
    }
  }

  async getAll(): Promise<Shift[]> {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.SHIFTS, "readonly");
        const store = transaction.objectStore(STORES.SHIFTS);
        const request = store.getAll();

        request.onsuccess = () => {
          const results = request.result.map((item: Shift) => ({
            ...item,
            startTime: new Date(item.startTime),
            endTime: item.endTime ? new Date(item.endTime) : undefined,
          }));
          resolve(
            results.sort(
              (a: Shift, b: Shift) =>
                b.startTime.getTime() - a.startTime.getTime()
            )
          );
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Error obteniendo turnos de DB:", error);
      return [];
    }
  }
}

/** Instancia singleton por defecto (inyectable en contextos) */
export const shiftRepository = new ShiftRepository();
