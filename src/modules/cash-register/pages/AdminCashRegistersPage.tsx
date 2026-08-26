import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Alert,
  Stack,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { BackButton, PageHeader } from "../../../shared/ui";
import { LOGIN_COLORS } from "../../../shared/theme";
import { useCashRegisterDashboard } from "../hooks/useCashRegisterDashboard";
import { CashRegisterStatusCard } from "../ui/admin/CashRegisterStatusCard";
import { WaiterPerformanceList } from "../ui/admin/WaiterPerformanceList";
import { LiveKpiCards } from "../ui/admin/LiveKpiCards";

const AdminCashRegistersPage = () => {
  const {
    cajasActivas,
    waiterPerformance,
    liveKpis,
    loading,
    isRefreshing,
    lastUpdated,
    reloadDashboard,
  } = useCashRegisterDashboard();

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: "background.default",
        pt: 4,
        pb: 8,
        px: { xs: 2, md: 6 },
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Glow background */}
      <Box
        sx={{
          position: "absolute",
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          background: `radial-gradient(circle, ${LOGIN_COLORS.primarySubtle} 0%, rgba(255,255,255,0) 70%)`,
          borderRadius: "50%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <Box position="relative" zIndex={1}>
        <PageHeader
          title="Monitoreo de Cajas en Vivo"
          startContent={<BackButton to="/admin" />}
          actions={
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Actualizado: {lastUpdated.toLocaleTimeString()}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={
                  <RefreshIcon
                    sx={{
                      animation: isRefreshing ? "spin 1s linear infinite" : "none",
                      "@keyframes spin": {
                        "0%": { transform: "rotate(0deg)" },
                        "100%": { transform: "rotate(360deg)" },
                      },
                    }}
                  />
                }
                onClick={() => void reloadDashboard()}
                disabled={isRefreshing}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  bgcolor: "background.paper",
                }}
              >
                {isRefreshing ? "Actualizando..." : "Actualizar"}
              </Button>
            </Stack>
          }
        />

        <Box sx={{ mt: 2, mb: 4, pl: 1 }}>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700 }}>
            Visualiza en tiempo real las cajas abiertas, el flujo de ingresos en efectivo, tarjeta
            y app, así como el rendimiento del personal en sala.
          </Typography>
        </Box>

        <Container maxWidth={false} disableGutters>
          {/* Barra superior de KPIs Globales */}
          <LiveKpiCards kpis={liveKpis} loading={loading} />

          <Grid container spacing={4}>
            {/* Left Column: Cajas Activas */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Typography
                variant="h5"
                fontWeight={800}
                color="text.primary"
                sx={{ mb: 3 }}
              >
                Cajas Trabajando ({cajasActivas.length})
              </Typography>

              {cajasActivas.length === 0 && !loading ? (
                <Alert
                  severity="info"
                  sx={{
                    borderRadius: 3.5,
                    fontWeight: 600,
                    border: "1px solid",
                    borderColor: "info.light",
                    p: 2,
                  }}
                >
                  No hay estaciones de caja abiertas en este momento. Las cajas abiertas
                  por cajeros principales o despachadores aparecerán aquí automáticamente.
                </Alert>
              ) : (
                <Grid container spacing={3}>
                  {cajasActivas.map((caja) => (
                    <Grid size={{ xs: 12, md: 6 }} key={caja.id}>
                      <CashRegisterStatusCard caja={caja} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>

            {/* Right Column: Meseros / Rendimiento */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <WaiterPerformanceList
                waiters={waiterPerformance}
                loading={loading}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminCashRegistersPage;
