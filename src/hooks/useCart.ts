// src/hooks/useCart.ts
import { useCallback, useMemo, useState } from "react";
import { CartItemType } from "../types/cart";
import { Product, ProductPrice, ProductSize } from "../types/product";
import { SelectedExtra } from "../types/extras";
import { SaleItem } from "../types/sales";

interface UseCartOptions {
  addSale?: (item: SaleItem) => void;
  navigate?: (path: string) => void;
}

/** Item pendiente: producto + tamaño seleccionado, esperando selección de extras */
export interface PendingItem {
  product: Product;
  size: ProductSize;
  price: number;
}

export function useCart({ addSale, navigate }: UseCartOptions = {}) {
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<null | { name: string; prices: ProductPrice[]; product: Product }>(null);
  const [pendingItem, setPendingItem] = useState<PendingItem | null>(null);

  const handleChangeQuantity = useCallback((index: number, quantity: number) => {
    setCart((prev) => {
      const updated = [...prev];
      const newQuantity = Math.max(1, quantity);
      const currentGiftQuantity = updated[index].giftQuantity || 0;
      updated[index] = {
        ...updated[index],
        quantity: newQuantity,
        giftQuantity: Math.min(newQuantity, currentGiftQuantity),
      };
      return updated;
    });
  }, []);

  const handleChangeGiftQuantity = useCallback((index: number, giftQuantity: number) => {
    setCart((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        giftQuantity: Math.max(0, Math.min(updated[index].quantity, giftQuantity)),
      };
      return updated;
    });
  }, []);

  /** Compara extras para determinar si dos items del carrito son iguales */
  const extrasKey = (extras: SelectedExtra[]) =>
    extras.map((e) => e.name).sort().join("|");

  const handleAddToCartItem = useCallback(
    (newItem: { name: string; price: number; size: ProductSize; extras: SelectedExtra[]; note?: string }) => {
      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (item) =>
            item.name === newItem.name &&
            item.size === newItem.size &&
            extrasKey(item.extras) === extrasKey(newItem.extras) &&
            item.note === newItem.note
        );

        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + 1,
          };
          return updated;
        }

        const extrasTotal = newItem.extras.reduce((sum, e) => sum + e.price, 0);
        return [
          ...prev,
          {
            ...newItem,
            price: newItem.price + extrasTotal,
            quantity: 1,
          },
        ];
      });
    },
    []
  );

  const handleAddToCart = useCallback(
    (item: Product) => {
      if (item?.prices?.length) {
        const isUniquePrice = item.prices.length === 1 && item.prices[0].size === "único";
        if (isUniquePrice) {
          handleAddToCartItem({
            name: item.name,
            price: item.prices[0].price,
            size: "único",
            extras: [],
          });
        } else {
          const validPrices = item.prices.filter((p) =>
            ["familiar", "mediana", "personal"].includes(p.size)
          );
          setSelectedProduct({ name: item.name, prices: validPrices, product: item });
        }
      }
    },
    [handleAddToCartItem]
  );

  /** Después de seleccionar tamaño: si el producto tiene extras, abre ExtrasDialog */
  const handleSelectSize = useCallback(
    (selected: { name: string; price: number; size: ProductSize }) => {
      const product = selectedProduct?.product;
      setSelectedProduct(null);

      if (product?.extras?.length) {
        // Tiene extras configurados → mostrar diálogo de extras
        setPendingItem({
          product,
          size: selected.size,
          price: selected.price,
        });
      } else {
        // No tiene extras → agregar directo al carrito
        handleAddToCartItem({ ...selected, extras: [] });
        if (addSale) addSale({ ...selected, extras: [] });
      }
    },
    [selectedProduct, addSale, handleAddToCartItem]
  );

  /** Confirmar extras seleccionados y agregar al carrito */
  const handleConfirmExtras = useCallback(
    (selectedExtras: SelectedExtra[], note?: string) => {
      if (!pendingItem) return;

      const cartItem = {
        name: pendingItem.product.name,
        price: pendingItem.price,
        size: pendingItem.size,
        extras: selectedExtras,
        note,
      };

      handleAddToCartItem(cartItem);
      if (addSale) {
        const extrasTotal = selectedExtras.reduce((s, e) => s + e.price, 0);
        addSale({
          ...cartItem,
          price: cartItem.price + extrasTotal,
        });
      }
      setPendingItem(null);
    },
    [pendingItem, addSale, handleAddToCartItem]
  );

  const handleCancelExtras = useCallback(() => {
    setPendingItem(null);
  }, []);

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

  const total = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const giftQty = item.giftQuantity || 0;
        const paidQty = Math.max(0, item.quantity - giftQty);
        return sum + item.price * paidQty;
      }, 0),
    [cart]
  );

  return {
    cart,
    total,
    selectedProduct,
    setSelectedProduct,
    pendingItem,
    handleChangeQuantity,
    handleChangeGiftQuantity,
    handleAddToCartItem,
    handleAddToCart,
    handleSelectSize,
    handleConfirmExtras,
    handleCancelExtras,
    handleRemoveItem,
    handleConfirmFactura,
  };
}

export default useCart;
