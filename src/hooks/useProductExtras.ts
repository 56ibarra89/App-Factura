import { useCallback, useState } from "react";
import { ExtraFormItem } from "../types/product";
import { EMPTY_EXTRA_PRICES } from "../config/constants";

const emptyExtra = (): ExtraFormItem => ({
  name: "",
  prices: EMPTY_EXTRA_PRICES.map((p) => ({ ...p })),
});

export function useProductExtras() {
  const [extras, setExtras] = useState<ExtraFormItem[]>([]);

  const addExtra = useCallback(() => setExtras((prev) => [...prev, emptyExtra()]), []);

  const removeExtra = useCallback((index: number) =>
    setExtras((prev) => prev.filter((_, i) => i !== index)), []);

  const changeExtraName = useCallback((index: number, name: string) => {
    setExtras((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], name };
      return updated;
    });
  }, []);

  const changeExtraPrice = useCallback((extraIndex: number, sizeIndex: number, price: string) => {
    setExtras((prev) => {
      const updated = [...prev];
      const prices = [...updated[extraIndex].prices];
      prices[sizeIndex] = { ...prices[sizeIndex], price };
      updated[extraIndex] = { ...updated[extraIndex], prices };
      return updated;
    });
  }, []);

  return {
    extras,
    setExtras,
    addExtra,
    removeExtra,
    changeExtraName,
    changeExtraPrice,
  };
}
