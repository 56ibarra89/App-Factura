import { useEffect, useState } from "react";
import {
  deliveryPricingGateway,
  type DeliveryPricingGateway,
} from "../services/config/deliveryPricingGateway";
import { DEFAULT_DELIVERY_PRICES } from "../types/config";

export function useDeliveryQuickPrices(
  gateway: DeliveryPricingGateway = deliveryPricingGateway,
) {
  const [quickPrices, setQuickPrices] = useState<string[]>([
    ...DEFAULT_DELIVERY_PRICES,
  ]);

  useEffect(() => {
    let mounted = true;

    void gateway.load().then((prices) => {
      if (!mounted) return;

      if (prices && Array.isArray(prices)) {
        const normalizedPrices = [...prices];
        while (normalizedPrices.length < 6) normalizedPrices.push("");
        setQuickPrices(normalizedPrices.slice(0, 6));
        return;
      }

      setQuickPrices([...DEFAULT_DELIVERY_PRICES]);
    });

    return () => {
      mounted = false;
    };
  }, [gateway]);

  return { quickPrices };
}
