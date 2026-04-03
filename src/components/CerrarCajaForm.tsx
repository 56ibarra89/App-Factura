import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
  CircularProgress
} from "@mui/material";
import { LOGIN_COLORS } from "../theme/loginTheme";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface Props {
  amount: string;
  onChangeAmount: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  canSubmit: boolean;
  openingAmount: number;
  loading?: boolean;
}

export function CerrarCajaForm({
  amount,
  onChangeAmount,
  onSubmit,
  onCancel,
  canSubmit,
  openingAmount,
  loading = false
}: Props) {
  const diff = Number(amount) - openingAmount;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ bgcolor: 'rgba(0,0,0,0.03)', p: 2, borderRadius: 2, mb: 1 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          Monto de apertura:
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          ${openingAmount.toFixed(2)}
        </Typography>
      </Box>

      <TextField
        label="Efectivo real en caja"
        type="number"
        value={amount}
        onChange={(e) => onChangeAmount(e.target.value)}
        fullWidth
        autoFocus
        disabled={loading}
        inputProps={{ min: 0, step: "0.01" }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              $
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': { borderColor: LOGIN_COLORS.primary },
            '&.Mui-focused fieldset': { borderColor: LOGIN_COLORS.primary },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: LOGIN_COLORS.primary },
        }}
      />

      {amount && (
        <Typography 
          variant="body2" 
          fontWeight="bold" 
          color={diff >= 0 ? "success.main" : "error.main"}
          sx={{ textAlign: 'right' }}
        >
          Diferencia: {diff >= 0 ? "+" : ""}${diff.toFixed(2)}
        </Typography>
      )}

      <Box display="flex" gap={2} mt={2}>
        <Button
          variant="outlined"
          fullWidth
          onClick={onCancel}
          disabled={loading}
          startIcon={<ArrowBackIcon />}
          sx={{ 
            borderRadius: 2, 
            py: 1.2,
            color: 'text.secondary',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover', borderColor: 'text.primary' }
          }}
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
            '&:hover': { bgcolor: LOGIN_COLORS.primaryDark },
            boxShadow: `0 4px 14px ${LOGIN_COLORS.primaryShadow}`,
            position: 'relative'
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : (
            "Cerrar caja"
          )}
        </Button>
      </Box>
    </Box>
  );
}
