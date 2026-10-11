import { useState, useMemo } from "react";
import { Box, Grid, CircularProgress, Typography, IconButton, Select, MenuItem, Stack, TextField } from "@mui/material";
import { BackButton, PageHeader } from "../../../shared/ui";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useSalesReport } from "../hooks/useSalesReport";
import { StatCard } from "../ui/StatCard";
import { TopProductsList } from "../ui/TopProductsList";
import { SalesChart } from "../ui/SalesChart";
import { SalesChannelsCard } from "../ui/SalesChannelsCard";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInDays, format } from "date-fns";

type FilterType = "today" | "week" | "month" | "custom";

const SalesReportsPage = () => {
  const [privacyMode, setPrivacyMode] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("today");

  const [customStart, setCustomStart] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [customEnd, setCustomEnd] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    switch (filterType) {
      case "today":
        return { startDate: startOfDay(now), endDate: endOfDay(now) };
      case "week":
        return { startDate: startOfWeek(now, { weekStartsOn: 1 }), endDate: endOfWeek(now, { weekStartsOn: 1 }) };
      case "month":
        return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
      case "custom":
        return {
          startDate: startOfDay(new Date(customStart + "T00:00:00")),
          endDate: endOfDay(new Date(customEnd + "T00:00:00"))
        };
      default:
        return { startDate: startOfDay(now), endDate: endOfDay(now) };
    }
  }, [filterType, customStart, customEnd]);

  const { data, isLoading, error } = useSalesReport(startDate, endDate);
  const averageTicket =
    data && data.totalOrders > 0 ? data.totalSales / data.totalOrders : 0;

  const daysDiff = differenceInDays(endDate, startDate);
  const groupByDay = daysDiff >= 1;

  const getReportTitle = () => {
    switch (filterType) {
      case "today": return "Reporte del Día";
      case "week": return "Reporte Semanal";
      case "month": return "Reporte Mensual";
      case "custom": return "Reporte Personalizado";
      default: return "Reporte de Ventas";
    }
  };

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: 'background.default',
        pt: 4,
        pb: 4,
        px: { xs: 2, md: 6 },
        display: "flex",
        flexDirection: "column",
        gap: 2
      }}
    >
      <PageHeader
        title={getReportTitle()}
        startContent={<BackButton to="/home" />}
        actions={
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <Select
              size="small"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              sx={{ bgcolor: "background.paper", borderRadius: 2, minWidth: 150 }}
            >
              <MenuItem value="today">Hoy</MenuItem>
              <MenuItem value="week">Esta Semana</MenuItem>
              <MenuItem value="month">Este Mes</MenuItem>
              <MenuItem value="custom">Personalizado</MenuItem>
            </Select>

            {filterType === "custom" && (
              <>
                <TextField
                  type="date"
                  size="small"
                  label="Desde"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ bgcolor: "background.paper", borderRadius: 2 }}
                />
                <TextField
                  type="date"
                  size="small"
                  label="Hasta"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ bgcolor: "background.paper", borderRadius: 2 }}
                />
              </>
            )}

            <Box display="flex" gap={1}>
              <IconButton
                onClick={() => setPrivacyMode(!privacyMode)}
                sx={{ bgcolor: "background.paper", boxShadow: 1 }}
                title={privacyMode ? "Mostrar montos" : "Ocultar montos (Privacidad)"}
              >
                {privacyMode ? <VisibilityIcon color="primary" /> : <VisibilityOffIcon color="primary" />}
              </IconButton>
              <IconButton sx={{ bgcolor: "background.paper", boxShadow: 1 }}>
                <LocalPrintshopIcon color="primary" />
              </IconButton>
            </Box>
          </Box>
        }
      />

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
          <Typography color="error" variant="h6">{error}</Typography>
        </Box>
      ) : data ? (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Fila 1: métricas superiores */}
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={3} alignItems="stretch">
              <Grid
                size={{ xs: 12, sm: 6, md: 4, lg: 2 }}
                display="flex"
              >
                <StatCard
                  title="Total Facturado"
                  value={`C$${data.totalSales.toFixed(2)}`}
                  icon={<PointOfSaleIcon fontSize="large" />}
                  subtitle={`${data.totalOrders} factura${data.totalOrders === 1 ? "" : "s"} cobrada${data.totalOrders === 1 ? "" : "s"}`}
                  color="#d32f2f"
                  iconColor="#d32f2f"
                  iconBg="rgba(211, 47, 47, 0.1)"
                  masked={privacyMode}
                />
              </Grid>
              <Grid
                size={{ xs: 12, sm: 6, md: 4, lg: 2 }}
                display="flex"
              >
                <StatCard
                  title="Ticket Promedio"
                  value={`C$${averageTicket.toFixed(2)}`}
                  icon={<ReceiptLongIcon fontSize="large" />}
                  subtitle="Consumo promedio por orden"
                  color="secondary.main"
                  iconColor="secondary.main"
                  iconBg="action.hover"
                  masked={privacyMode}
                />
              </Grid>
              <Grid
                size={{ xs: 12, sm: 6, md: 4, lg: 2 }}
                display="flex"
              >
                <StatCard
                  title="Descuentos Aplicados"
                  value={`C$${data.totalDiscounts.toFixed(2)}`}
                  icon={<LocalOfferIcon fontSize="large" />}
                  subtitle={
                    data.discountedOrdersCount === 0
                      ? "Sin descuentos aplicados"
                      : `${data.discountedOrdersCount} orden${data.discountedOrdersCount === 1 ? "" : "es"} con descuento`
                  }
                  color="#e65100"
                  iconColor="#e65100"
                  iconBg="rgba(230, 81, 0, 0.1)"
                  masked={privacyMode}
                />
              </Grid>
              {data.paymentBreakdown.map((payment) => {
                const isCash = payment.type === "CASH";
                const isCard = payment.type === "CARD_POS";
                const color = isCash
                  ? "#2e7d32"
                  : isCard
                    ? "#0288d1"
                    : "#ed6c02";
                const icon = isCash ? (
                  <AttachMoneyIcon fontSize="large" />
                ) : isCard ? (
                  <CreditCardIcon fontSize="large" />
                ) : (
                  <PhoneAndroidIcon fontSize="large" />
                );
                const originalAmount =
                  payment.currency === "USD" &&
                  payment.originalAmount !== undefined
                    ? ` · US$${payment.originalAmount.toFixed(2)} recibidos`
                    : "";
                return (
                  <Grid
                    key={payment.id}
                    size={{ xs: 12, sm: 6, md: 4, lg: 2 }}
                    display="flex"
                  >
                    <StatCard
                      title={payment.name}
                      value={`C$${payment.amount.toFixed(2)}`}
                      icon={icon}
                      subtitle={`${payment.transactionCount} pago${payment.transactionCount === 1 ? "" : "s"}${originalAmount}`}
                      color={color}
                      iconColor={color}
                      iconBg="action.hover"
                      masked={privacyMode}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </Grid>

          {/* Fila 2: gráfica y resúmenes laterales */}
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={3} alignItems="flex-start">
              <Grid size={{ xs: 12, lg: 8 }}>
                <SalesChart data={data.salesByTime} groupByDay={groupByDay} />
              </Grid>
              <Grid size={{ xs: 12, lg: 4 }}>
                <Stack spacing={3}>
                  <TopProductsList products={data.topProducts} />
                  <SalesChannelsCard
                    channels={data.channelsSummary}
                    masked={privacyMode}
                  />
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      ) : null}
    </Box>
  );
};

export default SalesReportsPage;

