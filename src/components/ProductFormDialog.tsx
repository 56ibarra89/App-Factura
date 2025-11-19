import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  Button,
  Stack,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Product, ProductSize } from "../types/product";

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
    category: "",
    prices: pizzaDefaults,
    singlePrice: "",
  });

  useEffect(() => {
    if (editing) {
      const { product, category } = editing;

      setForm({
        name: product.name,
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
    } else {
      setForm({
        name: "",
        category: "",
        prices: pizzaDefaults.map((p) => ({ ...p })),
        singlePrice: "",
      });
    }
  }, [editing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newProduct: Product = {
      name: form.name,
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

          <Stack direction="row" spacing={2}>
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