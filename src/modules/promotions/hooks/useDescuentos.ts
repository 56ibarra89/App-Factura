import { useState, useCallback, useEffect } from "react";
import type { DescuentoRule } from "../model/promotion.types";
import {
  promotionsGateway,
  type PromotionsGateway,
} from "../api/promotionsGateway";

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
        appliesTo:
          d.productIds?.length || d.categoryIds?.length
            ? "Productos o categorÃ­as seleccionados"
            : "Toda la cuenta",
        productIds: d.productIds,
        categoryIds: d.categoryIds,
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
