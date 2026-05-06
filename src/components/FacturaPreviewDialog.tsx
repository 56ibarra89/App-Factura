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
  Autocomplete,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import { CartItemType } from "../types/cart";
import { PaymentMethod, OrderType } from "../types/order.types";
import { Customer } from "../types/customer.types";
import PaymentMethodSelector from "./PaymentMethodSelector";
import CustomerAutocomplete from "./CustomerAutocomplete";
import { useCustomerSearch } from "../hooks/useCustomerSearch";
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
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("local");
  const [customerAddress, setCustomerAddress] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [toastOpen, setToastOpen] = useState(false);

  const { saveCustomer } = useCustomerSearch();

  // Reiniciar campos cuando el diálogo se abre
  useEffect(() => {
    if (open) {
      setPaymentMethod("EFECTIVO");
      setSplitAmounts({ efectivo: 0, tarjeta: total });
      setCustomerName("");
      setCustomerPhone("");
      setOrderType("local");
      setCustomerAddress("");
      setSelectedCustomer(null);
    }
  }, [open, total]);

  // Cuando el tipo cambia a "delivery" y ya hay un cliente con direcciones,
  // prellenar con la dirección usada más recientemente
  useEffect(() => {
    if (
      orderType === "delivery" &&
      selectedCustomer &&
      selectedCustomer.addresses.length > 0 &&
      !customerAddress
    ) {
      const sorted = [...selectedCustomer.addresses].sort(
        (a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
      );
      setCustomerAddress(sorted[0].address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderType, selectedCustomer]);

  /** Al seleccionar un cliente del autocomplete */
  const handleCustomerSelect = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    if (customer) {
      // Prellenar teléfono si el cliente lo tiene guardado
      if (customer.phone) setCustomerPhone(customer.phone);
      if (customer.addresses.length > 0 && orderType === "delivery") {
        const sorted = [...customer.addresses].sort(
          (a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
        );
        setCustomerAddress(sorted[0].address);
      }
    } else {
      setCustomerPhone("");
      setCustomerAddress("");
    }
  };

  /** Dirección más reciente primero para el dropdown */
  const savedAddresses =
    selectedCustomer?.addresses
      .slice()
      .sort(
        (a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
      )
      .map((a) => a.address) ?? [];

  /** Confirmar pedido: guarda el cliente y luego llama al callback del padre */
  const handleConfirm = async () => {
    if (customerName.trim()) {
      const isNew = await saveCustomer(
        customerName,
        orderType === "delivery" ? customerAddress : undefined,
        customerPhone || undefined
      );
      if (isNew) setToastOpen(true);
    }
    onConfirm(
      paymentMethod,
      paymentMethod === "MIXTO" ? splitAmounts : undefined,
      customerName,
      orderType,
      customerAddress,
    );
  };

  return (
    <>
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
                        {`$${item.price.toFixed(2)} c/u — Subtotal: $${(
                          item.price *
                          Math.max(0, item.quantity - (item.giftQuantity || 0))
                        ).toFixed(2)}`}
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
                {/* ── Buscador / autocomplete de clientes ── */}
                <Box sx={{ mb: 2 }}>
                  <CustomerAutocomplete
                    value={customerName}
                    onChange={setCustomerName}
                    onCustomerSelect={handleCustomerSelect}
                  />
                </Box>

                {/* ── Teléfono del cliente ── */}
                <TextField
                  fullWidth
                  label="Teléfono del Cliente"
                  placeholder="Ej: 7800-0000"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  size="small"
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
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

                {/* ── Dirección de Entrega ── */}
                {orderType === "delivery" && (
                  <Box sx={{ mt: 2 }}>
                    {savedAddresses.length > 0 ? (
                      <Autocomplete
                        freeSolo
                        options={savedAddresses}
                        inputValue={customerAddress}
                        onInputChange={(_e, val) => setCustomerAddress(val)}
                        onChange={(_e, val) =>
                          setCustomerAddress(typeof val === "string" ? val : val ?? "")
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="O escribe una dirección nueva..."
                            placeholder="Ej: barrio la libertad, calle el sol, casa 5"
                            size="small"
                            required
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LocationOnIcon fontSize="small" color="action" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                        renderOption={(props, option) => {
                          const { key, ...restProps } = props as { key: React.Key } & React.HTMLAttributes<HTMLLIElement>;
                          return (
                            <li key={key} {...restProps}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <LocationOnIcon
                                  fontSize="small"
                                  color="action"
                                  sx={{ flexShrink: 0 }}
                                />
                                <Typography variant="body2">{option}</Typography>
                              </Box>
                            </li>
                          );
                        }}
                      />
                    ) : (
                      <TextField
                        fullWidth
                        label="Dirección de Entrega"
                        placeholder="Ej: barrio la libertad, calle el sol, casa numero 5"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        variant="outlined"
                        size="small"
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOnIcon fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  </Box>
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
            onClick={handleConfirm}
            sx={{ "@media print": { display: "none" } }}
          >
            {confirmText}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast fuera del Dialog para que persista al cerrarse */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          ✅ ¡Cliente guardado exitosamente!
        </Alert>
      </Snackbar>
    </>
  );
}
