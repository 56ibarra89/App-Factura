/**
 * useCertificados — Hook CRUD para la gestión de certificados/vales de producto.
 *
 * SOLID:
 *  S — Single Responsibility: solo gestiona el estado y lógica de certificados.
 *      La generación del serial y la fecha de emisión son responsabilidades internas.
 *  D — Dependency Inversion: recibe los datos iniciales como parámetro →
 *      fácilmente sustituible por una fuente API sin modificar el hook.
 */
import { useState, useCallback, useEffect } from "react";
import { CertificadoRule } from "../data/promocionesMockData";

// ── Helpers de dominio ───────────────────────────────────────────────────────

/**
 * Genera un serial único con formato VC-XXXXXX (6 dígitos aleatorios).
 * Verifica que no exista ya en la lista actual para garantizar unicidad.
 */
export function generateSerial(existing: CertificadoRule[]): string {
  const existingSerials = new Set(existing.map((c) => c.serial));
  let serial: string;
  do {
    const num = Math.floor(100000 + Math.random() * 900000);
    serial = `VC-${num}`;
  } while (existingSerials.has(serial));
  return serial;
}

/** Devuelve la fecha de hoy en formato ISO YYYY-MM-DD. */
export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

// ── Tipo de entrada para emitir un certificado ───────────────────────────────

export type CertificadoInput = {
  origin: string;
  product: string;
  notes?: string;
};

// ── Hook ─────────────────────────────────────────────────────────────────────

interface UseCertificadosReturn {
  certificados: CertificadoRule[];
  addCertificado: (data: CertificadoInput) => void;
  markDelivered: (id: number) => void;
  cancelCertificado: (id: number) => void;
  deleteCertificado: (id: number) => void;
}

/**
 * Hook que provee el CRUD de certificados/vales.
 * @param initialData - Datos iniciales (mock o procedentes de una API).
 */
export function useCertificados(
  initialData: CertificadoRule[]
): UseCertificadosReturn {
  const [certificados, setCertificados] = useState<CertificadoRule[]>(() => {
    try {
      const saved = localStorage.getItem("app_certificados");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse app_certificados", e);
    }
    return initialData;
  });

  useEffect(() => {
    localStorage.setItem("app_certificados", JSON.stringify(certificados));
  }, [certificados]);

  /** Emite un nuevo certificado generando serial y fecha de emisión automáticamente. */
  const addCertificado = useCallback((data: CertificadoInput) => {
    setCertificados((prev) => {
      const newCert: CertificadoRule = {
        id: Date.now(),
        serial: generateSerial(prev),
        origin: data.origin,
        product: data.product,
        notes: data.notes,
        issueDate: todayISO(),
        status: "Disponible",
      };
      return [...prev, newCert];
    });
  }, []);

  /** Marca el certificado como entregado (canje). Disponible → Entregado. */
  const markDelivered = useCallback((id: number) => {
    setCertificados((prev) =>
      prev.map((c) =>
        c.id === id && c.status === "Disponible"
          ? { ...c, status: "Entregado" }
          : c
      )
    );
  }, []);

  /** Anula el certificado sin eliminarlo del registro. */
  const cancelCertificado = useCallback((id: number) => {
    setCertificados((prev) =>
      prev.map((c) =>
        c.id === id && c.status === "Disponible"
          ? { ...c, status: "Anulado" }
          : c
      )
    );
  }, []);

  /** Elimina físicamente el certificado de la lista. */
  const deleteCertificado = useCallback((id: number) => {
    setCertificados((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return {
    certificados,
    addCertificado,
    markDelivered,
    cancelCertificado,
    deleteCertificado,
  };
}
