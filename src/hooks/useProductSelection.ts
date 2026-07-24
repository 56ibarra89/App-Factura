import { useCallback, useState } from "react";
import { Product, ProductPrice, ProductSize } from "../types/product";
import { SelectedExtra } from "../types/extras";
import type { CartItemInput } from "../types/cart";

export interface PendingItem {
  product: Product;
  size: ProductSize;
  price: number;
}

export function useProductSelection(onConfirm: (item: CartItemInput) => void) {
  const [selectedProduct, setSelectedProduct] = useState<null | { name: string; prices: ProductPrice[]; product: Product; kitchenId?: string }>(null);
  const [pendingItem, setPendingItem] = useState<PendingItem & { kitchenId?: string } | null>(null);

  const startSelection = useCallback((item: Product, kitchenId?: string) => {
    if (item?.prices?.length) {
      const isUniquePrice = item.prices.length === 1 && item.prices[0].size === "único";
      if (isUniquePrice) {
        if (item.extras?.length) {
          setPendingItem({
            product: item,
            size: "único",
            price: item.prices[0].price,
            kitchenId,
          });
        } else {
          onConfirm({
            productId: item.id,
            name: item.name,
            price: item.prices[0].price,
            size: "único",
            extras: [],
            kitchenId,
          });
        }
      } else {
        setSelectedProduct({ name: item.name, prices: item.prices, product: item, kitchenId });
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
        kitchenId: selectedProduct?.kitchenId,
      });
    } else {
      onConfirm({
        ...selected,
        productId: product?.id,
        extras: [],
        kitchenId: selectedProduct?.kitchenId,
      });
    }
  }, [selectedProduct, onConfirm]);

  const confirmExtras = useCallback((selectedExtras: SelectedExtra[], note?: string) => {
    if (!pendingItem) return;

    onConfirm({
      productId: pendingItem.product.id,
      name: pendingItem.product.name,
      price: pendingItem.price,
      size: pendingItem.size,
      extras: selectedExtras,
      note,
      kitchenId: pendingItem.kitchenId,
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
