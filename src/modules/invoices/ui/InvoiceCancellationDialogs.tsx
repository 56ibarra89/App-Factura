import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { PinValidationDialog } from "../../auth";
import { LOGIN_COLORS } from "../../../shared/theme";
import type { CancellationReasonPolicy } from "../../settings/model/voidWastePolicy.types";

interface InvoiceCancellationDialogsProps {
  reasonOpen: boolean;
  pinOpen: boolean;
  reasons: CancellationReasonPolicy[];
  reasonId: string;
  note: string;
  onReasonChange(reasonId: string): void;
  onNoteChange(note: string): void;
  onCloseReason(): void;
  onSubmitReason(): void;
  onClosePin(): void;
  onConfirm(pin?: string): void;
}

export function InvoiceCancellationDialogs({
  reasonOpen,
  pinOpen,
  reasons,
  reasonId,
  note,
  onReasonChange,
  onNoteChange,
  onCloseReason,
  onSubmitReason,
  onClosePin,
  onConfirm,
}: InvoiceCancellationDialogsProps) {
  return (
    <>
      <Dialog open={reasonOpen} onClose={onCloseReason} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            fontWeight: "bold",
            color: LOGIN_COLORS.primary,
          }}
        >
          Motivo de Anulación
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2} mt={1}>
            Selecciona un motivo oficial. El sistema pedirá PIN cuando la orden
            esté pagada, la cocina ya haya iniciado o el motivo lo requiera.
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Motivo oficial</InputLabel>
            <Select
              autoFocus
              label="Motivo oficial"
              value={reasonId}
              onChange={(event) => onReasonChange(event.target.value)}
            >
              {reasons.map((reason) => (
                <MenuItem key={reason.id} value={reason.id}>
                  {reason.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Nota adicional (opcional)"
            placeholder="Detalle útil para auditoría..."
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
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
            disabled={!reasonId}
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
