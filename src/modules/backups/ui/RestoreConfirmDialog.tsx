import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ShieldIcon from "@mui/icons-material/Shield";
import type { BackupItem } from "../api/backupGateway";

interface RestoreConfirmDialogProps {
  open: boolean;
  item: BackupItem | null;
  file: File | null;
  restoring: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const RestoreConfirmDialog: React.FC<RestoreConfirmDialogProps> = ({
  open,
  item,
  file,
  restoring,
  onClose,
  onConfirm,
}) => {
  const sourceName = file ? file.name : item?.filename || "archivo seleccionado";

  return (
    <Dialog
      open={open}
      onClose={restoring ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 1 },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            bgcolor: "warning.50",
            color: "warning.main",
            display: "flex",
          }}
        >
          <WarningAmberIcon fontSize="medium" />
        </Box>
        <Typography variant="h6" fontWeight={800}>
          ¿Confirmar Restauración del Sistema?
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 2 }}>
          <strong>Acción Crítica:</strong> Al restaurar la base de datos, toda la información actual del sistema será reemplazada por los registros contenidos en este archivo.
        </Alert>

        <Box sx={{ mb: 2, bgcolor: "grey.50", p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            ARCHIVO ORIGEN:
          </Typography>
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{ fontFamily: "monospace", color: "text.primary", mt: 0.5 }}
          >
            {sourceName}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", bgcolor: "primary.50", p: 2, borderRadius: 2 }}>
          <ShieldIcon color="primary" sx={{ mt: 0.2 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color="primary.main">
              Protección Anti-Pérdida Activada
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem", mt: 0.5 }}>
              El sistema generará de forma obligatoria un <strong>Snapshot de Seguridad preventivo</strong> antes de aplicar los cambios. Si necesitas deshacer la restauración, podrás regresar al punto exacto anterior.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          disabled={restoring}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          color="warning"
          onClick={onConfirm}
          disabled={restoring}
          startIcon={
            restoring ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <WarningAmberIcon />
            )
          }
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            px: 2.5,
          }}
        >
          {restoring ? "Restaurando Base de Datos..." : "Sí, Crear Snapshot y Restaurar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
