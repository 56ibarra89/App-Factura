import {
  Box,
  Button,
  InputAdornment,
  TextField,
} from "@mui/material";
import { LOGIN_COLORS } from "../theme/loginTheme";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface Props {
  amount: string;
  onChangeAmount: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  canSubmit: boolean;
}

export function AbrirCajaForm({
  amount,
  onChangeAmount,
  onSubmit,
  onCancel,
  canSubmit,
}: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
              $
            </InputAdornment>
          ),
        }}
        helperText="Ingresa el monto en efectivo disponible en gaveta."
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&:hover fieldset': { borderColor: LOGIN_COLORS.primary },
            '&.Mui-focused fieldset': { borderColor: LOGIN_COLORS.primary },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: LOGIN_COLORS.primary },
        }}
      />

      <Box display="flex" gap={2} mt={1}>
        <Button
          variant="outlined"
          fullWidth
          onClick={onCancel}
          startIcon={<ArrowBackIcon />}
          sx={{ 
            borderRadius: 2, 
            py: 1.5,
            color: 'text.secondary',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover', borderColor: 'text.primary' }
          }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          fullWidth
          onClick={onSubmit}
          disabled={!canSubmit}
          sx={{ 
            borderRadius: 2, 
            py: 1.5,
            bgcolor: LOGIN_COLORS.primary,
            '&:hover': { bgcolor: LOGIN_COLORS.primaryDark },
            boxShadow: `0 4px 14px ${LOGIN_COLORS.primaryShadow}`,
            fontWeight: 'bold'
          }}
        >
          Abrir caja
        </Button>
      </Box>
    </Box>
  );
}