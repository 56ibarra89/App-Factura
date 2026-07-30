import { apiClient } from "../../../shared/api";
import type { Correlativo } from "../model/fiscal.types";

export interface ICorrelativoRepository {
  save(correlativo: Correlativo): Promise<void>;
  update(id: string, correlativo: Partial<Correlativo>): Promise<void>;
  getAll(): Promise<Correlativo[]>;
  getActiveByDocumentType(documentType: string): Promise<Correlativo | null>;
  delete(id: string): Promise<void>;
}

const toBackend = (correlativo: Partial<Correlativo>) => {
  const rest = { ...correlativo };
  delete rest.id;
  delete rest.createdAt;
  return {
    ...rest,
    ...(rest.documentType && { documentType: rest.documentType.toUpperCase() }),
    ...(rest.status && { status: rest.status.toUpperCase() })
  };
};

interface BackendCorrelativo {
  id: string;
  documentType: string;
  resolutionNumber: string;
  prefix: string;
  startNumber: number;
  endNumber: number;
  currentNumber: number;
  issueDate?: string;
  expirationDate?: string;
  status: string;
  createdAt?: string;
}

const toFrontend = (backendObj: BackendCorrelativo): Correlativo => {
  const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
  const documentType = capitalize(backendObj.documentType);
  const status = capitalize(backendObj.status);
  if (documentType !== "Factura") {
    throw new Error(`Tipo de documento no soportado: ${documentType}`);
  }
  if (status !== "Activo" && status !== "Agotado" && status !== "Vencido") {
    throw new Error(`Estado de correlativo no soportado: ${status}`);
  }
  return {
    ...backendObj,
    documentType,
    status,
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
    const data: BackendCorrelativo[] = await apiClient("/correlativos");
    return data.map(toFrontend);
  },

  async getActiveByDocumentType(documentType: string): Promise<Correlativo | null> {
    try {
      const active: BackendCorrelativo | null = await apiClient(`/correlativos/active?documentType=${documentType.toUpperCase()}`);
      return active ? toFrontend(active) : null;
    } catch {
      return null;
    }
  },

  async delete(id: string): Promise<void> {
    await apiClient(`/correlativos/${id}`, {
      method: "DELETE",
    });
  }
};
