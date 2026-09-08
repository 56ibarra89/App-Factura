import { Box, Typography, Paper, Avatar, Stack, Skeleton } from "@mui/material";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import type { WaiterPerformance } from "../../api/adminDashboardGateway";
import { formatCurrency } from "../../../../shared/format";

interface Props {
  waiters: WaiterPerformance[];
  loading?: boolean;
}

export const WaiterPerformanceList = ({ waiters, loading = false }: Props) => {
  const sortedWaiters = [...waiters].sort((a, b) => b.revenueTotal - a.revenueTotal);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        bgcolor: "background.paper",
        boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
        border: "1px solid",
        borderColor: "divider",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Título de Sección */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
        <Box display="flex" alignItems="center" gap={1.2}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: "rgba(255, 193, 7, 0.12)",
              color: "#f57c00",
              display: "flex",
            }}
          >
            <EmojiEventsIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="800" color="text.primary">
              Top Meseros del Día
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Rendimiento y consumo por personal de sala
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Lista de Meseros / Loading / Empty */}
      {loading ? (
        <Stack spacing={1.5}>
          <Skeleton variant="rounded" height={70} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rounded" height={70} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rounded" height={70} sx={{ borderRadius: 3 }} />
        </Stack>
      ) : sortedWaiters.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center", my: "auto" }}>
          <TableRestaurantIcon sx={{ fontSize: 44, color: "text.disabled", mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Aún no hay mesas cobradas en este turno.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5} sx={{ flex: 1 }}>
          {sortedWaiters.map((waiter, idx) => {
            const isPodium = idx === 0;
            const medal =
              idx === 0
                ? "👑 1° Lugar"
                : idx === 1
                  ? "🥈 2° Lugar"
                  : idx === 2
                    ? "🥉 3° Lugar"
                    : `${idx + 1}°`;

            return (
              <Box
                key={waiter.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.75,
                  borderRadius: 3,
                  bgcolor: isPodium ? "rgba(211, 47, 47, 0.04)" : "background.default",
                  border: "1px solid",
                  borderColor: isPodium ? "rgba(211, 47, 47, 0.15)" : "divider",
                  transition: "background-color 0.2s",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: waiter.avatarColor || "#757575",
                      width: 42,
                      height: 42,
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      boxShadow: `0 4px 10px ${waiter.avatarColor || "#757575"}35`,
                    }}
                  >
                    {waiter.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <Typography variant="subtitle2" fontWeight="800" color="text.primary">
                        {waiter.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          bgcolor: isPodium ? "rgba(255, 193, 7, 0.2)" : "action.selected",
                          color: isPodium ? "#e65100" : "text.secondary",
                          px: 0.8,
                          py: 0.2,
                          borderRadius: 1,
                        }}
                      >
                        {medal}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {waiter.ordersServed}{" "}
                      {waiter.ordersServed === 1 ? "mesa atendida" : "mesas atendidas"}
                    </Typography>
                  </Box>
                </Stack>
                <Typography variant="subtitle1" fontWeight="900" color="text.primary">
                  {formatCurrency(waiter.revenueTotal)}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
};
