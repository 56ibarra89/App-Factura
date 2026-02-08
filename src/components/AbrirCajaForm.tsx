import {
  Box,
  Button,
  InputAdornment,
  TextField,
} from "@mui/material";

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
    <>
      <TextField
        label="Monto inicial"
        type="number"
        value={amount}
        onChange={(e) => onChangeAmount(e.target.value)}
        fullWidth
        margin="normal"
        inputProps={{ min: 0, step: "0.01" }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              $
            </InputAdornment>
          ),
        }}
        helperText="Ej: 150000"
      />

      <Box display="flex" gap={2} mt={3}>
        <Button
          variant="outlined"
          fullWidth
          onClick={onCancel}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          fullWidth
          onClick={onSubmit}
          disabled={!canSubmit}
        >
          Abrir caja
        </Button>
      </Box>
    </>
  );
}