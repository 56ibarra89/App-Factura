import { useState, useEffect, useCallback } from "react";
import { correlativoRepository } from "../repositories/CorrelativoRepository";
import { Correlativo, CorrelativoStatus, DocumentType } from "../types/correlativo.types";

export const useCorrelativos = () => {
  const [correlativos, setCorrelativos] = useState<Correlativo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCorrelativos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await correlativoRepository.getAll();
      setCorrelativos(data);
    } catch (error) {
      console.error("Error al cargar correlativos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCorrelativos();
  }, [loadCorrelativos]);

  const saveCorrelativo = async (formData: Partial<Correlativo>) => {
    try {
      const newCorrelativo: Correlativo = {
        id: crypto.randomUUID(),
        documentType: formData.documentType as DocumentType,
        resolutionNumber: formData.resolutionNumber || "",
        prefix: formData.prefix || "",
        startNumber: Number(formData.startNumber),
        endNumber: Number(formData.endNumber),
        currentNumber: Number(formData.currentNumber || formData.startNumber),
        issueDate: new Date(formData.issueDate || new Date()),
        expirationDate: new Date(formData.expirationDate || new Date()),
        status: formData.status as CorrelativoStatus,
        createdAt: new Date(),
      };

      // Inactivar los correlativos anteriores activos del mismo tipo
      if (newCorrelativo.status === "Activo") {
        const activeExisting = correlativos.find(
          (c) => c.documentType === newCorrelativo.documentType && c.status === "Activo"
        );
        if (activeExisting) {
          activeExisting.status = "Vencido";
          await correlativoRepository.save(activeExisting);
        }
      }

      await correlativoRepository.save(newCorrelativo);
      await loadCorrelativos();
    } catch (error) {
      console.error("Error guardando correlativo:", error);
      throw error;
    }
  };

  const deleteCorrelativo = async (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este registro?")) {
      try {
        await correlativoRepository.delete(id);
        await loadCorrelativos();
      } catch (error) {
        console.error("Error eliminando correlativo:", error);
      }
    }
  };

  const activeFactura = correlativos.find(
    (c) => c.documentType === "Factura" && c.status === "Activo"
  );

  return {
    correlativos,
    loading,
    activeFactura,
    saveCorrelativo,
    deleteCorrelativo,
  };
};
