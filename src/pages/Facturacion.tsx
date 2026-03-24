// src/pages/Facturacion.tsx
import { Box } from "@mui/material";
import { useState } from "react";
import { useProductContext } from "../context/ProductContext";
import { useSalesContext } from "../context/SalesContext";
import { useNavigate } from "react-router-dom";
import useCart from "../hooks/useCart";

// Importa los nuevos componentes
import CategoryTabs from "../components/CategoryTabs";
import ProductGrid from "../components/ProductGrid";
import Cart from "../components/Cart";

// Importa los diálogos
import FacturaPreviewDialog from "../components/FacturaPreviewDialog";
import SelectSizeDialog from "../components/SelectSizeDialog";
import ExtrasDialog from "../components/ExtrasDialog";

const Facturacion = () => {
  const { categories } = useProductContext();
  const [selectedTab, setSelectedTab] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  const navigate = useNavigate();
  const { addSale } = useSalesContext();

  const {
    cart,
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
  } = useCart({ addSale, navigate });

  const currentProducts = categories[selectedTab]?.items || [];

  // --- RENDERIZADO ---
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
        total={total}
        onAddItem={handleAddToCartItem}
        onRemoveItem={handleRemoveItem}
        onChangeQuantity={handleChangeQuantity}
        onChangeGiftQuantity={handleChangeGiftQuantity}
        onPreviewClick={() => setPreviewOpen(true)}
      />

      {/* Diálogo de selección de tamaño */}
      {selectedProduct && (
        <SelectSizeDialog
          open={!!selectedProduct}
          productName={selectedProduct.name}
          prices={selectedProduct.prices}
          onClose={() => setSelectedProduct(null)}
          onSelect={handleSelectSize}
        />
      )}

      {/* Diálogo de extras (aparece después de seleccionar tamaño) */}
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
        total={total}
        onClose={() => setPreviewOpen(false)}
        onConfirm={handleConfirmFactura}
      />
    </Box>
  );
};

export default Facturacion;