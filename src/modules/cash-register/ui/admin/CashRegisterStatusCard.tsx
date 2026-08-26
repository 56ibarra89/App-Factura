import { Box, Typography, Paper, Grid, Chip, Stack, alpha } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { LOGIN_COLORS, LOGIN_SHADOWS } from "../../../../shared/theme";
import { formatCurrency } from "../../../../shared/format";
import type { CajaActiveMock } from "../../hooks/useCashRegisterDashboard";

interface Props {
  caja: CajaActiveMock;
}

export const CashRegisterStatusCard = ({ caja }: Props) => {
  const appRevenue = caja.revenueApp || 0;
  const totalRevenue =
    caja.revenueTotal !== undefined
      ? caja.revenueTotal
      : caja.revenueCash + caja.revenueCard + appRevenue;

  const timeOpen = Math.max(0, new Date().getTime() - new Date(caja.startTime).getTime());
  const hoursOpen = Math.floor(timeOpen / (1000 * 60 * 60));
  const minutesOpen = Math.floor((timeOpen % (1000 * 60 * 60)) / (1000 * 60));

  const roleUpper = (caja.cashierRole || "").toUpperCase();

  const getRoleConfig = () => {
    switch (roleUpper) {
      case "CAJERO_PRINCIPAL":
        return {
          label: "Cajero Principal",
          color: "secondary" as const,
          icon: "👑",
          accentColor: "#9c27b0",
        };
      case "DESPACHADOR":
        return {
          label: "Despacho Delivery",
          color: "warning" as const,
          icon: "🛵",
          accentColor: "#ed6c02",
        };
      case "ADMIN":
        return {
          label: "Administrador",
          color: "error" as const,
          icon: "🛡️",
          accentColor: LOGIN_COLORS.primary,
        };
      case "CAJERO":
      default:
        return {
          label: "Cajero POS",
          color: "info" as const,
          icon: "💼",
          accentColor: "#0288d1",
        };
    }
  };

  const roleConfig = getRoleConfig();

  const chartData = [
    { name: "Efectivo", value: caja.revenueCash, color: "#2e7d32" },
    { name: "Tarjeta", value: caja.revenueCard, color: "#0288d1" },
    { name: "App / Transf.", value: appRevenue, color: "#ed6c02" },
  ].filter((item) => item.value > 0);

  const hasData = chartData.length > 0;
  const displayChartData = hasData
    ? chartData
    : [{ name: "Sin ingresos", value: 1, color: "#e0e0e0" }];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        bgcolor: "background.paper",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        position: "relative",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: LOGIN_SHADOWS.card,
        },
      }}
    >
      {/* Top accent line */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          bgcolor: roleConfig.accentColor,
        }}
      />

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box>
          <Typography variant="h6" fontWeight="800" color="text.primary">
            {caja.name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", mt: 0.5 }}
          >
            <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Abierta hace {hoursOpen}h {minutesOpen}m por <strong>&nbsp;{caja.cashier}</strong>
          </Typography>
        </Box>

        <Chip
          label={`${roleConfig.icon} ${roleConfig.label}`}
          color={roleConfig.color}
          size="small"
          sx={{ fontWeight: 700, fontSize: "0.75rem" }}
        />
      </Box>

      {/* Main Stats with Pie */}
      <Box display="flex" alignItems="center" mb={2.5}>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight="700"
            textTransform="uppercase"
            letterSpacing={0.5}
          >
            Total Recaudado
          </Typography>
          <Typography variant="h4" fontWeight="900" color="text.primary" sx={{ mt: 0.5 }}>
            {formatCurrency(totalRevenue)}
          </Typography>
        </Box>

        <Box sx={{ width: 80, height: 80 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayChartData}
                innerRadius={24}
                outerRadius={38}
                paddingAngle={hasData ? 3 : 0}
                dataKey="value"
                stroke="none"
              >
                {displayChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              {hasData && (
                <RechartsTooltip
                  formatter={(val: unknown) => formatCurrency(Number(val))}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* 3-way Method Breakdown */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid size={{ xs: 4 }}>
          <Box
            sx={{
              p: 1.25,
              borderRadius: 2.5,
              bgcolor: alpha("#2e7d32", 0.06),
              border: "1px solid",
              borderColor: alpha("#2e7d32", 0.15),
            }}
          >
            <Box display="flex" alignItems="center" mb={0.5}>
              <AttachMoneyIcon sx={{ color: "#2e7d32", fontSize: 16, mr: 0.25 }} />
              <Typography variant="caption" fontWeight="bold" color="text.secondary">
                Efectivo
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight="800" color="text.primary">
              {formatCurrency(caja.revenueCash)}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 4 }}>
          <Box
            sx={{
              p: 1.25,
              borderRadius: 2.5,
              bgcolor: alpha("#0288d1", 0.06),
              border: "1px solid",
              borderColor: alpha("#0288d1", 0.15),
            }}
          >
            <Box display="flex" alignItems="center" mb={0.5}>
              <CreditCardIcon sx={{ color: "#0288d1", fontSize: 16, mr: 0.25 }} />
              <Typography variant="caption" fontWeight="bold" color="text.secondary">
                Tarjeta
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight="800" color="text.primary">
              {formatCurrency(caja.revenueCard)}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 4 }}>
          <Box
            sx={{
              p: 1.25,
              borderRadius: 2.5,
              bgcolor: alpha("#ed6c02", 0.06),
              border: "1px solid",
              borderColor: alpha("#ed6c02", 0.15),
            }}
          >
            <Box display="flex" alignItems="center" mb={0.5}>
              <PhoneAndroidIcon sx={{ color: "#ed6c02", fontSize: 16, mr: 0.25 }} />
              <Typography variant="caption" fontWeight="bold" color="text.secondary">
                App / Transf.
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight="800" color="text.primary">
              {formatCurrency(appRevenue)}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Footer Info */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ pt: 1.5, borderTop: "1px dashed", borderColor: "divider" }}
      >
        <Box display="flex" alignItems="center">
          <ReceiptIcon sx={{ color: "text.secondary", mr: 0.75, fontSize: 18 }} />
          <Typography variant="caption" color="text.secondary" fontWeight="600">
            <strong>{caja.transactionsCompleted}</strong> transacciones
          </Typography>
        </Box>

        {caja.openingAmount !== undefined && (
          <Box display="flex" alignItems="center">
            <LockOpenIcon sx={{ color: "text.secondary", mr: 0.5, fontSize: 16 }} />
            <Typography variant="caption" color="text.secondary">
              Apertura: <strong>{formatCurrency(caja.openingAmount)}</strong>
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};
