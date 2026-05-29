import { useState, useCallback, useEffect } from "react";
import { apiClient } from "../config/apiClient";
import { DescuentoRule } from "../types/promociones";

export function useDescuentos() {
  const [descuentos, setDescuentos] = useState<DescuentoRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDescuentos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient("/promotions/discounts");
      
      setDescuentos(data.map((d: any) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        value: d.value,
        status: d.status === "Activo" || d.status === "ACTIVO" ? "Activo" : "Inactivo",
        appliesTo: "Toda la cuenta" // En un futuro se pueden usar productIds y categoryIds
      })));
    } catch (e) {
      console.error("Error fetching discounts:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDescuentos();
  }, [fetchDescuentos]);

  const addDescuento = useCallback(async (data: any) => {
    const valueNum = parseFloat(data.value.replace(/[^0-9.]/g, ''));
    await apiClient("/promotions/discounts", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        type: data.type === "Porcentaje" ? "Porcentaje" : "Monto Fijo",
        value: valueNum,
        status: data.status === "Inactivo" ? "Inactivo" : "Activo",
      }),
    });
    await fetchDescuentos();
  }, [fetchDescuentos]);

  const editDescuento = useCallback(async (data: any) => {
    const valueNum = parseFloat(data.value.replace(/[^0-9.]/g, ''));
    await apiClient(`/promotions/discounts/${data.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: data.name,
        type: data.type === "Porcentaje" ? "Porcentaje" : "Monto Fijo",
        value: valueNum,
        status: data.status === "Inactivo" ? "Inactivo" : "Activo",
      }),
    });
    await fetchDescuentos();
  }, [fetchDescuentos]);

  const deleteDescuento = useCallback(async (id: number) => {
    await apiClient(`/promotions/discounts/${id}`, { method: "DELETE" });
    await fetchDescuentos();
  }, [fetchDescuentos]);

  return { descuentos, loading, addDescuento, editDescuento, deleteDescuento };
}
