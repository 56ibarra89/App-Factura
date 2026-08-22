import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { LOGIN_COLORS } from "../../../shared/theme";
import type { CashDenominationCount } from "../model/cash-register.types";
import { CashDenominationDialog } from "./CashDenominationDialog";

interface Props {
  amount: string;
  onChangeAmount: (value: string) => void;
  onApplyBreakdown: (
    entries: CashDenominationCount[],
    total: number,
  ) => void;
  denominationBreakdown?: CashDenominationCount[];
  onSubmit: () => void;
  onCancel: () => void;
  canSubmit: boolean;
  openingAmount: number;
  expectedCash: number;
  showReconciliation: boolean;
  requiresAuthorization: boolean;
  discrepancyThreshold: number;
  discrepancyReason: string;
  onChangeDiscrepancyReason: (value: string) => void;
  authorizationPin: string;
  onChangeAuthorizationPin: (value: string) => void;
  primaryLabel: string;
  loading?: boolean;
}

export function CloseCashRegisterForm({
  amount,
  onChangeAmount,
  onApplyBreakdown,
  denominationBreakdown,
  onSubmit,
  onCancel,
  canSubmit,
  openingAmount,
  expectedCash,
  showReconciliation,
  requiresAuthorization,
  discrepancyThreshold,
  discrepancyReason,
  onChangeDiscrepancyReason,
  authorizationPin,
  onChangeAuthorizationPin,
  primaryLabel,
  loading = false,
}: Props) {
  const difference = Number(amount) - expectedCash;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {showReconciliation ? (
        <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: 2, mb: 1 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Monto de apertura:
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            C${openingAmount.toFixed(2)}
          </Typography>
        </Box>
      ) : (
        <Alert severity="info">
          Arqueo ciego activo: cuenta el efectivo sin consultar los valores del sistema.
        </Alert>
      )}

      <TextField
        label="Efectivo real en caja (Conteo físico)"
        type="number"
        value={amount}
        onChange={(event) => onChangeAmount(event.target.value)}
        fullWidth
        autoFocus
        disabled={loading}
        inputProps={{ min: 0, step: "0.01" }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Typography fontWeight="bold">C$</Typography>
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            "&:hover fieldset": { borderColor: LOGIN_COLORS.primary },
            "&.Mui-focused fieldset": { borderColor: LOGIN_COLORS.primary },
          },
          "& .MuiInputLabel-root.Mui-focused": { color: LOGIN_COLORS.primary },
        }}
      />

      <CashDenominationDialog
        value={denominationBreakdown}
        disabled={loading}
        onApply={onApplyBreakdown}
      />

      {showReconciliation && amount !== "" && (
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: "action.hover",
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
            <Typography variant="body2" color="text.secondary">
              Diferencia respecto al esperado:
            </Typography>
            <Typography
              variant="body1"
              fontWeight="bold"
              color={
                Math.abs(difference) < 0.01
                  ? "success.main"
                  : difference > 0
                    ? "info.main"
                    : "error.main"
              }
            >
              {Math.abs(difference) < 0.01
                ? "Cuadre exacto (C$0.00)"
                : `${difference > 0 ? "Sobrante: +C$" : "Faltante: -C$"}${Math.abs(difference).toFixed(2)}`}
            </Typography>
          </Box>
        </Box>
      )}

      {requiresAuthorization && (
        <Box display="flex" flexDirection="column" gap={2}>
          <Alert severity="warning">
            La diferencia supera C${discrepancyThreshold.toFixed(2)}. Se requiere una justificación y el PIN de un administrador o cajero principal.
          </Alert>
          <TextField
            label="Justificación del descuadre"
            value={discrepancyReason}
            onChange={(event) => onChangeDiscrepancyReason(event.target.value)}
            multiline
            minRows={2}
            inputProps={{ maxLength: 500 }}
            disabled={loading}
            required
          />
          <TextField
            label="PIN de autorización"
            type="password"
            value={authorizationPin}
            onChange={(event) =>
              onChangeAuthorizationPin(event.target.value.replace(/\D/g, ""))
            }
            inputProps={{ inputMode: "numeric", maxLength: 12 }}
            disabled={loading}
            required
          />
        </Box>
      )}

      <Box display="flex" gap={2} mt={2}>
        <Button
          variant="outlined"
          fullWidth
          onClick={onCancel}
          disabled={loading}
          startIcon={<ArrowBackIcon />}
          sx={{ borderRadius: 2, py: 1.2 }}
        >
          Volver
        </Button>
        <Button
          variant="contained"
          fullWidth
          onClick={onSubmit}
          disabled={!canSubmit || loading}
          sx={{
            borderRadius: 2,
            py: 1.2,
            bgcolor: LOGIN_COLORS.primary,
            "&:hover": { bgcolor: LOGIN_COLORS.primaryDark },
            boxShadow: `0 4px 14px ${LOGIN_COLORS.primaryShadow}`,
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : primaryLabel}
        </Button>
      </Box>
    </Box>
  );
}
