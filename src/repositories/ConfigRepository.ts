import { apiClient } from "../config/apiClient";
import { GeneralConfigState } from "../hooks/useGeneralConfigData";
import { EmpresaConfigState } from "../hooks/useEmpresaConfig";

export const configRepository = {
  async getGeneralConfig(): Promise<GeneralConfigState | null> {
    try {
      const response = await apiClient("/config/general_config");
      return response.data;
    } catch (error) {
      console.error("Error obteniendo configuración general:", error);
      return null;
    }
  },

  async saveGeneralConfig(config: GeneralConfigState): Promise<void> {
    try {
      await apiClient("/config/general_config", {
        method: "PUT",
        body: JSON.stringify({ data: config }),
      });
    } catch (error) {
      console.error("Error guardando configuración general:", error);
      throw error;
    }
  },

  async getEmpresaConfig(): Promise<EmpresaConfigState | null> {
    try {
      const response = await apiClient("/config/empresa_config");
      return response.data;
    } catch (error) {
      console.error("Error obteniendo config de empresa:", error);
      return null;
    }
  },

  async saveEmpresaConfig(config: EmpresaConfigState): Promise<void> {
    try {
      await apiClient("/config/empresa_config", {
        method: "PUT",
        body: JSON.stringify({ data: config }),
      });
    } catch (error) {
      console.error("Error guardando config de empresa:", error);
      throw error;
    }
  },

  async getDeliveryPricesConfig(): Promise<string[] | null> {
    try {
      const response = await apiClient("/config/delivery_prices");
      // Asumimos que el payload guardado es { prices: string[] }
      return response.data?.prices || null;
    } catch (error) {
      console.error("Error obteniendo precios de delivery:", error);
      return null;
    }
  },

  async saveDeliveryPricesConfig(prices: string[]): Promise<void> {
    try {
      await apiClient("/config/delivery_prices", {
        method: "PUT",
        body: JSON.stringify({ data: { prices } }),
      });
    } catch (error) {
      console.error("Error guardando precios de delivery:", error);
      throw error;
    }
  }
};
