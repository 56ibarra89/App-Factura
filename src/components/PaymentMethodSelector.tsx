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
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import { PaymentMethod } from "../types/order.types";

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
}

export default function PaymentMethodSelector({
  total,
  paymentMethod,
  setPaymentMethod,
  splitAmounts,
  setSplitAmounts,
}: PaymentMethodSelectorProps) {
  const handlePaymentMethodChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMethod: PaymentMethod | null
  ) => {
    if (newMethod !== null) {
      setPaymentMethod(newMethod);
      if (newMethod === "MIXTO") {
        // Inicializar mixto asumiendo 0 efectivo, total en tarjeta, o mitad y mitad.
        // Lo más seguro es inicializar con el total en Efectivo 0 y el resto Tarjeta.
        setSplitAmounts({ efectivo: 0, tarjeta: total });
      }
    }
  };

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
        <ToggleButton value="APP" aria-label="App" sx={{ display: 'flex', flexDirection: 'column', py: 2 }}>
          <PhoneIphoneIcon />
          <Typography variant="caption" fontWeight="bold" mt={1}>APP</Typography>
        </ToggleButton>
        <ToggleButton value="MIXTO" aria-label="Mixto" sx={{ display: 'flex', flexDirection: 'column', py: 2 }}>
          <CallSplitIcon />
          <Typography variant="caption" fontWeight="bold" mt={1}>MIXTO</Typography>
        </ToggleButton>
      </ToggleButtonGroup>

      {paymentMethod === "MIXTO" && (
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            label="Efectivo"
            type="number"
            value={splitAmounts.efectivo || ""}
            onChange={handleCashChange}
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start">C$</InputAdornment>,
              inputProps: { min: 0, max: total, step: "0.01" }
            }}
          />
          <Typography variant="h6" color="text.secondary">+</Typography>
          <TextField
            label="Tarjeta"
            type="number"
            value={splitAmounts.tarjeta || ""}
            onChange={handleCardChange}
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start">C$</InputAdornment>,
              inputProps: { min: 0, max: total, step: "0.01" }
            }}
          />
        </Box>
      )}
    </>
  );
}
