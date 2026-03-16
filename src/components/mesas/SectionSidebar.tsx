import { Box, List, ListItem, ListItemButton, ListItemText, Typography, alpha } from "@mui/material";
import LayersIcon from '@mui/icons-material/Layers';
import DashboardIcon from '@mui/icons-material/Dashboard';

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
      bgcolor: "white", 
      borderRadius: 4,
      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }}>
      <Box sx={{ p: 3, borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ 
          bgcolor: alpha("#4482ff", 0.1), 
          color: "#4482ff", 
          p: 1, 
          borderRadius: 2,
          display: "flex"
        }}>
          <DashboardIcon />
        </Box>
        <Typography variant="h6" fontWeight="700" color="text.primary">
          Zonas
        </Typography>
      </Box>

      <List sx={{ p: 2, flexGrow: 1, overflowY: "auto" }}>
        {floors.map((floor, index) => {
          const isSelected = selectedFloor === index + 1;
          return (
            <ListItem disablePadding key={floor} sx={{ mb: 1 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => onChangeFloor(index + 1)}
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  px: 2,
                  transition: "all 0.2s",
                  bgcolor: isSelected ? "primary.main" : "transparent",
                  color: isSelected ? "white" : "text.secondary",
                  "&:hover": {
                    bgcolor: isSelected ? "primary.dark" : alpha("#4482ff", 0.08),
                    color: isSelected ? "white" : "primary.main",
                    transform: "translateX(4px)",
                  },
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "white",
                    boxShadow: "0 4px 12px rgba(68, 130, 255, 0.4)",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    }
                  }
                }}
              >
                <LayersIcon sx={{ 
                  mr: 2, 
                  fontSize: 20, 
                  color: isSelected ? "white" : "action.active" 
                }} />
                <ListItemText 
                  primary={floor} 
                  primaryTypographyProps={{ 
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: "0.95rem"
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
