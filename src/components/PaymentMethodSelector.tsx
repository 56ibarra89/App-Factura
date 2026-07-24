import React from "react";
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  InputAdornment,
} from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import { PaymentMethod } from "../types/order.types";
import { blockInvalidChar } from "../utils/inputUtils";

interface SplitAmounts {
  efectivo: number;
  tarjeta: number;
}

interface PaymentMethodSelectorProps {
  total: number;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  splitAmounts: SplitAmounts;
  setSplitAmounts: (amounts: SplitAmounts) => void;
  receivedLocal: number | "";
  setReceivedLocal: (val: number | "") => void;
  receivedSecondary: number | "";
  setReceivedSecondary: (val: number | "") => void;
  currencySymbol?: string;
  secondaryCurrencySymbol?: string;
  exchangeRate?: number;
  enableSecondaryCurrency?: boolean;
}

export default function PaymentMethodSelector({
  total,
  paymentMethod,
  setPaymentMethod,
  splitAmounts,
  setSplitAmounts,
  receivedLocal,
  setReceivedLocal,
  receivedSecondary,
  setReceivedSecondary,
  currencySymbol = "C$",
  secondaryCurrencySymbol = "$",
  exchangeRate = 36.50,
  enableSecondaryCurrency = false,
}: PaymentMethodSelectorProps) {
  const handlePaymentMethodChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMethod: PaymentMethod | null
  ) => {
    if (newMethod !== null) {
      setPaymentMethod(newMethod);
      if (newMethod === "MIXTO") {
        setSplitAmounts({ efectivo: 0, tarjeta: total });
      }
      setReceivedLocal("");
      setReceivedSecondary("");
    }
  };

  const exchangeRateVal = exchangeRate > 0 ? exchangeRate : 36.50;
  const totalReceivedInCordobas = Number(receivedLocal) + (Number(receivedSecondary) * exchangeRateVal);
  const hasReceivedAny = receivedLocal !== "" || receivedSecondary !== "";
  const change = hasReceivedAny && totalReceivedInCordobas >= total ? totalReceivedInCordobas - total : null;


  const handleCashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Si el valor ingresado es vacío, asumimos 0
    let cash = parseFloat(e.target.value);
    if (isNaN(cash) || cash < 0) cash = 0;
    if (cash > total) cash = total; // No puede ser mayor al total
    
    // Auto rellenar tarjeta con el restante
    const card = Number((total - cash).toFixed(2));
    setSplitAmounts({ efectivo: cash, tarjeta: card });
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Si el valor ingresado es vacío, asumimos 0
    let card = parseFloat(e.target.value);
    if (isNaN(card) || card < 0) card = 0;
    if (card > total) card = total;

    // Auto rellenar efectivo con el restante
    const cash = Number((total - card).toFixed(2));
    setSplitAmounts({ efectivo: cash, tarjeta: card });
  };

  return (
    <>
      <Typography variant="subtitle2" fontWeight="bold" mb={1}>
        Método de Pago:
      </Typography>
      <ToggleButtonGroup
        value={paymentMethod}
        exclusive
        onChange={handlePaymentMethodChange}
        fullWidth
        aria-label="método de pago"
        color="error"
        sx={{ mb: paymentMethod === "MIXTO" ? 2 : 0 }}
      >
        <ToggleButton value="EFECTIVO" aria-label="Efectivo" sx={{ display: 'flex', flexDirection: 'column', py: 2 }}>
          <AttachMoneyIcon />
          <Typography variant="caption" fontWeight="bold" mt={1}>EFECTIVO</Typography>
        </ToggleButton>
        <ToggleButton value="TARJETA" aria-label="Tarjeta" sx={{ display: 'flex', flexDirection: 'column', py: 2 }}>
          <CreditCardIcon />
          <Typography variant="caption" fontWeight="bold" mt={1}>TARJETA</Typography>
        </ToggleButton>
        <ToggleButton value="MIXTO" aria-label="Mixto" sx={{ display: 'flex', flexDirection: 'column', py: 2 }}>
          <CallSplitIcon />
          <Typography variant="caption" fontWeight="bold" mt={1}>MIXTO</Typography>
        </ToggleButton>
      </ToggleButtonGroup>

      {/* EFECTIVO - Calculadora de Vuelto */}
      {paymentMethod === "EFECTIVO" && (
        <Box mt={2} p={2} sx={{ bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" mb={2}>Monto Recibido</Typography>
          <Box display="flex" gap={2}>
            <TextField
              label={`Efectivo en ${currencySymbol}`}
              type="number"
              value={receivedLocal}
              onChange={(e) => setReceivedLocal(e.target.value === "" ? "" : parseFloat(e.target.value))}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
                inputProps: { min: 0, step: "0.01" }
              }}
              onKeyDown={blockInvalidChar}
            />
            {enableSecondaryCurrency && (
              <TextField
                label={`Efectivo en ${secondaryCurrencySymbol}`}
                type="number"
                value={receivedSecondary}
                onChange={(e) => setReceivedSecondary(e.target.value === "" ? "" : parseFloat(e.target.value))}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">{secondaryCurrencySymbol}</InputAdornment>,
                  inputProps: { min: 0, step: "0.01" }
                }}
                onKeyDown={blockInvalidChar}
              />
            )}
          </Box>
          
          {change !== null && (
            <Box mt={2} pt={2} borderTop={1} borderColor="divider" display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body1" fontWeight="bold">Vuelto a entregar:</Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {currencySymbol}{change.toFixed(2)}
              </Typography>
            </Box>
          )}
          {hasReceivedAny && totalReceivedInCordobas < total && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              El monto recibido (C${totalReceivedInCordobas.toFixed(2)}) es menor al total de la factura.
            </Typography>
          )}
        </Box>
      )}

      {/* MIXTO */}
      {paymentMethod === "MIXTO" && (
        <Box mt={2} p={2} sx={{ bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
           <Typography variant="subtitle2" mb={2}>Dividir Pago</Typography>
           <Box display="flex" gap={2} alignItems="center">
            <TextField
              label="Efectivo"
              type="number"
              value={splitAmounts.efectivo || ""}
              onChange={handleCashChange}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
                inputProps: { min: 0, max: total, step: "0.01" }
              }}
              onKeyDown={blockInvalidChar}
            />
            <Typography variant="h6" color="text.secondary">+</Typography>
            <TextField
              label="Tarjeta"
              type="number"
              value={splitAmounts.tarjeta || ""}
              onChange={handleCardChange}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
                inputProps: { min: 0, max: total, step: "0.01" }
              }}
              onKeyDown={blockInvalidChar}
            />
          </Box>
        </Box>
      )}
    </>
  );
}
