import { Box, Typography, Paper, Grid, IconButton, alpha } from "@mui/material";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { LOGIN_COLORS, LOGIN_SHADOWS } from "../../../../shared/theme";
import { formatCurrency } from "../../../../shared/format";
import type { CajaActiveMock } from "../../hooks/useCashRegisterDashboard";

interface Props {
  caja: CajaActiveMock;
}

export const CashRegisterStatusCard = ({ caja }: Props) => {
  const totalRevenue = caja.revenueCash + caja.revenueCard;
  const timeOpen = new Date().getTime() - caja.startTime.getTime();
  const hoursOpen = Math.floor(timeOpen / (1000 * 60 * 60));
  const minutesOpen = Math.floor((timeOpen % (1000 * 60 * 60)) / (1000 * 60));

  const chartData = [
    { name: 'Efectivo', value: caja.revenueCash, color: LOGIN_COLORS.primary },
    { name: 'Tarjeta', value: caja.revenueCard, color: '#4caf50' }, // Green for card to contrast
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        bgcolor: "background.paper",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        position: "relative",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "grey.100",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: LOGIN_SHADOWS.card
        }
      }}
    >
      {/* Decorative top bar */}
      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, bgcolor: LOGIN_COLORS.primary }} />

      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box>
          <Typography variant="h6" fontWeight="800" color="text.primary">
            {caja.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Abierta hace {hoursOpen}h {minutesOpen}m por <strong>&nbsp;{caja.cashier}</strong>
          </Typography>
        </Box>
        <IconButton size="small">
          <MoreVertIcon />
        </IconButton>
      </Box>

      <Box display="flex" alignItems="center" mb={3}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" fontWeight="600" textTransform="uppercase" letterSpacing={1}>
            Ingreso Total
          </Typography>
          <Typography variant="h4" fontWeight="900" color="text.primary" sx={{ mt: 0.5 }}>
            {formatCurrency(totalRevenue)}
          </Typography>
        </Box>

        <Box sx={{ width: 80, height: 80 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={25}
                outerRadius={40}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip formatter={(value: unknown) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: alpha(LOGIN_COLORS.primary, 0.05), border: '1px solid', borderColor: alpha(LOGIN_COLORS.primary, 0.1) }}>
            <Box display="flex" alignItems="center" mb={1}>
              <LocalAtmIcon sx={{ color: LOGIN_COLORS.primary, fontSize: 20, mr: 1 }} />
              <Typography variant="caption" fontWeight="bold" color="text.secondary">Efectivo</Typography>
            </Box>
            <Typography variant="subtitle1" fontWeight="800" color="text.primary">
              {formatCurrency(caja.revenueCash)}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: alpha('#4caf50', 0.05), border: '1px solid', borderColor: alpha('#4caf50', 0.1) }}>
            <Box display="flex" alignItems="center" mb={1}>
              <CreditCardIcon sx={{ color: '#4caf50', fontSize: 20, mr: 1 }} />
              <Typography variant="caption" fontWeight="bold" color="text.secondary">Tarjeta</Typography>
            </Box>
            <Typography variant="subtitle1" fontWeight="800" color="text.primary">
              {formatCurrency(caja.revenueCard)}
            </Typography>
          </Box>
        </Grid>
      </Grid>
      
      <Box display="flex" alignItems="center" mt={3} pt={2} borderTop="1px dashed" borderColor="grey.200">
        <ReceiptIcon sx={{ color: "grey.400", mr: 1, fontSize: 20 }} />
        <Typography variant="body2" color="text.secondary" fontWeight="500">
          <strong>{caja.transactionsCompleted}</strong> transacciones completadas
        </Typography>
      </Box>
    </Paper>
  );
};
