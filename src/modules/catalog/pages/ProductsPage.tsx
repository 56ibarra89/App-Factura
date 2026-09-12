import { Box, Button, Paper, Stack, Snackbar, Alert } from "@mui/material";
import {
  BackButton,
  ConfirmDialog,
  PageHeader,
} from "../../../shared/ui";
import CategoryIcon from "@mui/icons-material/Category";
import AddIcon from "@mui/icons-material/Add";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useState, useRef } from "react";
import { useCatalog } from "../hooks/useCatalog";
import type { Product } from "../model/catalog.types";
import ProductsTable from "../ui/admin/ProductsTable";
import ProductFormDialog from "../ui/admin/ProductFormDialog";
import ComboFormDialog from "../ui/admin/ComboFormDialog";
import CategoryManagerDialog from "../ui/admin/CategoryManagerDialog";
import { DeliveryPricesDialog } from "../../delivery";
import PackagingSizesDialog from "../ui/admin/PackagingSizesDialog";
import { RoleGuard, useAuth } from "../../auth";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import { logService } from "../../audit";
import { LOGIN_COLORS } from "../../../shared/theme";

const ProductsPage = () => {
  const { categories, addProduct, updateProduct, deleteProduct } = useCatalog();
  const { username, role } = useAuth();
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const blurActiveElement = () => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();
  };

  const [showForm, setShowForm] = useState(false);
  const [showComboForm, setShowComboForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showDeliveryPrices, setShowDeliveryPrices] = useState(false);
  const [showPackagingSizes, setShowPackagingSizes] = useState(false);
  const [editing, setEditing] = useState<null | {
    product: Product;
    category: string;
  }>(null);

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
    blurActiveElement();
    setEditing(null);
    setShowForm(true);
  };

  const handleAddCombo = () => {
    blurActiveElement();
    setEditing(null);
    setShowComboForm(true);
  };

  const handleEdit = (product: Product, category: string) => {
    blurActiveElement();
    setEditing({ product, category });
    if (product.isCombo) {
      setShowComboForm(true);
    } else {
      setShowForm(true);
    }
  };

  const handleDeleteClick = (name: string, category: string) => {
    blurActiveElement();
    setDeleteConfirm({
      open: true,
      name,
      category,
    });
  };

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleConfirmDelete = async () => {
    try {
      await deleteProduct(deleteConfirm.category, deleteConfirm.name);
      logService.log(username, role, "PRODUCT_DELETE", `Producto "${deleteConfirm.name}" eliminado de la categoría "${deleteConfirm.category}"`);
      setSnackbar({
        open: true,
        message: `"${deleteConfirm.name}" eliminado correctamente`,
        severity: "success",
      });
    } catch (error: any) {
      console.error("Error al eliminar:", error);
      setSnackbar({
        open: true,
        message: error?.message || "Error al eliminar el producto",
        severity: "error",
      });
    } finally {
      setDeleteConfirm((prev) => ({ ...prev, open: false }));
    }
  };

  const handleSubmit = async (category: string, newProduct: Product, oldName?: string) => {
    try {
      if (oldName) {
        await updateProduct(category, oldName, newProduct);
        logService.log(username, role, "PRODUCT_UPDATE", `${newProduct.isCombo ? 'Combo' : 'Producto'} "${oldName}" actualizado en la categoría "${category}"`);
        setSnackbar({
          open: true,
          message: `${newProduct.isCombo ? 'Combo' : 'Producto'} "${newProduct.name}" actualizado exitosamente`,
          severity: "success",
        });
      } else {
        await addProduct(category, newProduct);
        logService.log(username, role, "PRODUCT_CREATE", `${newProduct.isCombo ? 'Combo' : 'Producto'} "${newProduct.name}" creado en la categoría "${category}"`);
        setSnackbar({
          open: true,
          message: `${newProduct.isCombo ? 'Combo' : 'Producto'} "${newProduct.name}" creado exitosamente`,
          severity: "success",
        });
      }
      setShowForm(false);
      setShowComboForm(false);
      setEditing(null);
    } catch (error: any) {
      console.error("Error al guardar producto/combo:", error);
      setSnackbar({
        open: true,
        message: error?.message || "Error al guardar el producto o combo",
        severity: "error",
      });
    }
  };
  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: 'background.default',
        pt: 4,
        pb: 4,
        px: { xs: 2, md: 6 },
      }}
    >
      <PageHeader
        title="Inventario de Productos"
        startContent={<BackButton to="/home" />}
        actions={
          <RoleGuard allowedRoles={["admin"]}>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  blurActiveElement();
                  setShowCategoryManager(true);
                }}
                startIcon={<CategoryIcon />}
                sx={{
                  borderRadius: 2,
                  borderColor: LOGIN_COLORS.primary,
                  color: LOGIN_COLORS.primary,
                  '&:hover': { borderColor: LOGIN_COLORS.primaryDark, bgcolor: 'rgba(0,0,0,0.02)' }
                }}
              >
                Gestionar Categorías
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  blurActiveElement();
                  setShowDeliveryPrices(true);
                }}
                startIcon={<TwoWheelerIcon />}
                sx={{
                  borderRadius: 2,
                  borderColor: LOGIN_COLORS.primary,
                  color: LOGIN_COLORS.primary,
                  '&:hover': { borderColor: LOGIN_COLORS.primaryDark, bgcolor: 'rgba(0,0,0,0.02)' }
                }}
              >
                Precios Delivery
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  blurActiveElement();
                  setShowPackagingSizes(true);
                }}
                startIcon={<span role="img" aria-label="box">📦</span>}
                sx={{
                  borderRadius: 2,
                  borderColor: LOGIN_COLORS.primary,
                  color: LOGIN_COLORS.primary,
                  '&:hover': { borderColor: LOGIN_COLORS.primaryDark, bgcolor: 'rgba(0,0,0,0.02)' }
                }}
              >
                Gestionar Empaques
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleAddCombo}
                startIcon={<AutoAwesomeIcon />}
                sx={{
                  borderRadius: 2,
                  bgcolor: "#d32f2f",
                  background: "linear-gradient(135deg, #d32f2f 0%, #f57c00 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(211, 47, 47, 0.25)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #b71c1c 0%, #e65100 100%)",
                  },
                }}
              >
                Crear Combo
              </Button>
              <Button
                ref={addButtonRef}
                variant="contained"
                size="small"
                onClick={handleAdd}
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: 2,
                  bgcolor: LOGIN_COLORS.primary,
                  '&:hover': { bgcolor: LOGIN_COLORS.primaryDark }
                }}
              >
                Agregar Producto
              </Button>
            </Stack>
          </RoleGuard>
        }
      />

      <Paper sx={{ width: "100%", mb: 3, p: 2, borderRadius: 4, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
        <ProductsTable
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </Paper>

      <ProductFormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        editing={editing}
        disableRestoreFocus={true}
      />

      <ComboFormDialog
        open={showComboForm}
        onClose={() => {
          setShowComboForm(false);
          setEditing(null);
        }}
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

      <DeliveryPricesDialog
        open={showDeliveryPrices}
        onClose={() => setShowDeliveryPrices(false)}
      />
      <PackagingSizesDialog
        open={showPackagingSizes}
        onClose={() => setShowPackagingSizes(false)}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductsPage;

