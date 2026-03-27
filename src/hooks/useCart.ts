// src/hooks/useCart.ts
import { useCallback } from "react";
import { SaleItem } from "../types/sales";
import { useCartStore } from "./useCartStore";
import { useProductSelection } from "./useProductSelection";
import { useCheckout } from "./useCheckout";

interface UseCartOptions {
  addSale?: (item: SaleItem) => void;
  navigate?: (path: string) => void;
}

export function useCart({ addSale, navigate }: UseCartOptions = {}) {
  const {
    cart,
    total,
    addItem,
    removeItem,
    changeQuantity,
    changeGiftQuantity,
    clearCart,
  } = useCartStore();

  const handleConfirmProduct = useCallback(
    (item: Parameters<typeof addItem>[0]) => {
      addItem(item);
      if (addSale) {
        addSale(item);
      }
    },
    [addItem, addSale]
  );

  const {
    selectedProduct,
    setSelectedProduct,
    pendingItem,
    startSelection,
    selectSize,
    confirmExtras,
    cancelExtras,
  } = useProductSelection(handleConfirmProduct);

  const { confirmFactura } = useCheckout(cart, clearCart, addSale, navigate);

  return {
    // State
    cart,
    total,
    selectedProduct,
    setSelectedProduct,
    pendingItem,

    // Actions
    handleChangeQuantity: changeQuantity,
    handleChangeGiftQuantity: changeGiftQuantity,
    handleAddToCartItem: addItem,
    handleAddToCart: startSelection,
    handleSelectSize: selectSize,
    handleConfirmExtras: confirmExtras,
    handleCancelExtras: cancelExtras,
    handleRemoveItem: removeItem,
    handleConfirmFactura: confirmFactura,
  };
}

export default useCart;
