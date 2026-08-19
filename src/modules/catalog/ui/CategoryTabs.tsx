
import { Box, Tabs, Tab, IconButton } from "@mui/material";
import { Home } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import type { Category } from "../model/catalog.types";
import { CATEGORY_ICONS } from "./categoryIcons";

const defaultIconMap: Record<string, JSX.Element> = {
  Pizzas: CATEGORY_ICONS.LocalPizza,
  Mexicanos: CATEGORY_ICONS.Fastfood,
  Submarinos: CATEGORY_ICONS.LunchDining,
  Alitas: CATEGORY_ICONS.Restaurant,
  Postres: CATEGORY_ICONS.Cake,
  Bebidas: CATEGORY_ICONS.LocalDrink,
};

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
      bgcolor="action.hover"
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
            bgcolor: "background.paper",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            "&:hover": { bgcolor: "action.selected" }
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
            icon={
              (cat.icon && CATEGORY_ICONS[cat.icon]) ||
              defaultIconMap[cat.label] ||
              CATEGORY_ICONS.Restaurant
            }
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

