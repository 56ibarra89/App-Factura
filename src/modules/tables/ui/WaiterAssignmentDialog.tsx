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
} from "@mui/material";
import { useEffect, useState } from "react";
import type { AvailableWaiter } from "../api/waiterAssignmentsGateway";

interface WaiterAssignmentDialogProps {
  open: boolean;
  waiters: AvailableWaiter[];
  currentWaiterId?: string;
  submitting?: boolean;
  onClose(): void;
  onConfirm(waiterId: string): void;
}

export default function WaiterAssignmentDialog({
  open,
  waiters,
  currentWaiterId,
  submitting = false,
  onClose,
  onConfirm,
}: WaiterAssignmentDialogProps) {
  const [waiterId, setWaiterId] = useState("");

  useEffect(() => {
    if (open) setWaiterId(currentWaiterId ?? "");
  }, [currentWaiterId, open]);

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Asignar mesero responsable</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="dense">
          <InputLabel id="waiter-assignment-label">Mesero</InputLabel>
          <Select
            labelId="waiter-assignment-label"
            label="Mesero"
            value={waiterId}
            onChange={(event) => setWaiterId(event.target.value)}
            disabled={submitting}
          >
            {waiters.map((waiter) => (
              <MenuItem key={waiter.id} value={waiter.id}>
                {`${waiter.firstName} ${waiter.lastName}`.trim() || waiter.username}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={() => onConfirm(waiterId)}
          disabled={!waiterId || submitting}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
