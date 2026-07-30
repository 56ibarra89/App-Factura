import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, CircularProgress } from "@mui/material";
import { useState } from "react";
import {
  authService,
  useAuth,
} from "../../../auth";

interface LogoutAllDevicesModalProps {
  open: boolean;
  onClose: () => void;
}

export function LogoutAllDevicesModal({ open, onClose }: LogoutAllDevicesModalProps) {
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();

  const handleLogoutAll = async () => {
    setLoading(true);
    try {
      await authService.logoutAllDevices();
      // Luego de invalidar todos los tokens en el servidor, cerramos sesión localmente
      logout();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Contraseña actualizada</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Tu contraseña ha sido actualizada exitosamente.
          <br /><br />
          Por razones de seguridad, te recomendamos cerrar sesión en todos los dispositivos donde la tenías abierta previamente. 
          Al hacer esto, también se cerrará tu sesión actual y deberás iniciar sesión nuevamente con tu nueva contraseña.
          <br /><br />
          ¿Qué deseas hacer?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Mantener Sesiones
        </Button>
        <Button 
          onClick={handleLogoutAll} 
          color="error" 
          variant="contained" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
        >
          {loading ? "Cerrando..." : "Cerrar en todos los dispositivos"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
