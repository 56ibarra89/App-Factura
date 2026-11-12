import { Box, List, ListItem, ListItemButton, ListItemText, Typography, alpha } from "@mui/material";
import LayersIcon from '@mui/icons-material/Layers';
import DashboardIcon from '@mui/icons-material/Dashboard';

interface Props {
  floors: { id: number; name: string }[];
  selectedFloor: number;
  onChangeFloor: (floorId: number) => void;
}

export default function SectionSidebar({
  floors,
  selectedFloor,
  onChangeFloor,
}: Props) {
  return (
    <Box sx={{ 
      height: "100%", 
      bgcolor: "background.paper",
      borderRadius: 2,
      boxShadow: "none",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      border: "1px solid",
      borderColor: "divider",
    }}>
      <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ 
          bgcolor: "action.hover",
          color: "primary.main",
          p: 1.2, 
          borderRadius: 2,
          display: "flex",
          boxShadow: "none",
        }}>
          <DashboardIcon sx={{ fontSize: 24 }} />
        </Box>
        <Typography variant="h6" fontWeight="800" color="text.primary" sx={{ letterSpacing: 0.5 }}>
          ZONAS
        </Typography>
      </Box>

      <List sx={{ p: 2, flexGrow: 1, overflowY: "auto" }}>
        {floors.map((floor) => {
          const isSelected = selectedFloor === floor.id;
          return (
            <ListItem disablePadding key={floor.id} sx={{ mb: 1.5 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => onChangeFloor(floor.id)}
                sx={{
                  borderRadius: 1.5,
                  py: 1.8,
                  px: 2.5,
                  transition: "background-color 120ms ease-out, border-color 120ms ease-out",
                  bgcolor: isSelected ? (theme) => alpha(theme.palette.primary.main, 0.08) : "transparent",
                  color: isSelected ? "primary.main" : "text.secondary",
                  borderLeft: "3px solid",
                  borderLeftColor: isSelected ? "primary.main" : "transparent",
                  "&:hover": {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                    color: "primary.main",
                  },
                  "&.Mui-selected": {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    color: "primary.main",
                    "&:hover": {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                    }
                  }
                }}
              >
                <LayersIcon sx={{ 
                  mr: 2, 
                  fontSize: 22, 
                  color: isSelected ? "primary.main" : "inherit",
                }} />
                <ListItemText 
                  primary={floor.name} 
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
