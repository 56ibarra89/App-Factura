import {
  Avatar,
  Box,
  Paper,
  Typography,
} from "@mui/material";
import {
  DirectionsBike,
  Person,
  PointOfSale,
  RestaurantMenu,
} from "@mui/icons-material";
import type { DeliveryStat } from "../../../types/delivery";
import type { UserAccount } from "../../../types/user";
import { LOGIN_COLORS } from "../../../theme/loginTheme";

interface EmployeeScheduleListProps {
  employees: UserAccount[];
  loading: boolean;
  selectedUserId: string | null;
  stats: DeliveryStat[];
  onSelect: (userId: string) => void;
}

function getRoleIcon(role: string) {
  switch (role.toLowerCase()) {
    case "motorizado":
      return <DirectionsBike fontSize="small" />;
    case "cajero":
      return <PointOfSale fontSize="small" />;
    case "mesero":
    case "cocinero":
      return <RestaurantMenu fontSize="small" />;
    default:
      return <Person fontSize="small" />;
  }
}

function getInitials(user: UserAccount) {
  return `${user.firstName.charAt(0)}${user.lastName?.charAt(0) ?? ""}`.toUpperCase();
}

export default function EmployeeScheduleList({
  employees,
  loading,
  selectedUserId,
  stats,
  onSelect,
}: EmployeeScheduleListProps) {
  return (
    <>
      <Typography variant="h6" fontWeight="900" sx={{ mb: 2, opacity: 0.8 }}>
        Empleados ({employees.length})
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          maxHeight: { xs: "400px", md: "calc(100vh - 200px)" },
          overflowY: "auto",
          pr: 1,
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "text.disabled",
            borderRadius: "10px",
          },
        }}
      >
        {employees.map((user) => {
          const isSelected = selectedUserId === user.id;
          const deliveries =
            stats.find((stat) => stat.userId === user.id)?.todayDeliveries ?? 0;

          return (
            <Paper
              key={user.id}
              onClick={() => onSelect(user.id)}
              elevation={isSelected ? 3 : 0}
              sx={{
                p: 2,
                mb: 2,
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
                  boxShadow: isSelected
                    ? "none"
                    : "0 4px 12px rgba(0,0,0,0.05)",
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: isSelected
                    ? LOGIN_COLORS.primary
                    : "action.hover",
                  color: isSelected ? "white" : "text.secondary",
                  fontWeight: "bold",
                }}
              >
                {getInitials(user)}
              </Avatar>
              <Box flex={1}>
                <Typography
                  variant="subtitle1"
                  fontWeight={isSelected ? "800" : "600"}
                  color={isSelected ? "text.primary" : "text.secondary"}
                >
                  {user.firstName} {user.lastName}
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                  {getRoleIcon(user.role)}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight="600"
                    sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                  >
                    {user.role}
                    {user.role === "motorizado" &&
                      ` • ${deliveries} Entregas hoy`}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          );
        })}

        {employees.length === 0 && !loading && (
          <Box
            textAlign="center"
            py={4}
            bgcolor="background.paper"
            borderRadius={3}
            border="1px dashed rgba(0,0,0,0.1)"
          >
            <Typography color="text.secondary">
              No hay empleados registrados.
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
}
