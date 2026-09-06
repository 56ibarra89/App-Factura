import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { BackupItem } from "../api/backupGateway";

interface DeleteConfirmDialogProps {
  open: boolean;
  item: BackupItem | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  item,
  deleting,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={deleting ? undefined : onClose}
      maxWidth="xs"
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
            bgcolor: "error.50",
            color: "error.main",
            display: "flex",
          }}
        >
          <DeleteOutlineIcon fontSize="medium" />
        </Box>
        <Typography variant="h6" fontWeight={800}>
          Eliminar Respaldo
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          ¿Estás seguro de que deseas eliminar permanentemente este archivo de copia de seguridad?
        </Typography>

        <Box sx={{ bgcolor: "grey.50", p: 1.5, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{ fontFamily: "monospace", color: "text.primary", wordBreak: "break-all" }}
          >
            {item?.filename}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          disabled={deleting}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={deleting}
          startIcon={
            deleting ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <DeleteOutlineIcon />
            )
          }
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            px: 2.5,
          }}
        >
          {deleting ? "Eliminando..." : "Eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
