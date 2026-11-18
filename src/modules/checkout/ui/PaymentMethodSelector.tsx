import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
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
  isValidPosReference,
  POS_REFERENCE_MAX_LENGTH,
  sanitizePosReference,
  toLegacyPaymentMethod,
  type ConfiguredPaymentMethod,
} from "../../settings";
import { blockInvalidChar } from "../../../shared/forms";
import { summarizeMixedCashPayments } from "../model/checkoutFormDomain";

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
  mixedAmounts: SplitAmounts;
  setMixedAmounts(amounts: SplitAmounts): void;
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
  mixedAmounts,
  setMixedAmounts,
  receivedLocal,
  setReceivedLocal,
  receivedSecondary,
  setReceivedSecondary,
  currencySymbol = "C$",
  secondaryCurrencySymbol = "$",
  exchangeRate = 0,
}: Props) {
  const selected =
    methods.find((method) => method.id === selectedMethodId) ?? methods[0];
  const exchange = Number.isFinite(exchangeRate) && exchangeRate > 0 ? exchangeRate : 0;
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

  const [mixedDraft, setMixedDraft] = useState<{
    index: number;
    value: string;
  } | null>(null);
  const [firstMixedMethodId, secondMixedMethodId] = mixedMethodIds;

  useEffect(() => {
    setMixedDraft(null);
  }, [total, paymentMethod, firstMixedMethodId, secondMixedMethodId, exchangeRate]);

  const setFirstAmount = (value: number) => {
    const first = Number(Math.min(total, Math.max(0, value || 0)).toFixed(2));
    setMixedAmounts({
      efectivo: first,
      tarjeta: Number(Math.max(0, total - first).toFixed(2)),
    });
  };

  const setSecondAmount = (value: number) => {
    const second = Number(Math.min(total, Math.max(0, value || 0)).toFixed(2));
    setMixedAmounts({
      efectivo: Number(Math.max(0, total - second).toFixed(2)),
      tarjeta: second,
    });
  };

  const renderReference = (method?: ConfiguredPaymentMethod) => {
    if (!method?.requiresReference) return null;
    const isPos = method.type === "CARD_POS";
    const value = paymentReferences[method.id] ?? "";
    const hasInvalidPosReference =
      isPos && value.length > 0 && !isValidPosReference(value);

    return (
      <TextField
        fullWidth
        size="small"
        required
        label={
          isPos
            ? "Código de autorización / referencia POS"
            : `Referencia de ${method.name}`
        }
        placeholder={isPos ? "Ej.: 123456 o A12B34" : "Número de referencia"}
        value={value}
        onChange={(event) =>
          setReference(
            method.id,
            isPos
              ? sanitizePosReference(event.target.value)
              : event.target.value,
          )
        }
        error={hasInvalidPosReference}
        helperText={
          isPos
            ? "Ingrese del voucher entre 4 y 20 letras, números o guiones; debe contener al menos un número."
            : "Mínimo 4 caracteres."
        }
        slotProps={{
          htmlInput: {
            maxLength: isPos ? POS_REFERENCE_MAX_LENGTH : 120,
            autoCapitalize: isPos ? "characters" : undefined,
          },
        }}
      />
    );
  };

  const mixed = mixedMethodIds.map(
    (id) => methods.find((method) => method.id === id) ?? methods[0],
  );
  const hasUsdCashInMixed =
    paymentMethod === "MIXTO" &&
    mixed.some(
      (method) => method?.type === "CASH" && method?.currency === "USD",
    );
  const hasLocalCashInMixed =
    paymentMethod === "MIXTO" &&
    mixed.some(
      (method) => method?.type === "CASH" && method?.currency !== "USD",
    );

  useEffect(() => {
    if (paymentMethod !== "MIXTO") return;
    if (!hasUsdCashInMixed && receivedSecondary !== "") {
      setReceivedSecondary("");
    }
    if (!hasLocalCashInMixed && receivedLocal !== "") {
      setReceivedLocal("");
    }
  }, [
    hasLocalCashInMixed,
    hasUsdCashInMixed,
    paymentMethod,
    receivedLocal,
    receivedSecondary,
    setReceivedLocal,
    setReceivedSecondary,
  ]);

  const mixedCashSummary = summarizeMixedCashPayments({
    mixedMethods: mixed,
    mixedAmounts,
    receivedLocal,
    receivedSecondary,
    exchangeRate: exchange,
  });

  return (
    <>
      <Typography variant="subtitle2" fontWeight="bold" mb={1}>
        Método de Pago:
      </Typography>
      {exchange === 0 && methods.some((method) => method.currency === "USD") && (
        <Typography color="error" variant="body2" mb={1}>
          Configura una tasa de cambio válida en Configuración general para cobrar en dólares.
        </Typography>
      )}
      <Grid container spacing={1}>
        {methods.map((method) => (
          <Grid key={method.id} size={{ xs: 6, sm: 4 }} sx={{ display: "flex" }}>
            <ToggleButton
              value={method.id}
              disabled={method.currency === "USD" && exchange === 0}
              selected={
                paymentMethod !== "MIXTO" && selectedMethodId === method.id
              }
              onClick={() => choose(method)}
              color="error"
              fullWidth
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                height: "100%",
                minHeight: 88,
                py: 1.5,
              }}
            >
              <MethodIcon type={method.type} />
              <Typography
                variant="caption"
                fontWeight="bold"
                mt={0.5}
                sx={{ lineHeight: 1.2, textAlign: "center" }}
              >
                {method.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" mt={0.25}>
                {method.currency === "USD" ? "US$" : "C$"}
              </Typography>
            </ToggleButton>
          </Grid>
        ))}
        {methods.length >= 2 && (
          <Grid size={{ xs: 6, sm: 4 }} sx={{ display: "flex" }}>
            <ToggleButton
              value="MIXTO"
              selected={paymentMethod === "MIXTO"}
              onClick={() => {
                setPaymentMethod("MIXTO");
                const first = Math.min(
                  total,
                  Math.max(0, mixedAmounts.efectivo),
                );
                setMixedAmounts({
                  efectivo: first,
                  tarjeta: Number(Math.max(0, total - first).toFixed(2)),
                });
              }}
              color="error"
              fullWidth
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                height: "100%",
                minHeight: 88,
                py: 1.5,
              }}
            >
              <CallSplitIcon />
              <Typography
                variant="caption"
                fontWeight="bold"
                mt={0.5}
                sx={{ lineHeight: 1.2, textAlign: "center" }}
              >
                PAGO MIXTO
              </Typography>
              <Typography variant="caption" color="text.secondary" mt={0.25}>
                C$ / US$
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
                index === 0 ? mixedAmounts.efectivo : mixedAmounts.tarjeta;
              const displayedAmount =
                method?.currency === "USD" ? (exchange > 0 ? amount / exchange : 0) : amount;
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
                          disabled={mixedMethodIds[1 - index] === candidate.id || (candidate.currency === "USD" && exchange === 0)}
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
                    label={`Monto ${method?.name ?? ""} en ${method?.currency === "USD" ? "US$" : "C$"}`}
                    value={
                      mixedDraft?.index === index
                        ? mixedDraft.value
                        : displayedAmount
                          ? Number(displayedAmount.toFixed(2))
                          : ""
                    }
                    onChange={(event) => {
                      const raw = event.target.value;
                      setMixedDraft({ index, value: raw });
                      const parsed = Number(raw);
                      const nativeValue =
                        raw === "" || !Number.isFinite(parsed)
                          ? 0
                          : Math.max(0, parsed);
                      const valueInNio =
                        method?.currency === "USD"
                          ? nativeValue * exchange
                          : nativeValue;
                      if (index === 0) setFirstAmount(valueInNio);
                      else setSecondAmount(valueInNio);
                    }}
                    onBlur={() => {
                      setMixedDraft((current) => {
                        if (!current || current.index !== index) return current;
                        if (current.value === "" || current.value === ".") {
                          return null;
                        }
                        if (current.value.endsWith(".")) {
                          return { index, value: current.value.slice(0, -1) };
                        }
                        return current;
                      });
                    }}
                    onKeyDown={blockInvalidChar}
                    sx={{ mb: 1.5 }}
                  />
                  {renderReference(method)}
                </Grid>
              );
            })}
          </Grid>
          {mixedCashSummary.entries.map((cashEntry) => (
            <Box key={cashEntry.currency} mt={2}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label={`Monto recibido en ${cashEntry.currency === "USD" ? "dólares" : "córdobas"}`}
                value={
                  cashEntry.currency === "USD"
                    ? receivedSecondary
                    : receivedLocal
                }
                onChange={(event) => {
                  const value =
                    event.target.value === "" ? "" : Number(event.target.value);
                  if (cashEntry.currency === "USD") {
                    setReceivedSecondary(value);
                  } else {
                    setReceivedLocal(value);
                  }
                }}
                onKeyDown={blockInvalidChar}
              />
              {(cashEntry.due > 0 || cashEntry.received > 0) &&
                cashEntry.received >= cashEntry.due - 0.01 && (
                  <Typography mt={1} fontWeight="bold" color="success.main">
                    Vuelto: {currencySymbol}
                    {Math.max(0, cashEntry.received - cashEntry.due).toFixed(2)}
                  </Typography>
                )}
            </Box>
          ))}
        </Box>
      )}
    </>
  );
}
