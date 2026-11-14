import {
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { useState } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  disableRestoreFocus?: boolean;
  disableEnforceFocus?: boolean;
}

const ConfirmDialog = ({
  open,
  title,
  message,
  onClose,
  onConfirm,
  loading = false,
  disableRestoreFocus,
  disableEnforceFocus,
}: ConfirmDialogProps) => {
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const busy = loading || pending;
  const handleConfirm = async () => {
    if (busy) return;
    setPending(true);
    setErrorMessage(null);
    try {
      await onConfirm();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo completar la operación.");
    } finally {
      setPending(false);
    }
  };
  return (
    <Dialog 
      open={open} 
      onClose={busy ? undefined : onClose}
      disableRestoreFocus={disableRestoreFocus}
      disableEnforceFocus={disableEnforceFocus}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
        {errorMessage && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} color="inherit" disabled={busy} sx={{ fontWeight: 'bold' }}>
          Cancelar
        </Button>
        <Button onClick={() => void handleConfirm()} color="error" variant="contained" disabled={busy} autoFocus sx={{ fontWeight: 'bold', borderRadius: 2 }}>
          {busy ? "Procesando..." : "Confirmar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


export default ConfirmDialog;
