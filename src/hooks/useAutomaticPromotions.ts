import { useState, useEffect } from "react";
import { MOCK_HAPPY_HOURS, HappyHourRule } from "../data/promocionesMockData";
import { AppliedPromotion } from "../utils/cartTotals";

const DAYS_MAP = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sab"];

export function useAutomaticPromotions() {
  const [activeHappyHour, setActiveHappyHour] = useState<AppliedPromotion | null>(null);
  const [active2x1, setActive2x1] = useState<HappyHourRule | null>(null);

  useEffect(() => {
    // Revisa cada minuto si hay un happy hour activo
    const checkHappyHour = () => {
      const now = new Date();
      const currentDay = DAYS_MAP[now.getDay()];
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      let currentHH = MOCK_HAPPY_HOURS;
      try {
        const saved = localStorage.getItem("app_happy_hours");
        if (saved) currentHH = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }

      const activeRule = currentHH.find((rule: HappyHourRule) => {
        if (rule.status !== "Activo") return false;
        if (!rule.daysOfWeek.includes(currentDay)) return false;

        const [startH, startM] = rule.startTime.split(":").map(Number);
        const [endH, endM] = rule.endTime.split(":").map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
      });

      if (activeRule) {
        if (activeRule.promotionType === "2x1") {
          setActive2x1(activeRule);
          setActiveHappyHour(null);
        } else {
          setActive2x1(null);
          setActiveHappyHour({
            code: `AUTO-${activeRule.name.toUpperCase().replace(/\s+/g, "")}`,
            discountType: activeRule.promotionType,
            discountValue: parseFloat(activeRule.promotionValue || "0"),
          });
        }
      } else {
        setActiveHappyHour(null);
        setActive2x1(null);
      }
    };

    checkHappyHour();
    const interval = setInterval(checkHappyHour, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return { activeHappyHour, active2x1 };
}
