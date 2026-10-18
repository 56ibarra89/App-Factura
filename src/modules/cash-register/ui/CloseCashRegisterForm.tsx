import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Grid,
  alpha,
  Divider,
} from "@mui/material";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import NightlightRoundIcon from "@mui/icons-material/NightlightRound";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import type { CashDenominationCount } from "../model/cash-register.types";
import { CashDenominationDialog } from "./CashDenominationDialog";

interface Props {
  closeType: "HANDOVER" | "END_OF_DAY";
  onChangeCloseType: (type: "HANDOVER" | "END_OF_DAY") => void;
  amount: string;
  onChangeAmount: (value: string) => void;
  declaredCardAmount: string;
  onChangeDeclaredCardAmount: (value: string) => void;
  declaredAppAmount: string;
  onChangeDeclaredAppAmount: (value: string) => void;
  onApplyBreakdown: (entries: CashDenominationCount[], total: number) => void;
  denominationBreakdown?: CashDenominationCount[];
  onSubmit: () => void;
  onCancel: () => void;
  canSubmit: boolean;
  openingAmount: number;
  requiresAuthorization: boolean;
  discrepancyReason: string;
  onChangeDiscrepancyReason: (value: string) => void;
  authorizationPin: string;
  onChangeAuthorizationPin: (value: string) => void;
  loading?: boolean;
}

