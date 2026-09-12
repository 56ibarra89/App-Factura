import { useCallback } from "react";
import { useCartStore } from "./useCartStore";
import { useCheckout } from "./useCheckout";
import { useProductSelection } from "./useProductSelection";

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
    selectedComboProduct,
    pendingItem,
    startSelection,
    selectSize,
    confirmExtras,
    cancelExtras,
    confirmCombo,
    closeComboDialog,
  } = useProductSelection(handleConfirmProduct);

  const { confirmFactura, saveTableOrder, finalizeTableOrder, sendToKitchen } =
    useCheckout(cart, promotion);

  return {
    cart,
    promotion,
    subTotal,
    discountAmount,
    taxAmount,
    total,
    selectedProduct,
    setSelectedProduct,
    selectedComboProduct,
    pendingItem,

    handleChangeQuantity: changeQuantity,
    handleChangeGiftQuantity: changeGiftQuantity,
    handleAddToCartItem: addItem,
    handleAddToCart: startSelection,
    handleSelectSize: selectSize,
    handleConfirmExtras: confirmExtras,
    handleCancelExtras: cancelExtras,
    handleConfirmCombo: confirmCombo,
    handleCloseComboDialog: closeComboDialog,
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
