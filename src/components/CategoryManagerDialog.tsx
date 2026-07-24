import React, { useState } from "react";
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
import { useProductContext } from "../hooks/useProductContext";
import { AVAILABLE_ICONS } from "../config/icons";
import { useKitchens } from "../hooks/useKitchens";

interface CategoryManagerDialogProps {
  open: boolean;
  onClose: () => void;
}

const CategoryManagerDialog: React.FC<CategoryManagerDialogProps> = ({ open, onClose }) => {
  const { categories, addCategory, updateCategory, deleteCategory } = useProductContext();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("Restaurant");
  const [newKitchenId, setNewKitchenId] = useState<string>("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingIcon, setEditingIcon] = useState("Restaurant");
  const [editingKitchenId, setEditingKitchenId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { kitchens } = useKitchens();

  const handleAdd = () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) return;

    if (categories.some((c) => c.label.toLowerCase() === trimmedName.toLowerCase())) {
      setError("Ya existe una categoría con ese nombre.");
      return;
    }

    addCategory(trimmedName, newCategoryIcon, newKitchenId || undefined);
    setNewCategoryName("");
    setNewCategoryIcon("Restaurant");
    setNewKitchenId("");
    setError(null);
  };

  const handleEditSave = () => {
    const trimmedName = editingName.trim();
    if (!trimmedName || !editingCategory) return;

    if (
      trimmedName.toLowerCase() !== editingCategory.toLowerCase() &&
      categories.some((c) => c.label.toLowerCase() === trimmedName.toLowerCase())
    ) {
      setError("Ya existe una categoría con ese nombre.");
      return;
    }

    updateCategory(editingCategory, trimmedName, editingIcon, editingKitchenId || undefined);
    setEditingCategory(null);
    setEditingName("");
    setEditingIcon("Restaurant");
    setEditingKitchenId("");
    setError(null);
  };

  const handleDelete = (categoryName: string) => {
    const cat = categories.find((c) => c.label === categoryName);
    if (cat && cat.items.length > 0) {
      setError(`No se puede eliminar '${categoryName}' porque tiene productos asociados.`);
      return;
    }
    deleteCategory(categoryName);
    setError(null);
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
              {Object.keys(AVAILABLE_ICONS).map((iconKey) => (
                <MenuItem key={iconKey} value={iconKey}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {AVAILABLE_ICONS[iconKey]}
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
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            error={!!error && !editingCategory}
          />
          <Button variant="contained" onClick={handleAdd} disabled={!newCategoryName.trim()}>
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
                    onClick={() => handleDelete(cat.label)}
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
                      {Object.keys(AVAILABLE_ICONS).map((iconKey) => (
                        <MenuItem key={iconKey} value={iconKey}>
                          <Box display="flex" alignItems="center" gap={1}>
                            {AVAILABLE_ICONS[iconKey]}
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
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleEditSave()}
                    error={!!error && editingCategory === cat.label}
                    autoFocus
                  />
                  <Button variant="contained" size="small" onClick={handleEditSave}>
                    Guardar
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
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
                  {AVAILABLE_ICONS[cat.icon || "Restaurant"]}
                  <ListItemText
                    primary={cat.label}
                    secondary={
                      <>
                        {cat.items.length} productos
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
    </Dialog>
  );
};

export default CategoryManagerDialog;
