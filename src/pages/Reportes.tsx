import { Box, Grid, CircularProgress, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import { useNavigate } from "react-router-dom";
import { useDailyReport } from "../hooks/useDailyReport";
import { StatCard } from "../components/Reportes/StatCard";
import { TopProductsList } from "../components/Reportes/TopProductsList";
import { SalesChart } from "../components/Reportes/SalesChart";
import PageHeader from "../components/PageHeader";
import { LOGIN_GRADIENTS } from "../theme/loginTheme";

const Reportes = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useDailyReport();

  return (
    <Box
      minHeight="100vh"
      sx={{
        background: LOGIN_GRADIENTS.pageBackground,
        pt: 4,
        pb: 4,
        px: { xs: 2, md: 6 },
        display: "flex",
        flexDirection: "column",
        gap: 2
      }}
    >
      <PageHeader
        title="Reporte del Día"
        startContent={
          <IconButton 
            onClick={() => navigate("/home")} 
            sx={{ bgcolor: "white", boxShadow: 1, mr: 2, "&:hover": { bgcolor: "grey.100" } }}
          >
            <ArrowBackIcon color="primary" />
          </IconButton>
        }
        actions={
          <IconButton sx={{ bgcolor: "white", boxShadow: 1 }}>
            <LocalPrintshopIcon color="primary" />
          </IconButton>
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
          {/* Tarjetas de Estadísticas Top */}
          <Grid size={{ xs: 12, md: 6 }}>
            <StatCard
              title="Ventas Totales (Entregadas)"
              value={`$${data.totalSales.toFixed(2)}`}
              icon={<AttachMoneyIcon fontSize="large" />}
              subtitle="Ingresos del día"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <StatCard
              title="Órdenes Completadas"
              value={data.totalOrders}
              icon={<ReceiptIcon fontSize="large" />}
              subtitle="Facturas exitosas"
            />
          </Grid>

          {/* Gráfico de Ventas por Hora */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <SalesChart data={data.salesByHour} />
          </Grid>

          {/* Lista de Productos Top */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <TopProductsList products={data.topProducts} />
          </Grid>
        </Grid>
      ) : null}
    </Box>
  );
};

export default Reportes;
