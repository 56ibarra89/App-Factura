import { useCallback, useEffect, useState } from "react";
import {
  promotionsGateway,
  type HappyHourPayload,
  type PromotionsGateway,
} from "../api/promotionsGateway";
import type { HappyHourRule } from "../model/promotion.types";

const DAY_MAP: Record<string, string> = {
  SUNDAY: "Dom",
  MONDAY: "Lun",
  TUESDAY: "Mar",
  WEDNESDAY: "Mié",
  THURSDAY: "Jue",
  FRIDAY: "Vie",
  SATURDAY: "Sáb",
};

const REVERSE_DAY_MAP: Record<string, string> = {
  Dom: "SUNDAY",
  Lun: "MONDAY",
  Mar: "TUESDAY",
  Mié: "WEDNESDAY",
  Jue: "THURSDAY",
  Vie: "FRIDAY",
  Sáb: "SATURDAY",
  Sab: "SATURDAY",
};

function toHappyHourPayload(data: HappyHourRule): HappyHourPayload {
  const promotionType =
    data.promotionType === "porcentaje"
      ? "porcentaje"
      : data.promotionType === "monto_fijo"
        ? "monto_fijo"
        : "2x1";

  return {
    name: data.name,
    daysOfWeek: data.daysOfWeek.map((day) => REVERSE_DAY_MAP[day] || day),
    startTime: data.startTime,
    endTime: data.endTime,
    promotionType,
    promotionValue: data.promotionValue
      ? parseFloat(data.promotionValue)
      : undefined,
    status: data.status === "Inactivo" ? "Inactivo" : "Activo",
    appliesTo: promotionType === "2x1" ? data.appliesTo : undefined,
  };
}

export function useHappyHours(
  gateway: PromotionsGateway = promotionsGateway,
) {
  const [happyHours, setHappyHours] = useState<HappyHourRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHappyHours = useCallback(async () => {
    try {
      setLoading(true);
      const data = await gateway.listHappyHours();

      setHappyHours(
        data.map((happyHour) => {
          const days = happyHour.daysOfWeek.map(
            (day) => DAY_MAP[day] || day,
          );
          const rawType = happyHour.promotionType;
          let promotionType: HappyHourRule["promotionType"];
          let promotion: string;

          if (rawType === "2x1" || rawType === "DOSXUNO") {
            promotionType = "2x1";
            promotion = "2x1";
          } else if (
            rawType === "porcentaje" ||
            rawType === "PORCENTAJE"
          ) {
            promotionType = "porcentaje";
            promotion = `-${happyHour.promotionValue}%`;
          } else {
            promotionType = "monto_fijo";
            promotion = `-C$${happyHour.promotionValue}`;
          }

          return {
            id: happyHour.id,
            name: happyHour.name,
            daysOfWeek: days,
            startTime: happyHour.startTime,
            endTime: happyHour.endTime,
            promotionType,
            promotionValue: happyHour.promotionValue?.toString() || "",
            status:
              happyHour.status === "Activo" ||
              happyHour.status === "ACTIVO"
                ? "Activo"
                : "Inactivo",
            appliesTo: happyHour.appliesTo,
            productIds: happyHour.productIds,
            categoryIds: happyHour.categoryIds,
            days: days.join(", "),
            time: `${happyHour.startTime} - ${happyHour.endTime}`,
            promotion,
          };
        }),
      );
    } catch (error) {
      console.error("Error fetching happy hours:", error);
    } finally {
      setLoading(false);
    }
  }, [gateway]);

  useEffect(() => {
    void fetchHappyHours();
  }, [fetchHappyHours]);

  const addHappyHour = useCallback(
    async (data: HappyHourRule) => {
      await gateway.createHappyHour(toHappyHourPayload(data));
      await fetchHappyHours();
    },
    [fetchHappyHours, gateway],
  );

  const editHappyHour = useCallback(
    async (data: HappyHourRule) => {
      await gateway.updateHappyHour(data.id, toHappyHourPayload(data));
      await fetchHappyHours();
    },
    [fetchHappyHours, gateway],
  );

  const deleteHappyHour = useCallback(
    async (id: number) => {
      await gateway.deleteHappyHour(id);
      await fetchHappyHours();
    },
    [fetchHappyHours, gateway],
  );

  const toggleHappyHourStatus = useCallback(
    async (id: number) => {
      const happyHour = happyHours.find((item) => item.id === id);
      if (!happyHour) return;
      const status =
        happyHour.status === "Activo" ? "Inactivo" : "Activo";
      await gateway.updateHappyHour(id, { status });
      await fetchHappyHours();
    },
    [fetchHappyHours, gateway, happyHours],
  );

  return {
    happyHours,
    loading,
    addHappyHour,
    editHappyHour,
    deleteHappyHour,
    toggleHappyHourStatus,
  };
}
