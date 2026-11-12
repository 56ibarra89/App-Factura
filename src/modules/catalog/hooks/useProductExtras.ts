import { useCallback, useState } from "react";
import type { ExtraFormItem } from "../model/catalog.types";

const emptyExtra = (hasMultipleSizes: boolean, dynamicSizes: string[]): ExtraFormItem => ({
  name: "",
  prices: hasMultipleSizes 
    ? dynamicSizes.map((size) => ({ size, price: "" }))
    : [{ size: "único", price: "" }],
});

export function useProductExtras() {
  const [extras, setExtras] = useState<ExtraFormItem[]>([]);

  const addExtra = useCallback((hasMultipleSizes: boolean, dynamicSizes: string[]) => 
    setExtras((prev) => [...prev, emptyExtra(hasMultipleSizes, dynamicSizes)]), []);

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
