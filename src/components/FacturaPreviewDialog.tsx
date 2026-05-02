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
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { CartItemType } from "../types/cart";
import { PaymentMethod, OrderType } from "../types/order.types";
import PaymentMethodSelector from "./PaymentMethodSelector";
import { formatItemName } from "../utils/formatUtils";

interface FacturaPreviewDialogProps {
  open: boolean;
  cart: CartItemType[];
  subTotal: number;
  taxAmount: number;
  total: number;
  onClose: () => void;
  onConfirm: (
    paymentMethod: PaymentMethod,
    splitAmounts?: { efectivo: number; tarjeta: number },
    customerName?: string,
    orderType?: OrderType,
    customerAddress?: string,
  ) => void;
  title?: string;
  confirmText?: string;
  isTableMode?: boolean;
  disableRestoreFocus?: boolean;
  disableEnforceFocus?: boolean;
}

export default function FacturaPreviewDialog({
  open,
  cart,
  subTotal,
  taxAmount,
  total,
  onClose,
  onConfirm,
  title = "Resumen de Factura",
  confirmText = "Confirmar pedido",
  isTableMode = false,
  disableRestoreFocus = false,
  disableEnforceFocus = false,
}: FacturaPreviewDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("EFECTIVO");
  const [splitAmounts, setSplitAmounts] = useState({ efectivo: 0, tarjeta: 0 });
  const [customerName, setCustomerName] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("local");
  const [customerAddress, setCustomerAddress] = useState("");

  useEffect(() => {
    if (open) {
      setPaymentMethod("EFECTIVO");
      setSplitAmounts({ efectivo: 0, tarjeta: total });
      setCustomerName("");
      setOrderType("local");
      setCustomerAddress("");
    }
  }, [open, total]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      disableRestoreFocus={disableRestoreFocus}
      disableEnforceFocus={disableEnforceFocus}
    >
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
                      <Typography
                        component="span"
                        variant="caption"
                        color="primary"
                      >
                        Extras:{" "}
                        {item.extras
                          .map((e) => `${e.name} (+$${e.price.toFixed(2)})`)
                          .join(", ")}
                      </Typography>
                    )}
                    {item.note && (
                      <Typography
                        component="span"
                        variant="caption"
                        color="error.main"
                        sx={{ fontStyle: "italic" }}
                      >
                        Nota: {item.note}
                      </Typography>
                    )}
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      {`$${item.price.toFixed(2)} c/u — Subtotal: $${(item.price * Math.max(0, item.quantity - (item.giftQuantity || 0))).toFixed(2)}`}
                    </Typography>
                    {item.giftQuantity && item.giftQuantity > 0 ? (
                      <Typography
                        component="span"
                        variant="caption"
                        color="success.main"
                      >
                        Regalo: {item.giftQuantity} item(s) (-$
                        {(item.price * item.giftQuantity).toFixed(2)})
                      </Typography>
                    ) : null}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography>Subtotal:</Typography>
          <Typography>${subTotal.toFixed(2)}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography>Impuestos:</Typography>
          <Typography>${taxAmount.toFixed(2)}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography fontWeight="bold">Total:</Typography>
          <Typography fontWeight="bold" color="error.main">
            ${total.toFixed(2)}
          </Typography>
        </Box>

        {!isTableMode && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Nombre del Cliente"
                placeholder="Ej: Juan Pérez"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                sx={{ mb: 2 }}
                variant="outlined"
                size="small"
              />

              <Typography
                variant="subtitle2"
                gutterBottom
                fontWeight="bold"
                sx={{ color: "text.secondary", mb: 1 }}
              >
                Tipo de Pedido:
              </Typography>
              <ToggleButtonGroup
                value={orderType}
                exclusive
                onChange={(_, val) => val && setOrderType(val)}
                fullWidth
                color="error"
                size="small"
              >
                <ToggleButton value="local" sx={{ py: 1 }}>
                  LOCAL
                </ToggleButton>
                <ToggleButton value="llevar" sx={{ py: 1 }}>
                  LLEVAR
                </ToggleButton>
                <ToggleButton value="delivery" sx={{ py: 1 }}>
                  DELIVERY
                </ToggleButton>
              </ToggleButtonGroup>

              {orderType === "delivery" && (
                <TextField
                  fullWidth
                  label="Dirección de Entrega"
                  placeholder="Ej: barrio la libertad, calle el sol, casa numero 5"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  sx={{ mt: 2 }}
                  variant="outlined"
                  size="small"
                  required
                />
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <PaymentMethodSelector
              total={total}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              splitAmounts={splitAmounts}
              setSplitAmounts={setSplitAmounts}
            />
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ "@media print": { display: "none" } }}>
        <Button
          onClick={onClose}
          sx={{ "@media print": { display: "none" }, color: "error.main" }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() =>
            onConfirm(
              paymentMethod,
              paymentMethod === "MIXTO" ? splitAmounts : undefined,
              customerName,
              orderType,
              customerAddress,
            )
          }
          sx={{ "@media print": { display: "none" } }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
