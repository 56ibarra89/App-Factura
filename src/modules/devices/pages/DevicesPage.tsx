import {
  Box,
  Button,
  Grid,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { BackButton, PageHeader } from "../../../shared/ui";
import DeviceSection from "../ui/admin/DeviceSection";
import HardwareSettingsPanel from "../ui/admin/HardwareSettingsPanel";
import { useAdminDevices } from "../hooks/useAdminDevices";
import { LOGIN_COLORS } from "../../../shared/theme";
import type { DeviceGateway } from "../api/deviceGateway";

interface PerifericosProps {
  gateway?: DeviceGateway;
}

const DevicesPage = ({ gateway }: PerifericosProps) => {
  const devices = useAdminDevices(gateway);

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: "background.default",
        pt: 2,
        pb: 8,
        px: { xs: 2, md: 6 },
      }}
    >
      <PageHeader
        title="Gestión de Periféricos"
        startContent={<BackButton to="/admin" />}
        actions={
          <Box display="flex" gap={1.5}>
            <Button
              onClick={devices.scan}
              disabled={devices.scanning}
              variant="outlined"
              startIcon={<RefreshIcon />}
              sx={{
                borderRadius: 3,
                bgcolor: "background.paper",
                fontWeight: "bold",
                textTransform: "none",
              }}
            >
              {devices.scanning ? "Escaneando..." : "Escanear Dispositivos"}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                borderRadius: 3,
                bgcolor: LOGIN_COLORS.primary,
                fontWeight: "bold",
                textTransform: "none",
              }}
            >
              Agregar Manualmente
            </Button>
          </Box>
        }
      />

      <Box sx={{ mt: 3, mb: 6 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Configura y administra el hardware conectado a tu sistema, incluyendo
          impresoras térmicas y gavetas de dinero.
        </Typography>
        <Grid container spacing={4}>
          <DeviceSection
            devices={devices.devices}
            type="printer"
          />
          <DeviceSection
            devices={devices.devices}
            type="drawer"
          />
        </Grid>
      </Box>

      <HardwareSettingsPanel />
    </Box>
  );
};

export default DevicesPage;
