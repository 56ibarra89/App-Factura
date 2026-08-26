import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import { LOGIN_COLORS } from "../../../shared/theme";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface Props {
  cashRegisterName?: string;
  onChangeCashRegisterName?: (value: string) => void;
  amount: string;
  onChangeAmount: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  canSubmit: boolean;
  expectedAmount: number | null;
  requireExactOpening: boolean;
  isSubmitting: boolean;
  error: string;
}

export function OpenCashRegisterForm({
  cashRegisterName,
  onChangeCashRegisterName,
  amount,
  onChangeAmount,
  onSubmit,
  onCancel,
  canSubmit,
  expectedAmount,
  requireExactOpening,
  isSubmitting,
  error,
}: Props) {
  const isExactRequired = requireExactOpening && expectedAmount !== null;
  const numAmount = Number(amount);
  const showExactError = isExactRequired && amount !== "" && numAmount !== expectedAmount;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {onChangeCashRegisterName && (
        <TextField
          label="Nombre de la estación (opcional)"
          value={cashRegisterName || ""}
          onChange={(e) => onChangeCashRegisterName(e.target.value)}
          fullWidth
          helperText="Ej. Caja Principal, Caja Mostrador, Despacho Delivery"
          InputProps={{
            sx: { borderRadius: 2 },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": { borderColor: LOGIN_COLORS.primary },
              "&.Mui-focused fieldset": { borderColor: LOGIN_COLORS.primary },
            },
            "& .MuiInputLabel-root.Mui-focused": { color: LOGIN_COLORS.primary },
          }}
        />
      )}

      <TextField
        label="Monto inicial de apertura"
        type="number"
        value={amount}
        onChange={(e) => onChangeAmount(e.target.value)}
        fullWidth
        autoFocus
        inputProps={{ min: 0, step: "0.01" }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              C$
            </InputAdornment>
          ),
          sx: { borderRadius: 2 },
        }}
        error={showExactError}
        helperText={
          isExactRequired
            ? `Se requiere un monto exacto de C$ ${expectedAmount?.toFixed(2)} basado en el cierre anterior.`
            : "Ingresa el monto en efectivo disponible en gaveta al iniciar el turno."
        }
        sx={{
          "& .MuiOutlinedInput-root": {
            "&:hover fieldset": { borderColor: LOGIN_COLORS.primary },
            "&.Mui-focused fieldset": { borderColor: LOGIN_COLORS.primary },
          },
          "& .MuiInputLabel-root.Mui-focused": { color: LOGIN_COLORS.primary },
        }}
      />

      {error && <Alert severity="error">{error}</Alert>}

      <Box display="flex" gap={2} mt={1}>
        <Button
          variant="outlined"
          fullWidth
          onClick={onCancel}
          disabled={isSubmitting}
          startIcon={<ArrowBackIcon />}
          sx={{
            borderRadius: 2,
            py: 1.5,
            color: "text.secondary",
            borderColor: "divider",
            "&:hover": { bgcolor: "action.hover", borderColor: "text.primary" },
          }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          fullWidth
          onClick={onSubmit}
          disabled={!canSubmit}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : undefined}
          sx={{
            borderRadius: 2,
            py: 1.5,
            bgcolor: LOGIN_COLORS.primary,
            "&:hover": { bgcolor: LOGIN_COLORS.primaryDark },
            boxShadow: `0 4px 14px ${LOGIN_COLORS.primaryShadow}`,
            fontWeight: "bold",
          }}
        >
          {isSubmitting ? "Registrando..." : "Abrir caja"}
        </Button>
      </Box>
    </Box>
  );
}
