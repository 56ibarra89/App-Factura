// src/components/CategoryTabs.tsx
import { Box, Tabs, Tab, IconButton } from "@mui/material";
import {
  LocalPizza,
  Fastfood,
  LunchDining,
  Restaurant,
  LocalDrink,
  Cake,
  Home,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Product } from "../types/product";

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
  const navigate = useNavigate();

  return (
    <Box
      width="120px"
      display="flex"
      flexDirection="column"
      height="100%"
      bgcolor="#f0f0f0"
      borderRadius={2}
      p={1}
      sx={{
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
        <IconButton 
          onClick={() => navigate("/home")}
          sx={{ 
            bgcolor: "white", 
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            "&:hover": { bgcolor: "#eee" }
          }}
        >
          <Home color="primary" />
        </IconButton>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
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
        {categories.map((cat) => (
          <Tab
            key={cat.label}
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
    </Box>
  );
};

export default CategoryTabs;
