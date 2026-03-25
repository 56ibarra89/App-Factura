import { Box, Button, Paper, Stack } from "@mui/material";
import { useState } from "react";
import { useProductContext } from "../context/ProductContext";
import { Product } from "../types/product";
import { useNavigate } from "react-router-dom";
import ProductsTable from "../components/ProductsTable";
import ProductFormDialog from "../components/ProductFormDialog";


const Producto = () => {
  const { categories, addProduct, updateProduct, deleteProduct } = useProductContext();
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<null | {
    product: Product;
    category: string;
  }>(null);

  const handleAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (product: Product, category: string) => {
    setEditing({ product, category });
    setShowForm(true);
  };

  const handleDelete = (name: string, category: string) => {
    if (confirm(`¿Eliminar "${name}" de la categoría ${category}?`)) {
      deleteProduct(category, name);
    }
  };

  const handleSubmit = (category: string, newProduct: Product, oldName?: string) => {
    if (oldName) {
      updateProduct(category, oldName, newProduct);
    } else {
      addProduct(category, newProduct);
    }
    setShowForm(false);
    setEditing(null);
  };

  return (
    <>
      <Box p={4}>
        <Paper sx={{ width: "100%", mb: 3, p: 2 }}>
          <ProductsTable
            categories={categories}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Paper>

        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button variant="contained" onClick={handleAdd}>
            Agregar Producto
          </Button>

          <Button variant="outlined" onClick={() => navigate("/home")}>
            Volver al inicio
          </Button>
        </Stack>
      </Box>

      <ProductFormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        editing={editing}
      />
    </>
  );
};

export default Producto;