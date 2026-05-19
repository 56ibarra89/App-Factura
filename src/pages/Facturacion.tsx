// src/pages/Facturacion.tsx
import Box from "@mui/material/Box";
import { useState } from "react";
import { useProductContext } from "../context/ProductContext";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import useCart from "../hooks/useCart";
import { useEffect } from "react";
import { PaymentMethod, OrderType } from "../types/order.types";
import { Snackbar, Alert } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { logService } from "../services/logService";
import { useOrderCommands, useOrderQueries } from "../context/OrderContext";

// Componentes de UI
import CategoryTabs from "../components/CategoryTabs";
import ProductGrid from "../components/ProductGrid";
import Cart from "../components/Cart";

// Diálogos
import FacturaPreviewDialog from "../components/FacturaPreviewDialog";
import SelectSizeDialog from "../components/SelectSizeDialog";
import ExtrasDialog from "../components/ExtrasDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import { Customer } from "../types/customer.types";

const Facturacion = () => {
  const { categories } = useProductContext();
  const { username, role } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isKitchenConfirmOpen, setIsKitchenConfirmOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { deliveryCustomer?: Customer | null; deliveryPhone?: string } | null;

  // Estado para la asignación anticipada de cliente (Delivery)
  const [deliveryCustomer, setDeliveryCustomer] = useState<Customer | null>(state?.deliveryCustomer || null);
  const [deliveryPhone, setDeliveryPhone] = useState<string>(state?.deliveryPhone || "");

  const {
    cart,
    subTotal,
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
  } = useCart();

  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("tableId");
  const isCheckoutMode = searchParams.get("checkout") === "true";
  const { getOrderByTable } = useOrderQueries();
  const activeOrder = tableId ? getOrderByTable(tableId) : null;

  // Cargar carrito si es una mesa con orden activa
  useEffect(() => {
    if (activeOrder && cart.length === 0) {
      handleSetCart(activeOrder.items);
    }
  }, [activeOrder, cart.length, handleSetCart]);

  const handleFinalConfirm = (
    paymentMethod: PaymentMethod,
    splitAmounts?: { efectivo: number; tarjeta: number },
    customerName?: string,
    orderType?: OrderType,
    customerAddress?: string,
  ) => {
    if (tableId) {
      if (isCheckoutMode && activeOrder) {
        // Finalizar y cobrar mesa
        handleFinalizeTableOrder(
          activeOrder.id,
          paymentMethod,
          splitAmounts,
          customerName,
          orderType,
          customerAddress,
        );
        if (window.ipcRenderer) {
          window.ipcRenderer.send("print-silent");
          setTimeout(() => {
            handleClearCart();
            setPreviewOpen(false);
            navigate("/mesas");
          }, 500);
        } else {
          window.print();
          handleClearCart();
          setPreviewOpen(false);
          navigate("/mesas");
        }
      } else {
        // Solo guardar cambios en la mesa
        handleSaveTableOrder(activeOrder?.id, tableId);
        handleClearCart();
        setPreviewOpen(false);
        navigate("/mesas");
      }
    } else {
      // Venta directa normal
      handleConfirmFactura(
        paymentMethod,
        splitAmounts,
        customerName,
        orderType,
        customerAddress,
      );
      if (window.ipcRenderer) {
        window.ipcRenderer.send("print-silent");
        setTimeout(() => {
          handleClearCart();
          setPreviewOpen(false);
          navigate("/home");
        }, 500);
      } else {
        window.print();
        handleClearCart();
        setDeliveryCustomer(null);
        setDeliveryPhone("");
        setPreviewOpen(false);
        navigate("/home");
      }
    }
  };

  const { markAsSentToKitchenByTable } = useOrderCommands();

  const handleKitchenDispatch = () => {
    if (!tableId) return;
    setIsKitchenConfirmOpen(true);
  };

  const handleConfirmKitchenDispatch = () => {
    if (!tableId) return;

    // Primero guardamos el estado actual para no perder nada
    handleSaveTableOrder(activeOrder?.id, tableId);

    // Luego marcamos la mesa como enviada a cocina
    markAsSentToKitchenByTable(tableId);

    const nowMs = Date.now();
    const updatedCart = cart.map((item) => ({
      ...item,
      isSentToKitchen: true,
      sentAt: item.isSentToKitchen ? item.sentAt : nowMs,
      kitchenStatus: item.isSentToKitchen ? item.kitchenStatus : "pending",
    }));
    handleSetCart(updatedCart);

    logService.log(
      username,
      role,
      "KITCHEN_DISPATCH",
      `Pedido enviado a cocina para Mesa ${tableId.split("-M")[1]}`,
    );

    setSnackbarOpen(true);
    setIsKitchenConfirmOpen(false);
  };

  const currentProducts = categories[selectedTab]?.items || [];

  return (
    <Box display="flex" height="100vh" overflow="hidden">
      <CategoryTabs
        categories={categories}
        selectedTab={selectedTab}
        onTabChange={(_, newValue) => setSelectedTab(newValue)}
      />

      <ProductGrid
        products={currentProducts}
        onProductClick={handleAddToCart}
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
        onSendToKitchen={handleKitchenDispatch}
        isTableOrder={!!tableId}
      />

      {selectedProduct && (
        <SelectSizeDialog
          open={!!selectedProduct}
          productName={selectedProduct.name}
          prices={selectedProduct.prices}
          onClose={() => setSelectedProduct(null)}
          onSelect={handleSelectSize}
        />
      )}

      {pendingItem && (
        <ExtrasDialog
          open={!!pendingItem}
          productName={pendingItem.product.name}
          size={pendingItem.size}
          extras={pendingItem.product.extras || []}
          onClose={handleCancelExtras}
          onConfirm={handleConfirmExtras}
        />
      )}

      <FacturaPreviewDialog
        open={previewOpen}
        cart={cart}
        subTotal={subTotal}
        taxAmount={taxAmount}
        total={total}
        onClose={() => setPreviewOpen(false)}
        onConfirm={handleFinalConfirm}
        title={
          tableId
            ? isCheckoutMode
              ? `Cerrar Cuenta Mesa ${tableId}`
              : `Pedido Mesa ${tableId}`
            : "Resumen de Factura"
        }
        confirmText={
          tableId
            ? isCheckoutMode
              ? "Finalizar y Cobrar"
              : activeOrder
                ? "Actualizar Mesa"
                : "Abrir Mesa"
            : "Confirmar pedido"
        }
        isTableMode={!!tableId && !isCheckoutMode}
        disableRestoreFocus
        disableEnforceFocus
        initialCustomer={deliveryCustomer}
        initialPhone={deliveryPhone}
        initialOrderType={deliveryCustomer || deliveryPhone ? "delivery" : undefined}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%", borderRadius: 3, fontWeight: "bold" }}
        >
          Pedido enviado a cocina correctamente
        </Alert>
      </Snackbar>

      <ConfirmDialog
        open={isKitchenConfirmOpen}
        title="Enviar a Cocina"
        message="¿Estás seguro de que quieres enviar este pedido a cocina? Asegúrate de que todos los productos sean correctos."
        onClose={() => setIsKitchenConfirmOpen(false)}
        onConfirm={handleConfirmKitchenDispatch}
        disableRestoreFocus
        disableEnforceFocus
      />
    </Box>
  );
};

export default Facturacion;
