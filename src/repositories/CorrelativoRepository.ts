import { initDB, STORES } from "./db.config";
import { Correlativo } from "../types/correlativo.types";
import type { ICorrelativoRepository } from "../types/repositories";

export const correlativoRepository: ICorrelativoRepository = {
  async save(correlativo: Correlativo): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.CORRELATIVOS, "readwrite");
      const store = transaction.objectStore(STORES.CORRELATIVOS);
      const request = store.put(correlativo);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getAll(): Promise<Correlativo[]> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.CORRELATIVOS, "readonly");
      const store = transaction.objectStore(STORES.CORRELATIVOS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },

  async getActiveByDocumentType(documentType: string): Promise<Correlativo | null> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.CORRELATIVOS, "readonly");
      const store = transaction.objectStore(STORES.CORRELATIVOS);
      const index = store.index("documentType");
      const request = index.getAll(documentType);

      request.onsuccess = () => {
        const results = request.result as Correlativo[];
        const active = results.find((c) => c.status === "Activo");
        resolve(active || null);
      };
      request.onerror = () => reject(request.error);
    });
  },

  async delete(id: string): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.CORRELATIVOS, "readwrite");
      const store = transaction.objectStore(STORES.CORRELATIVOS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};
