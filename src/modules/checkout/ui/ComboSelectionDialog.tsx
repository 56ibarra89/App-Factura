import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Paper,
  Chip,
  Divider,
  TextField,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CloseIcon from "@mui/icons-material/Close";
import type { Product } from "../../catalog";
import { useCatalog } from "../../catalog";
import type { SelectedComboOptionItem, OrderItemInput } from "../../orders";
import {
  getComboGroupsStatus,
  isComboFullySelected,
  calculateComboTotalPrice,
} from "../model/comboSelectionDomain";
import { LOGIN_COLORS } from "../../../shared/theme";

interface ComboSelectionDialogProps {
  open: boolean;
  comboProduct: Product | null;
  kitchenId?: string;
  onClose: () => void;
  onConfirm: (item: OrderItemInput) => void;
}

export const ComboSelectionDialog: React.FC<ComboSelectionDialogProps> = ({
  open,
  comboProduct,
  kitchenId,
  onClose,
  onConfirm,
}) => {
  const { categories } = useCatalog();
  const [selections, setSelections] = useState<SelectedComboOptionItem[]>([]);
  const [comboNote, setComboNote] = useState<string>("");

  // Mapeo automático de cada producto del catálogo hacia su categoría y área de cocina
  const productMetaMap = useMemo(() => {
    const byId = new Map<
      string,
      { categoryId?: string; categoryName?: string; kitchenId?: string }
    >();
    const byName = new Map<
      string,
      { categoryId?: string; categoryName?: string; kitchenId?: string }
    >();

    categories.forEach((cat) => {
      cat.items.forEach((prod) => {
        const meta = {
          categoryId: cat.id || prod.categoryId,
          categoryName: cat.label,
          kitchenId: cat.kitchenId,
        };
        if (prod.id) byId.set(prod.id, meta);
        if (prod.name) byName.set(prod.name.toLowerCase().trim(), meta);
      });
    });

    return { byId, byName };
  }, [categories]);

  const resolveProductMeta = useCallback(
    (productId: string, productName: string) => {
      return (
        productMetaMap.byId.get(productId) ||
        productMetaMap.byName.get(productName.toLowerCase().trim())
      );
    },
    [productMetaMap],
  );

  // Resetear selecciones cuando cambia el combo
  useEffect(() => {
    if (open && comboProduct) {
      setSelections([]);
      setComboNote("");
    }
  }, [open, comboProduct]);

  const groupsStatus = useMemo(() => {
    if (!comboProduct) return [];
    return getComboGroupsStatus(comboProduct, selections);
  }, [comboProduct, selections]);

  const isReadyToConfirm = useMemo(() => {
    if (!comboProduct) return false;
    return isComboFullySelected(comboProduct, selections);
  }, [comboProduct, selections]);

  const totalPrice = useMemo(() => {
    if (!comboProduct) return 0;
    return calculateComboTotalPrice(comboProduct, selections);
  }, [comboProduct, selections]);

  if (!comboProduct) return null;

  const basePrice = Number(comboProduct.comboPrice || 0);
  const extraPriceSum = totalPrice - basePrice;

  // Manejador para opciones de selección única (requiredCount === 1)
  const handleSelectSingle = (
    groupId: string,
    groupName: string,
    productId: string,
    productName: string,
    size?: string,
    extraPrice: number = 0
  ) => {
    const meta = resolveProductMeta(productId, productName);
    setSelections((prev) => {
      // Filtrar cualquier selección previa de este grupo y agregar la nueva
      const withoutGroup = prev.filter((s) => s.groupId !== groupId);
      return [
        ...withoutGroup,
        {
          groupId,
          groupName,
          productId,
          productName,
          size,
          quantity: 1,
          extraPrice,
          kitchenId: meta?.kitchenId || kitchenId,
          categoryId: meta?.categoryId,
          categoryName: meta?.categoryName,
        },
      ];
    });
  };

  // Manejador para incrementar opciones en grupos múltiples (requiredCount > 1)
  const handleIncreaseMulti = (
    groupId: string,
    groupName: string,
    productId: string,
    productName: string,
    currentGroupTotal: number,
    requiredCount: number,
    size?: string,
    extraPrice: number = 0
  ) => {
    if (currentGroupTotal >= requiredCount) return;

    const meta = resolveProductMeta(productId, productName);
    setSelections((prev) => {
      const existingIdx = prev.findIndex(
        (s) => s.groupId === groupId && s.productId === productId && s.size === size
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + 1,
        };
        return updated;
      }

      return [
        ...prev,
        {
          groupId,
          groupName,
          productId,
          productName,
          size,
          quantity: 1,
          extraPrice,
          kitchenId: meta?.kitchenId || kitchenId,
          categoryId: meta?.categoryId,
          categoryName: meta?.categoryName,
        },
      ];
    });
  };

  // Manejador para decrementar opciones
  const handleDecrease = (groupId: string, productId: string, size?: string) => {
    setSelections((prev) => {
      const existingIdx = prev.findIndex(
        (s) => s.groupId === groupId && s.productId === productId && s.size === size
      );

      if (existingIdx < 0) return prev;

      const existing = prev[existingIdx];
      if (existing.quantity <= 1) {
        return prev.filter((_, idx) => idx !== existingIdx);
      }

      const updated = [...prev];
      updated[existingIdx] = {
        ...existing,
        quantity: existing.quantity - 1,
      };
      return updated;
    });
  };

  const handleConfirmOrder = () => {
    if (!isReadyToConfirm || !comboProduct) return;

    // Si todas las opciones del combo comparten la misma cocina, se le asigna al padre.
    // Si pertenecen a cocinas distintas o ninguna, se conserva la de la categoría o queda multi-área.
    const uniqueKitchenIds = Array.from(
      new Set(selections.map((s) => s.kitchenId).filter(Boolean))
    );
    const parentKitchenId =
      uniqueKitchenIds.length === 1 ? uniqueKitchenIds[0] : kitchenId;

    onConfirm({
      productId: comboProduct.id,
      categoryId: comboProduct.categoryId,
      name: comboProduct.name,
      size: "único",
      price: totalPrice,
      extras: [],
      note: comboNote.trim() || undefined,
      isCombo: true,
      comboSelections: selections,
      kitchenId: parentKitchenId,
    });

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Encabezado */}
      <DialogTitle
        sx={{
          bgcolor: LOGIN_COLORS.primary,
          color: "#fff",
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Inventory2Icon sx={{ fontSize: "1.8rem" }} />
          <Box>
            <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>
              {comboProduct.name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Precio Base: C$ {basePrice.toFixed(2)}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#fff" }} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, overflowY: "auto", flex: 1 }}>
        {comboProduct.description && (
          <Typography variant="body2" color="text.secondary" mb={2}>
            {comboProduct.description}
          </Typography>
        )}

        {/* Resumen de estado de los grupos */}
        <Box display="flex" flexWrap="wrap" gap={1} mb={2.5}>
          {groupsStatus.map((status) => (
            <Chip
              key={status.groupId}
              icon={status.isComplete ? <CheckCircleIcon /> : undefined}
              label={`${status.groupName}: ${status.selectedCount}/${status.requiredCount}`}
              color={status.isComplete ? "success" : "warning"}
              variant={status.isComplete ? "filled" : "outlined"}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          ))}
        </Box>

        {/* Listado de Grupos de Selección */}
        <Stack spacing={2.5}>
          {comboProduct.comboGroups && comboProduct.comboGroups.length > 0 ? (
            comboProduct.comboGroups.map((group) => {
              const groupStatus = groupsStatus.find((s) => s.groupId === group.id);
              const groupTotalSelected = groupStatus?.selectedCount || 0;
              const isGroupComplete = groupStatus?.isComplete || false;
              const isMulti = group.requiredCount > 1;

              return (
                <Paper
                  key={group.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: "1.5px solid",
                    borderColor: isGroupComplete ? "success.light" : "divider",
                    bgcolor: isGroupComplete ? "action.hover" : "background.paper",
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1.5}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                        {group.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {isMulti
                          ? `Elige ${group.requiredCount} opciones (puedes repetir)`
                          : "Selecciona 1 opción"}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${groupTotalSelected} de ${group.requiredCount}`}
                      size="small"
                      color={isGroupComplete ? "success" : "primary"}
                      sx={{ fontWeight: "bold" }}
                    />
                  </Box>

                  <Divider sx={{ mb: 1.5 }} />

                  {/* Opciones disponibles */}
                  <Box
                    display="grid"
                    gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
                    gap={1.2}
                  >
                    {group.options.map((option) => {
                      const optionProductName = option.itemProductName || "Producto";
                      const extraPrice = Number(option.extraPrice || 0);

                      const existingSelection = selections.find(
                        (s) =>
                          s.groupId === group.id &&
                          s.productId === option.itemProductId &&
                          s.size === option.size
                      );
                      const optionQty = existingSelection?.quantity || 0;
                      const isSelected = optionQty > 0;

                      return (
                        <Paper
                          key={option.id}
                          elevation={0}
                          sx={{
                            p: 1.2,
                            borderRadius: 2,
                            border: "1.5px solid",
                            borderColor: isSelected ? LOGIN_COLORS.primary : "divider",
                            bgcolor: isSelected
                              ? "rgba(207, 31, 46, 0.04)"
                              : "background.paper",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <Box sx={{ minWidth: 0, flex: 1, pr: 1 }}>
                            <Typography
                              variant="body2"
                              fontWeight={isSelected ? "bold" : "medium"}
                              noWrap
                            >
                              {optionProductName}
                            </Typography>
                            <Box display="flex" gap={1} alignItems="center">
                              {option.size && option.size !== "único" && (
                                <Typography variant="caption" color="text.secondary">
                                  Tam: {option.size}
                                </Typography>
                              )}
                              {extraPrice > 0 && (
                                <Typography
                                  variant="caption"
                                  fontWeight="bold"
                                  color="warning.main"
                                >
                                  +C$ {extraPrice.toFixed(2)}
                                </Typography>
                              )}
                            </Box>
                          </Box>

                          {/* Botones de acción */}
                          {!isMulti ? (
                            <Button
                              size="small"
                              variant={isSelected ? "contained" : "outlined"}
                              onClick={() =>
                                handleSelectSingle(
                                  group.id || "",
                                  group.name,
                                  option.itemProductId,
                                  optionProductName,
                                  option.size,
                                  extraPrice
                                )
                              }
                              sx={{
                                minWidth: 75,
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                bgcolor: isSelected ? LOGIN_COLORS.primary : undefined,
                                "&:hover": {
                                  bgcolor: isSelected
                                    ? LOGIN_COLORS.primaryDark
                                    : undefined,
                                },
                              }}
                            >
                              {isSelected ? "Elegido" : "Elegir"}
                            </Button>
                          ) : (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <IconButton
                                size="small"
                                disabled={optionQty === 0}
                                onClick={() =>
                                  handleDecrease(
                                    group.id || "",
                                    option.itemProductId,
                                    option.size
                                  )
                                }
                                sx={{ p: 0.5 }}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                sx={{ minWidth: 20, textAlign: "center" }}
                              >
                                {optionQty}
                              </Typography>
                              <IconButton
                                size="small"
                                disabled={groupTotalSelected >= group.requiredCount}
                                onClick={() =>
                                  handleIncreaseMulti(
                                    group.id || "",
                                    group.name,
                                    option.itemProductId,
                                    optionProductName,
                                    groupTotalSelected,
                                    group.requiredCount,
                                    option.size,
                                    extraPrice
                                  )
                                }
                                sx={{
                                  p: 0.5,
                                  bgcolor:
                                    groupTotalSelected < group.requiredCount
                                      ? "action.selected"
                                      : undefined,
                                }}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
                        </Paper>
                      );
                    })}
                  </Box>
                </Paper>
              );
            })
          ) : (
            <Alert severity="warning">
              Este combo no tiene grupos de opciones configurados.
            </Alert>
          )}

          {/* Campo de Notas e Instrucciones */}
          <TextField
            label="Instrucciones o notas del combo (opcional)"
            placeholder="Ej. Sin cebolla en la pizza, gaseosa bien fría..."
            value={comboNote}
            onChange={(e) => setComboNote(e.target.value)}
            fullWidth
            size="small"
            multiline
            rows={2}
          />
        </Stack>
      </DialogContent>

      <Divider />

      {/* Pie con totales y botón de agregar */}
      <DialogActions
        sx={{
          p: 2,
          bgcolor: "background.paper",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Box display="flex" alignItems="baseline" gap={1}>
            <Typography variant="h6" fontWeight="bold" color={LOGIN_COLORS.primary}>
              C$ {totalPrice.toFixed(2)}
            </Typography>
            {extraPriceSum > 0 && (
              <Typography variant="caption" color="text.secondary">
                (Base: C$ {basePrice.toFixed(2)} + Extras: C$ {extraPriceSum.toFixed(2)})
              </Typography>
            )}
          </Box>
          {!isReadyToConfirm && (
            <Typography variant="caption" color="error.main" fontWeight="medium">
              Completa todas las selecciones requeridas para agregar
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={!isReadyToConfirm}
            onClick={handleConfirmOrder}
            sx={{
              fontWeight: "bold",
              px: 3,
              bgcolor: LOGIN_COLORS.primary,
              "&:hover": { bgcolor: LOGIN_COLORS.primaryDark },
            }}
          >
            Agregar al Pedido
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
