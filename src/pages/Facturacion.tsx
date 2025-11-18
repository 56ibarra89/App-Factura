// src/pages/Facturacion.tsx
import { Box } from "@mui/material";
import { useState, useMemo, useCallback } from "react";
import { useProductContext } from "../context/ProductContext";
import { Product, ProductPrice, ProductSize } from "../context/ProductContext";
import { useSalesContext } from "../context/SalesContext";
import { useNavigate } from "react-router-dom";

// Importa los nuevos componentes
import CategoryTabs from "../components/CategoryTabs";
import ProductGrid from "../components/ProductGrid";
import Cart, { CartItemType } from "../components/Cart"; // Importa el tipo

// Importa los diálogos
import FacturaPreviewDialog from "../context/FacturaPreviewDialog";
import ExtrasDialog from "../components/ExtrasDialog";
import SelectSizeDialog from "../components/SelectSizeDialog";

// Constantes fuera del componente para que no se re-creen
const extras = ["Queso extra", "Pepperoni", "Jamón", "Bacon"];

export const Facturacion = () => {
  const { categories } = useProductContext();
  const [selectedTab, setSelectedTab] = useState(0);
  const [openExtras, setOpenExtras] = useState(false); // Sigues teniendo este estado, aunque no se usa
  const [previewOpen, setPreviewOpen] = useState(false);

  const [cart, setCart] = useState<CartItemType[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<null | {
    name: string;
    prices: ProductPrice[];
  }>(null);

  const navigate = useNavigate();
  const { addSale } = useSalesContext();

  // --- LÓGICA DEL CARRITO ---
  // Envuelve las funciones en useCallback para optimizar
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

  const handleAddToCartItem = useCallback(
    (newItem: { name: string; price: number; size: ProductSize }) => {
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
    },
    []
  );

  const handleAddToCart = useCallback((item: Product) => {
    if (item?.prices?.length) {
      const isUniquePrice =
        item.prices.length === 1 && item.prices[0].size === "único";
      if (isUniquePrice) {
        handleAddToCartItem({
          name: item.name,
          price: item.prices[0].price,
          size: "único",
        });
      } else {
        const validPrices = item.prices.filter((p) =>
          ["familiar", "mediana", "personal"].includes(p.size)
        );
        setSelectedProduct({ name: item.name, prices: validPrices });
      }
    }
  }, [handleAddToCartItem]);

  const handleSelectSize = useCallback(
    (selected: { name: string; price: number; size: ProductSize }) => {
      handleAddToCartItem(selected);
      // Nota: addSale(selected) aquí parece añadir la venta ANTES de confirmar
      // Quizás quieras mover todo el 'addSale' a la confirmación de la factura
      // Lo dejo como estaba en tu código original.
      addSale(selected); 
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
    cart.forEach((item) => addSale(item));
    setCart([]);
    setPreviewOpen(false);
    navigate("/home");
  }, [cart, addSale, navigate]);

  // --- VALORES CALCULADOS ---
  // Usa useMemo para que el total solo se recalcule si el carrito cambia
  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const currentProducts = categories[selectedTab]?.items || [];

  // --- RENDERIZADO ---
  // El JSX ahora es mucho más limpio y semántico
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
        onPreviewClick={() => setPreviewOpen(true)}
      />

      {/* Los diálogos siguen viviendo aquí, ya que son controlados
          por el estado de esta página (Facturacion) */}
      <ExtrasDialog
        open={openExtras}
        extras={extras}
        onClose={() => setOpenExtras(false)}
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