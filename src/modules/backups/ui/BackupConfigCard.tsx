import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  CircularProgress,
  MenuItem,
  TextField,
  Chip,
  Alert,
} from "@mui/material";
import SettingsBackupRestoreIcon from "@mui/icons-material/SettingsBackupRestore";
import SaveIcon from "@mui/icons-material/Save";
import AutoModeIcon from "@mui/icons-material/AutoMode";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import type { BackupConfig } from "../api/backupGateway";

interface BackupConfigCardProps {
  config: BackupConfig;
  saving: boolean;
  onSave: (config: Partial<BackupConfig>) => void;
}

export const BackupConfigCard: React.FC<BackupConfigCardProps> = ({
  config,
  saving,
  onSave,
}) => {
  const [enabled, setEnabled] = useState(config.enabled);
  const [hour, setHour] = useState(config.hour);
  const [minute, setMinute] = useState(config.minute);
  const [backupOnShiftClose, setBackupOnShiftClose] = useState(
    config.backupOnShiftClose
  );
  const [retentionDays, setRetentionDays] = useState(config.retentionDays);

  useEffect(() => {
    setEnabled(config.enabled);
    setHour(config.hour);
    setMinute(config.minute);
    setBackupOnShiftClose(config.backupOnShiftClose);
    setRetentionDays(config.retentionDays);
  }, [config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      enabled,
      hour,
      minute,
      backupOnShiftClose,
      retentionDays,
    });
  };

  const hasChanges =
    enabled !== config.enabled ||
    hour !== config.hour ||
    minute !== config.minute ||
    backupOnShiftClose !== config.backupOnShiftClose ||
    retentionDays !== config.retentionDays;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: "primary.50",
              color: "primary.main",
              display: "flex",
            }}
          >
            <SettingsBackupRestoreIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Automatización y Retención
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Reglas inteligentes para proteger tus datos sin intervención manual
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2.5 }} />

        <Box component="form" onSubmit={handleSubmit}>
          {/* Opción 1: Respaldo nocturno programado */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AutoModeIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight={700}>
                  Respaldo Diario Nocturno
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    color="primary"
                  />
                }
                label=""
                sx={{ m: 0 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
              Ejecuta un volcado completo de la base de datos a la hora de menor actividad comercial.
            </Typography>

            {enabled && (
              <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 1, bgcolor: "grey.50", p: 1.5, borderRadius: 2 }}>
                <TextField
                  select
                  size="small"
                  label="Hora"
                  value={hour}
                  onChange={(e) => setHour(Number(e.target.value))}
                  sx={{ width: 110, bgcolor: "background.paper" }}
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <MenuItem key={i} value={i}>
                      {String(i).padStart(2, "0")}:00 ({i < 12 ? "AM" : "PM"})
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  size="small"
                  label="Minuto"
                  value={minute}
                  onChange={(e) => setMinute(Number(e.target.value))}
                  sx={{ width: 100, bgcolor: "background.paper" }}
                >
                  {[0, 15, 30, 45].map((m) => (
                    <MenuItem key={m} value={m}>
                      :{String(m).padStart(2, "0")}
                    </MenuItem>
                  ))}
                </TextField>

                <Chip
                  label={`Hora programada: ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 2.5 }} />

          {/* Opción 2: Respaldo al cierre de caja */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PointOfSaleIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight={700}>
                  Respaldo al Cierre de Caja
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={backupOnShiftClose}
                    onChange={(e) => setBackupOnShiftClose(e.target.checked)}
                    color="primary"
                  />
                }
                label=""
                sx={{ m: 0 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Genera automáticamente una copia de seguridad cada vez que un cajero realiza el cierre final de su turno.
            </Typography>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          {/* Opción 3: Política de Retención */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <DeleteSweepIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={700}>
                Política de Retención y Limpieza
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Las copias de seguridad anteriores al período seleccionado serán depuradas automáticamente para optimizar espacio en disco.
            </Typography>

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              {[15, 30, 60].map((days) => (
                <Chip
                  key={days}
                  label={`${days} días`}
                  clickable
                  color={retentionDays === days ? "primary" : "default"}
                  variant={retentionDays === days ? "filled" : "outlined"}
                  onClick={() => setRetentionDays(days)}
                  sx={{ fontWeight: 700, px: 1 }}
                />
              ))}
            </Box>
          </Box>

          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            Los snapshots de seguridad preventivos generados antes de una restauración se protegen y no se eliminan durante la limpieza estándar.
          </Alert>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={saving || !hasChanges}
              startIcon={
                saving ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
              sx={{
                borderRadius: 2,
                px: 3,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              {saving ? "Guardando..." : "Guardar Reglas"}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
