import { useState, useEffect, useRef } from "react";
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Typography, Box, InputAdornment 
} from "@mui/material";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import { LOGIN_COLORS } from "../../theme/loginTheme";

interface Props {
  open: boolean;
  mesaId: string | null;
  onClose: () => void;
  onConfirm: (nombre: string, monto: number) => void;
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
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Efecto para forzar el foco en el campo de nombre al abrir el diálogo en Electron
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 150); // Un pequeño retraso para permitir que la animación de MUI termine
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleConfirm = () => {
    if (!nombre.trim()) return; // Validar que se ingrese un nombre
    
    const parsedMonto = parseFloat(monto) || 0;
    onConfirm(nombre, parsedMonto);
    
    // Resetear formulario para futuras aperturas
    setNombre("");
    setMonto("");
  };

  const handleCancel = () => {
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
        </Box>
      </DialogContent>


      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={handleCancel} 
          variant="text" 
          sx={{ fontWeight: "bold", textTransform: "none", color: "text.secondary" }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          disabled={!nombre.trim()}
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
