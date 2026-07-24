import { useState, useCallback, useEffect } from "react";
import { DescuentoRule } from "../types/promociones";
import {
  promotionsGateway,
  type PromotionsGateway,
} from "../services/promotions/promotionsGateway";

export function useDescuentos(
  gateway: PromotionsGateway = promotionsGateway,
) {
  const [descuentos, setDescuentos] = useState<DescuentoRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDescuentos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await gateway.listDiscounts();
      
      setDescuentos(data.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        value: String(d.value),
        status: d.status === "Activo" || d.status === "ACTIVO" ? "Activo" : "Inactivo",
        appliesTo: "Toda la cuenta" // En un futuro se pueden usar productIds y categoryIds
      })));
    } catch (e) {
      console.error("Error fetching discounts:", e);
    } finally {
      setLoading(false);
    }
  }, [gateway]);

  useEffect(() => {
    fetchDescuentos();
  }, [fetchDescuentos]);

  const addDescuento = useCallback(async (data: DescuentoRule) => {
    const valueNum = parseFloat(data.value.replace(/[^0-9.]/g, ''));
    await gateway.createDiscount({
      name: data.name,
      type: data.type === "Porcentaje" ? "Porcentaje" : "Monto Fijo",
      value: valueNum,
      status: data.status === "Inactivo" ? "Inactivo" : "Activo",
    });
    await fetchDescuentos();
  }, [fetchDescuentos, gateway]);

  const editDescuento = useCallback(async (data: DescuentoRule) => {
    const valueNum = parseFloat(data.value.replace(/[^0-9.]/g, ''));
    await gateway.updateDiscount(data.id, {
      name: data.name,
      type: data.type === "Porcentaje" ? "Porcentaje" : "Monto Fijo",
      value: valueNum,
      status: data.status === "Inactivo" ? "Inactivo" : "Activo",
    });
    await fetchDescuentos();
  }, [fetchDescuentos, gateway]);

  const deleteDescuento = useCallback(async (id: number) => {
    await gateway.deleteDiscount(id);
    await fetchDescuentos();
  }, [fetchDescuentos, gateway]);

  return { descuentos, loading, addDescuento, editDescuento, deleteDescuento };
}
