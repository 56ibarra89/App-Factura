// src/hooks/useCart.ts
import { useCallback } from "react";
import { useCartStore } from "./useCartStore";
import { useProductSelection } from "./useProductSelection";
import { useCheckout } from "./useCheckout";

interface UseCartOptions {
  navigate?: (path: string) => void;
}

export function useCart({ navigate }: UseCartOptions = {}) {
  const {
    cart,
    total,
    addItem,
    removeItem,
    changeQuantity,
    changeGiftQuantity,
    clearCart,
    setCart,
  } = useCartStore();

  const handleConfirmProduct = useCallback(
    (item: Parameters<typeof addItem>[0]) => {
      addItem(item);
    },
    [addItem]
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
 
  const { confirmFactura, saveTableOrder, finalizeTableOrder, sendToKitchen } = useCheckout(cart, clearCart, navigate);
 
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
    handleSaveTableOrder: saveTableOrder,
    handleFinalizeTableOrder: finalizeTableOrder,
    handleSetCart: setCart,
    handleSendToKitchen: sendToKitchen,
  };
}

export default useCart;
