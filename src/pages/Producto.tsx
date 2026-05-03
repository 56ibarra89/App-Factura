import { Box, Button, Paper, Stack } from "@mui/material";
import { useState, useRef } from "react";
import { useProductContext } from "../context/ProductContext";
import { Product } from "../types/product";
import { useNavigate } from "react-router-dom";
import ProductsTable from "../components/ProductsTable";
import ProductFormDialog from "../components/ProductFormDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import CategoryManagerDialog from "../components/CategoryManagerDialog";
import RoleGuard from "../components/auth/RoleGuard";
import { logService } from "../services/logService";
import { useAuth } from "../context/AuthContext";


const Producto = () => {
  const { categories, addProduct, updateProduct, deleteProduct } = useProductContext();
  const { username, role } = useAuth();
  const navigate = useNavigate();
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const [showForm, setShowForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
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
    logService.log(username, role, "PRODUCT_DELETE", `Producto "${deleteConfirm.name}" eliminado de la categoría "${deleteConfirm.category}"`);
    setDeleteConfirm({ ...deleteConfirm, open: false });
  };

  const handleSubmit = (category: string, newProduct: Product, oldName?: string) => {
    if (oldName) {
      updateProduct(category, oldName, newProduct);
      logService.log(username, role, "PRODUCT_UPDATE", `Producto "${oldName}" actualizado en la categoría "${category}"`);
    } else {
      addProduct(category, newProduct);
      logService.log(username, role, "PRODUCT_CREATE", `Producto "${newProduct.name}" creado en la categoría "${category}"`);
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
            onDelete={handleDeleteClick}
          />
        </Paper>

        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <RoleGuard allowedRoles={["admin"]}>
            <Button 
              variant="outlined" 
              onClick={() => setShowCategoryManager(true)}
            >
              Gestionar Categorías
            </Button>
            <Button 
              ref={addButtonRef}
              variant="contained" 
              onClick={handleAdd}
            >
              Agregar Producto
            </Button>
          </RoleGuard>

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
        disableRestoreFocus={true}
      />

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que deseas eliminar "${deleteConfirm.name}" de la categoría "${deleteConfirm.category}"?`}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, open: false })}
        onConfirm={handleConfirmDelete}
        disableRestoreFocus={true}
      />

      <CategoryManagerDialog
        open={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
      />
    </>
  );
};

export default Producto;