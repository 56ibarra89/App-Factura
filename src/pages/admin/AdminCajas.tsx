import { Box, Container, Typography, Grid, Tabs, Tab } from "@mui/material";
import { useState } from "react";
import { BackButton } from "../../components/BackButton";

import PageHeader from "../../components/PageHeader";
import { LOGIN_GRADIENTS, LOGIN_COLORS } from "../../theme/loginTheme";
import { useAdminCajasData } from "../../hooks/useAdminCajasData";
import { useCajasConfig } from "../../hooks/useCajasConfig";
import { CajaStatusCard } from "../../components/Admin/CajaStatusCard";
import { WaiterPerformanceList } from "../../components/Admin/WaiterPerformanceList";
import { CajasConfigTab } from "../../components/Admin/CajasConfigTab";
import { TurnosConfigTab } from "../../components/Admin/TurnosConfigTab";

const AdminCajas = () => {
  const { cajasActivas, waiterPerformance } = useAdminCajasData();
  const {
    cajas,
    turnos,
    addCaja,
    updateCaja,
    deleteCaja,
    addTurno,
    updateTurno,
    deleteTurno,
  } = useCajasConfig();

  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

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
          startContent={<BackButton to="/admin" />}
        />

        <Box sx={{ mt: 2, mb: 4, pl: 1 }}>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 650 }}>
            Visualiza el estado en tiempo real de las estaciones de cobro, gestiona los perfiles de turnos laborales
            y define los montos de apertura en efectivo predeterminados del sistema.
          </Typography>
        </Box>

        {/* Pestañas de Navegación */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              "& .MuiTab-root": {
                fontWeight: "bold",
                textTransform: "none",
                fontSize: "1rem",
              },
            }}
          >
            <Tab label="Monitoreo en Vivo" />
            <Tab label="Configuración de Cajas" />
            <Tab label="Perfiles de Turnos" />
          </Tabs>
        </Box>

        <Container maxWidth={false} disableGutters>
          {/* Tab 0: Monitoreo en Vivo */}
          {activeTab === 0 && (
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
          )}

          {/* Tab 1: Configuración de Cajas */}
          {activeTab === 1 && (
            <CajasConfigTab
              cajas={cajas}
              onAdd={addCaja}
              onUpdate={updateCaja}
              onDelete={deleteCaja}
            />
          )}

          {/* Tab 2: Perfiles de Turnos */}
          {activeTab === 2 && (
            <TurnosConfigTab
              turnos={turnos}
              onAdd={addTurno}
              onUpdate={updateTurno}
              onDelete={deleteTurno}
            />
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default AdminCajas;
