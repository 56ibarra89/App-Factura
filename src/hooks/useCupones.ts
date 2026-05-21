/**
 * useCupones — Hook CRUD para la gestión de cupones manuales.
 *
 * SOLID:
 *  S — Single Responsibility: solo gestiona el estado y lógica de cupones.
 *  D — Dependency Inversion: recibe los datos iniciales por parámetro,
 *      pudiendo conectarse a una API sin modificar el hook.
 */
import { useState, useCallback, useEffect } from "react";
import { CuponRule, CuponStatus } from "../data/promocionesMockData";

// ── Función pura de dominio ──────────────────────────────────────────────────

/**
 * Calcula el estado de un cupón en función de sus usos y fecha de vencimiento.
 * El criterio que se cumpla primero (agotado o vencido) prevalece.
 *
 * @returns CuponStatus calculado automáticamente, o "Inactivo" si el cupón está desactivado.
 */
export function computeCuponStatus(
  maxUses: number,
  currentUses: number,
  expiresDate: string,
  manualStatus: CuponStatus
): CuponStatus {
  // Un cupón inactivo manualmente no cambia a otro estado automáticamente
  if (manualStatus === "Inactivo") return "Inactivo";

  const isExhausted = maxUses > 0 && currentUses >= maxUses;
  const isExpired =
    expiresDate !== "" && new Date(expiresDate) < new Date(new Date().toDateString());

  if (isExhausted) return "Agotado";
  if (isExpired) return "Vencido";
  return "Activo";
}

// ── Funciones auxiliares (cálculo de campos derivados) ───────────────────────

/** Genera el texto de descuento para la columna visual. */
function buildDiscount(type: CuponRule["discountType"], value: string): string {
  if (type === "porcentaje") return `${value}%`;
  return `C$${parseFloat(value).toFixed(2)}`;
}

/** Genera el texto de uso para la columna visual. */
function buildUsage(current: number, max: number): string {
  return max === 0 ? `${current} / ∞` : `${current} / ${max}`;
}

/** Genera el texto de vencimiento para la columna visual. */
function buildExpires(dateISO: string): string {
  return dateISO === "" ? "Sin límite" : dateISO;
}

/**
 * Reconstruye todos los campos derivados de un CuponRule a partir de sus
 * campos granulares. Llama a computeCuponStatus internamente.
 */
export function hydrateCupon(
  partial: Omit<CuponRule, "discount" | "usage" | "expires" | "status"> & {
    manualStatus?: CuponStatus;
  }
): CuponRule {
  const manualStatus: CuponStatus = partial.manualStatus ?? "Activo";
  const status = computeCuponStatus(
    partial.maxUses,
    partial.currentUses,
    partial.expiresDate,
    manualStatus
  );
  return {
    ...partial,
    discount: buildDiscount(partial.discountType, partial.discountValue),
    usage: buildUsage(partial.currentUses, partial.maxUses),
    expires: buildExpires(partial.expiresDate),
    status,
  };
}

// ── Hook ─────────────────────────────────────────────────────────────────────

interface UseCuponesReturn {
  cupones: CuponRule[];
  addCupon: (data: Omit<CuponRule, "id" | "discount" | "usage" | "expires" | "status"> & { manualStatus?: CuponStatus }) => void;
  editCupon: (data: Omit<CuponRule, "discount" | "usage" | "expires" | "status"> & { manualStatus?: CuponStatus }) => void;
  deleteCupon: (id: number) => void;
}

/**
 * Hook que provee el CRUD de cupones con recálculo automático de estado.
 * @param initialData - Datos iniciales (mock o procedentes de una API).
 */
export function useCupones(initialData: CuponRule[]): UseCuponesReturn {
  const [cupones, setCupones] = useState<CuponRule[]>(() => {
    try {
      const saved = localStorage.getItem("app_cupones");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialData;
  });

  useEffect(() => {
    localStorage.setItem("app_cupones", JSON.stringify(cupones));
  }, [cupones]);

  const addCupon = useCallback(
    (data: Omit<CuponRule, "id" | "discount" | "usage" | "expires" | "status"> & { manualStatus?: CuponStatus }) => {
      const newCupon = hydrateCupon({ ...data, id: Date.now() });
      setCupones((prev) => [...prev, newCupon]);
    },
    []
  );

  const editCupon = useCallback(
    (data: Omit<CuponRule, "discount" | "usage" | "expires" | "status"> & { manualStatus?: CuponStatus }) => {
      const updated = hydrateCupon(data);
      setCupones((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    },
    []
  );

  const deleteCupon = useCallback((id: number) => {
    setCupones((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { cupones, addCupon, editCupon, deleteCupon };
}
