// src/components/ExtrasDialog.tsx
import { Dialog, DialogTitle, DialogContent, Typography, Button } from "@mui/material";

interface ExtrasDialogProps {
  open: boolean;
  extras: string[];
  onClose: () => void;
}

const ExtrasDialog: React.FC<ExtrasDialogProps> = ({ open, extras, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Extras para tu pizza</DialogTitle>
      <DialogContent>
        {extras.map((extra, i) => (
          <Typography key={i}>• {extra}</Typography>
        ))}
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={onClose}
        >
          Agregar y continuar
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ExtrasDialog;