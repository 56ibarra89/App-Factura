import {
  Box,
  Button,
  InputAdornment,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { LOGIN_COLORS } from "../theme/loginTheme";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { CashRegisterConfig } from "../types/shift.types";

interface Props {
  cajas: CashRegisterConfig[];
  selectedRegisterId: string;
  onSelectRegister: (id: string) => void;
  amount: string;
  onChangeAmount: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  canSubmit: boolean;
  expectedAmount: number | null;
  requireExactOpening: boolean;
}

export function AbrirCajaForm({
  cajas,
  selectedRegisterId,
  onSelectRegister,
  amount,
  onChangeAmount,
  onSubmit,
  onCancel,
  canSubmit,
  expectedAmount,
  requireExactOpening,
}: Props) {
  const isExactRequired = requireExactOpening && expectedAmount !== null;
  const numAmount = Number(amount);
  const showExactError = isExactRequired && amount !== "" && numAmount !== expectedAmount;
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {cajas.length > 0 && (
        <FormControl fullWidth>
          <InputLabel id="select-caja-label">Estación de Caja</InputLabel>
          <Select
            labelId="select-caja-label"
            value={selectedRegisterId}
            label="Estación de Caja"
            onChange={(e) => onSelectRegister(e.target.value)}
            sx={{
              borderRadius: 2,
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: LOGIN_COLORS.primary },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: LOGIN_COLORS.primary },
            }}
          >
            {cajas.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <TextField
        label="Monto inicial de apertura"
        type="number"
        value={amount}
        onChange={(e) => onChangeAmount(e.target.value)}
        fullWidth
        autoFocus={cajas.length === 0}
        inputProps={{ min: 0, step: "0.01" }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              C$
            </InputAdornment>
          ),
          sx: { borderRadius: 2 }
        }}
        error={showExactError}
        helperText={
          isExactRequired 
            ? `Se requiere un monto exacto de C$ ${expectedAmount?.toFixed(2)} basado en el cierre anterior.` 
            : "Ingresa el monto en efectivo disponible en gaveta."
        }
        sx={{
          '& .MuiOutlinedInput-root': {
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
