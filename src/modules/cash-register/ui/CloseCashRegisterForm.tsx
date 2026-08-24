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
  declaredCardAmount: string;
  onChangeDeclaredCardAmount: (value: string) => void;
  declaredAppAmount: string;
  onChangeDeclaredAppAmount: (value: string) => void;
  onApplyBreakdown: (
    entries: CashDenominationCount[],
    total: number,
  ) => void;
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
  openingAmount,
  requiresAuthorization,
  discrepancyReason,
  onChangeDiscrepancyReason,
  authorizationPin,
  onChangeAuthorizationPin,
  loading = false,
}: Props) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Alert severity="info">
        Arqueo ciego obligatorio: las ventas, gastos y el total esperado permanecerán ocultos hasta completar el cierre.
      </Alert>

      <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: 2 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          Saldo de apertura informado:
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          C${openingAmount.toFixed(2)}
        </Typography>
      </Box>

      {/* 1. SECCIÓN EFECTIVO */}
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          💵 1. Efectivo Físico en Cajón
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
          Ingresa el monto total de billetes y monedas físicos en caja.
        </Typography>

        <TextField
          label="Efectivo físico contado"
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
            mb: 1.5,
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
      </Box>

      {/* 2. SECCIÓN TARJETA / DATÁFONO */}
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          💳 2. Vouchers de Tarjeta (Datáfono / POS)
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
          Digita el monto del reporte de cierre de lote o suma de vouchers firmados.
        </Typography>
        <TextField
          label="Total Vouchers de Tarjeta"
          type="number"
          value={declaredCardAmount}
          onChange={(event) => onChangeDeclaredCardAmount(event.target.value)}
          fullWidth
          disabled={loading}
          inputProps={{ min: 0, step: "0.01" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Typography fontWeight="bold">C$</Typography>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* 3. SECCIÓN APP / TRANSFERENCIAS */}
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          📱 3. Transferencias / Apps Bancarias
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
          Digita el monto total verificado en la banca en línea o depósitos de apps.
        </Typography>
        <TextField
          label="Total Transferencias / App"
          type="number"
          value={declaredAppAmount}
          onChange={(event) => onChangeDeclaredAppAmount(event.target.value)}
          fullWidth
          disabled={loading}
          inputProps={{ min: 0, step: "0.01" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Typography fontWeight="bold">C$</Typography>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {requiresAuthorization && (
        <Box display="flex" flexDirection="column" gap={2}>
          <Alert severity="warning">
            El arqueo presenta un descuadre en uno o más métodos de pago (Efectivo, Tarjeta o App). La tolerancia es C$0.00: debes ingresar una justificación y el PIN de un administrador o cajero principal.
          </Alert>
          <TextField
            label="Justificación del descuadre"
            helperText="Escribe al menos 5 caracteres."
            value={discrepancyReason}
            onChange={(event) => onChangeDiscrepancyReason(event.target.value)}
            multiline
            minRows={2}
            inputProps={{ minLength: 5, maxLength: 500 }}
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
          {loading ? <CircularProgress size={24} color="inherit" /> : "Cerrar caja"}
        </Button>
      </Box>
    </Box>
  );
}
