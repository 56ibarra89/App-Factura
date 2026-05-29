/**
 * CuponDialog — Formulario de creación / edición de cupones manuales.
 *
 * SOLID:
 *  S — Single Responsibility: solo gestiona la UI del formulario.
 *      No toca el estado global; todo lo delega a onSave.
 *  O — Open/Closed: soporta modo "crear" y "editar" sin bifurcar la lógica
 *      interna — solo cambia el estado inicial del formulario.
 *  I — Interface Segregation: onSave recibe solo lo que el dialog produce;
 *      la reconstrucción de campos derivados ocurre en useCupones.
 */
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  IconButton,
  Tooltip,
  Alert,
} from "@mui/material";
import { useState, useEffect } from "react";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { CuponRule, CuponStatus } from "../../../types/promociones";

// ── Tipo de salida del formulario ────────────────────────────────────────────

export type CuponFormOutput = Omit<
  CuponRule,
  "discount" | "usage" | "expires" | "status"
> & { manualStatus: CuponStatus };

// ── Helpers ──────────────────────────────────────────────────────────────────

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** Genera un código alfanumérico aleatorio de la longitud indicada. */
function generateCode(length = 8): string {
  return Array.from({ length }, () =>
    CHARS.charAt(Math.floor(Math.random() * CHARS.length))
  ).join("");
}

// ── Estado inicial del formulario ────────────────────────────────────────────

type FormState = {
  code: string;
  discountType: CuponRule["discountType"];
  discountValue: string;
  maxUses: string; // string para el TextField, se convierte a number al guardar
  expiresDate: string;
  manualStatus: CuponStatus;
};

const DEFAULT_FORM: FormState = {
  code: "",
  discountType: "porcentaje",
  discountValue: "",
  maxUses: "",
  expiresDate: "",
  manualStatus: "Activo",
};

// ── Componente ───────────────────────────────────────────────────────────────

interface CuponDialogProps {
  open: boolean;
  onClose: () => void;
  /** Recibe los datos del formulario; useCupones construye el resto. */
  onSave: (data: CuponFormOutput) => void;
  editingCupon?: CuponRule | null;
}

