import { Box, Typography, Paper, Avatar } from "@mui/material";
import { RestaurantMenu } from "@mui/icons-material";
import { LOGIN_COLORS } from "../../../../../shared/theme";
import type { UserAccount } from "../../../../accounts";

interface WaiterListProps {
  waiters: UserAccount[];
  selectedUserId: string | null;
  onSelect: (id: string) => void;
}

const stringAvatar = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ''}`.toUpperCase();
};

export default function WaiterList({ waiters, selectedUserId, onSelect }: WaiterListProps) {
  return (
    <Box>
      <Typography variant="h6" fontWeight="900" sx={{ opacity: 0.8, mb: 2 }}>
        Meseros ({waiters.length})
      </Typography>
      <Box sx={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: 1.5,
        maxHeight: { xs: "400px", md: "calc(100vh - 200px)" },
        overflowY: "auto",
        pr: 1
      }}>
        {waiters.map((user) => {
          const isSelected = selectedUserId === user.id;
          return (
            <Paper
              key={user.id}
              onClick={() => onSelect(user.id)}
              elevation={isSelected ? 3 : 0}
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
                cursor: "pointer",
                borderRadius: 3,
                border: `2px solid ${isSelected ? LOGIN_COLORS.primary : "transparent"}`,
                bgcolor: isSelected ? "action.selected" : "background.paper",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: isSelected ? "none" : "translateY(-2px)",
                  boxShadow: isSelected ? "none" : "0 4px 12px rgba(0,0,0,0.05)",
                }
              }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: isSelected ? LOGIN_COLORS.primary : "action.hover",
                  color: isSelected ? "white" : "text.secondary",
                  fontWeight: "bold"
                }}
              >
                {stringAvatar(user.firstName, user.lastName)}
              </Avatar>
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight={isSelected ? "800" : "600"} color={isSelected ? "text.primary" : "text.secondary"}>
                  {user.firstName} {user.lastName}
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                  <RestaurantMenu fontSize="small" sx={{ color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary">Mesero</Typography>
                </Box>
              </Box>
            </Paper>
          );
        })}
        {waiters.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
            No hay meseros registrados.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
