import React, { useRef } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import StorageIcon from "@mui/icons-material/Storage";
import UpdateIcon from "@mui/icons-material/Update";
import DnsIcon from "@mui/icons-material/Dns";
import ScheduleIcon from "@mui/icons-material/Schedule";
import type { BackupItem, BackupConfig } from "../api/backupGateway";

interface BackupStatsHeaderProps {
  backups: BackupItem[];
  config: BackupConfig;
  generating: boolean;
  onGenerate: () => void;
  onFileSelectForRestore: (file: File) => void;
}

export const BackupStatsHeader: React.FC<BackupStatsHeaderProps> = ({
  backups,
  config,
  generating,
  onGenerate,
  onFileSelectForRestore,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const totalBytes = backups.reduce((acc, b) => acc + (b.sizeBytes || 0), 0);
  const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);
  const latestBackup = backups.length > 0 ? backups[0] : null;

  const formatLatestDate = (dateStr?: string) => {
    if (!dateStr) return "Sin copias aún";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelectForRestore(file);
    }
    // Limpiar input para permitir seleccionar el mismo archivo si es necesario
    if (event.target) {
      event.target.value = "";
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Botones de acción principales */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800} color="text.primary">
            Panel de Copias y Recuperación
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Garantiza la continuidad de tu negocio con respaldos atómicos y recuperación segura.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".sql"
            onChange={handleFileInputChange}
          />

          <Button
            variant="outlined"
            color="primary"
            startIcon={<UploadFileIcon />}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              px: 2.5,
              py: 1,
            }}
          >
            Subir Archivo .SQL
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={
              generating ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <AddIcon />
              )
            }
            disabled={generating}
            onClick={onGenerate}
            sx={{
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              py: 1,
              boxShadow: "0 4px 14px rgba(25, 118, 210, 0.35)",
            }}
          >
            {generating ? "Generando Copia..." : "+ Crear Respaldo Ahora"}
          </Button>
        </Box>
      </Box>

      {/* Tarjetas resumen de KPIs */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 2.5,
        }}
      >
        <Card
          elevation={0}
          sx={{
            p: 1,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: "primary.50",
                color: "primary.main",
                display: "flex",
              }}
            >
              <StorageIcon fontSize="medium" />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                TOTAL RESPALDOS
              </Typography>
              <Typography variant="h6" fontWeight={800}>
                {backups.length} {backups.length === 1 ? "archivo" : "archivos"}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            p: 1,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: "success.50",
                color: "success.main",
                display: "flex",
              }}
            >
              <UpdateIcon fontSize="medium" />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                ÚLTIMA COPIA
              </Typography>
              <Typography variant="h6" fontWeight={800} sx={{ fontSize: "0.95rem" }}>
                {formatLatestDate(latestBackup?.createdAt)}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            p: 1,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: "info.50",
                color: "info.main",
                display: "flex",
              }}
            >
              <DnsIcon fontSize="medium" />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                ALMACENAMIENTO LOCAL
              </Typography>
              <Typography variant="h6" fontWeight={800}>
                {totalMb} MB
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            p: 1,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: config.enabled ? "warning.50" : "grey.100",
                color: config.enabled ? "warning.main" : "text.disabled",
                display: "flex",
              }}
            >
              <ScheduleIcon fontSize="medium" />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                RESPALDO NOCTURNO
              </Typography>
              <Typography variant="h6" fontWeight={800} sx={{ fontSize: "0.95rem" }}>
                {config.enabled
                  ? `${String(config.hour).padStart(2, "0")}:${String(config.minute).padStart(2, "0")} hrs`
                  : "Desactivado"}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
