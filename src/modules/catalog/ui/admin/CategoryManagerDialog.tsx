import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useCatalog } from "../../hooks/useCatalog";
import { CATEGORY_ICONS } from "../categoryIcons";
import { useKitchens } from "../../../kitchens";
import CategoryExtrasDialog from "./CategoryExtrasDialog";

interface CategoryManagerDialogProps {
  open: boolean;
  onClose: () => void;
}

const CategoryManagerDialog: React.FC<CategoryManagerDialogProps> = ({ open, onClose }) => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCatalog();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("Restaurant");
  const [newKitchenId, setNewKitchenId] = useState<string>("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingIcon, setEditingIcon] = useState("Restaurant");
  const [editingKitchenId, setEditingKitchenId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [extrasCategoryId, setExtrasCategoryId] = useState<string | null>(null);
  const extrasCategory = categories.find((category) => category.id === extrasCategoryId) ?? null;
  const { kitchens } = useKitchens();

  useEffect(() => {
    if (open) {
      setError(null);
      setSaving(false);
      setEditingCategory(null);
    }
  }, [open]);

  const handleAdd = async () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName || saving) return;

    if (categories.some((c) => c.label.toLowerCase() === trimmedName.toLowerCase())) {
      setError("Ya existe una categoría con ese nombre.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await addCategory(trimmedName, newCategoryIcon, newKitchenId || undefined);
      setNewCategoryName("");
      setNewCategoryIcon("Restaurant");
      setNewKitchenId("");
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "No se pudo crear la categoría.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditSave = async () => {
    const trimmedName = editingName.trim();
    if (!trimmedName || !editingCategory || saving) return;

    if (
      trimmedName.toLowerCase() !== editingCategory.toLowerCase() &&
      categories.some((c) => c.label.toLowerCase() === trimmedName.toLowerCase())
    ) {
      setError("Ya existe una categoría con ese nombre.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await updateCategory(
        editingCategory,
        trimmedName,
        editingIcon,
        editingKitchenId || null,
      );
      setEditingCategory(null);
      setEditingName("");
      setEditingIcon("Restaurant");
      setEditingKitchenId("");
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "No se pudo actualizar la categoría.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoryName: string) => {
    if (saving) return;
    const cat = categories.find((c) => c.label === categoryName);
    if (cat && cat.items.length > 0) {
      setError(`No se puede eliminar '${categoryName}' porque tiene productos asociados.`);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await deleteCategory(categoryName);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "No se pudo eliminar la categoría.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Gestionar Categorías</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" gap={1} mb={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 80 }}>
            <Select
              value={newCategoryIcon}
              onChange={(e) => setNewCategoryIcon(e.target.value as string)}
              displayEmpty
            >
              {Object.keys(CATEGORY_ICONS).map((iconKey) => (
                <MenuItem key={iconKey} value={iconKey}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {CATEGORY_ICONS[iconKey]}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={newKitchenId}
              onChange={(e) => setNewKitchenId(e.target.value as string)}
              displayEmpty
            >
              <MenuItem value="">
                <em>Ninguna cocina</em>
              </MenuItem>
              {kitchens.map((k) => (
                <MenuItem key={k.id} value={k.id}>{k.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            fullWidth
            label="Nueva categoría"
            value={newCategoryName}
            disabled={saving}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void handleAdd();
              }
            }}
            error={!!error && !editingCategory}
          />
          <Button
            variant="contained"
            onClick={() => void handleAdd()}
            disabled={!newCategoryName.trim() || saving}
          >
            Agregar
          </Button>
        </Box>

        {error && (
          <Typography color="error" variant="body2" mb={2}>
            {error}
          </Typography>
        )}

        <List sx={{ width: "100%", bgcolor: "background.paper" }}>
          {categories.map((cat) => (
            <ListItem
              key={cat.label}
              secondaryAction={
                <Box>
                  <IconButton
                    edge="end"
                    aria-label={`Gestionar extras de ${cat.label}`}
                    color="primary"
                    onClick={() => setExtrasCategoryId(cat.id ?? null)}
                  >
                    <AddCircleOutlineIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => {
                      setEditingCategory(cat.label);
                      setEditingName(cat.label);
                      setEditingIcon(cat.icon || "Restaurant");
                      setEditingKitchenId(cat.kitchenId || "");
                      setError(null);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    color="error"
                    disabled={saving}
                    onClick={() => void handleDelete(cat.label)}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              {editingCategory === cat.label ? (
                <Box display="flex" gap={1} width="100%" mr={8} alignItems="center">
                  <FormControl size="small" sx={{ minWidth: 80 }}>
                    <Select
                      value={editingIcon}
                      onChange={(e) => setEditingIcon(e.target.value as string)}
                    >
                      {Object.keys(CATEGORY_ICONS).map((iconKey) => (
                        <MenuItem key={iconKey} value={iconKey}>
                          <Box display="flex" alignItems="center" gap={1}>
                            {CATEGORY_ICONS[iconKey]}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={editingKitchenId}
                      onChange={(e) => setEditingKitchenId(e.target.value as string)}
                      displayEmpty
                    >
                      <MenuItem value="">
                        <em>Ninguna cocina</em>
                      </MenuItem>
                      {kitchens.map((k) => (
                        <MenuItem key={k.id} value={k.id}>{k.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    size="small"
                    fullWidth
                    value={editingName}
                    disabled={saving}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        void handleEditSave();
                      }
                    }}
                    error={!!error && editingCategory === cat.label}
                    autoFocus
                  />
                  <Button
                    variant="contained"
                    size="small"
                    disabled={saving || !editingName.trim()}
                    onClick={() => void handleEditSave()}
                  >
                    Guardar
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={saving}
                    onClick={() => {
                      setEditingCategory(null);
                      setError(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </Box>
              ) : (
                <Box display="flex" alignItems="center" gap={2}>
                  {CATEGORY_ICONS[cat.icon || "Restaurant"]}
                  <ListItemText
                    primary={cat.label}
                    secondary={
                      <>
                        {cat.items.length} productos • {cat.extras.length} extras
                        {cat.kitchenId && ` • Cocina: ${kitchens.find(k => k.id === cat.kitchenId)?.name || 'Desconocida'}`}
                      </>
                    }
                  />
                </Box>
              )}
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <Box p={2} display="flex" justifyContent="flex-end">
        <Button onClick={onClose} variant="contained">
          Cerrar
        </Button>
      </Box>
      <CategoryExtrasDialog category={extrasCategory} onClose={() => setExtrasCategoryId(null)} />
    </Dialog>
  );
};

export default CategoryManagerDialog;
