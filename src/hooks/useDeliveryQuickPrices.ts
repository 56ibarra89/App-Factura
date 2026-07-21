import { useEffect, useState } from "react";
import { configRepository } from "../repositories/ConfigRepository";

const DEFAULT_QUICK_PRICES = ["30.00", "50.00", "", "", "", ""];

export function useDeliveryQuickPrices() {
  const [quickPrices, setQuickPrices] = useState<string[]>(DEFAULT_QUICK_PRICES);

  useEffect(() => {
    let mounted = true;

    configRepository.getDeliveryPricesConfig().then((prices) => {
      if (!mounted) return;

      if (prices && Array.isArray(prices)) {
        const normalizedPrices = [...prices];
        while (normalizedPrices.length < 6) normalizedPrices.push("");
        setQuickPrices(normalizedPrices.slice(0, 6));
        return;
      }

      setQuickPrices(DEFAULT_QUICK_PRICES);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return { quickPrices };
}
