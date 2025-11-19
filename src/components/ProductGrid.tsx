// src/components/ProductGrid.tsx
import { Box } from "@mui/material";
import ProductCard from "../components/ProductCard";
import { Product } from "../types/product"; // Asegúrate de importar tu tipo Product

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const ProductGrid = ({ products, onProductClick }: ProductGridProps) => {
  return (
    <Box flex={1} p={3} sx={{ maxHeight: "100%", overflowY: "auto" }}>
      <Box display="flex" flexWrap="wrap" gap={2}>
        {products.map((item, idx) => (
          <ProductCard
            key={idx}
            name={item.name}
            price={item.prices?.[0]?.price || 0}
            onClick={() => onProductClick(item)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ProductGrid;