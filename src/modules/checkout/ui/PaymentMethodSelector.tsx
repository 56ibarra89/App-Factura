import type { Dispatch, SetStateAction } from "react";
import {
  Box,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  Typography,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import type { PaymentMethod } from "../../orders";
import {
  toLegacyPaymentMethod,
  type ConfiguredPaymentMethod,
} from "../../settings/model/paymentMethods.types";
import { blockInvalidChar } from "../../../shared/forms";

interface SplitAmounts {
  efectivo: number;
  tarjeta: number;
}

interface Props {
  total: number;
  methods: ConfiguredPaymentMethod[];
  paymentMethod: PaymentMethod;
  setPaymentMethod(method: PaymentMethod): void;
  selectedMethodId: string;
  setSelectedMethodId(id: string): void;
  mixedMethodIds: [string, string];
  setMixedMethodIds: Dispatch<SetStateAction<[string, string]>>;
  paymentReferences: Record<string, string>;
  setPaymentReferences: Dispatch<SetStateAction<Record<string, string>>>;
  splitAmounts: SplitAmounts;
  setSplitAmounts(amounts: SplitAmounts): void;
  receivedLocal: number | "";
  setReceivedLocal(value: number | ""): void;
  receivedSecondary: number | "";
  setReceivedSecondary(value: number | ""): void;
  currencySymbol?: string;
  secondaryCurrencySymbol?: string;
  exchangeRate?: number;
}

const MethodIcon = ({ type }: { type: ConfiguredPaymentMethod["type"] }) => {
  if (type === "CASH") return <AttachMoneyIcon />;
  if (type === "CARD_POS") return <CreditCardIcon />;
  if (type === "DIGITAL_WALLET") return <PhoneAndroidIcon />;
  return <AccountBalanceIcon />;
};

export default function PaymentMethodSelector({
  total,
  methods,
  paymentMethod,
  setPaymentMethod,
  selectedMethodId,
  setSelectedMethodId,
  mixedMethodIds,
  setMixedMethodIds,
  paymentReferences,
  setPaymentReferences,
  splitAmounts,
  setSplitAmounts,
  receivedLocal,
  setReceivedLocal,
  receivedSecondary,
  setReceivedSecondary,
  currencySymbol = "C$",
  secondaryCurrencySymbol = "$",
  exchangeRate = 36.5,
}: Props) {
  const selected =
    methods.find((method) => method.id === selectedMethodId) ?? methods[0];
  const exchange = exchangeRate > 0 ? exchangeRate : 36.5;
  const received =
    selected?.currency === "USD"
      ? Number(receivedSecondary) * exchange
      : Number(receivedLocal);
  const hasReceived =
    selected?.currency === "USD"
      ? receivedSecondary !== ""
      : receivedLocal !== "";
  const change = hasReceived && received >= total ? received - total : null;

  const choose = (method: ConfiguredPaymentMethod) => {
    setSelectedMethodId(method.id);
    setPaymentMethod(toLegacyPaymentMethod(method));
    setReceivedLocal("");
    setReceivedSecondary("");
  };

  const setReference = (id: string, value: string) =>
    setPaymentReferences((current) => ({ ...current, [id]: value }));

  const setFirstAmount = (value: number) => {
    const first = Math.min(total, Math.max(0, value || 0));
    setSplitAmounts({
      efectivo: first,
      tarjeta: Number((total - first).toFixed(2)),
    });
  };

  const renderReference = (method?: ConfiguredPaymentMethod) =>
    method?.requiresReference ? (
      <TextField
        fullWidth
        size="small"
        required
        label={`Referencia de ${method.name}`}
        placeholder="Últimos 4 dígitos o aprobación"
        value={paymentReferences[method.id] ?? ""}
        onChange={(event) => setReference(method.id, event.target.value)}
        helperText="Mínimo 4 caracteres. El backend no permitirá facturar sin ella."
      />
    ) : null;

  const mixed = mixedMethodIds.map(
    (id) => methods.find((method) => method.id === id) ?? methods[0],
  );

  return (
    <>
      <Typography variant="subtitle2" fontWeight="bold" mb={1}>
        Método de Pago:
      </Typography>
      <Grid container spacing={1}>
        {methods.map((method) => (
          <Grid key={method.id} size={{ xs: 6, sm: 4 }}>
            <ToggleButton
              value={method.id}
              selected={
                paymentMethod !== "MIXTO" && selectedMethodId === method.id
              }
              onClick={() => choose(method)}
              color="error"
              fullWidth
              sx={{ display: "flex", flexDirection: "column", py: 1.5 }}
            >
              <MethodIcon type={method.type} />
              <Typography variant="caption" fontWeight="bold" mt={0.5}>
                {method.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {method.currency === "USD" ? "US$" : "C$"}
              </Typography>
            </ToggleButton>
          </Grid>
        ))}
        {methods.length >= 2 && (
          <Grid size={{ xs: 6, sm: 4 }}>
            <ToggleButton
              value="MIXTO"
              selected={paymentMethod === "MIXTO"}
              onClick={() => {
                setPaymentMethod("MIXTO");
                setSplitAmounts({ efectivo: 0, tarjeta: total });
              }}
              color="error"
              fullWidth
              sx={{ display: "flex", flexDirection: "column", py: 1.5 }}
            >
              <CallSplitIcon />
              <Typography variant="caption" fontWeight="bold" mt={0.5}>
                PAGO MIXTO
              </Typography>
            </ToggleButton>
          </Grid>
        )}
      </Grid>

      {paymentMethod !== "MIXTO" && selected && (
        <Box
          mt={2}
          p={2}
          border="1px solid"
          borderColor="divider"
          borderRadius={2}
        >
          {selected.type === "CASH" && (
            <TextField
              fullWidth
              size="small"
              type="number"
              label={`Monto recibido en ${selected.currency === "USD" ? "dólares" : "córdobas"}`}
              value={
                selected.currency === "USD" ? receivedSecondary : receivedLocal
              }
              onChange={(event) => {
                const value =
                  event.target.value === "" ? "" : Number(event.target.value);
                if (selected.currency === "USD") setReceivedSecondary(value);
                else setReceivedLocal(value);
              }}
              onKeyDown={blockInvalidChar}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {selected.currency === "USD"
                      ? secondaryCurrencySymbol
                      : currencySymbol}
                  </InputAdornment>
                ),
              }}
              helperText={
                selected.currency === "USD"
                  ? `Tipo de cambio: ${currencySymbol}${exchange.toFixed(4)}`
                  : undefined
              }
            />
          )}
          {renderReference(selected)}
          {change !== null && (
            <Typography mt={1.5} fontWeight="bold" color="success.main">
              Vuelto: {currencySymbol}
              {change.toFixed(2)}
            </Typography>
          )}
          {selected.type === "CASH" && hasReceived && received < total && (
            <Typography mt={1} variant="caption" color="error">
              El monto recibido es menor al total.
            </Typography>
          )}
        </Box>
      )}

      {paymentMethod === "MIXTO" && (
        <Box
          mt={2}
          p={2}
          border="1px solid"
          borderColor="divider"
          borderRadius={2}
        >
          <Grid container spacing={2}>
            {[0, 1].map((index) => {
              const method = mixed[index];
              const amount =
                index === 0 ? splitAmounts.efectivo : splitAmounts.tarjeta;
              return (
                <Grid key={index} size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                    <InputLabel>{`Método ${index + 1}`}</InputLabel>
                    <Select
                      label={`Método ${index + 1}`}
                      value={mixedMethodIds[index]}
                      onChange={(event) =>
                        setMixedMethodIds((current) => {
                          const next: [string, string] = [...current];
                          next[index] = event.target.value;
                          return next;
                        })
                      }
                    >
                      {methods.map((candidate) => (
                        <MenuItem
                          key={candidate.id}
                          value={candidate.id}
                          disabled={mixedMethodIds[1 - index] === candidate.id}
                        >
                          {candidate.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label={`Monto ${method?.name ?? ""} en C$`}
                    value={amount || ""}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      if (index === 0) setFirstAmount(value);
                      else setFirstAmount(total - value);
                    }}
                    onKeyDown={blockInvalidChar}
                    sx={{ mb: 1.5 }}
                  />
                  {renderReference(method)}
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}
    </>
  );
}
