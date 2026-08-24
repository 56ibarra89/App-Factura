import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import type { Order } from "../../orders";

interface PaymentConfirmationDialogProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onConfirm: (
    payments: { method: string; amount: number }[],
    paymentMethodLabel: string,
  ) => Promise<void>;
}

type SelectedMethod = "EFECTIVO" | "TARJETA" | "APP" | "MIXTO";

export const PaymentConfirmationDialog: React.FC<
  PaymentConfirmationDialogProps
> = ({ open, order, onClose, onConfirm }) => {
  const [selectedMethod, setSelectedMethod] =
    useState<SelectedMethod>("EFECTIVO");
  const [cashAmount, setCashAmount] = useState("");
  const [otherAmount, setOtherAmount] = useState("");
  const [otherMethod, setOtherMethod] = useState<"TARJETA" | "APP">("TARJETA");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = order?.total || 0;

  useEffect(() => {
    if (!order) return;
    const initialMethod = (
      order.paymentMethod || "EFECTIVO"
    ).toUpperCase() as SelectedMethod;

    if (["EFECTIVO", "TARJETA", "APP", "MIXTO"].includes(initialMethod)) {
      setSelectedMethod(initialMethod);
    } else {
      setSelectedMethod("EFECTIVO");
    }

    if (initialMethod === "MIXTO" && order.splitAmounts) {
      setCashAmount(String(order.splitAmounts.efectivo || ""));
      setOtherAmount(String(order.splitAmounts.tarjeta || ""));
      setOtherMethod("TARJETA");
    } else {
      setCashAmount("");
      setOtherAmount("");
    }
    setError("");
    setLoading(false);
  }, [order, open]);

  const handleCashChange = (val: string) => {
    setCashAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num <= total) {
      setOtherAmount((total - num).toFixed(2));
    }
  };

  const handleConfirm = async () => {
    if (!order) return;
    setError("");
    setLoading(true);

    try {
      let payments: { method: string; amount: number }[] = [];

      if (selectedMethod === "MIXTO") {
        const cash = parseFloat(cashAmount) || 0;
        const other = parseFloat(otherAmount) || 0;

        if (Math.abs(cash + other - total) > 0.01) {
          setError(
            `La suma de efectivo (C$${cash.toFixed(2)}) y ${otherMethod} (C$${other.toFixed(2)}) debe coincidir con el total de C$${total.toFixed(2)}`,
          );
          setLoading(false);
          return;
        }

        payments = [
          { method: "EFECTIVO", amount: cash },
          { method: otherMethod, amount: other },
        ].filter((p) => p.amount > 0);
      } else {
        payments = [{ method: selectedMethod, amount: total }];
      }

      await onConfirm(payments, selectedMethod);
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al registrar el cobro del pedido.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight="bold">
          Confirmar Liquidación de Pedido
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Pedido #{order.invoiceNumber || order.id.slice(-6)} • {order.customerName || "Cliente"}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: 2, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Total a Cobrar:
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              C${total.toFixed(2)}
            </Typography>
          </Box>
          {order.paymentMethod && (
            <Box mt={1} display="flex" alignItems="center" gap={1}>
              <Typography variant="caption" color="text.secondary">
                Método registrado originalmente:
              </Typography>
              <Chip
                label={order.paymentMethod.toUpperCase()}
                size="small"
                variant="outlined"
                color="info"
              />
            </Box>
          )}
        </Box>

        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Selecciona el método de cobro real:
        </Typography>

        <Grid container spacing={1.5} mb={3}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Button
              variant={selectedMethod === "EFECTIVO" ? "contained" : "outlined"}
              fullWidth
              onClick={() => setSelectedMethod("EFECTIVO")}
              startIcon={<AttachMoneyIcon />}
              sx={{ py: 1.5, textTransform: "none" }}
            >
              Efectivo
            </Button>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Button
              variant={selectedMethod === "TARJETA" ? "contained" : "outlined"}
              fullWidth
              onClick={() => setSelectedMethod("TARJETA")}
              startIcon={<CreditCardIcon />}
              sx={{ py: 1.5, textTransform: "none" }}
            >
              Tarjeta
            </Button>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Button
              variant={selectedMethod === "APP" ? "contained" : "outlined"}
              fullWidth
              onClick={() => setSelectedMethod("APP")}
              startIcon={<PhoneAndroidIcon />}
              sx={{ py: 1.5, textTransform: "none" }}
            >
              App / Transf.
            </Button>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Button
              variant={selectedMethod === "MIXTO" ? "contained" : "outlined"}
              fullWidth
              onClick={() => setSelectedMethod("MIXTO")}
              startIcon={<CallSplitIcon />}
              sx={{ py: 1.5, textTransform: "none" }}
            >
              Mixto
            </Button>
          </Grid>
        </Grid>

        {selectedMethod === "MIXTO" && (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              mb: 2,
              bgcolor: "background.paper",
            }}
          >
            <Typography variant="body2" fontWeight="bold" mb={1.5}>
              Desglose de Pago Mixto:
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Monto en Efectivo"
                  type="number"
                  fullWidth
                  size="small"
                  value={cashAmount}
                  onChange={(e) => handleCashChange(e.target.value)}
                  inputProps={{ min: 0, max: total, step: "0.01" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">C$</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={`Monto en ${otherMethod === "TARJETA" ? "Tarjeta" : "App / Transf."}`}
                  type="number"
                  fullWidth
                  size="small"
                  value={otherAmount}
                  onChange={(e) => setOtherAmount(e.target.value)}
                  inputProps={{ min: 0, max: total, step: "0.01" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">C$</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box display="flex" gap={1} alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Método electrónico complementario:
                  </Typography>
                  <Button
                    size="small"
                    variant={otherMethod === "TARJETA" ? "contained" : "outlined"}
                    onClick={() => setOtherMethod("TARJETA")}
                    sx={{ textTransform: "none", py: 0.2 }}
                  >
                    Tarjeta
                  </Button>
                  <Button
                    size="small"
                    variant={otherMethod === "APP" ? "contained" : "outlined"}
                    onClick={() => setOtherMethod("APP")}
                    sx={{ textTransform: "none", py: 0.2 }}
                  >
                    App / Transf.
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Confirmar y Liquidar"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
