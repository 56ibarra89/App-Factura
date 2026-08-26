import { Box, Typography, Paper, Avatar, Skeleton, Chip } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Cell,
} from "recharts";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import type { WaiterPerformanceMock } from "../../hooks/useCashRegisterDashboard";
import { formatCurrency } from "../../../../shared/format";

interface Props {
  waiters: WaiterPerformanceMock[];
  loading?: boolean;
}

export const WaiterPerformanceList = ({ waiters, loading = false }: Props) => {
  const sortedWaiters = [...waiters].sort((a, b) => b.revenueTotal - a.revenueTotal);
  const hasRevenueData = sortedWaiters.some((w) => w.revenueTotal > 0);

  const getPodiumBadge = (idx: number) => {
    if (idx === 0) return { icon: "👑", label: "1° Lugar", color: "#d32f2f" };
    if (idx === 1) return { icon: "🥈", label: "2° Lugar", color: "#1976d2" };
    if (idx === 2) return { icon: "🥉", label: "3° Lugar", color: "#ed6c02" };
    return null;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        bgcolor: "background.paper",
        boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box mb={3}>
        <Typography variant="h6" fontWeight="800" color="text.primary">
          Top Meseros del Día
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Métricas de ingresos generados y atención de pedidos
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" flexDirection="column" gap={2}>
          <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 3 }} />
        </Box>
      ) : sortedWaiters.length === 0 ? (
        <Box
          sx={{
            py: 6,
            px: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            bgcolor: "action.hover",
            borderRadius: 3,
          }}
        >
          <PersonOffOutlinedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1.5, opacity: 0.6 }} />
          <Typography variant="subtitle1" fontWeight="700" color="text.primary">
            Sin actividad de meseros hoy
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280, mt: 0.5 }}>
            Los pedidos asignados a zonas o mesas se reflejarán aquí en tiempo real.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Gráfico de Barras Horizontal */}
          {hasRevenueData && (
            <Box sx={{ width: "100%", height: 220, mb: 3 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sortedWaiters.slice(0, 5)}
                  margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                  <XAxis
                    type="number"
                    tickFormatter={(val) => `C$${val}`}
                    stroke="#888"
                    fontSize={11}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    fontWeight="600"
                    fontSize={12}
                    width={90}
                  />
                  <RechartsTooltip
                    formatter={(value: unknown) => formatCurrency(Number(value))}
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                    contentStyle={{
                      borderRadius: "10px",
                      border: "none",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                    }}
                  />
                  <Bar dataKey="revenueTotal" radius={[0, 4, 4, 0]} barSize={20}>
                    {sortedWaiters.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.avatarColor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}

          {/* Lista Descriptiva */}
          <Box display="flex" flexDirection="column" gap={1.5}>
            {sortedWaiters.map((waiter, idx) => {
              const podium = getPodiumBadge(idx);
              return (
                <Box
                  key={waiter.id}
                  display="flex"
                  alignItems="center"
                  p={1.75}
                  sx={{
                    borderRadius: 3,
                    bgcolor: idx === 0 ? "rgba(211, 47, 47, 0.03)" : "transparent",
                    border: "1px solid",
                    borderColor: idx === 0 ? "rgba(211, 47, 47, 0.15)" : "divider",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: waiter.avatarColor,
                      width: 42,
                      height: 42,
                      fontWeight: "bold",
                      fontSize: "1rem",
                      boxShadow: `0 4px 10px ${waiter.avatarColor}35`,
                    }}
                  >
                    {waiter.name.charAt(0)}
                  </Avatar>

                  <Box ml={2} flex={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle2" fontWeight="700" color="text.primary">
                        {waiter.name}
                      </Typography>
                      {podium && (
                        <Chip
                          size="small"
                          label={`${podium.icon} ${podium.label}`}
                          sx={{
                            height: 20,
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            bgcolor: `${podium.color}15`,
                            color: podium.color,
                          }}
                        />
                      )}
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      {waiter.ordersServed} {waiter.ordersServed === 1 ? "mesa atendida" : "mesas atendidas"}
                    </Typography>
                  </Box>

                  <Typography variant="subtitle1" fontWeight="800" color="text.primary">
                    {formatCurrency(waiter.revenueTotal)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </>
      )}
    </Paper>
  );
};
