import { Box, Container, IconButton, Typography, Grid } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/PageHeader";
import { LOGIN_GRADIENTS, LOGIN_COLORS } from "../../theme/loginTheme";
import { useAdminCajasData } from "../../hooks/useAdminCajasData";
import { CajaStatusCard } from "../../components/Admin/CajaStatusCard";
import { WaiterPerformanceList } from "../../components/Admin/WaiterPerformanceList";

const AdminCajas = () => {
  const navigate = useNavigate();
  const { cajasActivas, waiterPerformance } = useAdminCajasData();

  return (
    <Box
      minHeight="100vh"
      sx={{
        background: LOGIN_GRADIENTS.pageBackground,
        pt: 4,
        pb: 8,
        px: { xs: 2, md: 6 },
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {/* Decorative Background Element */}
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
          pointerEvents: "none"
        }}
      />

      <Box position="relative" zIndex={1}>
        <PageHeader
          title="Administración de Cajas"
          startContent={
            <IconButton 
              onClick={() => navigate("/admin")} 
              sx={{ bgcolor: "white", boxShadow: 1, mr: 2, "&:hover": { bgcolor: "grey.100" } }}
            >
              <ArrowBackIcon color="primary" />
            </IconButton>
          }
        />

        <Box sx={{ mt: 2, mb: 5, pl: 1 }}>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 650 }}>
            Visualiza el estado en tiempo real de todas las sucursales y estaciones de cobro activas. 
            Supervisa los ingresos por método de pago y el rendimiento de tu personal de atención.
          </Typography>
        </Box>

        <Container maxWidth={false} disableGutters>
          <Grid container spacing={4}>
            {/* Left Column: Cajas Activas */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ mb: 3 }}>
                Cajas Trabajando ({cajasActivas.length})
              </Typography>
              <Grid container spacing={3}>
                {cajasActivas.map((caja) => (
                  <Grid size={{ xs: 12, md: 6 }} key={caja.id}>
                    <CajaStatusCard caja={caja} />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Right Column: Meseros / Rendimiento */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <WaiterPerformanceList waiters={waiterPerformance} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminCajas;
