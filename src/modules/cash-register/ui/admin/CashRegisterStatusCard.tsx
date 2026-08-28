import { Box, Typography, Paper, Chip, Stack, alpha } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LockOpenIcon from "@mui/icons-material/LockOpen";
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
  const isPrincipal = roleUpper === "CAJERO_PRINCIPAL";
  const isDelivery = roleUpper === "DESPACHADOR";
  const isAdmin = roleUpper === "ADMIN";

  const roleConfig = {
    label: isAdmin
      ? "Administrador"
      : isPrincipal
        ? "Cajero Principal"
        : isDelivery
          ? "Despacho Delivery"
          : "Cajero POS",
    color: (isAdmin
      ? "error"
      : isPrincipal
        ? "secondary"
        : isDelivery
          ? "warning"
          : "info") as "error" | "secondary" | "warning" | "info",
    icon: isAdmin ? "🛡️" : isPrincipal ? "👑" : isDelivery ? "🛵" : "💼",
    accentColor: isAdmin
      ? LOGIN_COLORS.primary
      : isPrincipal
        ? "#9c27b0"
        : isDelivery
          ? "#ed6c02"
          : "#0288d1",
  };

  const cashPct = totalRevenue > 0 ? (caja.revenueCash / totalRevenue) * 100 : 0;
  const cardPct = totalRevenue > 0 ? (caja.revenueCard / totalRevenue) * 100 : 0;
  const appPct = totalRevenue > 0 ? (appRevenue / totalRevenue) * 100 : 0;

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
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: LOGIN_SHADOWS.card,
        },
      }}
    >
      {/* Línea de acento superior según rol */}
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

      {/* Cabecera */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box>
          <Typography variant="h6" fontWeight="800" color="text.primary">
            {caja.name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", mt: 0.5, gap: 0.5, flexWrap: "wrap" }}
          >
            <AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <span>
              Abierta hace <strong>{hoursOpen}h {minutesOpen}m</strong>
            </span>
            <span>·</span>
            <span>
              Por <strong>{caja.cashier}</strong>
            </span>
          </Typography>
        </Box>

        <Chip
          label={`${roleConfig.icon} ${roleConfig.label}`}
          color={roleConfig.color}
          size="small"
          sx={{ fontWeight: 700, fontSize: "0.75rem" }}
        />
      </Box>

      {/* Total Recaudado */}
      <Box mb={2}>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={700}
          textTransform="uppercase"
          letterSpacing={0.5}
        >
          Total Recaudado en el Turno
        </Typography>
        <Typography variant="h4" fontWeight={900} color="text.primary" sx={{ mt: 0.25 }}>
          {formatCurrency(totalRevenue)}
        </Typography>
      </Box>

      {/* Barra de Distribución Proporcional Multicolor (Sin recortes) */}
      <Box sx={{ mb: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            height: 10,
            borderRadius: 5,
            overflow: "hidden",
            bgcolor: "grey.100",
            mb: 1,
          }}
        >
          {totalRevenue === 0 ? (
            <Box sx={{ width: "100%", bgcolor: "grey.200" }} />
          ) : (
            <>
              {cashPct > 0 && (
                <Box
                  sx={{ width: `${cashPct}%`, bgcolor: "#2e7d32" }}
                  title={`Efectivo: ${cashPct.toFixed(1)}%`}
                />
              )}
              {cardPct > 0 && (
                <Box
                  sx={{ width: `${cardPct}%`, bgcolor: "#0288d1" }}
                  title={`Tarjeta: ${cardPct.toFixed(1)}%`}
                />
              )}
              {appPct > 0 && (
                <Box
                  sx={{ width: `${appPct}%`, bgcolor: "#ed6c02" }}
                  title={`App: ${appPct.toFixed(1)}%`}
                />
              )}
            </>
          )}
        </Box>
      </Box>

      {/* 3 Métodos de Pago con estilo uniforme y responsivo */}
      <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={1.5} mb={2.5}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2.5,
            bgcolor: alpha("#2e7d32", 0.05),
            border: "1px solid",
            borderColor: alpha("#2e7d32", 0.15),
          }}
        >
          <Stack direction="row" spacing={0.5} alignItems="center" mb={0.5}>
            <AttachMoneyIcon sx={{ color: "#2e7d32", fontSize: 16 }} />
            <Typography variant="caption" fontWeight="bold" color="text.secondary">
              Efectivo
            </Typography>
          </Stack>
          <Typography variant="subtitle2" fontWeight="900" color="text.primary">
            {formatCurrency(caja.revenueCash)}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 1.5,
            borderRadius: 2.5,
            bgcolor: alpha("#0288d1", 0.05),
            border: "1px solid",
            borderColor: alpha("#0288d1", 0.15),
          }}
        >
          <Stack direction="row" spacing={0.5} alignItems="center" mb={0.5}>
            <CreditCardIcon sx={{ color: "#0288d1", fontSize: 16 }} />
            <Typography variant="caption" fontWeight="bold" color="text.secondary">
              Tarjeta
            </Typography>
          </Stack>
          <Typography variant="subtitle2" fontWeight="900" color="text.primary">
            {formatCurrency(caja.revenueCard)}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 1.5,
            borderRadius: 2.5,
            bgcolor: alpha("#ed6c02", 0.05),
            border: "1px solid",
            borderColor: alpha("#ed6c02", 0.15),
          }}
        >
          <Stack direction="row" spacing={0.5} alignItems="center" mb={0.5}>
            <PhoneAndroidIcon sx={{ color: "#ed6c02", fontSize: 16 }} />
            <Typography variant="caption" fontWeight="bold" color="text.secondary">
              App / Transf.
            </Typography>
          </Stack>
          <Typography variant="subtitle2" fontWeight="900" color="text.primary">
            {formatCurrency(appRevenue)}
          </Typography>
        </Box>
      </Box>

      {/* Footer Info */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ pt: 2, borderTop: "1px dashed", borderColor: "divider" }}
      >
        <Box display="flex" alignItems="center">
          <ReceiptIcon sx={{ color: "text.secondary", mr: 0.75, fontSize: 18 }} />
          <Typography variant="caption" color="text.secondary" fontWeight="600">
            <strong>{caja.transactionsCompleted}</strong> órdenes cobradas
          </Typography>
        </Box>

        {caja.openingAmount !== undefined && caja.openingAmount > 0 && (
          <Box display="flex" alignItems="center">
            <LockOpenIcon sx={{ color: "text.secondary", mr: 0.5, fontSize: 16 }} />
            <Typography variant="caption" color="text.secondary">
              Fondo inicial: <strong>{formatCurrency(caja.openingAmount)}</strong>
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};
