/**
 * useCertificados — Hook CRUD para la gestión de certificados/vales de producto conectado al backend.
 */
import { useState, useCallback, useEffect } from "react";
import { apiClient } from "../config/apiClient";
import { CertificadoRule } from "../types/promociones";
import { useProductContext } from "../context/ProductContext";

export type CertificadoInput = {
  origin: string;
  product: string;
  productName?: string;
  notes?: string;
};

// ── Hook ─────────────────────────────────────────────────────────────────────

interface UseCertificadosReturn {
  certificados: CertificadoRule[];
  loading: boolean;
  addCertificado: (data: CertificadoInput) => Promise<void>;
  markDelivered: (id: number) => Promise<void>;
  cancelCertificado: (id: number) => Promise<void>;
  deleteCertificado: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useCertificados(): UseCertificadosReturn {
  const [certificados, setCertificados] = useState<CertificadoRule[]>([]);
  const [loading, setLoading] = useState(true);
  const { categories } = useProductContext();

  const fetchCertificados = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient("/promotions/certificates");
      setCertificados(data.map((c: any) => {
        let productName = "Producto Desconocido";
        if (c.items && c.items.length > 0) {
           const pId = c.items[0].productId;
           for (const cat of categories) {
             const found = cat.items.find(item => item.id === pId);
             if (found) {
                productName = found.name;
                break;
             }
           }
        }
        
        return {
          id: c.id,
          serial: c.serial,
          origin: c.origin,
          product: productName,
          issueDate: c.issueDate ? c.issueDate.split("T")[0] : "",
          notes: c.description || "",
          status: c.status || "Disponible",
        };
      }));
    } catch (e) {
      console.error("Error fetching certificates:", e);
    } finally {
      setLoading(false);
    }
  }, [categories]);

  useEffect(() => {
    fetchCertificados();
  }, [fetchCertificados]);

  const addCertificado = useCallback(async (data: CertificadoInput) => {
    await apiClient("/promotions/certificates", {
      method: "POST",
      body: JSON.stringify({
        origin: data.origin,
        items: [{ productId: data.product, quantity: 1 }],
        description: data.notes,
      }),
    });
    await fetchCertificados();
  }, [fetchCertificados]);

  const markDelivered = useCallback(async (id: number) => {
    await apiClient(`/promotions/certificates/${id}/deliver`, { method: "POST" });
    await fetchCertificados();
  }, [fetchCertificados]);

  const cancelCertificado = useCallback(async (id: number) => {
    await apiClient(`/promotions/certificates/${id}/cancel`, { method: "POST" });
    await fetchCertificados();
  }, [fetchCertificados]);

  const deleteCertificado = useCallback(async (id: number) => {
    await apiClient(`/promotions/certificates/${id}`, { method: "DELETE" });
    await fetchCertificados();
  }, [fetchCertificados]);

  return {
    certificados,
    loading,
    addCertificado,
    markDelivered,
    cancelCertificado,
    deleteCertificado,
    refresh: fetchCertificados
  };
}
