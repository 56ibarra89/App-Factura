import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { PinValidationDialog } from "../../auth";
import { LOGIN_COLORS } from "../../../shared/theme";

interface InvoiceCancellationDialogsProps {
  reasonOpen: boolean;
  pinOpen: boolean;
  reason: string;
  onReasonChange(reason: string): void;
  onCloseReason(): void;
  onSubmitReason(): void;
  onClosePin(): void;
  onConfirm(pin?: string): void;
}

export function InvoiceCancellationDialogs({
  reasonOpen,
  pinOpen,
  reason,
  onReasonChange,
  onCloseReason,
  onSubmitReason,
  onClosePin,
  onConfirm,
}: InvoiceCancellationDialogsProps) {
  return (
    <>
      <Dialog
        open={reasonOpen}
        onClose={onCloseReason}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            color: LOGIN_COLORS.primary,
          }}
        >
          Motivo de Anulación
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="body2"
            color="text.secondary"
            mb={2}
            mt={1}
          >
            Por favor, explica brevemente por qué estás
            anulando esta factura (por ejemplo: intento de
            robo o fraude con tarjeta).
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            placeholder="Escribe el motivo aquí..."
            value={reason}
            onChange={(event) =>
              onReasonChange(event.target.value)
            }
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={onCloseReason} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={onSubmitReason}
            variant="contained"
            sx={{
              bgcolor: LOGIN_COLORS.primary,
              "&:hover": {
                bgcolor: LOGIN_COLORS.primaryDark,
              },
            }}
            disabled={!reason.trim()}
          >
            Siguiente
          </Button>
        </DialogActions>
      </Dialog>

      <PinValidationDialog
        open={pinOpen}
        onClose={onClosePin}
        onSuccess={onConfirm}
        title="Anular Factura"
      />
    </>
  );
}
