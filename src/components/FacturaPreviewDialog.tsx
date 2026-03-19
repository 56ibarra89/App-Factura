// src/components/FacturaPreviewDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Box,
} from "@mui/material";
import { CartItemType } from "../types/cart";

interface FacturaPreviewDialogProps {
  open: boolean;
  cart: CartItemType[];
  total: number;
  onClose: () => void;
  onConfirm: () => void;
}

export default function FacturaPreviewDialog({
  open,
  cart,
  total,
  onClose,
  onConfirm,
}: FacturaPreviewDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Resumen de Factura</DialogTitle>
      <DialogContent>
        <List>
          {cart.map((item, index) => (
            <ListItem key={index} disableGutters>
              <ListItemText
                primary={`${item.name} (${item.size}) x${item.quantity}`}
                secondary={
                  <Box component="span" display="flex" flexDirection="column">
                    {item.extras?.length > 0 && (
                      <Typography component="span" variant="caption" color="primary">
                        Extras: {item.extras.map((e) => `${e.name} (+$${e.price.toFixed(2)})`).join(", ")}
                      </Typography>
                    )}
                    {item.note && (
                      <Typography component="span" variant="caption" color="error.main" sx={{ fontStyle: 'italic' }}>
                        Nota: {item.note}
                      </Typography>
                    )}
                    <Typography component="span" variant="body2" color="text.secondary">
                      {`$${item.price.toFixed(2)} c/u — Subtotal: $${(item.price * item.quantity).toFixed(2)}`}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        <Box display="flex" justifyContent="space-between">
          <Typography fontWeight="bold">Total:</Typography>
          <Typography fontWeight="bold">${total.toFixed(2)}</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" color="primary" onClick={onConfirm}>
          Confirmar pedido
        </Button>
      </DialogActions>
    </Dialog>
  );
}