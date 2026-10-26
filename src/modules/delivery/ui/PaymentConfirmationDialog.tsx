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
import { paymentMethodsGateway } from "../../settings/api/paymentMethodsGateway";
import {
  DEFAULT_PAYMENT_METHODS_CONFIG,
  isValidPosReference,
  sanitizePosReference,
  toLegacyPaymentMethod,
  type ConfiguredPaymentMethod,
} from "../../settings/model/paymentMethods.types";
import { useGeneralSettings } from "../../settings";

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
    void paymentMethodsGateway.load().then((config) => {
      const active = config.methods.filter((method) => method.isActive);
      if (!active.length) return;
      const cashMethod =
        active.find(
          (method) => method.type === "CASH" && method.currency === "NIO",
        ) ??
        active.find((method) => method.type === "CASH") ??
        active[0];
      const electronic =
        active.find((method) => method.type !== "CASH") ?? active[0];
      setMethods(active);

      const orderPayments = order?.payments ?? [];
      const isOrderMixed =
        order?.paymentMethod === "MIXTO" || orderPayments.length > 1;

      if (isOrderMixed) {
        const cashPayment = orderPayments.find(
          (payment) => payment.method === "EFECTIVO",
        );
        const otherPayment =
          orderPayments.find((payment) => payment.method !== "EFECTIVO") ??
          orderPayments[1];
        const matchedOther =
          (otherPayment?.methodConfigId &&
            active.find((m) => m.id === otherPayment.methodConfigId)) ||
          (otherPayment &&
            active.find(
              (m) =>
                m.id !== cashMethod.id &&
                toLegacyPaymentMethod(m) === otherPayment.method,
            )) ||
          electronic;
        const initialCash =
          cashPayment?.amount ?? order?.splitAmounts?.efectivo ?? 0;

        setMixed(true);
        setSelectedId(cashMethod.id);
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
          cashMethod;

        setMixed(false);
        setSelectedId(matchedSingle.id);
        setOtherId(electronic.id);
        setCashAmount("");
        setReference(singlePayment?.reference ?? "");
      }
    });
  }, [open, order]);

  const selected = methods.find((method) => method.id === selectedId);
  const cash =
    methods.find(
      (method) => method.type === "CASH" && method.currency === "NIO",
    ) ?? methods.find((method) => method.type === "CASH");
  const other = methods.find((method) => method.id === otherId);
  const otherAmount = Math.max(0, total - (Number(cashAmount) || 0));
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
    amount: number,
    paymentReference?: string,
  ): OrderPaymentDetail => {
    const exchangeRate =
      method.currency === "USD" && config.exchangeRate > 0
        ? config.exchangeRate
        : 1;
    return {
      method: toLegacyPaymentMethod(method),
      amount,
      methodConfigId: method.id,
      reference: paymentReference?.trim() || undefined,
      originalAmount: Math.round((amount / exchangeRate) * 100) / 100,
      exchangeRate,
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
        const cashValue = Number(cashAmount) || 0;
        if (!cash || !other || cashValue <= 0 || otherAmount <= 0) {
          throw new Error("Ingresa dos montos válidos para el pago mixto.");
        }
        payments = [
          buildPayment(cash, cashValue),
          buildPayment(other, otherAmount, reference),
        ];
        label = `${cash.name} + ${other.name}`;
      } else {
        if (!selected) throw new Error("Selecciona un método de pago.");
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

  const electronicMethods = useMemo(
    () => methods.filter((method) => method.id !== cash?.id),
    [cash?.id, methods],
  );

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
          {cash && electronicMethods.length > 0 && (
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
              <TextField
                fullWidth
                size="small"
                type="number"
                label={cash.name}
                value={cashAmount}
                onChange={(event) => setCashAmount(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">C$</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Select
                fullWidth
                size="small"
                value={otherId}
                onChange={(event) => {
                  setOtherId(event.target.value);
                  setReference("");
                }}
              >
                {electronicMethods.map((method) => (
                  <MenuItem key={method.id} value={method.id}>
                    {method.name}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary">
                Monto restante: C${otherAmount.toFixed(2)}
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
