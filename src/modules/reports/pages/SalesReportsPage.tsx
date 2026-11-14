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
import { differenceInDays } from "date-fns";
import { getBusinessDateString } from "../../../shared/format";

type FilterType = "today" | "week" | "month" | "custom";

const YMD_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function parseYmdParts(ymd: string): { year: number; month: number; day: number } | null {
  if (!YMD_REGEX.test(ymd)) return null;
  const [year, month, day] = ymd.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(utc.getTime()) ||
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

function toManaguaStart(ymd: string): Date | null {
  if (!parseYmdParts(ymd)) return null;
  return new Date(`${ymd}T00:00:00.000-06:00`);
}

function toManaguaEnd(ymd: string): Date | null {
  if (!parseYmdParts(ymd)) return null;
  return new Date(`${ymd}T23:59:59.999-06:00`);
}

function shiftYmd(ymd: string, deltaDays: number): string {
  const parts = parseYmdParts(ymd);
  if (!parts) return ymd;
  const utc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + deltaDays));
  return utc.toISOString().slice(0, 10);
}

const SalesReportsPage = () => {
  const [privacyMode, setPrivacyMode] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("today");

  const [customStart, setCustomStart] = useState<string>(() =>
    getBusinessDateString(),
  );
  const [customEnd, setCustomEnd] = useState<string>(() =>
    getBusinessDateString(),
  );

  const { startDate, endDate, dateError } = useMemo(() => {
    const todayYmd = getBusinessDateString();
    const parts = parseYmdParts(todayYmd);

    switch (filterType) {
      case "today":
        return {
          startDate: toManaguaStart(todayYmd),
          endDate: toManaguaEnd(todayYmd),
          dateError: null as string | null,
        };
      case "week": {
        const utcToday = parts
          ? new Date(Date.UTC(parts.year, parts.month - 1, parts.day))
          : new Date();
        const dayOfWeek = utcToday.getUTCDay(); // 0=Dom .. 6=Sáb
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const weekStartYmd = shiftYmd(todayYmd, diffToMonday);
        const weekEndYmd = shiftYmd(weekStartYmd, 6);
        return {
          startDate: toManaguaStart(weekStartYmd),
          endDate: toManaguaEnd(weekEndYmd),
          dateError: null as string | null,
        };
      }
      case "month": {
        if (!parts) {
          return {
            startDate: null,
            endDate: null,
            dateError: "No se pudo calcular el rango mensual.",
          };
        }
        const mm = String(parts.month).padStart(2, "0");
        const lastDay = new Date(Date.UTC(parts.year, parts.month, 0)).getUTCDate();
        const monthStartYmd = `${parts.year}-${mm}-01`;
        const monthEndYmd = `${parts.year}-${mm}-${String(lastDay).padStart(2, "0")}`;
        return {
          startDate: toManaguaStart(monthStartYmd),
          endDate: toManaguaEnd(monthEndYmd),
          dateError: null as string | null,
        };
      }
      case "custom": {
        const start = toManaguaStart(customStart.trim());
        const end = toManaguaEnd(customEnd.trim());
        if (!start || !end) {
          return {
            startDate: null,
            endDate: null,
            dateError: "Selecciona ambas fechas en formato válido para generar el reporte.",
          };
        }
        if (start > end) {
          return {
            startDate: null,
            endDate: null,
            dateError: "La fecha inicial no puede ser mayor a la fecha final.",
          };
        }
        return {
          startDate: start,
          endDate: end,
          dateError: null as string | null,
        };
      }
      default:
        return {
          startDate: toManaguaStart(todayYmd),
          endDate: toManaguaEnd(todayYmd),
          dateError: null as string | null,
        };
    }
  }, [filterType, customStart, customEnd]);

  const { data, isLoading, error } = useSalesReport(startDate, endDate);
  const effectiveError = dateError ?? error;
  const averageTicket =
    data && data.totalOrders > 0 ? data.totalSales / data.totalOrders : 0;

  const daysDiff =
    startDate && endDate ? differenceInDays(endDate, startDate) : 0;
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

            <Box display="flex" gap={1} sx={{ "@media print": { display: "none" } }}>
              <IconButton
                onClick={() => setPrivacyMode(!privacyMode)}
                sx={{ bgcolor: "background.paper", boxShadow: 1 }}
                title={privacyMode ? "Mostrar montos" : "Ocultar montos (Privacidad)"}
              >
                {privacyMode ? <VisibilityIcon color="primary" /> : <VisibilityOffIcon color="primary" />}
              </IconButton>
              <IconButton
                onClick={() => window.print()}
                disabled={Boolean(effectiveError) || isLoading || !data}
                title="Imprimir reporte"
                sx={{ bgcolor: "background.paper", boxShadow: 1 }}
              >
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
      ) : effectiveError ? (
        <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
          <Typography color="error" variant="h6">{effectiveError}</Typography>
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

