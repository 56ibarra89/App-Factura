import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { authService } from "../../services/authService";
import { LOGIN_COLORS } from "../../theme/loginTheme";

interface PinValidationDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
}

const PinValidationDialog: React.FC<PinValidationDialogProps> = ({ 
  open, 
  onClose, 
  onSuccess,
  title = "Autorización Requerida"
}) => {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleValidation = async () => {
    if (pin.length === 0) {
      setError("Ingresa un PIN");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Verificamos el PIN con el servicio
      const user = await authService.loginWithPin(pin);
      
      if (user === "admin") {
        setPin("");
        onSuccess();
      } else if (user) {
        setError("Este usuario no tiene permisos para realizar esta acción.");
      } else {
        setError("PIN incorrecto");
      }
    } catch (err) {
      setError("Error en la validación");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPin("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', color: LOGIN_COLORS.primary }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={3} mt={1}>
          Ingresa el PIN de administrador para continuar.
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={1}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Button
                key={num}
                variant="outlined"
                onClick={() => {
                  if (pin.length < 4) {
                    setPin(p => p + num.toString());
                    setError("");
                  }
                }}
                disabled={loading}
                sx={{ height: 60, fontSize: 24, borderRadius: 2 }}
              >
                {num}
              </Button>
            ))}
            <Button
              variant="outlined"
              color="error"
              onClick={() => setPin(p => p.slice(0, -1))}
              disabled={loading || pin.length === 0}
              sx={{ height: 60, borderRadius: 2 }}
            >
              Borrar
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                if (pin.length < 4) {
                  setPin(p => p + "0");
                  setError("");
                }
              }}
              disabled={loading}
              sx={{ height: 60, fontSize: 24, borderRadius: 2 }}
            >
              0
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleValidation}
              disabled={loading || pin.length === 0}
              sx={{ height: 60, borderRadius: 2, bgcolor: LOGIN_COLORS.primary }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "OK"}
            </Button>
          </Box>

          <Box display="flex" justifyContent="center" height={24}>
            {/* Show dots depending on pin length */}
            {Array.from({ length: 4 }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: i < pin.length ? LOGIN_COLORS.primary : "grey.300",
                  mx: 1,
                  mt: 2
                }}
              />
            ))}
          </Box>

          {error && (
            <Typography color="error" variant="body2" textAlign="center" mt={1}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PinValidationDialog;
