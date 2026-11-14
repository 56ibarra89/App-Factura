import { useState, useEffect, useRef } from "react";
import {
  Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, InputAdornment
} from "@mui/material";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import { LOGIN_COLORS } from "../../../shared/theme";
import { getBusinessDateString, parseBusinessDayStart, formatBusinessTime } from "../../../shared/format";

interface Props {
  open: boolean;
  mesaId: string | null;
  onClose: () => void;
  onConfirm: (
    nombre: string,
    monto: number,
    resTime?: string,
    expTime?: string,
  ) => Promise<void> | void;
  disableRestoreFocus?: boolean;
  disableEnforceFocus?: boolean;
}

export default function ReservationDialog({
  open,
  mesaId,
  onClose,
  onConfirm,
  disableRestoreFocus,
  disableEnforceFocus
}: Props) {
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [expirationTime, setExpirationTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const now = new Date();

      const coeff = 1000 * 60 * 5;
      const roundedNow = new Date(Math.ceil(now.getTime() / coeff) * coeff);

      const exp = new Date(roundedNow.getTime() + 30 * 60000);

      const formatTime = (d: Date) => formatBusinessTime(d, { hour: "2-digit", minute: "2-digit", hour12: false });

      setReservationTime(formatTime(roundedNow));
      setExpirationTime(formatTime(exp));
    }
  }, [open]);

  const handleReservationTimeChange = (newTime: string) => {
    setReservationTime(newTime);
    if (!newTime) return;

    const [hours, minutes] = newTime.split(':').map(Number);
    const date = parseBusinessDayStart(getBusinessDateString()) ?? new Date();
    date.setTime(date.getTime() + (hours * 60 + minutes + 30) * 60000);

    const formatTime = (d: Date) => formatBusinessTime(d, { hour: "2-digit", minute: "2-digit", hour12: false });
    setExpirationTime(formatTime(date));
  };

  useEffect(() => {
    if (open) {
      setErrorMessage(null);
      setSubmitting(false);
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!nombre.trim() || submitting) return;

    const parsedMonto = parseFloat(monto) || 0;

    const parseTimeOnDay = (timeStr: string, baseDate = new Date()): Date | null => {
      if (!timeStr) return null;
      const [hours, minutes] = timeStr.split(":").map(Number);
      if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
      const baseDay = getBusinessDateString(baseDate);
      const start = parseBusinessDayStart(baseDay);
      return start ? new Date(start.getTime() + (hours * 60 + minutes) * 60000) : null;
    };

    const resDate = parseTimeOnDay(reservationTime);
    const expDate = parseTimeOnDay(expirationTime, resDate ?? new Date());
    if (resDate && expDate && expDate.getTime() <= resDate.getTime()) {
      expDate.setTime(expDate.getTime() + 24 * 60 * 60000);
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await onConfirm(
        nombre,
        parsedMonto,
        resDate ? resDate.toISOString() : undefined,
        expDate ? expDate.toISOString() : undefined,
      );

      setNombre("");
      setMonto("");
      setReservationTime("");
      setExpirationTime("");
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : "No se pudo registrar la reserva.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) return;
    setErrorMessage(null);
    setNombre("");
    setMonto("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      disableRestoreFocus={disableRestoreFocus}
      disableEnforceFocus={disableEnforceFocus}
      PaperProps={{
        sx: { borderRadius: 4, p: 1, minWidth: 400 }
      }}
    >
      <DialogTitle sx={{ fontWeight: "900", display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
        <EventSeatIcon sx={{ color: LOGIN_COLORS.primary, fontSize: 28 }} />
        Reservar Mesa
      </DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Estás registrando una reserva para la {mesaId ? mesaId.replace("F", "Planta ").replace("-M", ", Mesa ") : "Mesa seleccionada"}.
        </Typography>

        <Box display="flex" flexDirection="column" gap={3}>
          <TextField
            inputRef={nameInputRef}
            fullWidth
            label="Nombre del Cliente *"
            variant="outlined"
            placeholder="Ej. Juan Pérez"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <TextField
            fullWidth
            label="Monto de Anticipo (Opcional)"
            variant="outlined"
            type="number"
            placeholder="0.00"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />

          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              label="Hora de Reserva"
              variant="outlined"
              type="time"
              value={reservationTime}
              onChange={(e) => handleReservationTimeChange(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Límite de Tolerancia (Auto-vence)"
              variant="outlined"
              type="time"
              value={expirationTime}
              onChange={(e) => setExpirationTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          {errorMessage && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleCancel}
          disabled={submitting}
          variant="text"
          sx={{ fontWeight: "bold", textTransform: "none", color: "text.secondary" }}
        >
          Cancelar
        </Button>
        <Button
          onClick={() => void handleConfirm()}
          variant="contained"
          disabled={!nombre.trim() || submitting}
          sx={{
            bgcolor: LOGIN_COLORS.primary,
            fontWeight: "bold",
            textTransform: "none",
            borderRadius: 2,
            px: 3,
            "&:hover": { bgcolor: LOGIN_COLORS.primaryDark }
          }}
        >
          Confirmar Reserva
        </Button>
      </DialogActions>
    </Dialog>
  );
}

