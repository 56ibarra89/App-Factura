import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Grid, Paper, 
  alpha, Switch, TextField, MenuItem, Divider, Tooltip,
  Chip, Avatar
} from "@mui/material";
import { BackButton } from "../../components/BackButton";
import PrintIcon from "@mui/icons-material/Print";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import SettingsIcon from "@mui/icons-material/Settings";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import AddIcon from "@mui/icons-material/Add";
import PageHeader from "../../components/PageHeader";
import { LOGIN_COLORS, LOGIN_GRADIENTS } from "../../theme/loginTheme";
import { apiClient } from "../../config/apiClient";

interface Device {
  id: string;
  name: string;
  type: 'printer' | 'drawer' | 'scale';
  status: 'connected' | 'disconnected';
  details: string;
  isDefault?: boolean;
}

const Perifericos = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const data = await apiClient('/devices');
      setDevices(data);
    } catch (error) {
      console.error("Error al obtener los periféricos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    try {
      setScanning(true);
      await apiClient('/devices/scan', { method: 'POST' });
      await fetchDevices();
    } catch (error) {
      console.error("Error al escanear dispositivos:", error);
    } finally {
      setScanning(false);
    }
  };

  const renderDeviceCard = (device: Device) => {
    const isConnected = device.status === 'connected';

    return (
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 5,
          border: '1px solid',
          borderColor: isConnected ? alpha(LOGIN_COLORS.primary, 0.3) : 'divider',
          background: isConnected 
            ? (theme) => `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(LOGIN_COLORS.primary, 0.05)} 100%)`
            : 'background.paper',
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.06)',
            borderColor: LOGIN_COLORS.primary
          }
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Avatar 
            sx={{ 
              bgcolor: isConnected ? alpha(LOGIN_COLORS.primary, 0.1) : 'grey.100',
              color: isConnected ? LOGIN_COLORS.primary : 'grey.500',
              width: 52, height: 52,
              borderRadius: 4
            }}
          >
            {device.type === 'printer' && <PrintIcon fontSize="medium" />}
            {device.type === 'drawer' && <PointOfSaleIcon fontSize="medium" />}
          </Avatar>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title={isConnected ? "Conectado" : "Desconectado"}>
              {isConnected 
                ? <CheckCircleIcon sx={{ color: '#2ecc71', fontSize: 18 }} />
                : <ErrorIcon sx={{ color: '#e74c3c', fontSize: 18 }} />
              }
            </Tooltip>
            <Switch size="small" checked={isConnected} color="primary" />
          </Box>
        </Box>

        <Typography variant="subtitle1" fontWeight="900" noWrap>
          {device.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
          {device.details}
        </Typography>

        <Divider sx={{ mb: 2, opacity: 0.6 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button 
            size="small" 
            variant="text" 
            startIcon={<SettingsIcon />}
            sx={{ fontWeight: 'bold', textTransform: 'none' }}
          >
            Configurar
          </Button>
          {device.isDefault && (
            <Chip 
              label="Principal" 
              color="primary" 
              size="small" 
              sx={{ 
                fontWeight: 900, 
                fontSize: '0.65rem', 
                height: 20,
                borderRadius: 1.5,
                boxShadow: `0 4px 10px ${alpha(LOGIN_COLORS.primary, 0.3)}`
              }} 
            />
          )}
        </Box>
      </Paper>
    );
  };

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: 'background.default',
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
              onClick={handleScan}
              disabled={scanning}
              variant="outlined"
              startIcon={<RefreshIcon />}
              sx={{ borderRadius: 3, bgcolor: "background.paper", fontWeight: 'bold', textTransform: 'none' }}
            >
              {scanning ? "Escaneando..." : "Escanear Dispositivos"}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ borderRadius: 3, bgcolor: LOGIN_COLORS.primary, fontWeight: 'bold', textTransform: 'none' }}
            >
              Agregar Manualmente
            </Button>
          </Box>
        }
      />

      <Box sx={{ mt: 3, mb: 6 }}>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '100%', mb: 4 }}>
          Configura y administra el hardware conectado a tu sistema. Puedes gestionar múltiples impresoras térmicas para diferentes áreas 
          y configurar la apertura automática de tus gavetas de dinero.
        </Typography>

        <Grid container spacing={4}>
          {/* Sección de Impresoras */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <PrintIcon color="primary" />
              <Typography variant="h6" fontWeight="800">Impresoras Térmicas</Typography>
              <Divider sx={{ flex: 1, opacity: 0.5 }} />
            </Box>
            <Grid container spacing={2}>
              {devices.filter(d => d.type === 'printer').map(device => (
                <Grid size={{ xs: 12, sm: 6 }} key={device.id}>
                  {renderDeviceCard(device)}
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Sección de Gavetas */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <PointOfSaleIcon color="primary" />
              <Typography variant="h6" fontWeight="800">Gavetas de Dinero</Typography>
              <Divider sx={{ flex: 1, opacity: 0.5 }} />
            </Box>
            <Grid container spacing={2}>
              {devices.filter(d => d.type === 'drawer').map(device => (
                <Grid size={{ xs: 12, sm: 6 }} key={device.id}>
                  {renderDeviceCard(device)}
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {/* Panel de Configuración General Rápida */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 6,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: alpha(LOGIN_COLORS.primary, 0.02),
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
        }}
      >
        <Typography variant="h6" fontWeight="900" mb={3}>Configuración Global de Hardware</Typography>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Comportamiento de Impresión</Typography>
            <TextField select fullWidth size="small" defaultValue="auto">
              <MenuItem value="auto">Impresión Automática (Al facturar)</MenuItem>
              <MenuItem value="manual">Confirmación Manual</MenuItem>
              <MenuItem value="none">No imprimir automáticamente</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Apertura de Gaveta</Typography>
            <TextField select fullWidth size="small" defaultValue="payment">
              <MenuItem value="payment">Al recibir pago en efectivo</MenuItem>
              <MenuItem value="any">En cualquier método de pago</MenuItem>
              <MenuItem value="manual">Solo apertura manual por Admin</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Perifericos;
