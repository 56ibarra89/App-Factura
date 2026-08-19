import { Box, Container, Typography, Grid, Tabs, Tab } from "@mui/material";
import { useState } from "react";
import { BackButton, PageHeader } from "../../../shared/ui";

import { LOGIN_COLORS } from "../../../shared/theme";
import { useCashRegisterDashboard } from "../hooks/useCashRegisterDashboard";
import { useCashRegisterConfig } from "../hooks/useCashRegisterConfig";
import { CashRegisterStatusCard } from "../ui/admin/CashRegisterStatusCard";
import { WaiterPerformanceList } from "../ui/admin/WaiterPerformanceList";
import { CashRegisterConfigTab } from "../ui/admin/CashRegisterConfigTab";
import { ShiftProfileConfigTab } from "../ui/admin/ShiftProfileConfigTab";

const AdminCashRegistersPage = () => {
  const { cajasActivas, waiterPerformance } = useCashRegisterDashboard();
  const {
    cajas,
    turnos,
    addCaja,
    updateCaja,
    deleteCaja,
    addTurno,
    updateTurno,
    deleteTurno,
  } = useCashRegisterConfig();

  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: 'background.default',
        pt: 4,
        pb: 8,
        px: { xs: 2, md: 6 },
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {}
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
                      <CashRegisterStatusCard caja={caja} />
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
            <CashRegisterConfigTab
              cajas={cajas}
              onAdd={addCaja}
              onUpdate={updateCaja}
              onDelete={deleteCaja}
            />
          )}

          {/* Tab 2: Perfiles de Turnos */}
          {activeTab === 2 && (
            <ShiftProfileConfigTab
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

export default AdminCashRegistersPage;

