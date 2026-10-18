import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import type { CashDenominationCount } from "../model/cash-register.types";
import {
  calculateDenominationTotal,
  createEmptyDenominationBreakdown,
} from "../model/cashCountDomain";

interface Props {
  value?: CashDenominationCount[];
  disabled?: boolean;
  onApply: (entries: CashDenominationCount[], total: number) => void;
}

export function CashDenominationDialog({ value, disabled, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<CashDenominationCount[]>(
    value ?? createEmptyDenominationBreakdown(),
  );
  const total = useMemo(() => calculateDenominationTotal(entries), [entries]);
  const denominationGroups = [
    { title: "Billetes", entries: entries.filter((entry) => entry.denomination >= 10) },
    { title: "Monedas", entries: entries.filter((entry) => entry.denomination < 10) },
  ];

  const openDialog = () => {
    setEntries(value ?? createEmptyDenominationBreakdown());
    setOpen(true);
  };

  const updateQuantity = (denomination: number, quantity: number) => {
    setEntries((current) =>
      current.map((entry) =>
        entry.denomination === denomination
          ? { ...entry, quantity: Math.max(0, Math.trunc(quantity || 0)) }
          : entry,
      ),
    );
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<CalculateIcon />}
        onClick={openDialog}
        disabled={disabled}
        size="small"
        sx={{ borderRadius: 1.5 }}
      >
        Contar por denominaciones
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Conteo rápido de efectivo</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" mb={2}>
            Indica cuántos billetes o monedas tienes de cada denominación.
          </Typography>
          <Stack spacing={2.5}>
            {denominationGroups.map((group) => (
              <Box key={group.title}>
                <Typography variant="subtitle2" fontWeight={800} mb={1.25}>
                  {group.title}
                </Typography>
                <Grid container spacing={2}>
                  {group.entries.map((entry) => (
                    <Grid key={entry.denomination} size={{ xs: 12, sm: 6 }}>
                      <Box display="grid" gridTemplateColumns="1fr 110px 1fr" gap={2} alignItems="center">
                        <Typography fontWeight={700}>
                          C${entry.denomination.toFixed(entry.denomination < 1 ? 2 : 0)}
                        </Typography>
                        <TextField
                          label="Cantidad"
                          type="number"
                          size="small"
                          value={entry.quantity === 0 ? "" : entry.quantity}
                          placeholder="0"
                          onChange={(event) =>
                            updateQuantity(entry.denomination, Number(event.target.value))
                          }
                          inputProps={{ min: 0, step: 1 }}
                        />
                        <Typography textAlign="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                          C${(entry.denomination * entry.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </Stack>
          <Divider sx={{ my: 3 }} />
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6" fontWeight={800}>Total contado</Typography>
            <Typography variant="h5" fontWeight={900} color="primary.main">
              C${total.toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => {
              onApply(entries, total);
              setOpen(false);
            }}
          >
            Usar este total
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
