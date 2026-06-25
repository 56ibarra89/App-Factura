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
  MenuItem,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import { CartItemType } from "../types/cart";
import { PaymentMethod, OrderType } from "../types/order.types";
import { Customer } from "../types/customer.types";
import { UserAccount } from "../types/user";
import { CertificadoRule } from "../types/promociones";
import { apiClient } from "../config/apiClient";
import { useImpuestosConfig } from "../hooks/useImpuestosConfig";
import PaymentMethodSelector from "./PaymentMethodSelector";
import CustomerAutocomplete from "./CustomerAutocomplete";
import TicketPrint from "./TicketPrint";
import PromocionesSelector from "./PromocionesSelector";
import { AppliedPromotion } from "../utils/cartTotals";

import { useCustomerSearch } from "../hooks/useCustomerSearch";
import { formatItemName } from "../utils/formatUtils";
import { useGeneralConfigData } from "../hooks/useGeneralConfigData";
import { configRepository } from "../repositories/ConfigRepository";
import { PackagingSizeConfig } from "../types/product";

interface FacturaPreviewDialogProps {
  open: boolean;
  cart: CartItemType[];
  promotion?: AppliedPromotion | null;
  subTotal: number;
  discountAmount?: number;
  taxAmount: number;
  total: number;
  invoiceNumber?: string;
  onApplyPromotion?: (promo: AppliedPromotion) => void;
  onRemovePromotion?: () => void;
  onClose: () => void;
  onConfirm: (
    paymentMethod: PaymentMethod,
    splitAmounts?: { efectivo: number; tarjeta: number },
    customerName?: string,
    orderType?: OrderType,
    customerAddress?: string,
    packagingItems?: { name: string, price: number, quantity: number }[],
    customerTendered?: number,
    driverId?: string,
    deliveryCost?: number
  ) => void;
  title?: string;
  confirmText?: string;
  isTableMode?: boolean;
  disableRestoreFocus?: boolean;
  disableEnforceFocus?: boolean;
  initialCustomer?: Customer | null;
  initialPhone?: string;
  initialOrderType?: OrderType;
  initialDriverId?: string;
  lockOrderType?: boolean;
  hideDeliveryOption?: boolean;
  cashierName?: string;
}

