import { apiClient } from "../../../shared/api";
import type { RedeemableCertificate } from "../model/promotion.types";

export interface DiscountRecord {
  id: number;
  name: string;
  type: string;
  value: string | number;
  status: string;
}

export interface DiscountPayload {
  name: string;
  type: string;
  value: number;
  status: string;
}

export interface HappyHourRecord {
  id: number;
  name: string;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  startMinutes?: number;
  endMinutes?: number;
  promotionType: string;
  promotionValue?: string | number;
  status: string;
  appliesTo?: string;
}

export interface HappyHourPayload {
  name: string;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  promotionType: string;
  promotionValue?: number;
  status: string;
  appliesTo?: string;
}

export interface CouponRecord {
  id: number;
  code: string;
  discountType: string;
  discountValue: string | number;
  maxUses: number;
  currentUses: number;
  expiresDate?: string | null;
  manualStatus?: string;
}

export interface CouponPayload {
  code: string;
  discountType: "porcentaje" | "monto_fijo";
  discountValue: number;
  maxUses: number;
  expiresDate?: string;
  manualStatus: "Activo" | "Inactivo";
}

export interface CertificateRecord {
  id: number;
  serial: string;
  origin: string;
  issueDate?: string;
  description?: string;
  status?: "Disponible" | "Entregado" | "Anulado";
  items?: Array<{ productId: string; quantity: number }>;
}

export interface CertificatePayload {
  origin: string;
  items: Array<{ productId: string; quantity: number }>;
  description?: string;
}

interface BackendCertificate {
  id: number;
  serial: string;
  status: string;
  items: Array<{ productId: string; quantity: number }>;
  description?: string;
  amount?: number | string;
}

export interface CertificateLookupGateway {
  findCertificate(serial: string): Promise<RedeemableCertificate>;
}

export interface PromotionsGateway extends CertificateLookupGateway {
  listDiscounts(): Promise<DiscountRecord[]>;
  createDiscount(payload: DiscountPayload): Promise<void>;
  updateDiscount(id: number, payload: Partial<DiscountPayload>): Promise<void>;
  deleteDiscount(id: number): Promise<void>;

  listHappyHours(): Promise<HappyHourRecord[]>;
  createHappyHour(payload: HappyHourPayload): Promise<void>;
  updateHappyHour(id: number, payload: Partial<HappyHourPayload>): Promise<void>;
  deleteHappyHour(id: number): Promise<void>;

  listCoupons(): Promise<CouponRecord[]>;
  createCoupon(payload: CouponPayload): Promise<void>;
  updateCoupon(id: number, payload: CouponPayload): Promise<void>;
  deleteCoupon(id: number): Promise<void>;

  listCertificates(): Promise<CertificateRecord[]>;
  createCertificate(payload: CertificatePayload): Promise<void>;
  deliverCertificate(id: number): Promise<void>;
  cancelCertificate(id: number): Promise<void>;
  deleteCertificate(id: number): Promise<void>;
}

async function mutate(endpoint: string, method: "POST" | "PATCH" | "DELETE", body?: unknown) {
  await apiClient(endpoint, {
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

export const promotionsGateway: PromotionsGateway = {
  async findCertificate(serial) {
    const certificate: BackendCertificate = await apiClient(
      `/promotions/certificates/${serial.trim().toUpperCase()}`,
    );

    return {
      id: certificate.id,
      serial: certificate.serial,
      status: certificate.status,
      items: certificate.items,
      description: certificate.description,
      amount:
        certificate.amount === undefined
          ? undefined
          : Number(certificate.amount),
    };
  },

  listDiscounts: () => apiClient("/promotions/discounts"),
  createDiscount: (payload) => mutate("/promotions/discounts", "POST", payload),
  updateDiscount: (id, payload) =>
    mutate(`/promotions/discounts/${id}`, "PATCH", payload),
  deleteDiscount: (id) => mutate(`/promotions/discounts/${id}`, "DELETE"),

  listHappyHours: () => apiClient("/promotions/happy-hours"),
  createHappyHour: (payload) =>
    mutate("/promotions/happy-hours", "POST", payload),
  updateHappyHour: (id, payload) =>
    mutate(`/promotions/happy-hours/${id}`, "PATCH", payload),
  deleteHappyHour: (id) =>
    mutate(`/promotions/happy-hours/${id}`, "DELETE"),

  listCoupons: () => apiClient("/promotions/coupons"),
  createCoupon: (payload) => mutate("/promotions/coupons", "POST", payload),
  updateCoupon: (id, payload) =>
    mutate(`/promotions/coupons/${id}`, "PATCH", payload),
  deleteCoupon: (id) => mutate(`/promotions/coupons/${id}`, "DELETE"),

  listCertificates: () => apiClient("/promotions/certificates"),
  createCertificate: (payload) =>
    mutate("/promotions/certificates", "POST", payload),
  deliverCertificate: (id) =>
    mutate(`/promotions/certificates/${id}/deliver`, "POST"),
  cancelCertificate: (id) =>
    mutate(`/promotions/certificates/${id}/cancel`, "POST"),
  deleteCertificate: (id) =>
    mutate(`/promotions/certificates/${id}`, "DELETE"),
};
