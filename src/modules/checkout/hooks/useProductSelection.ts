import { useCallback, useState } from "react";
import type {
  Product,
  ProductPrice,
  ProductSize,
  SelectedExtra,
} from "../../catalog";
import type { OrderItemInput } from "../../orders";

export interface PendingItem {
  product: Product;
  size: ProductSize;
  price: number;
}

export function useProductSelection(onConfirm: (item: OrderItemInput) => void) {
  const [selectedProduct, setSelectedProduct] = useState<null | {
    name: string;
    prices: ProductPrice[];
    product: Product;
    kitchenId?: string;
  }>(null);

  const [selectedComboProduct, setSelectedComboProduct] = useState<null | {
    product: Product;
    kitchenId?: string;
  }>(null);

  const [pendingItem, setPendingItem] = useState<
    (PendingItem & { kitchenId?: string }) | null
  >(null);

  const startSelection = useCallback(
    (item: Product, kitchenId?: string) => {
      // 1. Si es un combo, abrir el diálogo interactivo de selección guiada
      if (item.isCombo) {
        setSelectedComboProduct({ product: item, kitchenId });
        return;
      }

      // 2. Producto estándar con precios
      if (item?.prices?.length) {
        const isUniquePrice =
          item.prices.length === 1 && item.prices[0].size === "único";
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
              categoryId: item.categoryId,
              name: item.name,
              price: item.prices[0].price,
              size: "único",
              extras: [],
              kitchenId,
            });
          }
        } else {
          setSelectedProduct({
            name: item.name,
            prices: item.prices,
            product: item,
            kitchenId,
          });
        }
      }
    },
    [onConfirm]
  );

  const selectSize = useCallback(
    (selected: { name: string; price: number; size: ProductSize }) => {
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
          categoryId: product?.categoryId,
          extras: [],
          kitchenId: selectedProduct?.kitchenId,
        });
      }
    },
    [selectedProduct, onConfirm]
  );

  const confirmExtras = useCallback(
    (selectedExtras: SelectedExtra[], note?: string) => {
      if (!pendingItem) return;

      onConfirm({
        productId: pendingItem.product.id,
        categoryId: pendingItem.product.categoryId,
        name: pendingItem.product.name,
        price: pendingItem.price,
        size: pendingItem.size,
        extras: selectedExtras,
        note,
        kitchenId: pendingItem.kitchenId,
      });
      setPendingItem(null);
    },
    [pendingItem, onConfirm]
  );

  const cancelExtras = useCallback(() => {
    setPendingItem(null);
  }, []);

  const confirmCombo = useCallback(
    (comboItem: OrderItemInput) => {
      onConfirm(comboItem);
      setSelectedComboProduct(null);
    },
    [onConfirm]
  );

  const closeComboDialog = useCallback(() => {
    setSelectedComboProduct(null);
  }, []);

  return {
    selectedProduct,
    setSelectedProduct,
    selectedComboProduct,
    setSelectedComboProduct,
    pendingItem,
    startSelection,
    selectSize,
    confirmExtras,
    cancelExtras,
    confirmCombo,
    closeComboDialog,
  };
}