export default function FacturaPreviewDialog({
  open,
  cart,
  promotion,
  subTotal,
  discountAmount = 0,
  taxAmount,
  total,
  onApplyPromotion,
  onRemovePromotion,
  onClose,
  onConfirm,
  title = "Resumen de Factura",
  confirmText = "Confirmar pedido",
  isTableMode = false,
  disableRestoreFocus = false,
  disableEnforceFocus = false,
  initialCustomer = null,
  initialPhone = "",
  initialOrderType = "local",
  initialDriverId = "",
  lockOrderType = false,
  hideDeliveryOption = false,
  invoiceNumber,
  cashierName,
}: FacturaPreviewDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("EFECTIVO");
  const [splitAmounts, setSplitAmounts] = useState({ efectivo: 0, tarjeta: 0 });
  const [receivedLocal, setReceivedLocal] = useState<number | "">("");
  const [receivedSecondary, setReceivedSecondary] = useState<number | "">("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState<OrderType>(initialOrderType || "local");
  const [customerAddress, setCustomerAddress] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [packagingConfig, setPackagingConfig] = useState<PackagingSizeConfig[]>([]);
  const [packagingQuantities, setPackagingQuantities] = useState<{ [name: string]: number }>({});
  const [drivers, setDrivers] = useState<UserAccount[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [deliveryCost, setDeliveryCost] = useState<number>(0);
  const [deliveryPrices, setDeliveryPrices] = useState<string[]>([]);
  const [stats, setStats] = useState<{ userId: string; todayDeliveries: number }[]>([]);

  const { saveCustomer } = useCustomerSearch();
  const { config } = useGeneralConfigData();
  const exchangeRateVal = config.exchangeRate > 0 ? config.exchangeRate : 36.50;
  const totalInUSD = total / exchangeRateVal;

  useEffect(() => {
    configRepository.getPackagingSizesConfig().then(data => {
      if (data) setPackagingConfig(data);
    });
    configRepository.getDeliveryPricesConfig().then(prices => {
      if (prices) setDeliveryPrices(prices.filter(p => p.trim() !== ""));
    });
  }, []);

  useEffect(() => {
    if (orderType === "delivery") {
      const fetchDrivers = async () => {
        try {
          const users = await apiClient("/users");
          const now = new Date(); const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
          const todayNameStr = days[new Date().getDay()];

          const motorizados = users.filter((u: UserAccount) => {
            if (u.role !== "motorizado") return false;
            const isScheduled = u.workDays && u.workDays.includes(todayNameStr);
            const hasExtraDay = u.extraDays && u.extraDays.some(d => d.date.startsWith(todayStr));
            return isScheduled || hasExtraDay;
          });
          
          setDrivers(motorizados);

          const statsData = await apiClient(`/users/motorizados/delivery-stats?date=${todayStr}`);
          setStats(statsData);
        } catch (err) {
          console.error("Error fetching motorizados:", err);
        }
      };
      fetchDrivers();
    }
  }, [orderType]);

  // Reiniciar campos cuando el diálogo se abre, usando valores iniciales si se proveen
  useEffect(() => {
    if (open) {
      setPaymentMethod("EFECTIVO");
      setSplitAmounts({ efectivo: 0, tarjeta: total });
      setReceivedLocal("");
      setReceivedSecondary("");
      setCustomerName(initialCustomer ? initialCustomer.name : "");
      setCustomerPhone(initialPhone || (initialCustomer?.phone || ""));
      setOrderType(initialOrderType || "local");
      setSelectedCustomer(initialCustomer);
      
      if (initialCustomer && initialCustomer.addresses.length > 0 && initialOrderType === "delivery") {
        const sorted = [...initialCustomer.addresses].sort(
          (a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
        );
        setCustomerAddress(sorted[0].address);
      } else {
        setCustomerAddress("");
      }
      setPackagingQuantities({});
      setDeliveryCost(0);
      setSelectedDriverId(initialDriverId || "");
    }
  }, [open, total, initialCustomer, initialPhone, initialOrderType, initialDriverId]);

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

  const totalPackagingCost = (orderType === "llevar" || orderType === "delivery")
    ? packagingConfig.reduce((sum, pkg) => sum + (pkg.price * (packagingQuantities[pkg.name] || 0)), 0)
    : 0;
  
  const { taxes, isExonerated } = useImpuestosConfig();
  const taxPercentage = isExonerated ? 0 : (taxes?.[0]?.percentage || 0);
  const extraCostsSubtotal = totalPackagingCost + (orderType === "delivery" ? deliveryCost : 0);
  const extraCostsTax = extraCostsSubtotal * (taxPercentage / 100);
  
  const finalTotal = total + extraCostsSubtotal + extraCostsTax;
  const finalTotalInUSD = finalTotal / exchangeRateVal;

  /** Lógica de validación de pago basada en el método seleccionado */
  const isPaymentValid = () => {
    if (isTableMode) return true; // En modo mesa el pago se procesa diferente o después
    if (paymentMethod === "EFECTIVO") {
      const totalReceived =
        Number(receivedLocal || 0) +
        Number(receivedSecondary || 0) * exchangeRateVal;
      // Permitir una pequeña diferencia por redondeo de decimales
      return totalReceived >= (finalTotal - 0.01);
    }
    // Para otros métodos (TARJETA, APP, MIXTO) la validación es más sencilla o ya está manejada
    if (paymentMethod === "MIXTO") {
      const sum = splitAmounts.efectivo + splitAmounts.tarjeta;
      return Math.abs(sum - finalTotal) < 0.01;
    }
    return true; // TARJETA y APP se asumen válidos al confirmar
  };

  /** Validar que se puedan confirmar los datos de la orden */
  const canConfirm = () => {
    if (!isPaymentValid()) return false;

    if (orderType === "delivery") {
      if (!customerAddress || customerAddress.trim() === "") return false;
      if (!selectedDriverId) return false;
      if (!deliveryCost || deliveryCost <= 0) return false;
    }

    if (orderType === "llevar" || orderType === "delivery") {
      if (packagingConfig.length > 0) {
        const hasPackaging = Object.values(packagingQuantities).some(qty => qty > 0);
        if (!hasPackaging) return false;
      }
    }

    return true;
  };

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
    const packagingItems = (orderType === "llevar" || orderType === "delivery")
      ? packagingConfig
          .filter(pkg => (packagingQuantities[pkg.name] || 0) > 0)
          .map(pkg => ({ name: pkg.name, price: pkg.price, quantity: packagingQuantities[pkg.name] || 0 }))
      : [];

    onConfirm(
      paymentMethod,
      paymentMethod === "MIXTO" ? splitAmounts : undefined,
      customerName,
      orderType,
      customerAddress,
      packagingItems,
      paymentMethod === "EFECTIVO" ? (Number(receivedLocal) || undefined) : undefined,
      orderType === "delivery" ? selectedDriverId : undefined,
      orderType === "delivery" ? deliveryCost : undefined
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
                        {`C$${item.price.toFixed(2)} c/u — Subtotal: C$${(
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
              <Typography color="success.main">Descuento:</Typography>
              <Typography color="success.main">-C${discountAmount.toFixed(2)}</Typography>
            </Box>
          )}
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Impuestos:</Typography>
            <Typography>C${(taxAmount + extraCostsTax).toFixed(2)}</Typography>
          </Box>
          {totalPackagingCost > 0 && (
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Empaques:</Typography>
              <Typography>C${totalPackagingCost.toFixed(2)}</Typography>
            </Box>
          )}
          {orderType === "delivery" && deliveryCost > 0 && (
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Transporte:</Typography>
              <Typography>C${deliveryCost.toFixed(2)}</Typography>
            </Box>
          )}
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography fontWeight="bold">Total:</Typography>
            <Box textAlign="right">
              <Typography fontWeight="bold" color="error.main">
                {config.currencySymbol}{finalTotal.toFixed(2)}
              </Typography>
              {config.enableSecondaryCurrency && (
                <Typography variant="caption" color="text.secondary" display="block">
                  Equivalente: {config.secondaryCurrencySymbol}{finalTotalInUSD.toFixed(2)} (Tasa: {config.currencySymbol}{exchangeRateVal})
                </Typography>
              )}
            </Box>
          </Box>

          {!isTableMode && onApplyPromotion && onRemovePromotion && (
            <PromocionesSelector
              currentPromotion={promotion || null}
              onApply={onApplyPromotion}
              onRemove={onRemovePromotion}
            />
          )}

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

                {!lockOrderType && (
                  <>
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
                      {!hideDeliveryOption && (
                        <ToggleButton value="delivery" sx={{ py: 1 }}>
                          DELIVERY
                        </ToggleButton>
                      )}
                    </ToggleButtonGroup>
                  </>
                )}

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

                    <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                      <TextField
                        select
                        label="Motorizado"
                        value={selectedDriverId}
                        onChange={(e) => setSelectedDriverId(e.target.value)}
                        size="small"
                        sx={{ flex: 1 }}
                      >
                        <MenuItem value="">
                          <em>Ninguno</em>
                        </MenuItem>
                        {drivers.map((driver) => {
                          const driverStats = stats.find(s => s.userId === driver.id);
                          const count = driverStats ? driverStats.todayDeliveries : 0;
                          return (
                            <MenuItem key={driver.id} value={driver.id}>
                              {driver.firstName} {driver.lastName} {count > 0 ? `(${count})` : ""}
                            </MenuItem>
                          );
                        })}
                      </TextField>

                      <TextField
                        select
                        label="Transporte"
                        value={deliveryCost === 0 ? "" : deliveryCost.toString()}
                        onChange={(e) => setDeliveryCost(parseFloat(e.target.value) || 0)}
                        size="small"
                        sx={{ width: 120 }}
                      >
                        {deliveryPrices.map((price, idx) => (
                          <MenuItem key={idx} value={price}>
                            C$ {price}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Box>
                )}

                {/* ── Empaques Utilizados ── */}
                {(orderType === "llevar" || orderType === "delivery") && packagingConfig.length > 0 && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: "background.default", borderRadius: 1, border: 1, borderColor: "divider" }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Empaques Utilizados
                    </Typography>
                    {packagingConfig.map(pkg => (
                      <Box key={pkg.name} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">{pkg.name} (C${pkg.price.toFixed(2)})</Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            style={{ minWidth: 32, padding: 0 }} 
                            onClick={() => setPackagingQuantities(p => ({ ...p, [pkg.name]: Math.max(0, (p[pkg.name] || 0) - 1) }))}
                          >
                            -
                          </Button>
                          <Typography variant="body2" width={20} textAlign="center">
                            {packagingQuantities[pkg.name] || 0}
                          </Typography>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            style={{ minWidth: 32, padding: 0 }} 
                            onClick={() => setPackagingQuantities(p => ({ ...p, [pkg.name]: (p[pkg.name] || 0) + 1 }))}
                          >
                            +
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}

              </Box>

              <Divider sx={{ my: 2 }} />

              <PaymentMethodSelector
                total={finalTotal}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                splitAmounts={splitAmounts}
                setSplitAmounts={setSplitAmounts}
                receivedLocal={receivedLocal}
                setReceivedLocal={setReceivedLocal}
                receivedSecondary={receivedSecondary}
                setReceivedSecondary={setReceivedSecondary}
                currencySymbol={config.currencySymbol}
                secondaryCurrencySymbol={config.secondaryCurrencySymbol}
                exchangeRate={exchangeRateVal}
                enableSecondaryCurrency={config.enableSecondaryCurrency}
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
            disabled={!canConfirm()}
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

      <TicketPrint
        cart={cart}
        subTotal={subTotal}
        discountAmount={discountAmount}
        taxAmount={taxAmount}
        total={total}
        customerName={customerName}
        customerAddress={customerAddress}
        orderType={orderType}
        invoiceNumber={invoiceNumber}
        cashierName={cashierName}
      />
    </>
  );
}
