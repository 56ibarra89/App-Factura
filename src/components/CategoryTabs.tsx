// src/components/CategoryTabs.tsx
import { Box, Tabs, Tab } from "@mui/material";
import {
  LocalPizza,
  Fastfood,
  LunchDining,
  Restaurant,
  LocalDrink,
  Cake,
} from "@mui/icons-material";
// 👇 1. IMPORTA EL TIPO 'Product' DE TU CONTEXTO
import { Product } from "../context/ProductContext"; 

// Este mapa de iconos puede vivir aquí o ser importado de un archivo de constantes
const iconMap: Record<string, JSX.Element> = {
  Pizzas: <LocalPizza fontSize="large" />,
  Mexicanos: <Fastfood fontSize="large" />,
  Submarinos: <LunchDining fontSize="large" />,
  Alitas: <Restaurant fontSize="large" />,
  Postres: <Cake fontSize="large" />,
  Bebidas: <LocalDrink fontSize="large" />,
};

interface Category {
  label: string;
  // 👇 2. USA EL TIPO 'Product' EN LUGAR DE 'any'
  items: Product[]; 
}

interface CategoryTabsProps {
  categories: Category[];
  selectedTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const CategoryTabs = ({
  categories,
  selectedTab,
  onTabChange,
}: CategoryTabsProps) => {
  return (
    <Box
      width="120px"
      bgcolor="#f0f0f0"
      borderRadius={2}
      p={1}
      sx={{
        overflowY: "auto",
        maxHeight: "100%",
        "&::-webkit-scrollbar": { width: "6px" },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#ccc",
          borderRadius: "4px",
        },
      }}
    >
      <Tabs
        orientation="vertical"
        value={selectedTab}
        onChange={onTabChange}
        variant="scrollable"
        sx={{ height: "100%" }}
      >
        {categories.map((cat, i) => (
          <Tab
            key={i}
            icon={iconMap[cat.label] ?? null}
            label={cat.label}
            sx={{
              alignItems: "center",
              justifyContent: "center",
              textTransform: "none",
              minHeight: 100,
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default CategoryTabs;