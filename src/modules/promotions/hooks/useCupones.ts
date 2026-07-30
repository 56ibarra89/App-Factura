/**
 * useCupones — Hook CRUD para la gestión de cupones manuales conectado al backend.
 */
import { useState, useCallback, useEffect } from "react";
import type {
  CuponRule,
  CuponStatus,
} from "../model/promotion.types";
import {
  promotionsGateway,
  type CouponRecord,
  type PromotionsGateway,
} from "../api/promotionsGateway";

// ── Función pura de dominio ──────────────────────────────────────────────────

export function computeCuponStatus(
  maxUses: number,
  currentUses: number,
  expiresDate: string | null | undefined,
  manualStatus: string
): CuponStatus {
  if (manualStatus === "INACTIVO") return "Inactivo";

  const isExhausted = maxUses > 0 && currentUses >= maxUses;
  const isExpired =
    expiresDate && new Date(expiresDate) < new Date(new Date().toDateString());

  if (isExhausted) return "Agotado";
  if (isExpired) return "Vencido";
  return "Activo";
}

function buildDiscount(type: string, value: string | number): string {
  if (type === "PORCENTAJE" || type === "porcentaje") return `${value}%`;
  return `C$${parseFloat(value.toString()).toFixed(2)}`;
}

function buildUsage(current: number, max: number): string {
  return max === 0 ? `${current} / ∞` : `${current} / ${max}`;
}

function buildExpires(dateISO: string | null | undefined): string {
  return !dateISO ? "Sin límite" : dateISO.split("T")[0];
}

export function hydrateCuponBackend(raw: CouponRecord): CuponRule {
  const manualStatusStr = raw.manualStatus || "ACTIVO";
  const status = computeCuponStatus(
    raw.maxUses,
    raw.currentUses,
    raw.expiresDate,
    manualStatusStr
  );

  return {
    id: raw.id,
    code: raw.code,
    discountType: raw.discountType === "porcentaje" || raw.discountType === "PORCENTAJE" ? "porcentaje" : "monto_fijo",
    discountValue: raw.discountValue.toString(),
    maxUses: raw.maxUses,
    currentUses: raw.currentUses,
    expiresDate: raw.expiresDate ? raw.expiresDate.split("T")[0] : "",
    discount: buildDiscount(raw.discountType, raw.discountValue),
    usage: buildUsage(raw.currentUses, raw.maxUses),
    expires: buildExpires(raw.expiresDate),
    status,
  };
}

// ── Hook ─────────────────────────────────────────────────────────────────────

interface UseCuponesReturn {
  cupones: CuponRule[];
  loading: boolean;
  addCupon: (data: Omit<CuponRule, "id" | "discount" | "usage" | "expires" | "status"> & { manualStatus?: CuponStatus }) => Promise<void>;
  editCupon: (data: Omit<CuponRule, "discount" | "usage" | "expires" | "status"> & { manualStatus?: CuponStatus }) => Promise<void>;
  deleteCupon: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useCupones(
  gateway: PromotionsGateway = promotionsGateway,
): UseCuponesReturn {
  const [cupones, setCupones] = useState<CuponRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCupones = useCallback(async () => {
    try {
      setLoading(true);
      const data = await gateway.listCoupons();
      setCupones(data.map(hydrateCuponBackend));
    } catch (e) {
      console.error("Error fetching coupons:", e);
    } finally {
      setLoading(false);
    }
  }, [gateway]);

  useEffect(() => {
    fetchCupones();
  }, [fetchCupones]);

  const addCupon = useCallback(
    async (data: Omit<CuponRule, "id" | "discount" | "usage" | "expires" | "status"> & { manualStatus?: CuponStatus }) => {
      await gateway.createCoupon({
        code: data.code,
        discountType: data.discountType === "porcentaje" ? "porcentaje" : "monto_fijo",
        discountValue: parseFloat(data.discountValue),
        maxUses: data.maxUses,
        expiresDate: data.expiresDate || undefined,
        manualStatus: data.manualStatus === "Inactivo" ? "Inactivo" : "Activo",
      });
      await fetchCupones();
    },
    [fetchCupones, gateway]
  );

  const editCupon = useCallback(
    async (data: Omit<CuponRule, "discount" | "usage" | "expires" | "status"> & { manualStatus?: CuponStatus }) => {
      await gateway.updateCoupon(data.id, {
        code: data.code,
        discountType: data.discountType === "porcentaje" ? "porcentaje" : "monto_fijo",
        discountValue: parseFloat(data.discountValue),
        maxUses: data.maxUses,
        expiresDate: data.expiresDate || undefined,
        manualStatus: data.manualStatus === "Inactivo" ? "Inactivo" : "Activo",
      });
      await fetchCupones();
    },
    [fetchCupones, gateway]
  );

  const deleteCupon = useCallback(
    async (id: number) => {
      await gateway.deleteCoupon(id);
      await fetchCupones();
    },
    [fetchCupones, gateway]
  );

  return { cupones, loading, addCupon, editCupon, deleteCupon, refresh: fetchCupones };
}
