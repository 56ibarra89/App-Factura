import { initDB, STORES } from "./db.config";
import { GeneralConfigState } from "../hooks/useGeneralConfigData";
import { EmpresaConfigState } from "../hooks/useEmpresaConfig";

export const configRepository = {
  async getGeneralConfig(): Promise<GeneralConfigState | null> {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.CONFIG, "readonly");
        const store = transaction.objectStore(STORES.CONFIG);
        const request = store.get("general_config");

        transaction.onabort = () => {
          console.error("Transacción abortada obteniendo configuración general");
          reject(transaction.error ?? request.error);
        };
        transaction.onerror = () => {
          console.error("Error en transacción obteniendo configuración general:", transaction.error);
          reject(transaction.error ?? request.error);
        };

        request.onsuccess = () => resolve(request.result?.data || null);
        request.onerror = () => {
          console.error("Error obteniendo configuración general:", request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("Error inicializando DB para configuración:", error);
      return null;
    }
  },

  async saveGeneralConfig(config: GeneralConfigState): Promise<void> {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.CONFIG, "readwrite");
        const store = transaction.objectStore(STORES.CONFIG);
        
        const request = store.put({
          id: "general_config",
          data: config,
          updatedAt: new Date().toISOString()
        });

        // IMPORTANT: resolver en oncomplete asegura que la transacción se haya "commiteado"
        // y no solo que el request individual haya tenido éxito.
        transaction.oncomplete = () => resolve();
        transaction.onabort = () => {
          console.error("Transacción abortada guardando configuración general");
          reject(transaction.error ?? request.error);
        };
        transaction.onerror = () => {
          console.error("Error en transacción guardando configuración general:", transaction.error);
          reject(transaction.error ?? request.error);
        };

        request.onerror = () => {
          console.error("Error guardando configuración general:", request.error);
          // El reject real lo hará transaction.onerror/onabort, pero esto ayuda a diagnosticar.
        };
      });
    } catch (error) {
      console.error("Error inicializando DB para guardar configuración:", error);
      throw error;
    }
  },

  async getEmpresaConfig(): Promise<EmpresaConfigState | null> {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.CONFIG, "readonly");
        const store = transaction.objectStore(STORES.CONFIG);
        const request = store.get("empresa_config");

        transaction.onabort = () => reject(transaction.error ?? request.error);
        transaction.onerror = () => reject(transaction.error ?? request.error);

        request.onsuccess = () => resolve(request.result?.data || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Error obteniendo config de empresa:", error);
      return null;
    }
  },

  async saveEmpresaConfig(config: EmpresaConfigState): Promise<void> {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.CONFIG, "readwrite");
        const store = transaction.objectStore(STORES.CONFIG);
        
        const request = store.put({
          id: "empresa_config",
          data: config,
          updatedAt: new Date().toISOString()
        });

        transaction.oncomplete = () => resolve();
        transaction.onabort = () => reject(transaction.error ?? request.error);
        transaction.onerror = () => reject(transaction.error ?? request.error);
      });
    } catch (error) {
      console.error("Error guardando config de empresa:", error);
      throw error;
    }
  }
};
