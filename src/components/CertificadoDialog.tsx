import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import { CertificadoRule } from "../types/promociones";
import { apiClient } from "../config/apiClient";

interface CertificadoDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: (certificado: CertificadoRule) => void;
}

export default function CertificadoDialog({
  open,
  onClose,
  onApply,
}: CertificadoDialogProps) {
  const [serial, setSerial] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setSerial("");
      setError("");
    }
  }, [open]);

  const handleApply = async () => {
    if (!serial.trim()) return;
    setError("");
    setLoading(true);

    try {
      const data = await apiClient(`/promotions/certificates/${serial.trim().toUpperCase()}`);
      
      if (data.status !== "Disponible") {
        setError(`Este certificado no puede usarse (Estado: ${data.status}).`);
        return;
      }

      onApply(data as CertificadoRule);
      onClose();
    } catch (e: any) {
      if (e.status === 404) {
        setError("No se encontró ningún certificado con este número.");
      } else if (e.message) {
        setError(e.message);
      } else {
        setError("Error al validar el certificado.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isInputEmpty = serial.trim().length === 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
        <CardGiftcardIcon color="primary" />
        Canjear Vale / Certificado
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Ingresa el número de serie del certificado para canjear su beneficio.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Número de Serie"
            placeholder="Ej. VC-847291"
            value={serial}
            onChange={(e) => {
              setSerial(e.target.value);
              setError("");
            }}
            error={!!error}
            helperText={error}
            InputProps={{
              startAdornment: <CardGiftcardIcon color="action" sx={{ mr: 1, fontSize: 20 }} />,
              style: { fontSize: "1.2rem", fontWeight: "bold" },
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isInputEmpty) {
                handleApply();
              }
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleApply}
          disabled={isInputEmpty || loading}
        >
          {loading ? "Verificando..." : "Canjear"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