const CuponDialog = ({
  open,
  onClose,
  onSave,
  editingCupon,
}: CuponDialogProps) => {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  // Pre-llenar al editar
  useEffect(() => {
    if (open) {
      if (editingCupon) {
        setForm({
          code: editingCupon.code,
          discountType: editingCupon.discountType,
          discountValue: editingCupon.discountValue,
          maxUses: editingCupon.maxUses === 0 ? "" : String(editingCupon.maxUses),
          expiresDate: editingCupon.expiresDate,
          // Al editar se muestra el estado actual; si está Agotado/Vencido lo
          // tratamos como "Activo" para que el usuario pueda corregir los datos
          manualStatus:
            editingCupon.status === "Agotado" || editingCupon.status === "Vencido"
              ? "Activo"
              : editingCupon.status,
        });
      } else {
        setForm({ ...DEFAULT_FORM, code: generateCode() });
      }
      setErrors({});
    }
  }, [open, editingCupon]);

  // ── Validación ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};

    if (!form.code.trim()) next.code = "El código es obligatorio.";

    const val = parseFloat(form.discountValue);
    if (!form.discountValue || isNaN(val) || val <= 0) {
      next.discountValue = "Ingresa un valor mayor a 0.";
    } else if (form.discountType === "porcentaje" && val > 100) {
      next.discountValue = "El porcentaje no puede superar 100.";
    }

    if (form.maxUses !== "") {
      const uses = parseInt(form.maxUses, 10);
      if (isNaN(uses) || uses < 0) {
        next.maxUses = "Ingresa un número válido (0 = ilimitado).";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      id: editingCupon?.id ?? 0, // 0 = nuevo; useCupones asigna Date.now()
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      discountValue: form.discountValue,
      maxUses: form.maxUses === "" ? 0 : parseInt(form.maxUses, 10),
      currentUses: editingCupon?.currentUses ?? 0,
      expiresDate: form.expiresDate,
      manualStatus: form.manualStatus,
    });
    onClose();
  };

  const isEditing = !!editingCupon;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEditing ? "Editar Cupón" : "Nuevo Cupón"}
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {/* Código */}
            <TextField
              fullWidth
              label="Código del cupón"
              value={form.code}
              onChange={(e) => {
                setForm({ ...form, code: e.target.value.toUpperCase() });
                setErrors((p) => ({ ...p, code: undefined }));
              }}
              error={!!errors.code}
              helperText={errors.code ?? "El cajero o cliente ingresa este código al cobrar."}
              required
              inputProps={{ style: { fontWeight: 700, letterSpacing: 2 } }}
              InputProps={{
                endAdornment: (
                  <Tooltip title="Generar código aleatorio">
                    <IconButton
                      size="small"
                      onClick={() =>
                        setForm({ ...form, code: generateCode() })
                      }
                    >
                      <AutorenewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ),
              }}
            />

            {/* Tipo de descuento */}
            <FormControl fullWidth>
              <InputLabel>Tipo de descuento</InputLabel>
              <Select
                value={form.discountType}
                label="Tipo de descuento"
                onChange={(e) =>
                  setForm({
                    ...form,
                    discountType: e.target.value as CuponRule["discountType"],
                    discountValue: "",
                  })
                }
              >
                <MenuItem value="porcentaje">Porcentaje (%)</MenuItem>
                <MenuItem value="monto_fijo">Monto fijo (C$)</MenuItem>
              </Select>
            </FormControl>

            {/* Valor del descuento */}
            <TextField
              fullWidth
              label="Valor del descuento"
              value={form.discountValue}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, "");
                setForm({ ...form, discountValue: val });
                setErrors((p) => ({ ...p, discountValue: undefined }));
              }}
              placeholder={
                form.discountType === "porcentaje" ? "Ej. 15" : "Ej. 50.00"
              }
              required
              error={!!errors.discountValue}
              helperText={errors.discountValue}
              InputProps={{
                startAdornment:
                  form.discountType === "monto_fijo" ? (
                    <InputAdornment position="start">C$</InputAdornment>
                  ) : null,
                endAdornment:
                  form.discountType === "porcentaje" ? (
                    <InputAdornment position="end">%</InputAdornment>
                  ) : null,
              }}
            />

            {/* Límite de usos */}
            <TextField
              fullWidth
              label="Límite de usos"
              value={form.maxUses}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                setForm({ ...form, maxUses: val });
                setErrors((p) => ({ ...p, maxUses: undefined }));
              }}
              placeholder="0 = ilimitado"
              error={!!errors.maxUses}
              helperText={
                errors.maxUses ??
                "Déjalo vacío o en 0 para usos ilimitados. El estado cambia a 'Agotado' automáticamente."
              }
            />

            {/* Fecha de vencimiento */}
            <TextField
              fullWidth
              label="Fecha de vencimiento"
              type="date"
              value={form.expiresDate}
              onChange={(e) => setForm({ ...form, expiresDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              helperText="Déjalo vacío para que no expire. El estado cambia a 'Vencido' automáticamente."
            />

            {/* Estado manual */}
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={form.manualStatus}
                label="Estado"
                onChange={(e) =>
                  setForm({
                    ...form,
                    manualStatus: e.target.value as CuponStatus,
                  })
                }
              >
                <MenuItem value="Activo">Activo</MenuItem>
                <MenuItem value="Inactivo">Inactivo (desactivado manualmente)</MenuItem>
              </Select>
            </FormControl>

            <Alert severity="info" sx={{ fontSize: "0.8rem" }}>
              El estado <strong>Agotado</strong> y <strong>Vencido</strong> se
              calculan automáticamente. Solo puedes activar o desactivar el cupón
              manualmente.
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button fullWidth variant="outlined" onClick={onClose}>
            Cancelar
          </Button>
          <Button fullWidth variant="contained" color="primary" type="submit">
            {isEditing ? "Actualizar" : "Crear Cupón"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CuponDialog;
