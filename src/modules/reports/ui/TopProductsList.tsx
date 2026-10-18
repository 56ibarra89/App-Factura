import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Chip
} from "@mui/material";
import LocalPizzaIcon from "@mui/icons-material/LocalPizza";
import type { TopProduct } from "../model/salesReport.types";

interface TopProductsListProps {
  products: TopProduct[];
}

export const TopProductsList: React.FC<TopProductsListProps> = ({ products }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    products.forEach((product) => {
      if (product.categoryName) categories.add(product.categoryName);
    });
    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }, [products]);
  const activeCategory =
    selectedCategory === "all" ||
    availableCategories.includes(selectedCategory)
      ? selectedCategory
      : "all";
  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter(
          (product) => product.categoryName === activeCategory,
        );

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: "none",
        bgcolor: 'background.paper',
        border: "1px solid",
        borderColor: "divider",
        height: '100%'
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalPizzaIcon color="primary" /> Productos Más Vendidos
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          Ingreso neto después de descuentos; las unidades de regalo no generan ingreso.
        </Typography>

        {products.length > 0 && (
          <Box display="flex" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
            <Chip
              label="Todos"
              color="primary"
              variant={activeCategory === "all" ? "filled" : "outlined"}
              onClick={() => setSelectedCategory("all")}
            />
            {availableCategories.map((category) => (
              <Chip
                key={category}
                label={category}
                color="primary"
                variant={
                  activeCategory === category ? "filled" : "outlined"
                }
                onClick={() => setSelectedCategory(category)}
              />
            ))}
          </Box>
        )}
        
        {products.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
            Aún no hay ventas el día de hoy.
          </Typography>
        ) : filteredProducts.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ py: 4 }}
          >
            No hay ventas registradas en esta categoría
          </Typography>
        ) : (
          <List disablePadding>
            {filteredProducts.slice(0, 5).map((product, index) => (
              <React.Fragment
                key={`${product.categoryId ?? "other"}-${product.name}`}
              >
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <Box sx={{ 
                    minWidth: 28, 
                    fontWeight: 'bold', 
                    color: index < 3 ? 'primary.main' : 'text.secondary'
                  }}>
                    #{index + 1}
                  </Box>
                  <ListItemText
                    primary={product.name}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                  <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.5}>
                    <Chip size="small" label={`${product.quantity} uds`} color="primary" variant={index < 3 ? "filled" : "outlined"} />
                    <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontVariantNumeric: "tabular-nums" }}>
                      C${product.totalRevenue.toFixed(2)}
                    </Typography>
                  </Box>
                </ListItem>
                {index < Math.min(filteredProducts.length - 1, 4) && (
                  <Divider />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};
