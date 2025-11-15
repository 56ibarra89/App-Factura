import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import { useState } from "react";
import { useProductContext, Product } from "../context/ProductContext";
import { useNavigate } from "react-router-dom";
import ProductsTable from "../components/ProductsTable";

// Lista de categorías disponibles
const categoriesList = [
  "Pizzas",
  "Mexicanos",
  "Submarinos",
  "Alitas",
  "Postres",
  "Bebidas",
];

// Utilidad para saber si la categoría es Pizza
const isPizzaCategory = (category: string) => category === "Pizzas";

// Precios por tamaño para pizzas
const initialPizzaPrices = [
  { size: "familiar", price: "" },
  { size: "mediana", price: "" },
  { size: "personal", price: "" },
];

export const Producto = () => {
  const { categories, addProduct, updateProduct, deleteProduct } =
    useProductContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    category: "",
    prices: initialPizzaPrices,
    singlePrice: "",
  });

  const [editing, setEditing] = useState<null | {
    oldName: string;
    category: string;
  }>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "category") {
      setForm({
        ...form,
        category: value,
        prices: isPizzaCategory(value)
          ? initialPizzaPrices
          : [{ size: "único", price: "" }],
        singlePrice: "",
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handlePriceChange = (index: number, value: string) => {
    const updatedPrices = [...form.prices];
    updatedPrices[index].price = value;
    setForm({ ...form, prices: updatedPrices });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category) return;

    const newProduct: Product = {
      name: form.name,
      prices: isPizzaCategory(form.category)
        ? form.prices.map((p) => ({
          size: p.size as "familiar" | "mediana" | "personal",
          price: parseFloat(p.price),
        }))
        : [
          {
            size: "único",
            price: parseFloat(form.singlePrice),
          },
        ],
    };

    if (editing) {
      updateProduct(editing.category, editing.oldName, newProduct);
      setEditing(null);
    } else {
      addProduct(form.category, newProduct);
    }

    setForm({
      name: "",
      category: "",
      prices: initialPizzaPrices.map((p) => ({ ...p, price: "" })),
      singlePrice: "",
    });
  };

  const handleEdit = (product: Product, category: string) => {
    setForm({
      name: product.name,
      category,
      prices: isPizzaCategory(category)
        ? product.prices.map((p) => ({
          size: p.size,
          price: p.price.toString(),
        }))
        : [{ size: "único", price: product.prices[0].price.toString() }],
      singlePrice: isPizzaCategory(category)
        ? ""
        : product.prices[0].price.toString(),
    });

    setEditing({ oldName: product.name, category });
  };

  const handleDelete = (name: string, category: string) => {
    if (
      confirm(
        `¿Estás seguro de eliminar "${name}" de la categoría ${category}?`
      )
    ) {
      deleteProduct(category, name);
    }
  };

  return (
    <>
      <Box p={4} maxWidth={600} mx="auto">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight="bold" mb={3}>
            {editing ? "Editar producto" : "Agregar nuevo producto"}
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Nombre del producto"
              variant="outlined"
              fullWidth
              name="name"
              value={form.name}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />

            {isPizzaCategory(form.category) ? (
              form.prices.map((entry, index) => (
                <TextField
                  key={entry.size}
                  label={`Precio ${entry.size}`}
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={entry.price}
                  onChange={(e) => handlePriceChange(index, e.target.value)}
                  sx={{ mb: 2 }}
                  inputProps={{ step: "0.01" }}
                />
              ))
            ) : (
              <TextField
                label="Precio"
                variant="outlined"
                fullWidth
                type="number"
                name="singlePrice"
                value={form.singlePrice}
                onChange={handleChange}
                sx={{ mb: 2 }}
                inputProps={{ step: "0.01" }}
              />
            )}

            <TextField
              select
              label="Categoría"
              fullWidth
              name="category"
              value={form.category}
              onChange={handleChange}
              sx={{ mb: 3 }}
            >
              {categoriesList.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>

            <Stack direction="row" spacing={2}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                {editing ? "Actualizar producto" : "Guardar producto"}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={() => {
                  setForm({
                    name: "",
                    category: "",
                    prices: initialPizzaPrices.map((p) => ({ ...p, price: "" })),
                    singlePrice: "",
                  });
                  setEditing(null);
                }}
              >
                Cancelar
              </Button>
            </Stack>
          </form>
          <Button
            variant="text"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => navigate("/home")}
          >
            Volver al inicio
          </Button>
        </Paper>
      </Box>

      {/* ---------------- TABLA DE PRODUCTOS ---------------- */}
      <Box p={4}>
        <Paper sx={{ height: 420, width: "100%", mb: 3 }}>
          <ProductsTable
            categories={categories}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Paper>
      </Box>
    </>
  );
};

export default Producto;
