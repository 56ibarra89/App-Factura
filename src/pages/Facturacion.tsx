import Box from "@mui/material/Box";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  useLocation,
  useSearchParams,
} from "react-router-dom";
import BillingDialogs from "../components/facturacion/BillingDialogs";
import Cart from "../components/Cart";
import CategoryTabs from "../components/CategoryTabs";
import ProductGrid from "../components/ProductGrid";
import { useAuth } from "../context/AuthContext";
import {
  useOrderCommands,
  useOrderQueries,
} from "../context/OrderContext";
import { useBillingFlow } from "../hooks/facturacion/useBillingFlow";
import { useCertificateRedemption } from "../hooks/facturacion/useCertificateRedemption";
import { useExclusiveAction } from "../hooks/facturacion/useExclusiveAction";
import { useKitchenDispatch } from "../hooks/facturacion/useKitchenDispatch";
import useCart from "../hooks/useCart";
import { useProductContext } from "../hooks/useProductContext";
import type { Customer } from "../types/customer.types";

interface BillingLocationState {
  deliveryCustomer?: Customer | null;
  deliveryPhone?: string;
  deliveryCost?: number;
  deliveryDriverId?: string;
  deliveryCustomerTendered?: number;
}

const Facturacion = () => {
  const { categories } = useProductContext();
  const { username, role } = useAuth();
  const location = useLocation();
  const state = location.state as BillingLocationState | null;

  const [selectedTab, setSelectedTab] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [certificateOpen, setCertificateOpen] = useState(false);
  const [deliveryCustomer, setDeliveryCustomer] =
    useState<Customer | null>(state?.deliveryCustomer || null);
  const [deliveryPhone, setDeliveryPhone] = useState(
    state?.deliveryPhone || "",
  );

  const {
    cart,
    promotion,
    subTotal,
    discountAmount,
    taxAmount,
    total,
    selectedProduct,
    setSelectedProduct,
    pendingItem,
    handleChangeQuantity,
    handleAddToCartItem,
    handleAddToCart,
    handleSelectSize,
    handleConfirmExtras,
    handleCancelExtras,
    handleRemoveItem,
    handleConfirmFactura,
    handleChangeGiftQuantity,
    handleSaveTableOrder,
    handleFinalizeTableOrder,
    handleSetCart,
    handleClearCart,
    handleApplyPromotion,
    handleRemovePromotion,
  } = useCart();

  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("tableId");
  const isCheckoutMode =
    searchParams.get("checkout") === "true";
  const { getOrderByTable } = useOrderQueries();
  const { markAsSentToKitchenByTable } = useOrderCommands();
  const activeOrder = tableId
    ? getOrderByTable(tableId)
    : null;

  useEffect(() => {
    if (activeOrder && cart.length === 0) {
      handleSetCart(activeOrder.items);
    }
  }, [activeOrder, cart.length, handleSetCart]);

  const closePreview = useCallback(() => {
    setPreviewOpen(false);
  }, []);

  const resetDelivery = useCallback(() => {
    setDeliveryCustomer(null);
    setDeliveryPhone("");
  }, []);

  const { runExclusive } = useExclusiveAction();
  const billing = useBillingFlow({
    tableId,
    isCheckoutMode,
    activeOrder,
    deliveryDriverId: state?.deliveryDriverId,
    confirmInvoice: handleConfirmFactura,
    saveTableOrder: handleSaveTableOrder,
    finalizeTableOrder: handleFinalizeTableOrder,
    clearCart: handleClearCart,
    resetDelivery,
    closePreview,
    runExclusive,
  });
  const kitchen = useKitchenDispatch({
    tableId,
    activeOrderId: activeOrder?.id,
    cart,
    username,
    role,
    saveTableOrder: handleSaveTableOrder,
    markAsSentToKitchenByTable,
    setCart: handleSetCart,
    runExclusive,
  });
  const applyCertificate = useCertificateRedemption({
    categories,
    cart,
    addItem: handleAddToCartItem,
  });

  const currentProducts =
    categories[selectedTab]?.items || [];

  return (
    <Box display="flex" height="100vh" overflow="hidden">
      <CategoryTabs
        categories={categories}
        selectedTab={selectedTab}
        onTabChange={(_, newValue) =>
          setSelectedTab(newValue)
        }
      />

      <ProductGrid
        products={currentProducts}
        onProductClick={(product) =>
          handleAddToCart(
            product,
            categories[selectedTab]?.kitchenId,
          )
        }
      />

      <Cart
        cartItems={cart}
        subTotal={subTotal}
        taxAmount={taxAmount}
        total={total}
        onAddItem={handleAddToCartItem}
        onRemoveItem={handleRemoveItem}
        onChangeQuantity={handleChangeQuantity}
        onChangeGiftQuantity={handleChangeGiftQuantity}
        onPreviewClick={() => setPreviewOpen(true)}
        onOpenCertificado={() => setCertificateOpen(true)}
        onSendToKitchen={kitchen.requestDispatch}
        isTableOrder={!!tableId}
      />

      <BillingDialogs
        products={{
          selectedProduct,
          pendingItem,
          closeSizeDialog: () => setSelectedProduct(null),
          selectSize: handleSelectSize,
          cancelExtras: handleCancelExtras,
          confirmExtras: handleConfirmExtras,
        }}
        invoice={{
          open: previewOpen,
          cart,
          promotion,
          subTotal,
          discountAmount,
          taxAmount,
          total,
          tableId,
          isCheckoutMode,
          hasActiveOrder: !!activeOrder,
          initialCustomer: deliveryCustomer,
          initialPhone: deliveryPhone,
          initialDriverId: state?.deliveryDriverId,
          initialDeliveryCost: state?.deliveryCost,
          initialCustomerTendered:
            state?.deliveryCustomerTendered,
          invoiceNumber: billing.createdInvoiceNumber,
          cashierName: activeOrder?.cashierName,
          close: closePreview,
          confirm: billing.handleFinalConfirm,
          applyPromotion: handleApplyPromotion,
          removePromotion: handleRemovePromotion,
        }}
        kitchen={{
          confirmOpen: kitchen.isConfirmOpen,
          successOpen: kitchen.isSuccessOpen,
          cancel: kitchen.cancelDispatch,
          confirm: kitchen.confirmDispatch,
          closeSuccess: kitchen.closeSuccess,
        }}
        certificate={{
          open: certificateOpen,
          close: () => setCertificateOpen(false),
          apply: applyCertificate,
        }}
      />
    </Box>
  );
};

export default Facturacion;
