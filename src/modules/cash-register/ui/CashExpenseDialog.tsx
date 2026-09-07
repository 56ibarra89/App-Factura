import { useState, useEffect, useMemo } from "react";
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
  Chip,
} from "@mui/material";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import PrintIcon from "@mui/icons-material/Print";
import LockIcon from "@mui/icons-material/Lock";
import ShieldIcon from "@mui/icons-material/Shield";
import {
  CASH_EXPENSE_CATEGORY_LABELS,
  type CashExpense,
  type CashExpenseCategory,
} from "../model/cash-expense.types";
import { cashExpenseGateway } from "../api/cashExpenseGateway";
import CashExpenseVoucherPrint from "./CashExpenseVoucherPrint";
import { usePettyCashPolicy } from "../hooks/usePettyCashPolicy";
import { PinValidationDialog, useAuth } from "../../auth";
import { logService } from "../../audit";

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
  const { username, role } = useAuth();
  const { policy, isVoucherRequired, validateExpense } = usePettyCashPolicy();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<CashExpenseCategory>("OTROS");
  const [reason, setReason] = useState("");
  const [voucherNumber, setVoucherNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [autoPrint, setAutoPrint] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [printedExpense, setPrintedExpense] = useState<CashExpense | null>(null);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);

  // Sincronizar preferencia de impresión térmica según políticas
  useEffect(() => {
    if (open) {
      setAutoPrint(policy.autoPrintVoucher);
    }
  }, [open, policy.autoPrintVoucher]);

  // Lista de categorías habilitadas según política
  const enabledCategories = useMemo(() => {
    return (
      Object.entries(CASH_EXPENSE_CATEGORY_LABELS) as [
        CashExpenseCategory,
        (typeof CASH_EXPENSE_CATEGORY_LABELS)[CashExpenseCategory],
      ][]
    ).filter(([key]) => {
      const catConfig = policy.categoryPolicies[key];
      return catConfig ? catConfig.enabled : true;
    });
  }, [policy.categoryPolicies]);

  // Si la categoría actual quedó deshabilitada, seleccionar la primera disponible
  useEffect(() => {
    if (
      enabledCategories.length > 0 &&
      !enabledCategories.some(([k]) => k === category)
    ) {
      setCategory(enabledCategories[0][0]);
    }
  }, [enabledCategories, category]);

  const numAmount = parseFloat(amount);
  const isValidAmount = !isNaN(numAmount) && numAmount > 0;

  // Validación de políticas en tiempo real
  const validation = useMemo(() => {
    if (!isValidAmount) {
      // Revisar si la categoría seleccionada exige PIN de por sí
      const catConfig = policy.categoryPolicies[category];
      if (catConfig?.requiresPin) {
        const catName = CASH_EXPENSE_CATEGORY_LABELS[category]?.label || category;
        return {
          allowed: true,
          needsPin: true,
          pinReason: `La categoría "${catName}" requiere obligatoriamente autorización con PIN de Administrador.`,
        };
      }
      return { allowed: true, needsPin: false };
    }
    return validateExpense(numAmount, category);
  }, [isValidAmount, numAmount, category, policy.categoryPolicies, validateExpense]);

  // Regla de comprobante obligatorio
  const voucherNeeded = useMemo(() => {
    if (!isValidAmount) {
      return policy.requireVoucherAlways;
    }
    return isVoucherRequired(numAmount);
  }, [isValidAmount, numAmount, policy.requireVoucherAlways, isVoucherRequired]);

  const resetForm = () => {
    setAmount("");
    setCategory("OTROS");
    setReason("");
    setVoucherNumber("");
    setNotes("");
    setError("");
    setLoading(false);
    setPinDialogOpen(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const executeExpenseCreation = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidAmount) {
      setError("Por favor ingresa un monto válido mayor a 0.");
      return;
    }

    if (!reason.trim()) {
      setError("El motivo o justificación del gasto es obligatorio.");
      return;
    }

    if (!validation.allowed) {
      setError(validation.error || "Este egreso no está permitido por las políticas.");
      return;
    }

    if (voucherNeeded && !voucherNumber.trim()) {
      setError(
        `Para este monto (C$ ${numAmount.toFixed(
          2,
        )}) es obligatorio ingresar el N° de Comprobante / Recibo según las políticas de caja chica.`,
      );
      return;
    }

    // Si requiere PIN supervisor, abrir diálogo de autorización
    if (validation.needsPin) {
      setPinDialogOpen(true);
      return;
    }

    await executeExpenseCreation();
  };

  const handlePinSuccess = async () => {
    setPinDialogOpen(false);
    logService.log(
      username || "supervisor",
      role || "admin",
      "CASH_EXPENSE_AUTHORIZED",
      `Autorizó egreso de caja chica: C$${numAmount.toFixed(
        2,
      )} en categoría "${CASH_EXPENSE_CATEGORY_LABELS[category]?.label || category}". Motivo: ${reason}`,
      "warn",
    );
    await executeExpenseCreation();
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

              {/* Alerta preventiva de PIN requerido */}
              {validation.needsPin && (
                <Alert
                  severity="warning"
                  icon={<LockIcon fontSize="inherit" />}
                  sx={{ borderRadius: 2 }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    Autorización con PIN Requerida
                  </Typography>
                  <Typography variant="caption" display="block">
                    {validation.pinReason}
                  </Typography>
                </Alert>
              )}

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  mb={0.5}
                  display="block"
                >
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
                  {enabledCategories.map(([key, value]) => {
                    const catRequiresPin = policy.categoryPolicies[key]?.requiresPin;
                    return (
                      <MenuItem key={key} value={key}>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          width="100%"
                        >
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
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                {value.description}
                              </Typography>
                            </Box>
                          </Box>
                          {catRequiresPin && (
                            <Chip
                              size="small"
                              icon={<LockIcon sx={{ fontSize: "14px !important" }} />}
                              label="PIN"
                              color="error"
                              variant="outlined"
                              sx={{ ml: 1, height: 22, fontSize: "0.7rem" }}
                            />
                          )}
                        </Box>
                      </MenuItem>
                    );
                  })}
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
                label={
                  voucherNeeded
                    ? "N° Factura / Recibo Proveedor (Obligatorio por política) *"
                    : "N° Factura / Recibo Proveedor (Opcional)"
                }
                fullWidth
                required={voucherNeeded}
                error={voucherNeeded && !voucherNumber.trim() && Boolean(amount)}
                value={voucherNumber}
                onChange={(e) => setVoucherNumber(e.target.value)}
                placeholder="Ej. REC-00482 o Factura #1234"
                helperText={
                  voucherNeeded
                    ? "La política de caja chica exige comprobante físico para este egreso."
                    : undefined
                }
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
              color={validation.needsPin ? "warning" : "error"}
              disabled={loading || !isValidAmount || !reason.trim()}
              startIcon={
                validation.needsPin ? (
                  <ShieldIcon />
                ) : (
                  <MoneyOffIcon />
                )
              }
            >
              {loading
                ? "Registrando..."
                : validation.needsPin
                ? "Autorizar con PIN"
                : "Confirmar Egreso"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Diálogo de Validación de PIN de Administrador */}
      <PinValidationDialog
        open={pinDialogOpen}
        onClose={() => setPinDialogOpen(false)}
        onSuccess={handlePinSuccess}
        title="Autorizar Salida de Efectivo"
      />

      {/* Comprobante Térmico Oculto para Impresión */}
      {printedExpense && <CashExpenseVoucherPrint expense={printedExpense} />}
    </>
  );
}
