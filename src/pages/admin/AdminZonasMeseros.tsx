import { useState, useMemo, useEffect } from "react";
import { Box, Grid, Snackbar, Alert } from "@mui/material";
import { BackButton } from "../../components/BackButton";
import PageHeader from "../../components/PageHeader";
import { useAccountManager } from "../../hooks/useAccountManager";
import { useMesasConfig } from "../../hooks/useMesasConfig";
import { useWaiterZones } from "../../hooks/useWaiterZones";
import WaiterList from "../../components/AdminZonasMeseros/WaiterList";
import WaiterZonesEditor from "../../components/AdminZonasMeseros/WaiterZonesEditor";

export default function AdminZonasMeseros() {
  const { users } = useAccountManager();
  const { floorsConfig } = useMesasConfig();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const {
    currentZones,
    loadingZones,
    savingZones,
    toast,
    fetchZones,
    saveZones,
    closeToast,
    setZone,
    clearZones
  } = useWaiterZones();

  const meseros = useMemo(() => {
    return users.filter((u) => u.role === "mesero");
  }, [users]);

  const selectedUser = meseros.find((u) => u.id === selectedUserId) || null;

  useEffect(() => {
    if (selectedUserId) {
      fetchZones(selectedUserId);
    } else {
      clearZones();
    }
  }, [selectedUserId, fetchZones, clearZones]);

  const handleSave = async () => {
    if (selectedUserId) {
      await saveZones(selectedUserId, currentZones);
    }
  };

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: 'background.default',
        pt: 2,
        pb: 4,
        px: { xs: 2, md: 6 },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PageHeader
        title="Asignación de Zonas (Meseros)"
        startContent={<BackButton to="/admin" />}
      />

      <Grid container spacing={3} sx={{ mt: 1, flex: 1 }}>
        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <WaiterList 
            waiters={meseros} 
            selectedUserId={selectedUserId} 
            onSelect={setSelectedUserId} 
          />
        </Grid>

        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
          <WaiterZonesEditor 
            selectedUser={selectedUser}
            floorsConfig={floorsConfig}
            currentZones={currentZones}
            onZoneChange={setZone}
            onSave={handleSave}
            loading={loadingZones}
            saving={savingZones}
          />
        </Grid>
      </Grid>

      <Snackbar 
        open={toast.open} 
        autoHideDuration={4000} 
        onClose={closeToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={closeToast} severity={toast.severity} sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
