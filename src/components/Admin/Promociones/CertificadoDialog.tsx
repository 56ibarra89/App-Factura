/**
 * CertificadoDialog — Formulario para emitir un nuevo certificado/vale de producto.
 *
 * SOLID:
 *  S — Single Responsibility: solo gestiona la UI de emisión.
 *      No toca el estado global; delega a onEmit.
 *  O — Open/Closed: el selector de productos se alimenta de ProductContext
 *      sin hardcodear ningún producto — abierto a extensión, cerrado a modificación.
 *  D — Dependency Inversion: depende de la abstracción ProductContext,
 *      no de una lista de productos concreta.
 */
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListSubheader,
  Typography,
  Alert,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useProductContext } from "../../../context/ProductContext";
import type { CertificadoInput } from "../../../hooks/useCertificados";

// ── Estado interno del formulario ────────────────────────────────────────────

type FormState = {
  origin: string;
  product: string;
  notes: string;
};

const DEFAULT_FORM: FormState = {
  origin: "",
  product: "",
  notes: "",
};

// ── Componente ───────────────────────────────────────────────────────────────

interface CertificadoDialogProps {
  open: boolean;
  onClose: () => void;
  /** Recibe solo los datos del formulario; el serial y la fecha los genera useCertificados. */
  onEmit: (data: CertificadoInput) => void;
}

const CertificadoDialog = ({ open, onClose, onEmit }: CertificadoDialogProps) => {
  const { categories } = useProductContext();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  // Resetear al abrir
  useEffect(() => {
    if (open) {
      setForm(DEFAULT_FORM);
      setErrors({});
    }
  }, [open]);

  // ── Validación ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.origin.trim()) next.origin = "El origen / empresa es obligatorio.";
    if (!form.product) next.product = "Selecciona el producto a canjear.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onEmit({
      origin: form.origin.trim(),
      product: form.product,
      notes: form.notes.trim() || undefined,
    });
    onClose();
  };

  // Aplanar todos los productos de todas las categorías para el Select agrupado
  const allProducts = categories.flatMap((cat) =>
    cat.items.map((item) => ({ category: cat.label, name: item.name }))
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Emitir Certificado / Vale</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {/* Origen / Empresa */}
            <TextField
              autoFocus
              fullWidth
              label="Origen / Empresa"
              value={form.origin}
              onChange={(e) => {
                setForm({ ...form, origin: e.target.value });
                setErrors((p) => ({ ...p, origin: undefined }));
              }}
              error={!!errors.origin}
              helperText={errors.origin ?? "Empresa, cliente frecuente o motivo de emisión."}
              required
              placeholder="Ej. Agencia de Viajes Sol, Cliente VIP, Premio"
            />

            {/* Producto a Canjear — Select agrupado por categoría */}
            <FormControl fullWidth error={!!errors.product} required>
              <InputLabel>Producto a Canjear</InputLabel>
              <Select
                value={form.product}
                label="Producto a Canjear"
                onChange={(e) => {
                  setForm({ ...form, product: e.target.value });
                  setErrors((p) => ({ ...p, product: undefined }));
                }}
                MenuProps={{ PaperProps: { style: { maxHeight: 320 } } }}
              >
                {allProducts.length === 0 && (
                  <MenuItem disabled value="">
                    No hay productos registrados
                  </MenuItem>
                )}
                {categories.map((cat) =>
                  cat.items.length === 0
                    ? null
                    : [
                        <ListSubheader key={`header-${cat.label}`}>
                          {cat.icon ? `${cat.icon} ` : ""}{cat.label}
                        </ListSubheader>,
                        ...cat.items.map((item) => (
                          <MenuItem key={`${cat.label}-${item.name}`} value={item.name}>
                            {item.name}
                          </MenuItem>
                        )),
                      ]
                )}
              </Select>
              {errors.product && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {errors.product}
                </Typography>
              )}
            </FormControl>

            {/* Notas adicionales */}
            <TextField
              fullWidth
              label="Notas adicionales (opcional)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              multiline
              rows={2}
              placeholder="Ej. Premio de temporada, cumpleaños del cliente…"
            />

            <Alert severity="info" sx={{ fontSize: "0.8rem" }}>
              El <strong>serial único</strong> (VC-XXXXXX) y la{" "}
              <strong>fecha de emisión</strong> se generan automáticamente al emitir.
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button fullWidth variant="outlined" onClick={onClose}>
            Cancelar
          </Button>
          <Button fullWidth variant="contained" color="error" type="submit">
            Emitir Certificado
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CertificadoDialog;
