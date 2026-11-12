import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import {
  Alert,
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { formatCurrency } from "../../../../shared/format";
import type {
  SplitBillAccount,
  SplitBillCheckoutSelection,
} from "../../model/splitBill.types";

interface SplitCustomAmountsPanelProps {
  accounts: SplitBillAccount[];
  assignedTotal: number;
  remaining: number;
  isValid: boolean;
  onAddAccount(): void;
  onRemoveAccount(accountId: string): void;
  onAmountChange(accountId: string, amount: number): void;
  onCheckout(selection: SplitBillCheckoutSelection): void;
}

export default function SplitCustomAmountsPanel({
  accounts,
  assignedTotal,
  remaining,
  isValid,
  onAddAccount,
  onRemoveAccount,
  onAmountChange,
  onCheckout,
}: SplitCustomAmountsPanelProps) {
  return (
    <Box sx={{ py: 1 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
          mb: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          Montos personalizados por subcuenta
        </Typography>
        <Button
          size="small"
          startIcon={<PersonAddIcon />}
          variant="outlined"
          onClick={onAddAccount}
          sx={{ textTransform: "none" }}
        >
          Agregar persona
        </Button>
      </Box>

      <Alert severity={isValid ? "success" : "info"} sx={{ mb: 2 }}>
        Asignado: {formatCurrency(assignedTotal)} · {remaining >= 0 ? "Pendiente" : "Excedente"}: {formatCurrency(Math.abs(remaining))}
      </Alert>

      <Stack spacing={2}>
        {accounts.map((account) => {
          const amount = account.customAmount ?? 0;

          return (
            <Paper
              key={account.id}
              variant="outlined"
              sx={{ p: 2, borderRadius: 2 }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {account.name}
                    </Typography>
                    {accounts.length > 1 && (
                      <IconButton
                        size="small"
                        color="error"
                        aria-label={`Eliminar ${account.name}`}
                        onClick={() => onRemoveAccount(account.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Monto a pagar"
                    type="number"
                    size="small"
                    fullWidth
                    value={amount || ""}
                    onChange={(event) =>
                      onAmountChange(account.id, Number(event.target.value))
                    }
                    slotProps={{
                      htmlInput: { min: 0, step: 0.01 },
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">C$</InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    disabled={!isValid || amount <= 0}
                    startIcon={<ShoppingCartCheckoutIcon />}
                    onClick={() =>
                      onCheckout({
                        mode: "custom",
                        accountId: account.id,
                        accountName: account.name,
                        amount,
                      })
                    }
                    sx={{ textTransform: "none", fontWeight: 700 }}
                  >
                    Preparar {formatCurrency(amount)}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
}
