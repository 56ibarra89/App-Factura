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
import BillingDialogs from "../ui/BillingDialogs";
import Cart from "../ui/Cart";
import {
  CategoryTabs,
  ProductGrid,
  useCatalog,
} from "../../catalog";
import { useAuth } from "../../auth";
import {
  useOrderCommands,
  useOrderQueries,
} from "../../orders";
import { useBillingFlow } from "../hooks/useBillingFlow";
import { useCertificateRedemption } from "../../promotions";
import { useExclusiveAction } from "../hooks/useExclusiveAction";
import { useKitchenDispatch } from "../hooks/useKitchenDispatch";
import useCart from "../hooks/useCart";
import type { Customer } from "../../customers";

interface BillingLocationState {
  deliveryCustomer?: Customer | null;
  deliveryPhone?: string;
  deliveryAddress?: string;
  deliveryCost?: number;
  deliveryDriverId?: string;
  deliveryCustomerTendered?: number;
}

const CheckoutPage = () => {
  const { categories } = useCatalog();
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
  const [deliveryAddress, setDeliveryAddress] = useState(
    state?.deliveryAddress || "",
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
    setDeliveryAddress("");
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
          initialAddress:
            deliveryAddress ||
            (deliveryCustomer?.addresses?.[0]?.address ?? ""),
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

export default CheckoutPage;
