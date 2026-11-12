import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
  disableRestoreFocus?: boolean;
  disableEnforceFocus?: boolean;
}

const ConfirmDialog = ({
  open,
  title,
  message,
  onClose,
  onConfirm,
  disableRestoreFocus,
  disableEnforceFocus,
}: ConfirmDialogProps) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      disableRestoreFocus={disableRestoreFocus}
      disableEnforceFocus={disableEnforceFocus}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 'bold' }}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus sx={{ fontWeight: 'bold', borderRadius: 2 }}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};


export default ConfirmDialog;
