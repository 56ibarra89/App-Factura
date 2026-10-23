import { useState, useEffect, useCallback, useMemo } from "react";
import type { AppliedPromotion } from "../model/promotion.types";
import {
  promotionsGateway,
  type CouponRecord,
  type DiscountRecord,
  type HappyHourRecord,
  type PromotionsGateway,
} from "../api/promotionsGateway";

const DAYS_MAP = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

interface ActiveTwoForOnePromotion {
  id: number;
  name: string;
  appliesTo?: string;
  promotionType: "2x1";
  productIds?: string[];
  categoryIds?: string[];
}

export interface OrderPromotionSnapshot {
  id?: string;
  couponId?: number;
  discountId?: number;
  happyHourId?: number;
  promotionSource?: string;
  promotionCode?: string;
  discountAmount?: number;
  items?: Array<{
    giftReason?: string;
    giftQuantity?: number;
  }>;
}

export function useAutomaticPromotions(
  gateway: PromotionsGateway = promotionsGateway,
) {
  const [activeHappyHour, setActiveHappyHour] = useState<AppliedPromotion | null>(null);
  const [active2x1, setActive2x1] =
    useState<ActiveTwoForOnePromotion | null>(null);
  const [happyHours, setHappyHours] = useState<HappyHourRecord[]>([]);

  const fetchHappyHours = useCallback(async () => {
    try {
      const data = await gateway.listHappyHours();
      setHappyHours(data);
    } catch (e) {
      console.error("Error fetching happy hours:", e);
    }
  }, [gateway]);

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

      const activeRule = happyHours.find((rule) => {
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
          ruleStartMinutes = rule.startMinutes ?? 0;
          ruleEndMinutes = rule.endMinutes ?? 0;
        }

        return currentMinutes >= ruleStartMinutes && currentMinutes <= ruleEndMinutes;
      });

      if (activeRule) {
        if (activeRule.promotionType === "2x1" || activeRule.promotionType === "DOSXUNO") {

          setActive2x1({
            id: activeRule.id,
            name: activeRule.name,
            appliesTo: activeRule.appliesTo,
            promotionType: "2x1",
            productIds: activeRule.productIds,
            categoryIds: activeRule.categoryIds,
          });
          setActiveHappyHour(null);
        } else {
          setActive2x1(null);

          const typeMap: Record<string, AppliedPromotion["discountType"]> = {
            porcentaje: "porcentaje",
            monto_fijo: "monto_fijo",
            PORCENTAJE: "porcentaje",
            MONTO_FIJO: "monto_fijo"
          };
          setActiveHappyHour({
            source: "happy-hour",
            id: activeRule.id,
            code: `AUTO-${activeRule.name.toUpperCase().replace(/\s+/g, "")}`,
            discountType: typeMap[activeRule.promotionType] || "porcentaje",
            discountValue: parseFloat(
              String(activeRule.promotionValue ?? "0"),
            ),
            productIds: activeRule.productIds,
            categoryIds: activeRule.categoryIds,
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

  return { activeHappyHour, active2x1, happyHours };
}

export function useOrderPromotionRehydration(
  order?: OrderPromotionSnapshot | null,
  preloadedHappyHours?: HappyHourRecord[],
  gateway: PromotionsGateway = promotionsGateway,
): AppliedPromotion | null {
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [discounts, setDiscounts] = useState<DiscountRecord[]>([]);
  const [fetchedHappyHours, setFetchedHappyHours] = useState<HappyHourRecord[]>(
    [],
  );

  const hasCoupon = Boolean(
    order && (order.couponId || order.promotionSource === "coupon"),
  );
  const hasDiscount = Boolean(
    order && (order.discountId || order.promotionSource === "discount"),
  );
  const hasTwoForOneItems = Boolean(
    order?.items?.some((item) => item.giftReason === "happy-hour-2x1"),
  );
  const hasHappyHour = Boolean(
    order &&
      (order.happyHourId ||
        order.promotionSource === "happy-hour" ||
        hasTwoForOneItems),
  );

  useEffect(() => {
    if (!hasCoupon) return;
    let active = true;
    gateway
      .listCoupons()
      .then((data) => {
        if (active) setCoupons(data);
      })
      .catch((e) => console.error("Error rehydrating coupon:", e));
    return () => {
      active = false;
    };
  }, [gateway, hasCoupon, order?.couponId, order?.promotionCode]);

  useEffect(() => {
    if (!hasDiscount) return;
    let active = true;
    gateway
      .listDiscounts()
      .then((data) => {
        if (active) setDiscounts(data);
      })
      .catch((e) => console.error("Error rehydrating discount:", e));
    return () => {
      active = false;
    };
  }, [gateway, hasDiscount, order?.discountId]);

  useEffect(() => {
    if (!hasHappyHour || preloadedHappyHours !== undefined) return;
    let active = true;
    gateway
      .listHappyHours()
      .then((data) => {
        if (active) setFetchedHappyHours(data);
      })
      .catch((e) => console.error("Error rehydrating happy hour:", e));
    return () => {
      active = false;
    };
  }, [gateway, hasHappyHour, order?.happyHourId, preloadedHappyHours]);

  const happyHours = preloadedHappyHours ?? fetchedHappyHours;

  return useMemo<AppliedPromotion | null>(() => {
    if (!order) return null;

    if (hasCoupon) {
      const matched = coupons.find(
        (c) =>
          (order.couponId && c.id === order.couponId) ||
          (order.promotionCode &&
            c.code.toUpperCase() === order.promotionCode.toUpperCase()),
      );
      if (matched) {
        return {
          source: "coupon",
          id: matched.id,
          code: matched.code,
          discountType:
            matched.discountType === "porcentaje" ||
            matched.discountType === "PORCENTAJE"
              ? "porcentaje"
              : "monto_fijo",
          discountValue: parseFloat(String(matched.discountValue)) || 0,
        };
      }
      return {
        source: "coupon",
        id: order.couponId ?? 0,
        code:
          order.promotionCode ||
          (order.couponId ? `Cupón #${order.couponId}` : "Cupón aplicado"),
        discountType: "monto_fijo",
        discountValue: order.discountAmount ?? 0,
      };
    }

    if (hasDiscount) {
      const matched = discounts.find(
        (d) => order.discountId && d.id === order.discountId,
      );
      if (matched) {
        const isPercent =
          matched.type === "Porcentaje" ||
          matched.type === "PORCENTAJE" ||
          matched.type === "porcentaje" ||
          String(matched.value).includes("%");
        const cleanValue = String(matched.value).replace(/[^0-9.]/g, "");
        return {
          source: "discount",
          id: matched.id,
          code: matched.name,
          discountType: isPercent ? "porcentaje" : "monto_fijo",
          discountValue: parseFloat(cleanValue) || 0,
          productIds: matched.productIds,
          categoryIds: matched.categoryIds,
        };
      }
      return {
        source: "discount",
        id: order.discountId ?? 0,
        code:
          order.promotionCode ||
          (order.discountId
            ? `Descuento #${order.discountId}`
            : "Descuento aplicado"),
        discountType: "monto_fijo",
        discountValue: order.discountAmount ?? 0,
      };
    }

    if (hasHappyHour) {
      const matched = happyHours.find(
        (r) => order.happyHourId && r.id === order.happyHourId,
      );
      if (matched) {
        if (
          matched.promotionType === "2x1" ||
          matched.promotionType === "DOSXUNO" ||
          hasTwoForOneItems
        ) {
          return {
            source: "happy-hour",
            id: matched.id,
            code: `AUTO-${matched.name.toUpperCase().replace(/\s+/g, "")}`,
            discountType: "2x1",
            discountValue: 0,
            productIds: matched.productIds,
            categoryIds: matched.categoryIds,
          };
        }
        const isFixed =
          matched.promotionType === "monto_fijo" ||
          matched.promotionType === "MONTO_FIJO";
        return {
          source: "happy-hour",
          id: matched.id,
          code: `AUTO-${matched.name.toUpperCase().replace(/\s+/g, "")}`,
          discountType: isFixed ? "monto_fijo" : "porcentaje",
          discountValue: parseFloat(String(matched.promotionValue ?? "0")) || 0,
          productIds: matched.productIds,
          categoryIds: matched.categoryIds,
        };
      }
      if (hasTwoForOneItems) {
        return {
          source: "happy-hour",
          id: order.happyHourId ?? 0,
          code: order.promotionCode || "AUTO-HAPPYHOUR2X1",
          discountType: "2x1",
          discountValue: 0,
        };
      }
      return {
        source: "happy-hour",
        id: order.happyHourId ?? 0,
        code: order.promotionCode || "AUTO-HAPPYHOUR",
        discountType: "monto_fijo",
        discountValue: order.discountAmount ?? 0,
      };
    }

    return null;
  }, [
    coupons,
    discounts,
    happyHours,
    hasCoupon,
    hasDiscount,
    hasHappyHour,
    hasTwoForOneItems,
    order,
  ]);
}

