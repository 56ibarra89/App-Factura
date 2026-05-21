// src/hooks/useCart.ts
import { useCallback } from "react";
import { useCartStore } from "./useCartStore";
import { useProductSelection } from "./useProductSelection";
import { useCheckout } from "./useCheckout";

function useCart() {
  const {
    cart,
    promotion,
    subTotal,
    discountAmount,
    taxAmount,
    total,
    addItem,
    removeItem,
    changeQuantity,
    changeGiftQuantity,
    clearCart,
    setCart,
    applyPromotion,
    removePromotion,
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
 
  const { confirmFactura, saveTableOrder, finalizeTableOrder, sendToKitchen } = useCheckout(cart, promotion, discountAmount);
 
  return {
    // State
    cart,
    promotion,
    subTotal,
    discountAmount,
    taxAmount,
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
    handleClearCart: clearCart,
    handleConfirmFactura: confirmFactura,
    handleSaveTableOrder: saveTableOrder,
    handleFinalizeTableOrder: finalizeTableOrder,
    handleSetCart: setCart,
    handleSendToKitchen: sendToKitchen,
    handleApplyPromotion: applyPromotion,
    handleRemovePromotion: removePromotion,
  };
}

export default useCart;
