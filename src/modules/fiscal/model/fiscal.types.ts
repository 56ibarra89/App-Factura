export type DocumentType = "Factura"; // En el futuro se pueden añadir "Nota de Crédito", etc.
export type CorrelativoStatus = "Activo" | "Agotado" | "Vencido";

export interface Correlativo {
  id: string; // UUID
  documentType: DocumentType;
  resolutionNumber: string; // Número de CAI, Resolución, etc.
  prefix: string; // Ej. 001-001-01-
  startNumber: number; // Rango inicial
  endNumber: number; // Rango final
  currentNumber: number; // Número actual
  issueDate: Date; // Fecha de emisión de la resolución
  expirationDate: Date; // Fecha límite de emisión
  status: CorrelativoStatus;
  createdAt: Date;
}

export interface DgiConfig {
  resolutionNumber: string;
  startNumber: number;
  endNumber: number;
  authorizationDate: string;
}
