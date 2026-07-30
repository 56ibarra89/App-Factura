import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  Button,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";
import { useEffect, useRef } from "react";
import type { Product } from "../../model/catalog.types";
import { useProductForm } from "../../hooks/useProductForm";
import { useCatalog } from "../../hooks/useCatalog";
import ExtrasFormSection from "./ExtrasFormSection";
import { blockInvalidChar } from "../../../../shared/forms";

const ProductFormDialog = ({
  open,
  onClose,
  onSubmit,
  editing,
  disableRestoreFocus,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (category: string, product: Product, oldName?: string) => void;
  editing: null | { product: Product; category: string };
  disableRestoreFocus?: boolean;
}) => {
  const { categories } = useCatalog();

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);
  }, [open]);

  const {
    form,
    setForm,
    extras,
    handleCategoryChange,
    handleMultipleSizesToggle,
    handleAddExtra,
    handleRemoveExtra,
    handleExtraNameChange,
    handleExtraPriceChange,
    handleSubmit,
    isFormValid,
  } = useProductForm({ editing, onSubmit, open });

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      disableRestoreFocus={disableRestoreFocus}
    >
      <DialogTitle>
        {editing ? "Editar producto" : "Agregar producto"}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre"
            sx={{ mb: 2, mt: 1 }}
            value={form.name}
            inputRef={nameInputRef}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={form.name.trim() === ""}
            helperText={form.name.trim() === "" ? "El nombre es obligatorio" : ""}
          />
          <TextField
            fullWidth
            label="Descripción"
            multiline
            rows={3}
            sx={{ mb: 2 }}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={form.category}
              label="Categoría"
              onChange={(e) => handleCategoryChange(e.target.value as string)}
            >
              {categories.map((c) => (
                <MenuItem key={c.label} value={c.label}>
                  {c.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={form.hasMultipleSizes}
                onChange={(e) => handleMultipleSizesToggle(e.target.checked)}
                disabled={!!editing}
              />
            }
            label="El producto tiene múltiples tamaños"
            sx={{ mb: 0 }}
          />
          {form.hasMultipleSizes && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, ml: 4 }}>
              Deja en blanco el precio de los tamaños que no apliquen para este producto.
            </Typography>
          )}

          {form.hasMultipleSizes
            ? form.prices.map((p, i) => (
                <TextField
                  key={p.size}
                  fullWidth
                  sx={{ mb: 2 }}
                  label={`Precio ${p.size}`}
                  type="number"
                  inputProps={{ min: 0, step: "0.01" }}
                  onKeyDown={blockInvalidChar}
                  error={p.price !== "" && parseFloat(p.price) <= 0}
                  helperText={p.price !== "" && parseFloat(p.price) <= 0 ? "El precio debe ser mayor a 0" : ""}
                  value={p.price}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val !== "" && parseFloat(val) < 0) return;
                    const arr = [...form.prices];
                    arr[i].price = val;
                    setForm({ ...form, prices: arr });
                  }}
                />
              ))
            : (
              <TextField
                fullWidth
                label="Precio"
                sx={{ mb: 2 }}
                type="number"
                inputProps={{ min: 0, step: "0.01" }}
                onKeyDown={blockInvalidChar}
                error={form.singlePrice !== "" && parseFloat(form.singlePrice) <= 0}
                helperText={form.singlePrice !== "" && parseFloat(form.singlePrice) <= 0 ? "El precio debe ser mayor a 0" : ""}
                value={form.singlePrice}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val !== "" && parseFloat(val) < 0) return;
                  setForm({ ...form, singlePrice: val });
                }}
              />
            )}

          {/* Sección de extras (disponible para todos los productos) */}
          <>
            <Divider sx={{ my: 2 }} />
            <ExtrasFormSection
              extras={extras}
              onAdd={handleAddExtra}
              onRemove={handleRemoveExtra}
              onNameChange={handleExtraNameChange}
              onPriceChange={handleExtraPriceChange}
            />
          </>

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={!isFormValid}
            >
              Guardar
            </Button>
            <Button
              onClick={onClose}
              variant="outlined"
              color="error"
              fullWidth
            >
              Cancelar
            </Button>
          </Stack>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default ProductFormDialog;
