// src/components/ProductGrid.tsx
import Box from "@mui/material/Box";
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
        {products.map((item) => (
          <ProductCard
            key={item.name}
            name={item.name}
            price={item.prices?.[0]?.price || 0}
            description={item.description}
            onClick={() => onProductClick(item)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ProductGrid;