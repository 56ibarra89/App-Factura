import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
} from "@mui/material";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import PrintIcon from "@mui/icons-material/Print";
import {
  CASH_EXPENSE_CATEGORY_LABELS,
  type CashExpense,
  type CashExpenseCategory,
} from "../model/cash-expense.types";
import { cashExpenseGateway } from "../api/cashExpenseGateway";
import CashExpenseVoucherPrint from "./CashExpenseVoucherPrint";

interface CashExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (expense: CashExpense) => void;
  shiftId?: string;
}

export default function CashExpenseDialog({
  open,
  onClose,
  onSuccess,
  shiftId,
}: CashExpenseDialogProps) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<CashExpenseCategory>("OTROS");
  const [reason, setReason] = useState("");
  const [voucherNumber, setVoucherNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [autoPrint, setAutoPrint] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [printedExpense, setPrintedExpense] = useState<CashExpense | null>(null);

  const resetForm = () => {
    setAmount("");
    setCategory("OTROS");
    setReason("");
    setVoucherNumber("");
    setNotes("");
    setError("");
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Por favor ingresa un monto válido mayor a 0.");
      return;
    }

    if (!reason.trim()) {
      setError("El motivo o justificación del gasto es obligatorio.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const created = await cashExpenseGateway.createExpense({
        amount: numAmount,
        category,
        reason: reason.trim(),
        voucherNumber: voucherNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        shiftId,
      });

      if (autoPrint) {
        setPrintedExpense(created);
        setTimeout(() => {
          window.print();
        }, 300);
      }

      if (onSuccess) {
        onSuccess(created);
      }

      handleClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "No se pudo registrar el gasto de caja.";
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              fontWeight: "bold",
              bgcolor: "rgba(211, 47, 47, 0.05)",
              color: "error.main",
            }}
          >
            <MoneyOffIcon color="error" />
            Registrar Gasto / Egreso de Caja
          </DialogTitle>

          <DialogContent dividers sx={{ pt: 2.5 }}>
            <Stack spacing={2.5}>
              {error && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Box>
                <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
                  Ingresa los datos del retiro de efectivo del cajón de dinero.
                </Typography>
              </Box>

              {/* Monto */}
              <TextField
                label="Monto Retirado (C$)"
                type="number"
                fullWidth
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                slotProps={{
                  htmlInput: { min: "0.01", step: "0.01" },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography fontWeight="bold" color="error.main">
                          C$
                        </Typography>
                      </InputAdornment>
                    ),
                  },
                }}
                autoFocus
              />

              {/* Categoría */}
              <FormControl fullWidth>
                <InputLabel id="category-select-label">Categoría del Gasto</InputLabel>
                <Select
                  labelId="category-select-label"
                  value={category}
                  label="Categoría del Gasto"
                  onChange={(e) => setCategory(e.target.value as CashExpenseCategory)}
                >
                  {Object.entries(CASH_EXPENSE_CATEGORY_LABELS).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: value.color,
                          }}
                        />
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            {value.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {value.description}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Motivo / Justificación */}
              <TextField
                label="Motivo o Justificación"
                fullWidth
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej. Pago de recibo de energía eléctrica del local"
                multiline
                rows={2}
              />

              {/* N° Comprobante / Recibo */}
              <TextField
                label="N° Factura / Recibo Proveedor (Opcional)"
                fullWidth
                value={voucherNumber}
                onChange={(e) => setVoucherNumber(e.target.value)}
                placeholder="Ej. REC-00482 o Factura #1234"
              />

              {/* Notas Adicionales */}
              <TextField
                label="Notas Adicionales (Opcional)"
                fullWidth
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalles complementarios..."
              />

              {/* Checkbox Imprimir */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={autoPrint}
                    onChange={(e) => setAutoPrint(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <PrintIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      Imprimir vale de salida en ticket térmico
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose} disabled={loading} color="inherit">
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="error"
              disabled={loading || !amount || !reason.trim()}
              startIcon={<MoneyOffIcon />}
            >
              {loading ? "Registrando..." : "Confirmar Egreso"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {printedExpense && <CashExpenseVoucherPrint expense={printedExpense} />}
    </>
  );
}
