import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
} from "@mui/material";
import { useState, useEffect } from "react";
import type {
  DescuentoRule,
} from "../../model/promotion.types";
import { useCatalog } from "../../../catalog";

interface DescuentoDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (rule: DescuentoRule) => void;
  editingRule?: DescuentoRule | null;
}

const DescuentoDialog = ({ open, onClose, onSave, editingRule }: DescuentoDialogProps) => {
  const { categories } = useCatalog();
  const [errorMsg, setErrorMsg] = useState<string>("");
  
  const [form, setForm] = useState<Partial<DescuentoRule>>({
    name: "",
    type: "Porcentaje",
    value: "",
    status: "Activo",
    appliesTo: "Toda la cuenta",
  });

  useEffect(() => {
    if (open) {
      if (editingRule) {
        setForm({
          ...editingRule,
          value: editingRule.value.replace(/[^0-9.]/g, ""),
        });
      } else {
        setForm({
          name: "",
          type: "Porcentaje",
          value: "",
          status: "Activo",
          appliesTo: "Toda la cuenta",
        });
      }
      setErrorMsg("");
    }
  }, [open, editingRule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numericValue = parseFloat(form.value || "0");
    
    if (form.type === "Porcentaje" && (numericValue <= 0 || numericValue > 100)) {
      setErrorMsg("El porcentaje debe ser un valor entre 1 y 100.");
      return;
    }
    
    if (form.type === "Monto Fijo" && numericValue <= 0) {
      setErrorMsg("El monto fijo debe ser mayor a 0.");
      return;
    }

    if (form.name && form.value && form.appliesTo) {
      const finalValue = form.type === "Porcentaje" ? `${form.value}%` : `C$${form.value}`;
      onSave({
        id: form.id || Date.now(),
        name: form.name,
        type: form.type as string,
        value: finalValue,
        status: form.status as "Activo" | "Inactivo",
        appliesTo: form.appliesTo,
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editingRule ? "Editar Descuento" : "Nuevo Descuento"}</DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit}>
          <TextField
            autoFocus
            fullWidth
            label="Nombre del descuento"
            sx={{ mb: 2, mt: 1 }}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={form.type}
              label="Tipo"
              onChange={(e) => setForm({ ...form, type: e.target.value, value: "" })}
            >
              <MenuItem value="Porcentaje">Porcentaje</MenuItem>
              <MenuItem value="Monto Fijo">Monto Fijo</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Valor"
            sx={{ mb: 2 }}
            value={form.value}
            onChange={(e) => {
              // Permitir solo números y un punto decimal
              const val = e.target.value.replace(/[^0-9.]/g, "");
              setForm({ ...form, value: val });
              setErrorMsg("");
            }}
            placeholder={form.type === "Porcentaje" ? "Ej. 20" : "Ej. 150.00"}
            required
            error={!!errorMsg}
            helperText={errorMsg}
            InputProps={{
              startAdornment: form.type === "Monto Fijo" ? <InputAdornment position="start">C$</InputAdornment> : null,
              endAdornment: form.type === "Porcentaje" ? <InputAdornment position="end">%</InputAdornment> : null,
            }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Aplica a</InputLabel>
            <Select
              value={form.appliesTo}
              label="Aplica a"
              onChange={(e) => setForm({ ...form, appliesTo: e.target.value })}
              required
            >
              <MenuItem value="Toda la cuenta">Toda la cuenta</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.label} value={c.label}>
                  Categoría: {c.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={form.status}
              label="Estado"
              onChange={(e) => setForm({ ...form, status: e.target.value as "Activo" | "Inactivo" })}
            >
              <MenuItem value="Activo">Activo</MenuItem>
              <MenuItem value="Inactivo">Inactivo</MenuItem>
            </Select>
          </FormControl>

          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained" fullWidth>
              {editingRule ? "Actualizar" : "Guardar"}
            </Button>
            <Button fullWidth variant="outlined" onClick={onClose}>
              Cancelar
            </Button>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DescuentoDialog;
