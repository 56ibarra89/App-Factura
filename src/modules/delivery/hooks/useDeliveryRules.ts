import { useState, useEffect, useCallback } from "react";
import {
  deliveryRulesGateway,
  DEFAULT_DELIVERY_RULES,
  type DeliveryRulesGateway,
} from "../api/deliveryRulesGateway";
import type { DeliveryRulesConfig, DeliveryZone } from "../model/delivery.types";

export function useDeliveryRules(gateway: DeliveryRulesGateway = deliveryRulesGateway) {
  const [rules, setRules] = useState<DeliveryRulesConfig>(DEFAULT_DELIVERY_RULES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadRules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await gateway.load();
      setRules(data);
    } catch (error) {
      console.error("Error al cargar reglas de delivery:", error);
    } finally {
      setLoading(false);
    }
  }, [gateway]);

  useEffect(() => {
    void loadRules();

    const handleRulesUpdated = () => {
      void loadRules();
    };

    window.addEventListener("delivery-rules-updated", handleRulesUpdated);
    return () => {
      window.removeEventListener("delivery-rules-updated", handleRulesUpdated);
    };
  }, [loadRules]);

  const saveRules = useCallback(
    async (newRules: DeliveryRulesConfig) => {
      setSaving(true);
      try {
        await gateway.save(newRules);
        setRules(newRules);
        window.dispatchEvent(new CustomEvent("delivery-rules-updated"));
      } finally {
        setSaving(false);
      }
    },
    [gateway],
  );

  const activeZones = rules.zones.filter((z) => z.isActive);

  const calculateFee = useCallback(
    (subTotal: number, zoneId?: string) => {
      const zone = rules.zones.find((z) => z.id === zoneId) || null;
      const originalPrice = zone ? zone.price : 0;
      const driverPayout = zone ? zone.driverPayout : originalPrice;

      const isFreeDelivery = Boolean(
        rules.freeDeliveryEnabled &&
          rules.freeDeliveryMinAmount > 0 &&
          subTotal >= rules.freeDeliveryMinAmount,
      );

      return {
        isFreeDelivery,
        customerFee: isFreeDelivery ? 0 : originalPrice,
        driverPayout,
        zone,
        minAmount: rules.freeDeliveryMinAmount,
      };
    },
    [rules],
  );

  return {
    rules,
    activeZones,
    loading,
    saving,
    loadRules,
    saveRules,
    calculateFee,
  };
}
