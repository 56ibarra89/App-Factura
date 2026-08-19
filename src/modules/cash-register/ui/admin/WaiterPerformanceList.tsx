import { Box, Typography, Paper, Avatar } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Cell } from 'recharts';
import type { WaiterPerformanceMock } from "../../hooks/useCashRegisterDashboard";
import { formatCurrency } from "../../../../shared/format";

interface Props {
  waiters: WaiterPerformanceMock[];
}

export const WaiterPerformanceList = ({ waiters }: Props) => {

  const sortedWaiters = [...waiters].sort((a, b) => b.revenueTotal - a.revenueTotal);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        bgcolor: "background.paper",
        boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
        border: "1px solid",
        borderColor: "grey.200",
      }}
    >
      <Box mb={4}>
        <Typography variant="h6" fontWeight="800" color="text.primary">
          Top Meseros del Día
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Métricas de ingresos generados y atención de pedidos
        </Typography>
      </Box>

      {}
      <Box sx={{ width: '100%', height: 260, mb: 4 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedWaiters}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
            <XAxis type="number" tickFormatter={(val) => `$${val}`} stroke="#888" fontSize={12} />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              fontWeight="600"
              fontSize={13}
              width={100}
            />
            <RechartsTooltip
              formatter={(value: unknown) => formatCurrency(Number(value))}
              cursor={{ fill: 'rgba(0,0,0,0.04)' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="revenueTotal" radius={[0, 4, 4, 0]} barSize={24}>
              {sortedWaiters.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.avatarColor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Lista Descriptiva */}
      <Box display="flex" flexDirection="column" gap={2}>
        {sortedWaiters.map((waiter, idx) => (
          <Box
            key={waiter.id}
            display="flex"
            alignItems="center"
            p={2}
            sx={{
              borderRadius: 3,
              bgcolor: idx === 0 ? 'rgba(211, 47, 47, 0.04)' : 'transparent',
              border: '1px solid',
              borderColor: idx === 0 ? 'rgba(211, 47, 47, 0.1)' : 'grey.100',
              transition: 'all 0.2s',
              "&:hover": {
                bgcolor: "action.hover"
              }
            }}
          >
            <Avatar
              sx={{
                bgcolor: waiter.avatarColor,
                width: 48,
                height: 48,
                fontWeight: 'bold',
                boxShadow: `0 4px 10px ${waiter.avatarColor}40`
              }}
            >
              {waiter.name.charAt(0)}
            </Avatar>
            <Box ml={2} flex={1}>
              <Typography variant="subtitle1" fontWeight="700" color="text.primary">
                {waiter.name} {idx === 0 && '👑'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {waiter.ordersServed} pedidos completados
              </Typography>
            </Box>
            <Typography variant="h6" fontWeight="900" color="text.primary">
              {formatCurrency(waiter.revenueTotal)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

