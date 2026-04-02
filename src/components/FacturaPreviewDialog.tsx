// src/components/FacturaPreviewDialog.tsx
import { useState, useEffect } from "react";
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
import { PaymentMethod } from "../types/order.types";
import PaymentMethodSelector from "./PaymentMethodSelector";
import { formatItemName } from "../utils/formatUtils";

interface FacturaPreviewDialogProps {
  open: boolean;
  cart: CartItemType[];
  total: number;
  onClose: () => void;
  onConfirm: (paymentMethod: PaymentMethod, splitAmounts?: { efectivo: number; tarjeta: number }) => void;
  title?: string;
  confirmText?: string;
  showPaymentMethod?: boolean;
}

export default function FacturaPreviewDialog({
  open,
  cart,
  total,
  onClose,
  onConfirm,
  title = "Resumen de Factura",
  confirmText = "Confirmar pedido",
  showPaymentMethod = true,
}: FacturaPreviewDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("EFECTIVO");
  const [splitAmounts, setSplitAmounts] = useState({ efectivo: 0, tarjeta: 0 });

  useEffect(() => {
    if (open) {
      setPaymentMethod("EFECTIVO");
      setSplitAmounts({ efectivo: 0, tarjeta: total });
    }
  }, [open, total]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <List>
          {cart.map((item) => (
            <ListItem key={`${item.name}-${item.size}`} disableGutters>
              <ListItemText
                primary={`${formatItemName(item.name, item.size)} x${item.quantity}`}
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
                      {`$${item.price.toFixed(2)} c/u — Subtotal: $${(item.price * Math.max(0, item.quantity - (item.giftQuantity || 0))).toFixed(2)}`}
                    </Typography>
                    {item.giftQuantity && item.giftQuantity > 0 ? (
                      <Typography component="span" variant="caption" color="success.main">
                        Regalo: {item.giftQuantity} item(s) (-${(item.price * item.giftQuantity).toFixed(2)})
                      </Typography>
                    ) : null}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        <Box display="flex" justifyContent="space-between" mb={showPaymentMethod ? 2 : 0}>
          <Typography fontWeight="bold">Total:</Typography>
          <Typography fontWeight="bold" color="error.main">${total.toFixed(2)}</Typography>
        </Box>

        {showPaymentMethod && (
          <PaymentMethodSelector
            total={total}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            splitAmounts={splitAmounts}
            setSplitAmounts={setSplitAmounts}
          />
        )}

      </DialogContent>
      <DialogActions sx={{ "@media print": { display: "none" } }}>
        <Button onClick={onClose} sx={{ "@media print": { display: "none" }, color: "error.main" }}>Cancelar</Button>
        <Button 
          variant="contained" 
          color="error" 
          onClick={() => onConfirm(paymentMethod, paymentMethod === "MIXTO" ? splitAmounts : undefined)} 
          sx={{ "@media print": { display: "none" } }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}