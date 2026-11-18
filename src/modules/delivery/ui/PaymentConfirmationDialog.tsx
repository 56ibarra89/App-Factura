import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import type { Order, OrderPaymentDetail } from "../../orders";
import {
  DEFAULT_PAYMENT_METHODS_CONFIG,
  isValidPosReference,
  paymentMethodsGateway,
  sanitizePosReference,
  toLegacyPaymentMethod,
  useGeneralSettings,
  type ConfiguredPaymentMethod,
} from "../../settings";

interface Props {
  open: boolean;
  order: Order | null;
  onClose(): void;
  onConfirm(
    payments: OrderPaymentDetail[],
    paymentMethodLabel: string,
  ): Promise<void>;
}

export function PaymentConfirmationDialog({
  open,
  order,
  onClose,
  onConfirm,
}: Props) {
  const { config } = useGeneralSettings();
  const [methods, setMethods] = useState<ConfiguredPaymentMethod[]>(
    DEFAULT_PAYMENT_METHODS_CONFIG.methods,
  );
  const [selectedId, setSelectedId] = useState("cash-nio");
  const [cashMethodId, setCashMethodId] = useState("cash-nio");
  const [otherId, setOtherId] = useState("card-generic");
  const [mixed, setMixed] = useState(false);
  const [cashAmount, setCashAmount] = useState("");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const total = order?.total ?? 0;

  useEffect(() => {
    if (!open) return;
    setError("");
    void paymentMethodsGateway.load().then((loadedConfig) => {
      const active = loadedConfig.methods.filter((method) => method.isActive);
      if (!active.length) return;
      const defaultCash =
        active.find(
          (method) => method.type === "CASH" && method.currency === "NIO",
        ) ??
        active.find((method) => method.type === "CASH") ??
        active[0];
      const electronic =
        active.find(
          (method) => method.id !== defaultCash.id && method.type !== "CASH",
        ) ??
        active.find((method) => method.id !== defaultCash.id) ??
        active[0];
      setMethods(active);

      const orderPayments = order?.payments ?? [];
      const isOrderMixed =
        order?.paymentMethod === "MIXTO" || orderPayments.length > 1;

      if (isOrderMixed) {
        const cashPayment = orderPayments.find(
          (payment) => payment.method === "EFECTIVO",
        );
        const matchedCash =
          (cashPayment?.methodConfigId &&
            active.find(
              (m) => m.id === cashPayment.methodConfigId && m.type === "CASH",
            )) ||
          defaultCash;
        const otherPayment =
          orderPayments.find((payment) => payment !== cashPayment) ??
          orderPayments[1];
        const matchedOther =
          (otherPayment?.methodConfigId &&
            active.find(
              (m) =>
                m.id === otherPayment.methodConfigId && m.id !== matchedCash.id,
            )) ||
          (otherPayment &&
            active.find(
              (m) =>
                m.id !== matchedCash.id &&
                toLegacyPaymentMethod(m) === otherPayment.method,
            )) ||
          active.find((m) => m.id !== matchedCash.id && m.type !== "CASH") ||
          electronic;

        const rate = Number.isFinite(config.exchangeRate) && config.exchangeRate > 0 ? config.exchangeRate : 0;
        const initialCash =
          matchedCash.currency === "USD"
            ? (cashPayment?.originalAmount ??
              (cashPayment?.amount && rate > 0
                ? Math.round((cashPayment.amount / rate) * 100) / 100
                : 0))
            : (cashPayment?.amount ?? order?.splitAmounts?.efectivo ?? 0);

        setMixed(true);
        setSelectedId(matchedCash.id);
        setCashMethodId(matchedCash.id);
        setOtherId(matchedOther.id);
        setCashAmount(initialCash > 0 ? String(initialCash) : "");
        setReference(otherPayment?.reference ?? "");
      } else {
        const singlePayment = orderPayments[0];
        const matchedSingle =
          (singlePayment?.methodConfigId &&
            active.find((m) => m.id === singlePayment.methodConfigId)) ||
          (order?.paymentMethod &&
            active.find(
              (m) => toLegacyPaymentMethod(m) === order.paymentMethod,
            )) ||
          defaultCash;

        setMixed(false);
        setSelectedId(matchedSingle.id);
        setCashMethodId(defaultCash.id);
        setOtherId(electronic.id);
        setCashAmount("");
        setReference(singlePayment?.reference ?? "");
      }
    });
  }, [config.exchangeRate, open, order]);

  const exchangeRate = Number.isFinite(config.exchangeRate) && config.exchangeRate > 0 ? config.exchangeRate : 0;
  const cashMethods = useMemo(
    () => methods.filter((method) => method.type === "CASH"),
    [methods],
  );
  const defaultCash =
    cashMethods.find((method) => method.currency === "NIO") ?? cashMethods[0];
  const cash =
    cashMethods.find((method) => method.id === cashMethodId) ?? defaultCash;
  const secondaryMethods = useMemo(
    () => methods.filter((method) => method.id !== cash?.id),
    [cash?.id, methods],
  );
  const selected = methods.find((method) => method.id === selectedId);
  const other =
    secondaryMethods.find((method) => method.id === otherId) ??
    secondaryMethods[0];
  const parsedCashInput = Number(cashAmount) || 0;
  const cashNioAmount =
    cash?.currency === "USD"
      ? Math.round(parsedCashInput * exchangeRate * 100) / 100
      : Math.round(parsedCashInput * 100) / 100;
  const otherAmount = Math.max(
    0,
    Math.round((total - cashNioAmount) * 100) / 100,
  );
  const referenceRequired = mixed
    ? other?.requiresReference
    : selected?.requiresReference;
  const referenceMethod = mixed ? other : selected;
  const validReference =
    !referenceRequired ||
    (referenceMethod?.type === "CARD_POS"
      ? isValidPosReference(reference)
      : reference.trim().length >= 4);

  const buildPayment = (
    method: ConfiguredPaymentMethod,
    amountNio: number,
    paymentReference?: string,
    explicitOriginalAmount?: number,
  ): OrderPaymentDetail => {
    const rate =
      method.currency === "USD"
        ? exchangeRate
        : 1;
    const roundedNio = Math.round(amountNio * 100) / 100;
    const originalAmount =
      explicitOriginalAmount !== undefined && method.currency === "USD"
        ? Math.round(explicitOriginalAmount * 10000) / 10000
        : Math.round((roundedNio / rate) * 10000) / 10000;
    return {
      method: toLegacyPaymentMethod(method),
      amount: roundedNio,
      methodConfigId: method.id,
      reference: paymentReference?.trim() || undefined,
      originalAmount,
      exchangeRate: rate,
    };
  };

  const handleConfirm = async () => {
    if (!order || !validReference) return;
    setLoading(true);
    setError("");
    try {
      let payments: OrderPaymentDetail[];
      let label: string;
      if (mixed) {
        if (
          (cash?.currency === "USD" || other?.currency === "USD") &&
          exchangeRate <= 0
        ) {
          throw new Error(
            "Configura una tasa de cambio USD válida antes de cobrar en dólares.",
          );
        }
        if (
          !cash ||
          !other ||
          parsedCashInput <= 0 ||
          cashNioAmount <= 0 ||
          otherAmount <= 0
        ) {
          throw new Error("Ingresa dos montos válidos para el pago mixto.");
        }
        payments = [
          buildPayment(
            cash,
            cashNioAmount,
            undefined,
            cash.currency === "USD" ? parsedCashInput : undefined,
          ),
          buildPayment(other, otherAmount, reference),
        ];
        label = `${cash.name} + ${other.name}`;
      } else {
        if (!selected) throw new Error("Selecciona un método de pago.");
        if (selected.currency === "USD" && exchangeRate <= 0) {
          throw new Error(
            "Configura una tasa de cambio USD válida antes de cobrar en dólares.",
          );
        }
        payments = [buildPayment(selected, total, reference)];
        label = selected.name;
      }
      await onConfirm(payments, label);
      onClose();
    } catch (caught: unknown) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudo registrar el cobro.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Confirmar Liquidación de Pedido
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Pedido #{order.invoiceNumber || order.id.slice(-6)}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Box bgcolor="action.hover" p={2} borderRadius={2} mb={2}>
          <Typography variant="body2" color="text.secondary">
            Total a cobrar
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            C${total.toFixed(2)}
          </Typography>
        </Box>
        <Grid container spacing={1} mb={2}>
          {methods.map((method) => (
            <Grid key={method.id} size={{ xs: 6, sm: 4 }} sx={{ display: "flex" }}>
              <Button
                fullWidth
                variant={
                  !mixed && selectedId === method.id ? "contained" : "outlined"
                }
                onClick={() => {
                  setMixed(false);
                  setSelectedId(method.id);
                  setReference("");
                }}
                sx={{ height: "100%", minHeight: 58, textTransform: "none" }}
              >
                {method.name}
              </Button>
            </Grid>
          ))}
          {cash && secondaryMethods.length > 0 && (
            <Grid size={{ xs: 6, sm: 4 }} sx={{ display: "flex" }}>
              <Button
                fullWidth
                variant={mixed ? "contained" : "outlined"}
                startIcon={<CallSplitIcon />}
                onClick={() => setMixed(true)}
                sx={{ height: "100%", minHeight: 58, textTransform: "none" }}
              >
                Mixto
              </Button>
            </Grid>
          )}
        </Grid>

        {mixed && cash && (
          <Grid container spacing={2} mb={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              {cashMethods.length > 1 && (
                <Select
                  fullWidth
                  size="small"
                  sx={{ mb: 1 }}
                  value={cash.id}
                  onChange={(event) => {
                    const nextCashId = event.target.value;
                    setCashMethodId(nextCashId);
                    if (otherId === nextCashId) {
                      const nextOther = methods.find(
                        (method) => method.id !== nextCashId,
                      );
                      if (nextOther) {
                        setOtherId(nextOther.id);
                        setReference("");
                      }
                    }
                  }}
                >
                  {cashMethods.map((method) => (
                    <MenuItem key={method.id} value={method.id}>
                      {method.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
              <TextField
                fullWidth
                size="small"
                type="number"
                label={cash.name}
                value={cashAmount}
                onChange={(event) => setCashAmount(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {cash.currency === "USD" ? "$" : "C$"}
                    </InputAdornment>
                  ),
                }}
              />
              {cash.currency === "USD" && parsedCashInput > 0 && exchangeRate > 0 && (
                <Typography variant="caption" color="text.secondary">
                  Equivale a C${cashNioAmount.toFixed(2)} (T/C{" "}
                  {exchangeRate.toFixed(2)})
                </Typography>
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Select
                fullWidth
                size="small"
                value={other?.id ?? ""}
                onChange={(event) => {
                  setOtherId(event.target.value);
                  setReference("");
                }}
              >
                {secondaryMethods.map((method) => (
                  <MenuItem key={method.id} value={method.id}>
                    {method.name}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary">
                {other?.currency === "USD" && exchangeRate <= 0
                  ? "Configura una tasa de cambio válida para cobrar en dólares."
                  : other?.currency === "USD"
                  ? `Monto restante: $${(otherAmount / exchangeRate).toFixed(2)} (C$${otherAmount.toFixed(2)})`
                  : `Monto restante: C$${otherAmount.toFixed(2)}`}
              </Typography>
            </Grid>
          </Grid>
        )}

        {referenceRequired && (
          <TextField
            fullWidth
            required
            label="Número de referencia / aprobación"
            value={reference}
            onChange={(event) =>
              setReference(
                referenceMethod?.type === "CARD_POS"
                  ? sanitizePosReference(event.target.value)
                  : event.target.value,
              )
            }
            helperText="Ingresa al menos los últimos 4 caracteres del voucher."
          />
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleConfirm()}
          disabled={loading || !validReference}
        >
          {loading ? <CircularProgress size={22} /> : "Confirmar y liquidar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
