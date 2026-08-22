import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import type { ShiftClosePreview } from "../model/cash-register.types";

interface Props {
  open: boolean;
  preview: ShiftClosePreview | null;
  onClose: () => void;
  onReviewOrders: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PREPARING: "En preparación",
  READY: "Lista",
  DELIVERED: "Entregada sin cobrar",
};

export function ShiftCloseBlockersDialog({
  open,
  preview,
  onClose,
  onReviewOrders,
  onRefresh,
  loading,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>No se puede cerrar la caja todavía</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Cobra o anula estas órdenes y libera sus mesas antes de continuar.
        </Alert>
        <List disablePadding>
          {preview?.blockingOrders.map((order) => (
            <ListItem key={order.id} divider disableGutters>
              <ListItemText
                primary={order.invoiceNumber || order.id}
                secondary={`${ORDER_STATUS_LABELS[order.status] ?? order.status}${
                  order.tables.length > 0 ? ` · ${order.tables.join(", ")}` : ""
                }`}
              />
            </ListItem>
          ))}
        </List>
        {preview?.blockingTables.length ? (
          <Typography variant="body2" color="text.secondary" mt={2}>
            Mesas ocupadas: {preview.blockingTables.map((table) => table.label).join(", ")}
          </Typography>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Volver</Button>
        <Button onClick={onRefresh} disabled={loading}>Verificar de nuevo</Button>
        <Button variant="contained" onClick={onReviewOrders}>Ir a órdenes</Button>
      </DialogActions>
    </Dialog>
  );
}