export function CloseCashRegisterForm({
  closeType,
  onChangeCloseType,
  amount,
  onChangeAmount,
  declaredCardAmount,
  onChangeDeclaredCardAmount,
  declaredAppAmount,
  onChangeDeclaredAppAmount,
  onApplyBreakdown,
  denominationBreakdown,
  onSubmit,
  onCancel,
  canSubmit,
  requiresAuthorization,
  discrepancyReason,
  onChangeDiscrepancyReason,
  authorizationPin,
  onChangeAuthorizationPin,
  loading = false,
}: Props) {
  const parseAmount = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const cashAmount = parseAmount(amount);
  const cardAmount = parseAmount(declaredCardAmount);
  const appAmount = parseAmount(declaredAppAmount);
  const declaredTotal = cashAmount + cardAmount + appAmount;
  const financialInputSx = {
    "& .MuiInputBase-input": {
      fontSize: "1.1rem",
      fontWeight: 700,
      fontVariantNumeric: "tabular-nums",
      textAlign: "right",
    },
  } as const;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Grid container spacing={3}>
        {/* COLUMNA IZQUIERDA: Modalidad y Reglas */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              height: "100%",
            }}
          >
            {/* Selector de Modalidad */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Stack direction="row" spacing={0.75} alignItems="center" mb={0.5}>
                <SettingsOutlinedIcon fontSize="small" color="action" />
                <Typography variant="subtitle2" fontWeight="800" color="text.primary">
                  Modalidad de Cierre
                </Typography>
              </Stack>
              <ToggleButtonGroup
                value={closeType}
                exclusive
                onChange={(_, newType) => {
                  if (newType) onChangeCloseType(newType);
                }}
                fullWidth
                disabled={loading}
                sx={{
                  gap: 1,
                  my: 1,
                  "& .MuiToggleButtonGroup-grouped": {
                    border: "1px solid !important",
                    borderColor: "divider !important",
                    borderRadius: "8px !important",
                    p: 1.2,
                    textTransform: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    "&.Mui-selected": {
                      bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, 0.08),
                      borderColor: "primary.main !important",
                    },
                  },
                }}
              >
                <ToggleButton value="HANDOVER">
                  <Stack direction="row" spacing={0.8} alignItems="center">
                    <SyncAltIcon sx={{ color: "text.secondary", fontSize: 18 }} />
                    <Typography variant="body2" fontWeight="bold">
                      Relevo de Turno
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Cambio de cajero · Mesas siguen abiertas
                  </Typography>
                </ToggleButton>
                <ToggleButton value="END_OF_DAY">
                  <Stack direction="row" spacing={0.8} alignItems="center">
                    <NightlightRoundIcon sx={{ color: "text.secondary", fontSize: 18 }} />
                    <Typography variant="body2" fontWeight="bold">
                      Cierre Final
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Fin de jornada · Exige mesas cobradas
                  </Typography>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Campos de Descuadre con PIN (Si aplica) */}
            {requiresAuthorization && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "warning.main",
                  bgcolor: (theme) => alpha(theme.palette.warning.main, 0.04),
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <WarningAmberOutlinedIcon sx={{ color: "warning.main", fontSize: 18 }} />
                  <Typography variant="caption" fontWeight="bold" color="warning.main">
                    Descuadre detectado: Ingresa justificación y PIN de autorización
                  </Typography>
                </Stack>
                <TextField
                  label="Justificación del descuadre"
                  size="small"
                  value={discrepancyReason}
                  onChange={(e) => onChangeDiscrepancyReason(e.target.value)}
                  multiline
                  minRows={2}
                  disabled={loading}
                  required
                />
                <TextField
                  label="PIN de Gerente / Admin"
                  size="small"
                  type="password"
                  value={authorizationPin}
                  onChange={(e) =>
                    onChangeAuthorizationPin(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  inputProps={{ inputMode: "numeric", maxLength: 6 }}
                  disabled={loading}
                  required
                />
              </Box>
            )}

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                mt: "auto",
              }}
            >
              <Typography variant="subtitle2" fontWeight={800} mb={1.5}>
                Resumen en vivo de lo declarado
              </Typography>
              <Stack spacing={0.75}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Efectivo</Typography>
                  <Typography variant="body2" fontWeight={700}>C${cashAmount.toFixed(2)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Vouchers</Typography>
                  <Typography variant="body2" fontWeight={700}>C${cardAmount.toFixed(2)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Transferencias / Apps</Typography>
                  <Typography variant="body2" fontWeight={700}>C${appAmount.toFixed(2)}</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                  <Typography variant="subtitle2" fontWeight={800}>Total declarado</Typography>
                  <Typography
                    variant="h5"
                    fontWeight={900}
                    color="primary.main"
                    sx={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    C${declaredTotal.toFixed(2)}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Grid>

        {/* COLUMNA DERECHA: Los 3 Canales de Conteo */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={1.8} height="100%">
            {/* 1. Efectivo Físico */}
            <Box
              sx={{
                p: 1.8,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Stack direction="row" spacing={0.8} alignItems="center">
                  <Box sx={{ display: "flex", p: 0.5, borderRadius: 1, bgcolor: "action.hover", color: "text.secondary" }}>
                    <AttachMoneyIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    1. Efectivo en Cajón
                  </Typography>
                </Stack>
                <CashDenominationDialog
                  value={denominationBreakdown}
                  disabled={loading}
                  onApply={onApplyBreakdown}
                />
              </Stack>
              <TextField
                size="small"
                placeholder="0.00"
                type="number"
                value={amount}
                onChange={(e) => onChangeAmount(e.target.value)}
                fullWidth
                disabled={loading}
                sx={financialInputSx}
                inputProps={{ min: 0, step: "0.01" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography fontWeight="bold" variant="body2">
                        C$
                      </Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* 2. Tarjetas / Datáfono */}
            <Box
              sx={{
                p: 1.8,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Stack
                direction="row"
                spacing={0.8}
                alignItems="center"
                mb={1}
              >
                <Box sx={{ display: "flex", p: 0.5, borderRadius: 1, bgcolor: "action.hover", color: "text.secondary" }}>
                  <CreditCardIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  2. Vouchers de Tarjeta (POS)
                </Typography>
              </Stack>
              <TextField
                size="small"
                placeholder="0.00"
                type="number"
                value={declaredCardAmount}
                onChange={(e) => onChangeDeclaredCardAmount(e.target.value)}
                fullWidth
                disabled={loading}
                sx={financialInputSx}
                inputProps={{ min: 0, step: "0.01" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography fontWeight="bold" variant="body2">
                        C$
                      </Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* 3. Transferencias / Apps */}
            <Box
              sx={{
                p: 1.8,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Stack
                direction="row"
                spacing={0.8}
                alignItems="center"
                mb={1}
              >
                <Box sx={{ display: "flex", p: 0.5, borderRadius: 1, bgcolor: "action.hover", color: "text.secondary" }}>
                  <PhoneAndroidIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  3. Transferencias / Apps
                </Typography>
              </Stack>
              <TextField
                size="small"
                placeholder="0.00"
                type="number"
                value={declaredAppAmount}
                onChange={(e) => onChangeDeclaredAppAmount(e.target.value)}
                fullWidth
                disabled={loading}
                sx={financialInputSx}
                inputProps={{ min: 0, step: "0.01" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography fontWeight="bold" variant="body2">
                        C$
                      </Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Stack>
        </Grid>
      </Grid>

      {/* ACCIONES INFERIORES */}
      <Box
        display="flex"
        justifyContent="flex-end"
        gap={2}
        mt={1}
        pt={2}
        borderTop="1px solid"
        borderColor="divider"
      >
        <Button
          variant="text"
          color="inherit"
          onClick={onCancel}
          disabled={loading}
          sx={{ borderRadius: 2, px: 2.5, py: 1.2, fontWeight: "bold" }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={!canSubmit || loading}
          sx={{
            borderRadius: 2,
            py: 1.2,
            minWidth: 240,
            fontWeight: "bold",
          }}
        >
          {loading ? (
            <CircularProgress size={22} color="inherit" />
          ) : closeType === "HANDOVER" ? (
            "Completar Relevo de Turno"
          ) : (
            "Cerrar Caja Final"
          )}
        </Button>
      </Box>
    </Box>
  );
}
