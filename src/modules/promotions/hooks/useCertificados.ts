
import { useState, useCallback, useEffect } from "react";
import type {
  CertificadoInput,
  CertificadoRule,
} from "../model/promotion.types";
import { useCatalog } from "../../catalog";
import {
  promotionsGateway,
  type PromotionsGateway,
} from "../api/promotionsGateway";

interface UseCertificadosReturn {
  certificados: CertificadoRule[];
  loading: boolean;
  addCertificado: (data: CertificadoInput) => Promise<void>;
  markDelivered: (id: number) => Promise<void>;
  cancelCertificado: (id: number) => Promise<void>;
  deleteCertificado: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useCertificados(
  gateway: PromotionsGateway = promotionsGateway,
): UseCertificadosReturn {
  const [certificados, setCertificados] = useState<CertificadoRule[]>([]);
  const [loading, setLoading] = useState(true);
  const { categories } = useCatalog();

  const fetchCertificados = useCallback(async () => {
    try {
      setLoading(true);
      const data = await gateway.listCertificates();
      setCertificados(data.map((c) => {
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
  }, [categories, gateway]);

  useEffect(() => {
    fetchCertificados();
  }, [fetchCertificados]);

  const addCertificado = useCallback(async (data: CertificadoInput) => {
    await gateway.createCertificate({
      origin: data.origin,
      items: [{ productId: data.product, quantity: 1 }],
      description: data.notes,
    });
    await fetchCertificados();
  }, [fetchCertificados, gateway]);

  const markDelivered = useCallback(async (id: number) => {
    await gateway.deliverCertificate(id);
    await fetchCertificados();
  }, [fetchCertificados, gateway]);

  const cancelCertificado = useCallback(async (id: number) => {
    await gateway.cancelCertificate(id);
    await fetchCertificados();
  }, [fetchCertificados, gateway]);

  const deleteCertificado = useCallback(async (id: number) => {
    await gateway.deleteCertificate(id);
    await fetchCertificados();
  }, [fetchCertificados, gateway]);

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

