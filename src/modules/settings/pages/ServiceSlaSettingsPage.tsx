import { useState } from "react";
import type { ReactNode } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import SpeedIcon from "@mui/icons-material/Speed";
import { BackButton, PageHeader } from "../../../shared/ui";
import { useServiceSlaConfig } from "../hooks/useServiceSlaConfig";
import type { SlaMetricSummary } from "../model/serviceSla.types";

function MetricCard({
  title,
  summary,
  icon,
}: {
  title: string;
  summary: SlaMetricSummary;
  icon: ReactNode;
}) {
  return (
    <Card variant="outlined" sx={{ height: "100%", borderRadius: 3 }}>
      <CardContent>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
          {icon}
          <Typography fontWeight={900}>{title}</Typography>
        </Stack>
        <Typography variant="h4" fontWeight={900} color="primary.main">
          {summary.averageMinutes.toFixed(1)} min
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Promedio de {summary.completed} servicios completados
        </Typography>
        <Chip
          sx={{ mt: 1.5, fontWeight: 800 }}
          color={summary.onTimePercent >= 80 ? "success" : "warning"}
          label={`${summary.onTimePercent}% dentro del objetivo`}
        />
      </CardContent>
    </Card>
  );
}

export default function ServiceSlaSettingsPage() {
  const { config, metrics, isLoading, isSaving, update, save } =
    useServiceSlaConfig({ loadMetrics: true, pollMs: 0 });
  const [message, setMessage] = useState<{
    text: string;
    severity: "success" | "error";
  } | null>(null);

  const handleSave = async () => {
    if (config.kitchenCriticalMinutes <= config.kitchenWarningMinutes) {
      setMessage({
        text: "El límite crítico debe ser mayor que el límite de atención.",
        severity: "error",
      });
      return;
    }
    try {
      await save();
      setMessage({
        text: "Tiempos de servicio guardados.",
        severity: "success",
      });
    } catch {
      setMessage({
        text: "No se pudo guardar la configuración de tiempos.",
        severity: "error",
      });
    }
  };

  return (
    <Box minHeight="100vh" bgcolor="background.default" p={{ xs: 2, md: 4 }}>
      <PageHeader
        title="Tiempos de Servicio y Alertas"
        startContent={<BackButton to="/admin" />}
        actions={
          <Button
            variant="contained"
            startIcon={
              isSaving ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            disabled={isLoading || isSaving}
            onClick={() => void handleSave()}
          >
            Guardar cambios
          </Button>
        }
      />

      <Typography color="text.secondary" maxWidth={800} mb={4}>
        Define los objetivos operativos del KDS y delivery. Los cambios se
        aplican a todas las terminales conectadas al backend.
      </Typography>

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: "100%", borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                  <RestaurantIcon color="primary" />
                  <Box>
                    <Typography variant="h6" fontWeight={900}>
                      Semáforo de cocina KDS
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tiempo contado desde que el pedido se envía a cocina.
                    </Typography>
                  </Box>
                </Stack>
                <Stack spacing={2.5}>
                  <TextField
                    label="Atención desde (minutos)"
                    type="number"
                    value={config.kitchenWarningMinutes}
                    onChange={(event) =>
                      update(
                        "kitchenWarningMinutes",
                        Number(event.target.value),
                      )
                    }
                    slotProps={{ htmlInput: { min: 1, max: 240 } }}
                    helperText="Antes de este tiempo la tarjeta permanece verde."
                  />
                  <TextField
                    label="Crítico desde (minutos)"
                    type="number"
                    value={config.kitchenCriticalMinutes}
                    onChange={(event) =>
                      update(
                        "kitchenCriticalMinutes",
                        Number(event.target.value),
                      )
                    }
                    slotProps={{ htmlInput: { min: 2, max: 360 } }}
                    helperText="A partir de este tiempo la tarjeta será roja y parpadeará."
                  />
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      color="success"
                      label={`0–${config.kitchenWarningMinutes - 1} min · A tiempo`}
                    />
                    <Chip
                      color="warning"
                      label={`${config.kitchenWarningMinutes}–${config.kitchenCriticalMinutes - 1} min · Atención`}
                    />
                    <Chip
                      color="error"
                      label={`${config.kitchenCriticalMinutes}+ min · Urgente`}
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: "100%", borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                  <TwoWheelerIcon color="error" />
                  <Box>
                    <Typography variant="h6" fontWeight={900}>
                      Delivery en ruta
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tiempo contado cuando el motorizado pulsa “Iniciar ruta”.
                    </Typography>
                  </Box>
                </Stack>
                <Stack spacing={2.5}>
                  <TextField
                    label="Tiempo máximo de entrega (minutos)"
                    type="number"
                    value={config.deliveryMaxMinutes}
                    onChange={(event) =>
                      update("deliveryMaxMinutes", Number(event.target.value))
                    }
                    slotProps={{ htmlInput: { min: 5, max: 720 } }}
                    helperText="Al superarlo se avisará al administrador, despachador y cajero responsable."
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.deliveryAlertsEnabled}
                        onChange={(_, checked) =>
                          update("deliveryAlertsEnabled", checked)
                        }
                      />
                    }
                    label="Generar alertas automáticas por retraso"
                  />
                  <Alert
                    severity={config.deliveryAlertsEnabled ? "info" : "warning"}
                  >
                    {config.deliveryAlertsEnabled
                      ? `El backend revisará cada minuto los pedidos que superen ${config.deliveryMaxMinutes} minutos en ruta.`
                      : "El semáforo visual seguirá activo, pero no se crearán notificaciones."}
                  </Alert>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={1} alignItems="center" mt={1}>
              <SpeedIcon color="primary" />
              <Typography variant="h6" fontWeight={900}>
                Rendimiento de los últimos 30 días
              </Typography>
            </Stack>
          </Grid>
          {metrics ? (
            <>
              <Grid size={{ xs: 12, md: 6 }}>
                <MetricCard
                  title="Preparación en cocina"
                  summary={metrics.kitchen}
                  icon={<RestaurantIcon color="primary" />}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <MetricCard
                  title="Entrega en ruta"
                  summary={metrics.delivery}
                  icon={<TwoWheelerIcon color="error" />}
                />
              </Grid>
            </>
          ) : (
            <Grid size={{ xs: 12 }}>
              <Alert severity="info">
                Las métricas comenzarán a mostrarse al completar servicios con
                las nuevas marcas de tiempo.
              </Alert>
            </Grid>
          )}
        </Grid>
      )}

      <Snackbar
        open={Boolean(message)}
        autoHideDuration={4500}
        onClose={() => setMessage(null)}
      >
        <Alert severity={message?.severity} onClose={() => setMessage(null)}>
          {message?.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}
