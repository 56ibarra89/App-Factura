

export type CuponStatus = "Activo" | "Inactivo" | "Agotado" | "Vencido";

export interface HappyHourRule {
  id: number;
  name: string;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  promotionType: "2x1" | "porcentaje" | "monto_fijo";
  promotionValue: string;
  status: "Activo" | "Inactivo";
  appliesTo?: string;
  days: string;
  time: string;
  promotion: string;
}

export interface DescuentoRule {
  id: number;
  name: string;
  type: string;
  value: string;
  status: "Activo" | "Inactivo";
  appliesTo: string;
}

export interface CuponRule {
  id: number;
  code: string;
  discountType: "porcentaje" | "monto_fijo";
  discountValue: string;
  maxUses: number;
  currentUses: number;
  expiresDate: string;
  discount: string;
  usage: string;
  expires: string;
  status: CuponStatus;
}

export interface CertificadoRule {
  id: number;
  serial: string;
  origin: string;
  product: string;
  issueDate: string;
  notes?: string;
  status: "Disponible" | "Entregado" | "Anulado";
}
