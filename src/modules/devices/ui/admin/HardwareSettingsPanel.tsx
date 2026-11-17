import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { runtimeConfigGateway } from "../../../../shared/api";
import { PERMISSIONS, useAuth } from "../../../auth";

const HARDWARE_SETTINGS_KEY = "hardware_global_settings";

type PrintBehavior = "auto" | "manual" | "none";
type DrawerTrigger = "payment" | "any" | "manual";

interface HardwareGlobalSettings {
  printBehavior: PrintBehavior;
  drawerTrigger: DrawerTrigger;
}

const DEFAULT_SETTINGS: HardwareGlobalSettings = {
  printBehavior: "auto",
  drawerTrigger: "payment",
};

const VALID_PRINT_BEHAVIORS = new Set<PrintBehavior>(["auto", "manual", "none"]);
const VALID_DRAWER_TRIGGERS = new Set<DrawerTrigger>(["payment", "any", "manual"]);

const normalizeSettings = (
  raw: Partial<HardwareGlobalSettings> | null,
): HardwareGlobalSettings => ({
  printBehavior:
    raw?.printBehavior && VALID_PRINT_BEHAVIORS.has(raw.printBehavior)
      ? raw.printBehavior
      : DEFAULT_SETTINGS.printBehavior,
  drawerTrigger:
    raw?.drawerTrigger && VALID_DRAWER_TRIGGERS.has(raw.drawerTrigger)
      ? raw.drawerTrigger
      : DEFAULT_SETTINGS.drawerTrigger,
});

export default function HardwareSettingsPanel() {
  const { hasPermission } = useAuth();
  const canManageSettings = hasPermission(PERMISSIONS.SETTINGS_MANAGE);
  const [settings, setSettings] =
    useState<HardwareGlobalSettings>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] =
    useState<HardwareGlobalSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    severity: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const stored =
          await runtimeConfigGateway.get<Partial<HardwareGlobalSettings>>(
            HARDWARE_SETTINGS_KEY,
          );
        if (!active) return;
        const normalized = normalizeSettings(stored);
        setSettings(normalized);
        setSavedSettings(normalized);
      } catch (err) {
        if (!active) return;
        setFeedback({
          severity: "error",
          message:
            err instanceof Error
              ? err.message
              : "No se pudo cargar la configuración global de hardware.",
        });
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const isDirty =
    settings.printBehavior !== savedSettings.printBehavior ||
    settings.drawerTrigger !== savedSettings.drawerTrigger;

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await runtimeConfigGateway.save(HARDWARE_SETTINGS_KEY, settings);
      setSavedSettings(settings);
      setFeedback({
        severity: "success",
        message: "Configuración global de hardware guardada.",
      });
    } catch (err) {
      setFeedback({
        severity: "error",
        message:
          err instanceof Error
            ? err.message
            : "No se pudo guardar la configuración global de hardware.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "none",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        mb={3}
      >
        <Typography variant="h6" fontWeight="900">
          Configuración Global de Hardware
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<SaveIcon />}
          disabled={loading || saving || !isDirty || !canManageSettings}
          onClick={() => void handleSave()}
        >
          {saving ? "Guardando..." : "Guardar preferencias"}
        </Button>
      </Stack>

      {feedback && (
        <Box mb={2.5}>
          <Alert severity={feedback.severity} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        </Box>
      )}

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Comportamiento de Impresión
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            disabled={loading || saving || !canManageSettings}
            value={settings.printBehavior}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                printBehavior: e.target.value as PrintBehavior,
              }))
            }
          >
            <MenuItem value="auto">Impresión Automática (Al facturar)</MenuItem>
            <MenuItem value="manual">Confirmación Manual</MenuItem>
            <MenuItem value="none">No imprimir automáticamente</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Apertura de Gaveta
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            disabled={loading || saving || !canManageSettings}
            value={settings.drawerTrigger}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                drawerTrigger: e.target.value as DrawerTrigger,
              }))
            }
          >
            <MenuItem value="payment">Al recibir pago en efectivo</MenuItem>
            <MenuItem value="any">En cualquier método de pago</MenuItem>
            <MenuItem value="manual">Solo apertura manual por Admin</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </Paper>
  );
}
