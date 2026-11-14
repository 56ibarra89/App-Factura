import { useState, useEffect, useCallback } from "react";
import {
  correlativoRepository,
  type ICorrelativoRepository,
} from "../api/correlativoRepository";
import type {
  Correlativo,
  CorrelativoStatus,
  DocumentType,
} from "../model/fiscal.types";

interface UseCorrelativosOptions {
  repository?: ICorrelativoRepository;
}

const parseCorrelativoDate = (value?: Date | string): Date => {
  if (!value) return new Date();
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return new Date(`${value.trim()}T12:00:00-06:00`);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

export const useCorrelativos = (options: UseCorrelativosOptions = {}) => {
  const repository = options.repository ?? correlativoRepository;
  const [correlativos, setCorrelativos] = useState<Correlativo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCorrelativos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await repository.getAll();
      setCorrelativos(data);
    } catch (error) {
      console.error("Error al cargar correlativos:", error);
    } finally {
      setLoading(false);
    }
  }, [repository]);

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
        issueDate: parseCorrelativoDate(formData.issueDate),
        expirationDate: parseCorrelativoDate(formData.expirationDate),
        status: formData.status as CorrelativoStatus,
        createdAt: new Date(),
      };

      await repository.save(newCorrelativo);
      await loadCorrelativos();
    } catch (error) {
      console.error("Error guardando correlativo:", error);
      throw error;
    }
  };

  const updateCorrelativo = async (id: string, formData: Partial<Correlativo>) => {
    try {
      await repository.update(id, formData);
      await loadCorrelativos();
    } catch (error) {
      console.error("Error actualizando correlativo:", error);
      throw error;
    }
  };

  const deleteCorrelativo = async (id: string) => {
    try {
      await repository.delete(id);
      await loadCorrelativos();
    } catch (error) {
      console.error("Error eliminando correlativo:", error);
      throw error;
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
    updateCorrelativo,
    deleteCorrelativo,
  };
};
