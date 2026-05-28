import { useState, useEffect, useCallback } from "react";
import { AppliedPromotion } from "../utils/cartTotals";
import { apiClient } from "../config/apiClient";

// 0: Domingo, 1: Lunes, etc. en JS date.getDay()
// En la base de datos se guarda como enum WeekDay: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
const DAYS_MAP = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export function useAutomaticPromotions() {
  const [activeHappyHour, setActiveHappyHour] = useState<AppliedPromotion | null>(null);
  const [active2x1, setActive2x1] = useState<any | null>(null);
  const [happyHours, setHappyHours] = useState<any[]>([]);

  const fetchHappyHours = useCallback(async () => {
    try {
      const data = await apiClient("/promotions/happy-hours");
      setHappyHours(data);
    } catch (e) {
      console.error("Error fetching happy hours:", e);
    }
  }, []);

  // Cargar una vez al montar y luego cada 5 minutos
  useEffect(() => {
    fetchHappyHours();
    const fetchInterval = setInterval(fetchHappyHours, 5 * 60000);
    return () => clearInterval(fetchInterval);
  }, [fetchHappyHours]);

  useEffect(() => {
    const checkHappyHour = () => {
      const now = new Date();
      const currentDay = DAYS_MAP[now.getDay()];
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const activeRule = happyHours.find((rule: any) => {
        if (rule.status !== "Activo" && rule.status !== "ACTIVO") return false;
        if (!rule.daysOfWeek.includes(currentDay)) return false;

        let ruleStartMinutes = 0;
        let ruleEndMinutes = 0;

        if (rule.startTime && rule.endTime) {
          const [startH, startM] = rule.startTime.split(":").map(Number);
          const [endH, endM] = rule.endTime.split(":").map(Number);
          ruleStartMinutes = startH * 60 + startM;
          ruleEndMinutes = endH * 60 + endM;
        } else {
          ruleStartMinutes = rule.startMinutes;
          ruleEndMinutes = rule.endMinutes;
        }

        return currentMinutes >= ruleStartMinutes && currentMinutes <= ruleEndMinutes;
      });

      if (activeRule) {
        if (activeRule.promotionType === "2x1" || activeRule.promotionType === "DOSXUNO") {
          // Adaptamos la regla al formato esperado por la UI (para 2x1)
          setActive2x1({
            id: activeRule.id,
            name: activeRule.name,
            appliesTo: activeRule.appliesTo,
            promotionType: "2x1",
          });
          setActiveHappyHour(null);
        } else {
          setActive2x1(null);
          // Si es PORCENTAJE o MONTO_FIJO
          const typeMap: any = {
            porcentaje: "porcentaje",
            monto_fijo: "monto_fijo",
            PORCENTAJE: "porcentaje",
            MONTO_FIJO: "monto_fijo"
          };
          setActiveHappyHour({
            code: `AUTO-${activeRule.name.toUpperCase().replace(/\s+/g, "")}`,
            discountType: typeMap[activeRule.promotionType] || "porcentaje",
            discountValue: parseFloat(activeRule.promotionValue || "0"),
          });
        }
      } else {
        setActiveHappyHour(null);
        setActive2x1(null);
      }
    };

    checkHappyHour();
    const interval = setInterval(checkHappyHour, 60000); // Revisar cada minuto
    return () => clearInterval(interval);
  }, [happyHours]);

  return { activeHappyHour, active2x1 };
}
