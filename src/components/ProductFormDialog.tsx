import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import { Product } from "../types/product";
import { useProductForm } from "../hooks/useProductForm";
import { IS_PIZZA as isPizza, PRODUCT_CATEGORIES as categoriesList } from "../config/constants";
import ExtrasFormSection from "./ExtrasFormSection";

const ProductFormDialog = ({
  open,
  onClose,
  onSubmit,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (category: string, product: Product, oldName?: string) => void;
  editing: null | { product: Product; category: string };
}) => {
  const {
    form,
    setForm,
    extras,
    handleCategoryChange,
    handleAddExtra,
    handleRemoveExtra,
    handleExtraNameChange,
    handleExtraPriceChange,
    handleSubmit,
    isFormValid,
  } = useProductForm({ editing, onSubmit, open });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {editing ? "Editar producto" : "Agregar producto"}
      </DialogTitle>

      <DialogContent dividers>
        <form onSubmit={handleSubmit}>
          <TextField
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

          <TextField
            select
            fullWidth
            label="Categoría"
            name="category"
            sx={{ mb: 2 }}
            value={form.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            {categoriesList.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>

          {isPizza(form.category)
            ? form.prices.map((p, i) => (
                <TextField
                  key={p.size}
                  fullWidth
                  sx={{ mb: 2 }}
                  label={`Precio ${p.size}`}
                  type="number"
                  inputProps={{ min: 0, step: "0.01" }}
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

          {/* Sección de extras (solo Pizzas) */}
          {isPizza(form.category) && (
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
          )}

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