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
import { formatItemName } from "../utils/formatUtils";
import TicketPrint from "./TicketPrint";

interface OrderViewDialogProps {
  open: boolean;
  cart: CartItemType[];
  subTotal?: number;
  taxAmount?: number;
  total: number;
  customerName?: string;
  customerAddress?: string;
  orderType?: string;
  invoiceNumber?: string;
  cashierName?: string;
  discountAmount?: number;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  confirmText?: string;
  showConfirmButton?: boolean;
}

export default function OrderViewDialog({
  open,
  cart,
  total,
  onClose,
  onConfirm,
  title = "Detalle de Factura",
  confirmText = "Imprimir",
  showConfirmButton = true,
  subTotal = 0,
  taxAmount = 0,
  discountAmount = 0,
  customerName,
  customerAddress,
  orderType,
  invoiceNumber,
  cashierName,
}: OrderViewDialogProps) {
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
                      <Typography
                        component="span"
                        variant="caption"
                        color="primary"
                      >
                        Extras:{" "}
                        {item.extras
                          .map((e) => `${e.name} (+C$${e.price.toFixed(2)})`)
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
                      {`C$${item.price.toFixed(2)} c/u — Subtotal: C$${(item.price * Math.max(0, item.quantity - (item.giftQuantity || 0))).toFixed(2)}`}
                    </Typography>
                    {item.giftQuantity && item.giftQuantity > 0 ? (
                      <Typography
                        component="span"
                        variant="caption"
                        color="success.main"
                      >
                        Regalo: {item.giftQuantity} item(s) (-C$
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
          <Typography>C${subTotal.toFixed(2)}</Typography>
        </Box>
        
        {discountAmount > 0 && (
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography color="success.main">Descuento aplicado:</Typography>
            <Typography color="success.main">-C${discountAmount.toFixed(2)}</Typography>
          </Box>
        )}
        
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography>Impuestos:</Typography>
          <Typography>C${taxAmount.toFixed(2)}</Typography>
        </Box>

        <Box display="flex" justifyContent="space-between">
          <Typography fontWeight="bold">Total:</Typography>
          <Typography fontWeight="bold" color="error.main">
            C${total.toFixed(2)}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ "@media print": { display: "none" } }}>
        <Button
          onClick={onClose}
          sx={{ "@media print": { display: "none" }, color: "error.main" }}
        >
          Cerrar
        </Button>
        {showConfirmButton && (
          <Button
            variant="contained"
            color="error"
            onClick={onConfirm}
            sx={{ "@media print": { display: "none" } }}
          >
            {confirmText}
          </Button>
        )}
      </DialogActions>

      {/* Hidden printable ticket */}
      <TicketPrint
        cart={cart}
        subTotal={subTotal}
        taxAmount={taxAmount}
        total={total}
        customerName={customerName}
        customerAddress={customerAddress}
        orderType={orderType}
        invoiceNumber={invoiceNumber}
        cashierName={cashierName}
      />
    </Dialog>
  );
}
