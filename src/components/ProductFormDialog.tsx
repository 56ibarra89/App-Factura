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
} from "@mui/material";
import { useEffect, useRef } from "react";
import { Product } from "../types/product";
import { useProductForm } from "../hooks/useProductForm";
import { useProductContext } from "../context/ProductContext";
import ExtrasFormSection from "./ExtrasFormSection";
import { blockInvalidChar } from "../utils/inputUtils";

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
  const { categories } = useProductContext();

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      nameInputRef.current?.focus();
    }, 150);
    return () => window.clearTimeout(timer);
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

      <DialogContent dividers>
        <form onSubmit={handleSubmit}>
          <TextField
            inputRef={nameInputRef}
            autoFocus
            fullWidth
            label="Nombre"
            name="name"
            sx={{ mb: 2 }}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <TextField
            fullWidth
            label="Descripción"
            name="description"
            multiline
            minRows={2}
            maxRows={4}
            sx={{ mb: 2 }}
            placeholder="Ej: Incluye queso mozzarella, salsa de tomate, pepperoni..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="category-label">Categoría</InputLabel>
            <Select
              labelId="category-label"
              value={form.category}
              name="category"
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
            sx={{ mb: 2 }}
          />

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

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button type="submit" variant="contained" fullWidth disabled={!isFormValid}>
              {editing ? "Actualizar" : "Guardar"}
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

export default ProductFormDialog;
