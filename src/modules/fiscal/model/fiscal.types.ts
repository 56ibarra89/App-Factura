export type DocumentType = "Factura";
export type CorrelativoStatus = "Activo" | "Agotado" | "Vencido";

export interface Correlativo {
  id: string;
  documentType: DocumentType;
  resolutionNumber: string;
  prefix: string;
  startNumber: number;
  endNumber: number;
  currentNumber: number;
  issueDate: Date;
  expirationDate: Date;
  status: CorrelativoStatus;
  createdAt: Date;
}

export interface DgiConfig {
  resolutionNumber: string;
  startNumber: number;
  endNumber: number;
  authorizationDate: string;
}

