import { apiClient } from "../config/apiClient";
import { Correlativo } from "../types/correlativo.types";
import type { ICorrelativoRepository } from "../types/repositories";

const toBackend = (correlativo: Partial<Correlativo>) => {
  const { id, createdAt, ...rest } = correlativo;
  return {
    ...rest,
    ...(rest.documentType && { documentType: rest.documentType.toUpperCase() }),
    ...(rest.status && { status: rest.status.toUpperCase() })
  };
};

const toFrontend = (backendObj: any): Correlativo => {
  const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
  return {
    ...backendObj,
    documentType: capitalize(backendObj.documentType),
    status: capitalize(backendObj.status),
    issueDate: backendObj.issueDate ? new Date(backendObj.issueDate) : new Date(),
    expirationDate: backendObj.expirationDate ? new Date(backendObj.expirationDate) : new Date(),
    createdAt: backendObj.createdAt ? new Date(backendObj.createdAt) : new Date()
  };
};

export const correlativoRepository: ICorrelativoRepository = {
  async save(correlativo: Correlativo): Promise<void> {
    await apiClient("/correlativos", {
      method: "POST",
      body: JSON.stringify(toBackend(correlativo)),
    });
  },

  async update(id: string, correlativo: Partial<Correlativo>): Promise<void> {
    await apiClient(`/correlativos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(toBackend(correlativo)),
    });
  },

  async getAll(): Promise<Correlativo[]> {
    const data = await apiClient("/correlativos");
    return data.map(toFrontend);
  },

  async getActiveByDocumentType(documentType: string): Promise<Correlativo | null> {
    try {
      const active = await apiClient(`/correlativos/active?documentType=${documentType.toUpperCase()}`);
      return active ? toFrontend(active) : null;
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
