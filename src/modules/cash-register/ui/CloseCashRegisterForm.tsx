import {
  Alert,
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import NightlightRoundIcon from "@mui/icons-material/NightlightRound";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import { LOGIN_COLORS } from "../../../shared/theme";
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
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight="800"
                gutterBottom
                color="text.primary"
              >
                ⚙️ Modalidad de Cierre
              </Typography>
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
                    borderRadius: "10px !important",
                    p: 1.2,
                    textTransform: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    "&.Mui-selected": {
                      bgcolor:
                        closeType === "HANDOVER"
                          ? alpha("#0288d1", 0.08)
                          : alpha("#ed6c02", 0.08),
                      borderColor:
                        closeType === "HANDOVER"
                          ? "#0288d1 !important"
                          : "#ed6c02 !important",
                    },
                  },
                }}
              >
                <ToggleButton value="HANDOVER">
                  <Stack direction="row" spacing={0.8} alignItems="center">
                    <SyncAltIcon sx={{ color: "#0288d1", fontSize: 18 }} />
                    <Typography variant="body2" fontWeight="bold">
                      Relevo de Turno
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Cambio de cajero
                  </Typography>
                </ToggleButton>
                <ToggleButton value="END_OF_DAY">
                  <Stack direction="row" spacing={0.8} alignItems="center">
                    <NightlightRoundIcon sx={{ color: "#ed6c02", fontSize: 18 }} />
                    <Typography variant="body2" fontWeight="bold">
                      Cierre Final
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Fin de jornada
                  </Typography>
                </ToggleButton>
              </ToggleButtonGroup>
              {closeType === "HANDOVER" ? (
                <Alert
                  severity="info"
                  sx={{ py: 0.5, borderRadius: 2, fontSize: "0.78rem" }}
                >
                  <strong>Relevo:</strong> Las mesas ocupadas seguirán abiertas para el siguiente turno.
                </Alert>
              ) : (
                <Alert
                  severity="warning"
                  sx={{ py: 0.5, borderRadius: 2, fontSize: "0.78rem" }}
                >
                  <strong>Cierre Final:</strong> Se exige que todas las mesas estén cobradas o liberadas.
                </Alert>
              )}
            </Box>

            <Alert
              severity="info"
              sx={{ py: 0.8, borderRadius: 2, fontSize: "0.8rem" }}
            >
              🔒 <strong>Arqueo Ciego:</strong> Las ventas del sistema permanecen ocultas para garantizar un conteo objetivo.
            </Alert>

            {/* Campos de Descuadre con PIN (Si aplica) */}
            {requiresAuthorization && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "warning.main",
                  bgcolor: alpha("#ed6c02", 0.04),
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  color="warning.main"
                >
                  ⚠️ Descuadre detectado: Ingresa justificación y PIN de autorización
                </Typography>
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
                    onChangeAuthorizationPin(e.target.value.replace(/\D/g, ""))
                  }
                  inputProps={{ inputMode: "numeric", maxLength: 12 }}
                  disabled={loading}
                  required
                />
              </Box>
            )}
          </Box>
        </Grid>

        {/* COLUMNA DERECHA: Los 3 Canales de Conteo */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={1.8}>
            {/* 1. Efectivo Físico */}
            <Box
              sx={{
                p: 1.8,
                borderRadius: 3,
                border: "1px solid",
                borderColor: alpha("#2e7d32", 0.2),
                bgcolor: alpha("#2e7d32", 0.02),
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Stack direction="row" spacing={0.8} alignItems="center">
                  <AttachMoneyIcon sx={{ color: "#2e7d32", fontSize: 18 }} />
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
                borderRadius: 3,
                border: "1px solid",
                borderColor: alpha("#0288d1", 0.2),
                bgcolor: alpha("#0288d1", 0.02),
              }}
            >
              <Stack
                direction="row"
                spacing={0.8}
                alignItems="center"
                mb={1}
              >
                <CreditCardIcon sx={{ color: "#0288d1", fontSize: 18 }} />
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
                borderRadius: 3,
                border: "1px solid",
                borderColor: alpha("#ed6c02", 0.2),
                bgcolor: alpha("#ed6c02", 0.02),
              }}
            >
              <Stack
                direction="row"
                spacing={0.8}
                alignItems="center"
                mb={1}
              >
                <PhoneAndroidIcon sx={{ color: "#ed6c02", fontSize: 18 }} />
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
        gap={2}
        mt={1}
        pt={2}
        borderTop="1px solid"
        borderColor="divider"
      >
        <Button
          variant="outlined"
          fullWidth
          onClick={onCancel}
          disabled={loading}
          startIcon={<ArrowBackIcon />}
          sx={{ borderRadius: 2.5, py: 1.2, fontWeight: "bold" }}
        >
          Volver
        </Button>
        <Button
          variant="contained"
          fullWidth
          onClick={onSubmit}
          disabled={!canSubmit || loading}
          sx={{
            borderRadius: 2.5,
            py: 1.2,
            bgcolor: LOGIN_COLORS.primary,
            "&:hover": { bgcolor: LOGIN_COLORS.primaryDark },
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
