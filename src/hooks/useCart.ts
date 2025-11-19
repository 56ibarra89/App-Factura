// src/hooks/useCart.ts
import { useCallback, useMemo, useState } from "react";
import { CartItemType } from "../types/cart";
import { Product, ProductPrice, ProductSize } from "../types/product";

interface UseCartOptions {
  addSale?: (item: any) => void;
  navigate?: (path: string) => void;
}

export function useCart({ addSale, navigate }: UseCartOptions = {}) {
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<null | { name: string; prices: ProductPrice[] }>(null);

  const handleChangeQuantity = useCallback((index: number, quantity: number) => {
    setCart((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        quantity: Math.max(1, quantity),
      };
      return updated;
    });
  }, []);

  const handleAddToCartItem = useCallback((newItem: { name: string; price: number; size: ProductSize }) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.name === newItem.name && item.size === newItem.size
      );

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  }, []);

  const handleAddToCart = useCallback(
    (item: Product) => {
      if (item?.prices?.length) {
        const isUniquePrice = item.prices.length === 1 && item.prices[0].size === "único";
        if (isUniquePrice) {
          handleAddToCartItem({ name: item.name, price: item.prices[0].price, size: "único" });
        } else {
          const validPrices = item.prices.filter((p) => ["familiar", "mediana", "personal"].includes(p.size));
          setSelectedProduct({ name: item.name, prices: validPrices });
        }
      }
    },
    [handleAddToCartItem]
  );

  const handleSelectSize = useCallback(
    (selected: { name: string; price: number; size: ProductSize }) => {
      handleAddToCartItem(selected);
      if (addSale) addSale(selected);
      setSelectedProduct(null);
    },
    [addSale, handleAddToCartItem]
  );

  const handleRemoveItem = useCallback((index: number) => {
    setCart((prev) => {
      const updated = [...prev];
      if (updated[index].quantity > 1) {
        updated[index].quantity -= 1;
        return updated;
      }
      return updated.filter((_, i) => i !== index);
    });
  }, []);

  const handleConfirmFactura = useCallback(() => {
    cart.forEach((item) => addSale && addSale(item));
    setCart([]);
    if (navigate) navigate("/home");
  }, [cart, addSale, navigate]);

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  return {
    cart,
    total,
    selectedProduct,
    setSelectedProduct,
    handleChangeQuantity,
    handleAddToCartItem,
    handleAddToCart,
    handleSelectSize,
    handleRemoveItem,
    handleConfirmFactura,
  };
}

export default useCart;
