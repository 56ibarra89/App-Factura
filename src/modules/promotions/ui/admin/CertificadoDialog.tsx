/**
 * CertificadoDialog — Formulario para emitir un nuevo certificado/vale de producto.
 *
 * SOLID:
 *  S — Single Responsibility: solo gestiona la UI de emisión.
 *      No toca el estado global; delega a onEmit.
 *  O — Open/Closed: el selector de productos se alimenta de CatalogContext
 *      sin hardcodear ningún producto — abierto a extensión, cerrado a modificación.
 *  D — Dependency Inversion: depende de la abstracción CatalogContext,
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
import { useCatalog } from "../../../catalog";
import type {
  CertificadoInput,
} from "../../model/promotion.types";

// ── Estado interno del formulario ────────────────────────────────────────────

type FormState = {
  origin: string;
  productId: string;
  notes: string;
};

const DEFAULT_FORM: FormState = {
  origin: "",
  productId: "",
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
  const { categories } = useCatalog();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  // Resetear al abrir
  useEffect(() => {
    if (open) {
      setForm(DEFAULT_FORM);
      setErrors({});
    }
  }, [open]);

  // Aplanar todos los productos
  const allProducts = categories.flatMap((cat) =>
    cat.items.map((item) => ({ id: item.id, name: item.name }))
  );

  // ── Validación ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.origin.trim()) next.origin = "El origen / empresa es obligatorio.";
    if (!form.productId) next.productId = "Selecciona el producto a canjear.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    const product = allProducts.find(p => p.id === form.productId);
    const productName = product ? product.name : "";

    onEmit({
      origin: form.origin.trim(),
      product: form.productId,
      productName: productName,
      notes: form.notes.trim() || undefined,
    });
    onClose();
  };

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
            <FormControl fullWidth error={!!errors.productId} required>
              <InputLabel>Producto a Canjear</InputLabel>
              <Select
                value={form.productId}
                label="Producto a Canjear"
                onChange={(e) => {
                  setForm({ ...form, productId: e.target.value });
                  setErrors((p) => ({ ...p, productId: undefined }));
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
                          <MenuItem key={`item-${item.id}`} value={item.id}>
                            {item.name}
                          </MenuItem>
                        )),
                      ]
                )}
              </Select>
              {errors.productId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {errors.productId}
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
