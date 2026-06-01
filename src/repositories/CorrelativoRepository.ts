import { apiClient } from "../config/apiClient";
import { Correlativo } from "../types/correlativo.types";
import type { ICorrelativoRepository } from "../types/repositories";

export const correlativoRepository: ICorrelativoRepository = {
  async save(correlativo: Correlativo): Promise<void> {
    await apiClient("/correlativos", {
      method: "POST",
      body: JSON.stringify(correlativo),
    });
  },

  async update(id: string, correlativo: Partial<Correlativo>): Promise<void> {
    await apiClient(`/correlativos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(correlativo),
    });
  },

  async getAll(): Promise<Correlativo[]> {
    return apiClient("/correlativos");
  },

  async getActiveByDocumentType(documentType: string): Promise<Correlativo | null> {
    try {
      const active = await apiClient(`/correlativos/active?documentType=${documentType}`);
      return active;
    } catch (error) {
      return null;
    }
  },

  async delete(id: string): Promise<void> {
    await apiClient(`/correlativos/${id}`, {
      method: "DELETE",
    });
  }
};
