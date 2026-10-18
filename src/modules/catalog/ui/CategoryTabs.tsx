
import { Box, Tabs, Tab, IconButton, alpha } from "@mui/material";
import { Home } from "@mui/icons-material";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import type { Category } from "../model/catalog.types";
import { CATEGORY_ICONS } from "./categoryIcons";
import { useAuth } from "../../auth";

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
  const location = useLocation();
  const { role } = useAuth();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("tableId");

  const handleNavigation = () => {
    if (tableId) {
      navigate("/mesas");
    } else if (
      role === "despachador" ||
      Boolean(location.state?.fromDeliveryPage)
    ) {
      navigate("/delivery");
    } else {
      navigate("/home");
    }
  };

  return (
    <Box
      width="128px"
      display="flex"
      flexDirection="column"
      height="100%"
      bgcolor="background.paper"
      p={1}
      sx={{
        boxSizing: "border-box",
        borderRight: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
        <IconButton
          onClick={handleNavigation}
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            boxShadow: "none",
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
            backgroundColor: "action.disabled",
            borderRadius: 2,
          },
        }}
      >
      <Tabs
        orientation="vertical"
        value={selectedTab}
        onChange={onTabChange}
        variant="scrollable"
        sx={{ height: "100%", "& .MuiTabs-indicator": { display: "none" } }}
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
              minHeight: 92,
              mb: 1,
              borderRadius: 2,
              border: "1px solid transparent",
              transition: "background-color 120ms ease-out, border-color 120ms ease-out, color 120ms ease-out",
              "&.Mui-selected": {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                borderColor: "primary.main",
                color: "primary.main",
                fontWeight: 700,
              },
            }}
          />
        ))}
      </Tabs>
      </Box>
    </Box>
  );
};

export default CategoryTabs;

