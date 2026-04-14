import { Box, Button, Paper, Stack } from "@mui/material";
import { useState, useRef } from "react";
import { useProductContext } from "../context/ProductContext";
import { Product } from "../types/product";
import { useNavigate } from "react-router-dom";
import ProductsTable from "../components/ProductsTable";
import ProductFormDialog from "../components/ProductFormDialog";
import ConfirmDialog from "../components/ConfirmDialog";


const Producto = () => {
  const { categories, addProduct, updateProduct, deleteProduct } = useProductContext();
  const navigate = useNavigate();
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<null | {
    product: Product;
    category: string;
  }>(null);

  // Estados para el diálogo de confirmación de eliminación
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    name: string;
    category: string;
  }>({
    open: false,
    name: "",
    category: "",
  });

  const handleAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (product: Product, category: string) => {
    setEditing({ product, category });
    setShowForm(true);
  };

  const handleDeleteClick = (name: string, category: string) => {
    setDeleteConfirm({
      open: true,
      name,
      category,
    });
  };

  const handleConfirmDelete = () => {
    deleteProduct(deleteConfirm.category, deleteConfirm.name);
    setDeleteConfirm({ ...deleteConfirm, open: false });
    
    // Asegurar que el foco regrese a un elemento estable después de borrar
    setTimeout(() => {
      addButtonRef.current?.focus();
    }, 100);
  };

  const handleSubmit = (category: string, newProduct: Product, oldName?: string) => {
    if (oldName) {
      updateProduct(category, oldName, newProduct);
    } else {
      addProduct(category, newProduct);
    }
    setShowForm(false);
    setEditing(null);
    
    // Devolver el foco al botón de agregar para consistencia
    setTimeout(() => {
      addButtonRef.current?.focus();
    }, 100);
  };

  return (
    <>
      <Box p={4}>
        <Paper sx={{ width: "100%", mb: 3, p: 2 }}>
          <ProductsTable
            categories={categories}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        </Paper>

        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button 
            ref={addButtonRef}
            variant="contained" 
            onClick={handleAdd}
          >
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
        disableRestoreFocus
      />

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que deseas eliminar "${deleteConfirm.name}" de la categoría "${deleteConfirm.category}"?`}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, open: false })}
        onConfirm={handleConfirmDelete}
        disableRestoreFocus
        disableEnforceFocus
      />
    </>
  );
};

export default Producto;