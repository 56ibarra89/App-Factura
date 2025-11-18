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
import { ProductSize } from "../context/ProductContext"; // Asegúrate de importar desde donde tienes definido ProductSize

interface CartItem {
  name: string;
  price: number;
  size: ProductSize;
  quantity: number;
}

interface FacturaPreviewDialogProps {
  open: boolean;
  cart: CartItem[];
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
                secondary={`$${item.price.toFixed(2)} c/u — Subtotal: $${(item.price * item.quantity).toFixed(2)}`}
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