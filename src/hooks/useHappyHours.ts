import { useState, useCallback, useEffect } from "react";
import { apiClient } from "../config/apiClient";
import { HappyHourRule } from "../types/promociones";

export function useHappyHours() {
  const [happyHours, setHappyHours] = useState<HappyHourRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHappyHours = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient("/promotions/happy-hours");
      
      const dayMap: any = {
        SUNDAY: "Dom", MONDAY: "Lun", TUESDAY: "Mar", 
        WEDNESDAY: "Mié", THURSDAY: "Jue", FRIDAY: "Vie", SATURDAY: "Sáb"
      };

      setHappyHours(data.map((h: any) => {
        const startTime = h.startTime;
        const endTime = h.endTime;
        const days = h.daysOfWeek.map((d: string) => dayMap[d] || d);
        
        let promoStr = "";
        let pType = h.promotionType;
        if (pType === "2x1" || pType === "DOSXUNO") {
          promoStr = "2x1";
          pType = "2x1";
        } else if (pType === "porcentaje" || pType === "PORCENTAJE") {
          promoStr = `-${h.promotionValue}%`;
          pType = "porcentaje";
        } else {
          promoStr = `-C$${h.promotionValue}`;
          pType = "monto_fijo";
        }

        return {
          id: h.id,
          name: h.name,
          daysOfWeek: days,
          startTime,
          endTime,
          promotionType: pType,
          promotionValue: h.promotionValue?.toString() || "",
          status: h.status === "Activo" || h.status === "ACTIVO" ? "Activo" : "Inactivo",
          appliesTo: h.appliesTo,
          days: days.join(", "),
          time: `${startTime} - ${endTime}`,
          promotion: promoStr,
        };
      }));
    } catch (e) {
      console.error("Error fetching happy hours:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHappyHours();
  }, [fetchHappyHours]);

  const addHappyHour = useCallback(async (data: any) => {
    const revDayMap: any = {
      Dom: "SUNDAY", Lun: "MONDAY", Mar: "TUESDAY", 
      Mié: "WEDNESDAY", Jue: "THURSDAY", Vie: "FRIDAY", Sáb: "SATURDAY", Sab: "SATURDAY"
    };
    const daysOfWeek = data.daysOfWeek.map((d: string) => revDayMap[d] || d);

    let pType = "2x1";
    if (data.promotionType === "porcentaje") pType = "porcentaje";
    if (data.promotionType === "monto_fijo") pType = "monto_fijo";

    await apiClient("/promotions/happy-hours", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        daysOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        promotionType: pType,
        promotionValue: data.promotionValue ? parseFloat(data.promotionValue) : undefined,
        status: data.status === "Inactivo" ? "Inactivo" : "Activo",
        appliesTo: pType === "2x1" ? data.appliesTo : undefined
      }),
    });
    await fetchHappyHours();
  }, [fetchHappyHours]);

  const editHappyHour = useCallback(async (data: any) => {
    const revDayMap: any = {
      Dom: "SUNDAY", Lun: "MONDAY", Mar: "TUESDAY", 
      Mié: "WEDNESDAY", Jue: "THURSDAY", Vie: "FRIDAY", Sáb: "SATURDAY", Sab: "SATURDAY"
    };
    const daysOfWeek = data.daysOfWeek.map((d: string) => revDayMap[d] || d);

    let pType = "2x1";
    if (data.promotionType === "porcentaje") pType = "porcentaje";
    if (data.promotionType === "monto_fijo") pType = "monto_fijo";

    await apiClient(`/promotions/happy-hours/${data.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: data.name,
        daysOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        promotionType: pType,
        promotionValue: data.promotionValue ? parseFloat(data.promotionValue) : undefined,
        status: data.status === "Inactivo" ? "Inactivo" : "Activo",
        appliesTo: pType === "2x1" ? data.appliesTo : undefined
      }),
    });
    await fetchHappyHours();
  }, [fetchHappyHours]);

  const deleteHappyHour = useCallback(async (id: number) => {
    await apiClient(`/promotions/happy-hours/${id}`, { method: "DELETE" });
    await fetchHappyHours();
  }, [fetchHappyHours]);

  const toggleHappyHourStatus = useCallback(async (id: number) => {
    const hh = happyHours.find(h => h.id === id);
    if (!hh) return;
    const newStatus = hh.status === "Activo" ? "Inactivo" : "Activo";
    await apiClient(`/promotions/happy-hours/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus })
    });
    await fetchHappyHours();
  }, [fetchHappyHours, happyHours]);

  return { happyHours, loading, addHappyHour, editHappyHour, deleteHappyHour, toggleHappyHourStatus };
}
