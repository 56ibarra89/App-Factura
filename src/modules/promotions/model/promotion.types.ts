export type CuponStatus = "Activo" | "Inactivo" | "Agotado" | "Vencido";

export type PromotionSource = "coupon" | "discount" | "happy-hour";

export interface AppliedPromotion {
  source: PromotionSource;
  id: number;
  code: string;
  discountType: "2x1" | "porcentaje" | "monto_fijo";
  discountValue: number;
  productIds?: string[];
  categoryIds?: string[];
}

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
  productIds?: string[];
  categoryIds?: string[];
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
  productIds?: string[];
  categoryIds?: string[];
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

export type CuponFormOutput = Omit<
  CuponRule,
  "discount" | "usage" | "expires" | "status"
> & { manualStatus: CuponStatus };

export interface CertificadoRule {
  id: number;
  serial: string;
  origin: string;
  product: string;
  issueDate: string;
  notes?: string;
  status: "Disponible" | "Entregado" | "Anulado";
}

export interface CertificadoInput {
  origin: string;
  product: string;
  productName?: string;
  notes?: string;
}

export interface RedeemableCertificateItem {
  productId: string;
  quantity: number;
}

export interface RedeemableCertificate {
  id: number;
  serial: string;
  status: string;
  items: RedeemableCertificateItem[];
  description?: string;
  amount?: number;
}
