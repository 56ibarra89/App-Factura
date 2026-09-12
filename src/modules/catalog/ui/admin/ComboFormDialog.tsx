import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Box,
  Paper,
  IconButton,
  InputAdornment,
  Chip,
} from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import CloseIcon from "@mui/icons-material/Close";
import type { Product, ComboGroupDef } from "../../model/catalog.types";
import { useCatalog } from "../../hooks/useCatalog";
import { LOGIN_COLORS } from "../../../../shared/theme";
import { blockInvalidChar } from "../../../../shared/forms";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (category: string, product: Product, oldName?: string) => Promise<void> | void;
  editing: null | { product: Product; category: string };
  disableRestoreFocus?: boolean;
}

interface FormState {
  name: string;
  description: string;
  category: string;
  comboPrice: string;
  comboGroups: ComboGroupDef[];
}

export const ComboFormDialog = ({
  open,
  onClose,
  onSubmit,
  editing,
  disableRestoreFocus,
}: Props) => {
  const { categories } = useCatalog();

  // Lista de todos los productos simples (no combos) elegibles para armar grupos
  const selectableProducts = useMemo(() => {
    return categories
      .flatMap((c) =>
        c.items.map((item) => ({
          ...item,
          categoryLabel: c.label,
        })),
      )
      .filter((p) => !p.isCombo);
  }, [categories]);

  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    category: "",
    comboPrice: "",
    comboGroups: [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (editing) {
      setForm({
        name: editing.product.name,
        description: editing.product.description || "",
        category: editing.category || (categories[0]?.label ?? ""),
        comboPrice: editing.product.comboPrice
          ? String(editing.product.comboPrice)
          : editing.product.prices[0]?.price
            ? String(editing.product.prices[0].price)
            : "",
        comboGroups: editing.product.comboGroups
          ? JSON.parse(JSON.stringify(editing.product.comboGroups))
          : [],
      });
    } else {
      setForm({
        name: "",
        description: "",
        category: categories[0]?.label ?? "",
        comboPrice: "",
        comboGroups: [
          {
            name: "Platos Principales",
            requiredCount: 2,
            options: [],
          },
        ],
      });
    }
  }, [categories, editing, open]);

  // Manejo de Grupos
  const handleAddGroup = () => {
    setForm((prev) => ({
      ...prev,
      comboGroups: [
        ...prev.comboGroups,
        {
          name: "",
          requiredCount: 1,
          options: [],
        },
      ],
    }));
  };

  const handleRemoveGroup = (groupIndex: number) => {
    setForm((prev) => ({
      ...prev,
      comboGroups: prev.comboGroups.filter((_, idx) => idx !== groupIndex),
    }));
  };

  const handleGroupChange = (
    groupIndex: number,
    field: keyof ComboGroupDef,
    value: unknown,
  ) => {
    setForm((prev) => {
      const next = [...prev.comboGroups];
      next[groupIndex] = { ...next[groupIndex], [field]: value };
      return { ...prev, comboGroups: next };
    });
  };

  // Manejo de Opciones dentro de un Grupo
  const handleAddOption = (groupIndex: number) => {
    const defaultProduct = selectableProducts[0];
    if (!defaultProduct) return;

    const defaultSize = defaultProduct.hasMultipleSizes
      ? defaultProduct.prices[0]?.size || ""
      : "";

    setForm((prev) => {
      const next = [...prev.comboGroups];
      const targetGroup = next[groupIndex];
      targetGroup.options = [
        ...targetGroup.options,
        {
          itemProductId: defaultProduct.id || "",
          itemProductName: defaultProduct.name,
          size: defaultSize,
          extraPrice: 0,
        },
      ];
      return { ...prev, comboGroups: next };
    });
  };

  const handleRemoveOption = (groupIndex: number, optionIndex: number) => {
    setForm((prev) => {
      const next = [...prev.comboGroups];
      next[groupIndex].options = next[groupIndex].options.filter(
        (_, idx) => idx !== optionIndex,
      );
      return { ...prev, comboGroups: next };
    });
  };

  const handleOptionProductChange = (
    groupIndex: number,
    optionIndex: number,
    productId: string,
  ) => {
    const selectedProd = selectableProducts.find((p) => p.id === productId);
    const defaultSize = selectedProd?.hasMultipleSizes
      ? selectedProd.prices[0]?.size || ""
      : "";

    setForm((prev) => {
      const next = [...prev.comboGroups];
      next[groupIndex].options[optionIndex] = {
        ...next[groupIndex].options[optionIndex],
        itemProductId: productId,
        itemProductName: selectedProd?.name,
        size: defaultSize,
      };
      return { ...prev, comboGroups: next };
    });
  };

  const handleOptionSizeChange = (
    groupIndex: number,
    optionIndex: number,
    size: string,
  ) => {
    setForm((prev) => {
      const next = [...prev.comboGroups];
      next[groupIndex].options[optionIndex] = {
        ...next[groupIndex].options[optionIndex],
        size,
      };
      return { ...prev, comboGroups: next };
    });
  };

  const handleOptionExtraPriceChange = (
    groupIndex: number,
    optionIndex: number,
    extraPrice: number,
  ) => {
    setForm((prev) => {
      const next = [...prev.comboGroups];
      next[groupIndex].options[optionIndex] = {
        ...next[groupIndex].options[optionIndex],
        extraPrice,
      };
      return { ...prev, comboGroups: next };
    });
  };

  // Validación
  const isFormValid = useMemo(() => {
    if (!form.name.trim()) return false;
    if (!form.category) return false;
    const priceNum = parseFloat(form.comboPrice);
    if (isNaN(priceNum) || priceNum <= 0) return false;
    if (form.comboGroups.length === 0) return false;

    for (const group of form.comboGroups) {
      if (!group.name.trim()) return false;
      if (group.requiredCount < 1) return false;
      if (group.options.length === 0) return false;
      for (const opt of group.options) {
        if (!opt.itemProductId) return false;
      }
    }

    return true;
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || saving) return;

    const parsedPrice = parseFloat(form.comboPrice) || 0;

    const comboProduct: Product = {
      id: editing?.product.id,
      name: form.name.trim(),
      description: form.description.trim(),
      isCombo: true,
      comboPrice: parsedPrice,
      hasMultipleSizes: false,
      prices: [{ size: "único", price: parsedPrice }],
      comboGroups: form.comboGroups.map((g) => ({
        id: g.id,
        name: g.name.trim(),
        requiredCount: Number(g.requiredCount) || 1,
        options: g.options.map((o) => ({
          id: o.id,
          itemProductId: o.itemProductId,
          itemProductName: o.itemProductName,
          size: o.size || undefined,
          extraPrice: Number(o.extraPrice) || 0,
        })),
      })),
    };

    try {
      setSaving(true);
      await onSubmit(form.category, comboProduct, editing?.product.name);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      disableRestoreFocus={disableRestoreFocus}
    >
      <DialogTitle sx={{ m: 0, p: 2.5, bgcolor: "background.paper" }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: "rgba(207, 31, 46, 0.1)",
                color: LOGIN_COLORS.primary,
                display: "flex",
              }}
            >
              <AutoAwesomeIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="800" color="text.primary">
                {editing ? "Editar Combo / Paquete" : "Crear Nuevo Combo / Paquete"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Configura paquetes con precio promocional y selección múltiple de ítems
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3, bgcolor: "background.default" }}>
          {/* SECCIÓN 1: DATOS BÁSICOS DEL COMBO */}
          <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3 }}>
            <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 2 }}>
              1. Información General del Combo
            </Typography>
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="Nombre del Combo"
                  placeholder="Ej: Combo Familiar Fin de Semana"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  error={form.name.trim() === ""}
                  helperText={form.name.trim() === "" ? "El nombre es obligatorio" : ""}
                />

                <TextField
                  fullWidth
                  label="Precio Total del Combo"
                  type="number"
                  inputProps={{ min: 0, step: "0.01" }}
                  onKeyDown={blockInvalidChar}
                  placeholder="550.00"
                  value={form.comboPrice}
                  onChange={(e) => setForm({ ...form, comboPrice: e.target.value })}
                  error={parseFloat(form.comboPrice) <= 0}
                  helperText={
                    parseFloat(form.comboPrice) <= 0
                      ? "Ingresa el precio total del combo"
                      : ""
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography fontWeight="800" color="primary.main">
                          C$
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Categoría en Menú</InputLabel>
                  <Select
                    value={form.category}
                    label="Categoría en Menú"
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value as string })
                    }
                  >
                    {categories.map((c) => (
                      <MenuItem key={c.label} value={c.label}>
                        {c.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Descripción Comercial"
                  placeholder="Ej: Incluye 2 pizzas grandes, 1 gaseosa 2L y pan con ajo."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </Stack>
            </Stack>
          </Paper>

          {/* SECCIÓN 2: GRUPOS DE SELECCIÓN */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
            <Box>
              <Typography variant="subtitle2" fontWeight="800">
                2. Grupos de Selección (Componentes del Combo)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Define qué puede elegir el cliente (ej: 2 pizzas de cierto tamaño, 1 bebida, etc.)
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddGroup}
              sx={{
                borderRadius: 2,
                borderColor: LOGIN_COLORS.primary,
                color: LOGIN_COLORS.primary,
              }}
            >
              Agregar Grupo
            </Button>
          </Box>

          <Stack spacing={2.5}>
            {form.comboGroups.map((group, groupIdx) => (
              <Paper
                key={groupIdx}
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                {/* Cabecera del Grupo */}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems={{ sm: "center" }}
                  justifyContent="space-between"
                  mb={2}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center" flex={1}>
                    <Chip
                      label={`Grupo #${groupIdx + 1}`}
                      size="small"
                      sx={{ fontWeight: 800 }}
                    />
                    <TextField
                      size="small"
                      label="Título del Grupo"
                      placeholder="Ej: Elige 2 Pizzas Grandes"
                      value={group.name}
                      onChange={(e) =>
                        handleGroupChange(groupIdx, "name", e.target.value)
                      }
                      sx={{ flex: 1 }}
                      error={!group.name.trim()}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <TextField
                      size="small"
                      label="Cantidad Requerida"
                      type="number"
                      inputProps={{ min: 1, step: 1 }}
                      onKeyDown={blockInvalidChar}
                      value={group.requiredCount}
                      onChange={(e) =>
                        handleGroupChange(
                          groupIdx,
                          "requiredCount",
                          Math.max(1, parseInt(e.target.value) || 1),
                        )
                      }
                      sx={{ width: 140 }}
                    />

                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleRemoveGroup(groupIdx)}
                      title="Eliminar este grupo"
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                {/* Opciones permitidas en este grupo */}
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Opciones permitidas para este grupo ({group.options.length}):
                </Typography>

                <Stack spacing={1.5} mt={1}>
                  {group.options.map((option, optIdx) => {
                    const currentProd = selectableProducts.find(
                      (p) => p.id === option.itemProductId,
                    );
                    const hasSizes =
                      currentProd?.hasMultipleSizes &&
                      currentProd.prices &&
                      currentProd.prices.length > 0;

                    return (
                      <Stack
                        key={optIdx}
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1.5}
                        alignItems="center"
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: "rgba(0,0,0,0.02)",
                          border: "1px dashed",
                          borderColor: "divider",
                        }}
                      >
                        <FormControl size="small" sx={{ flex: 2, minWidth: 200 }}>
                          <InputLabel>Producto</InputLabel>
                          <Select
                            value={option.itemProductId}
                            label="Producto"
                            onChange={(e) =>
                              handleOptionProductChange(
                                groupIdx,
                                optIdx,
                                e.target.value as string,
                              )
                            }
                          >
                            {selectableProducts.map((p) => (
                              <MenuItem key={p.id} value={p.id}>
                                {p.name} ({p.categoryLabel})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        {hasSizes && (
                          <FormControl size="small" sx={{ flex: 1, minWidth: 130 }}>
                            <InputLabel>Tamaño</InputLabel>
                            <Select
                              value={option.size || ""}
                              label="Tamaño"
                              onChange={(e) =>
                                handleOptionSizeChange(
                                  groupIdx,
                                  optIdx,
                                  e.target.value as string,
                                )
                              }
                            >
                              {currentProd.prices.map((pr) => (
                                <MenuItem key={pr.size} value={pr.size}>
                                  {pr.size}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}

                        <TextField
                          size="small"
                          label="Costo Extra (Opcional)"
                          type="number"
                          placeholder="0.00"
                          inputProps={{ min: 0, step: "0.01" }}
                          onKeyDown={blockInvalidChar}
                          value={option.extraPrice === 0 ? "" : option.extraPrice}
                          onChange={(e) =>
                            handleOptionExtraPriceChange(
                              groupIdx,
                              optIdx,
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          sx={{ width: 140 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Typography variant="caption" fontWeight="700">
                                  +C$
                                </Typography>
                              </InputAdornment>
                            ),
                          }}
                        />

                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveOption(groupIdx, optIdx)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    );
                  })}

                  <Button
                    variant="text"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => handleAddOption(groupIdx)}
                    sx={{ alignSelf: "flex-start", mt: 1 }}
                  >
                    Añadir Opción al Grupo
                  </Button>
                </Stack>
              </Paper>
            ))}

            {form.comboGroups.length === 0 && (
              <Box
                sx={{
                  py: 4,
                  textAlign: "center",
                  bgcolor: "background.paper",
                  borderRadius: 3,
                  border: "1px dashed",
                  borderColor: "divider",
                }}
              >
                <FastfoodIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Este combo no tiene grupos de selección configurados.
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddGroup}
                  sx={{ mt: 1.5, bgcolor: LOGIN_COLORS.primary }}
                >
                  Agregar Primer Grupo
                </Button>
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: "background.paper" }}>
          <Button onClick={onClose} variant="outlined" color="inherit" disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!isFormValid || saving}
            sx={{
              bgcolor: LOGIN_COLORS.primary,
              "&:hover": { bgcolor: LOGIN_COLORS.primaryDark },
              px: 4,
            }}
          >
            {saving ? "Guardando..." : editing ? "Actualizar Combo" : "Guardar Combo"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ComboFormDialog;
