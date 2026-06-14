import { useCallback, useState } from "react";
import { Product, ProductPrice, ProductSize } from "../types/product";
import { SelectedExtra } from "../types/extras";

export interface PendingItem {
  product: Product;
  size: ProductSize;
  price: number;
}

export function useProductSelection(onConfirm: (item: { name: string; price: number; size: ProductSize; extras: SelectedExtra[]; note?: string }) => void) {
  const [selectedProduct, setSelectedProduct] = useState<null | { name: string; prices: ProductPrice[]; product: Product }>(null);
  const [pendingItem, setPendingItem] = useState<PendingItem | null>(null);

  const startSelection = useCallback((item: Product) => {
    if (item?.prices?.length) {
      const isUniquePrice = item.prices.length === 1 && item.prices[0].size === "único";
      if (isUniquePrice) {
        if (item.extras?.length) {
          setPendingItem({
            product: item,
            size: "único",
            price: item.prices[0].price,
          });
        } else {
          onConfirm({
            name: item.name,
            price: item.prices[0].price,
            size: "único",
            extras: [],
          });
        }
      } else {
        setSelectedProduct({ name: item.name, prices: item.prices, product: item });
      }
    }
  }, [onConfirm]);

  const selectSize = useCallback((selected: { name: string; price: number; size: ProductSize }) => {
    const product = selectedProduct?.product;
    setSelectedProduct(null);

    if (product?.extras?.length) {
      setPendingItem({
        product,
        size: selected.size,
        price: selected.price,
      });
    } else {
      onConfirm({ ...selected, extras: [] });
    }
  }, [selectedProduct, onConfirm]);

  const confirmExtras = useCallback((selectedExtras: SelectedExtra[], note?: string) => {
    if (!pendingItem) return;

    onConfirm({
      name: pendingItem.product.name,
      price: pendingItem.price,
      size: pendingItem.size,
      extras: selectedExtras,
      note,
    });
    setPendingItem(null);
  }, [pendingItem, onConfirm]);

  const cancelExtras = useCallback(() => {
    setPendingItem(null);
  }, []);

  return {
    selectedProduct,
    setSelectedProduct,
    pendingItem,
    startSelection,
    selectSize,
    confirmExtras,
    cancelExtras,
  };
}
