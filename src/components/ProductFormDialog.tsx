import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  Button,
  Stack,
  Typography,
  IconButton,
  Box,
  Divider,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useEffect, useState } from "react";
import { Product, ProductSize } from "../types/product";
import { ExtraIngredientDef } from "../types/extras";

const categoriesList = [
  "Pizzas",
  "Mexicanos",
  "Submarinos",
  "Alitas",
  "Postres",
  "Bebidas",
];

const isPizza = (cat: string) => cat === "Pizzas";

const pizzaDefaults = [
  { size: "familiar", price: "" },
  { size: "mediana", price: "" },
  { size: "personal", price: "" },
];

const pizzaSizes: ProductSize[] = ["familiar", "mediana", "personal"];

interface ExtraFormItem {
  name: string;
  prices: { size: string; price: string }[];
}

const emptyExtra = (): ExtraFormItem => ({
  name: "",
  prices: pizzaSizes.map((s) => ({ size: s, price: "" })),
});

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
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    prices: pizzaDefaults,
    singlePrice: "",
  });

  const [extras, setExtras] = useState<ExtraFormItem[]>([]);

  useEffect(() => {
    if (editing) {
      const { product, category } = editing;

      setForm({
        name: product.name,
        description: product.description || "",
        category,
        prices: isPizza(category)
          ? product.prices.map((p) => ({
              size: p.size,
              price: p.price.toString(),
            }))
          : [{ size: "único", price: product.prices[0].price.toString() }],
        singlePrice: isPizza(category)
          ? ""
          : product.prices[0].price.toString(),
      });

      // Cargar extras existentes
      if (product.extras?.length) {
        setExtras(
          product.extras.map((ext) => ({
            name: ext.name,
            prices: pizzaSizes.map((s) => {
              const found = ext.prices.find((p) => p.size === s);
              return { size: s, price: found ? found.price.toString() : "" };
            }),
          }))
        );
      } else {
        setExtras([]);
      }
    } else {
      setForm({
        name: "",
        description: "",
        category: "",
        prices: pizzaDefaults.map((p) => ({ ...p })),
        singlePrice: "",
      });
      setExtras([]);
    }
  }, [editing]);

  const handleAddExtra = () => {
    setExtras((prev) => [...prev, emptyExtra()]);
  };

  const handleRemoveExtra = (index: number) => {
    setExtras((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExtraNameChange = (index: number, name: string) => {
    setExtras((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], name };
      return updated;
    });
  };

  const handleExtraPriceChange = (extraIndex: number, sizeIndex: number, price: string) => {
    setExtras((prev) => {
      const updated = [...prev];
      const prices = [...updated[extraIndex].prices];
      prices[sizeIndex] = { ...prices[sizeIndex], price };
      updated[extraIndex] = { ...updated[extraIndex], prices };
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Construir extras del producto
    const productExtras: ExtraIngredientDef[] = isPizza(form.category)
      ? extras
          .filter((ext) => ext.name.trim() !== "")
          .map((ext) => ({
            name: ext.name.trim(),
            prices: ext.prices
              .filter((p) => p.price !== "" && parseFloat(p.price) > 0)
              .map((p) => ({
                size: p.size as ProductSize,
                price: parseFloat(p.price),
              })),
          }))
          .filter((ext) => ext.prices.length > 0)
      : [];

    const newProduct: Product = {
      name: form.name,
      description: form.description.trim() || undefined,
      prices: isPizza(form.category)
        ? form.prices.map((p) => ({
            size: p.size as ProductSize,
            price: parseFloat(p.price),
          }))
        : [
            {
              size: "único",
              price: parseFloat(form.singlePrice),
            },
          ],
      extras: productExtras.length > 0 ? productExtras : undefined,
    };

    onSubmit(
      form.category,
      newProduct,
      editing ? editing.product.name : undefined
    );
  };

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
            onChange={(e) => {
              const cat = e.target.value;
              setForm({
                ...form,
                category: cat,
                prices: isPizza(cat)
                  ? pizzaDefaults.map((p) => ({ ...p, price: "" }))
                  : [{ size: "único", price: "" }],
                singlePrice: "",
              });
              if (!isPizza(cat)) {
                setExtras([]);
              }
            }}
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
                  value={p.price}
                  onChange={(e) => {
                    const arr = [...form.prices];
                    arr[i].price = e.target.value;
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
                value={form.singlePrice}
                onChange={(e) =>
                  setForm({ ...form, singlePrice: e.target.value })
                }
              />
            )}

          {/* --- SECCIÓN DE EXTRAS (solo para Pizzas) --- */}
          {isPizza(form.category) && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Ingredientes Extra
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={handleAddExtra}
                >
                  Agregar extra
                </Button>
              </Box>

              {extras.length === 0 && (
                <Typography variant="body2" color="text.secondary" mb={2}>
                  No hay extras configurados. Los clientes no podrán agregar ingredientes extra.
                </Typography>
              )}

              {extras.map((extra, extraIdx) => (
                <Paper
                  key={extraIdx}
                  variant="outlined"
                  sx={{ p: 1.5, mb: 1.5 }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <TextField
                      size="small"
                      label="Nombre del extra"
                      value={extra.name}
                      onChange={(e) => handleExtraNameChange(extraIdx, e.target.value)}
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveExtra(extraIdx)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Box display="flex" gap={1}>
                    {extra.prices.map((p, sizeIdx) => (
                      <TextField
                        key={p.size}
                        size="small"
                        label={`${p.size}`}
                        type="number"
                        value={p.price}
                        onChange={(e) =>
                          handleExtraPriceChange(extraIdx, sizeIdx, e.target.value)
                        }
                        sx={{ flex: 1 }}
                        inputProps={{ min: 0, step: 0.5 }}
                      />
                    ))}
                  </Box>
                </Paper>
              ))}
            </>
          )}

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button type="submit" variant="contained" fullWidth>
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