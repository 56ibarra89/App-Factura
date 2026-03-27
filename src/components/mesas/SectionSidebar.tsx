import { Box, List, ListItem, ListItemButton, ListItemText, Typography } from "@mui/material";
import LayersIcon from '@mui/icons-material/Layers';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { LOGIN_COLORS, LOGIN_GRADIENTS } from "../../theme/loginTheme";

interface Props {
  floors: string[];
  selectedFloor: number;
  onChangeFloor: (floor: number) => void;
}

export default function SectionSidebar({
  floors,
  selectedFloor,
  onChangeFloor,
}: Props) {
  return (
    <Box sx={{ 
      height: "100%", 
      background: LOGIN_GRADIENTS.brandingPanel,
      backgroundImage: LOGIN_GRADIENTS.brandingPanelRadial,
      borderRadius: 4,
      boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      borderRight: "1px solid rgba(255,255,255,0.05)"
    }}>
      <Box sx={{ p: 4, borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ 
          bgcolor: "rgba(255,255,255,0.1)", 
          color: "white", 
          p: 1.2, 
          borderRadius: 2.5,
          display: "flex",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
        }}>
          <DashboardIcon sx={{ fontSize: 24 }} />
        </Box>
        <Typography variant="h6" fontWeight="800" color="white" sx={{ letterSpacing: 0.5 }}>
          ZONAS
        </Typography>
      </Box>

      <List sx={{ p: 2, flexGrow: 1, overflowY: "auto" }}>
        {floors.map((floor, index) => {
          const isSelected = selectedFloor === index + 1;
          return (
            <ListItem disablePadding key={floor} sx={{ mb: 1.5 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => onChangeFloor(index + 1)}
                sx={{
                  borderRadius: 3,
                  py: 1.8,
                  px: 2.5,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  bgcolor: isSelected ? "rgba(255,255,255,0.12)" : "transparent",
                  color: isSelected ? "white" : "rgba(255,255,255,0.6)",
                  borderLeft: isSelected ? `4px solid ${LOGIN_COLORS.primary}` : "4px solid transparent",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.08)",
                    color: "white",
                    transform: "translateX(6px)",
                  },
                  "&.Mui-selected": {
                    bgcolor: "rgba(255,255,255,0.12)",
                    color: "white",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.15)",
                    }
                  }
                }}
              >
                <LayersIcon sx={{ 
                  mr: 2, 
                  fontSize: 22, 
                  color: isSelected ? LOGIN_COLORS.primary : "inherit",
                  transition: "all 0.3s"
                }} />
                <ListItemText 
                  primary={floor} 
                  primaryTypographyProps={{ 
                    fontWeight: isSelected ? 800 : 500,
                    fontSize: "1rem",
                    letterSpacing: 0.2
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}
