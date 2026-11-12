import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import type { CashDenominationCount } from "../model/cash-register.types";

interface Props {
  open: boolean;
  onClose: () => void;
  denominations: CashDenominationCount[] | null;
}

export function ShiftDenominationViewDialog({
  open,
  onClose,
  denominations,
}: Props) {
  if (!denominations) return null;

  const total = denominations.reduce(
    (acc, d) => acc + d.denomination * d.quantity,
    0,
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <CalculateIcon color="primary" />
        <Typography variant="h6" fontWeight="bold">
          Denominaciones de Efectivo
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="caption" color="text.secondary" mb={2} display="block">
          Conteo físico de billetes y monedas declarado por el cajero:
        </Typography>
        <Stack spacing={1}>
          {denominations
            .filter((d) => d.quantity > 0)
            .map((d) => (
              <Box
                key={d.denomination}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  p: 1,
                  bgcolor: "action.hover",
                  borderRadius: 1.5,
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  C${d.denomination}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  x {d.quantity}
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="primary.main">
                  C${(d.denomination * d.quantity).toFixed(2)}
                </Typography>
              </Box>
            ))}
        </Stack>
        <Divider sx={{ my: 1.5 }} />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" fontWeight="bold">
            Total Conteo:
          </Typography>
          <Typography variant="h6" fontWeight="bold" color="primary.main">
            C${total.toFixed(2)}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button variant="contained" onClick={onClose} fullWidth>
          Entendido
        </Button>
      </DialogActions>
    </Dialog>
  );
}
