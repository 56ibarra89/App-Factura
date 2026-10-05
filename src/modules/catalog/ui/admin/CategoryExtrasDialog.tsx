import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { useEffect, useMemo, useState } from "react";
import { blockInvalidChar } from "../../../../shared/forms";
import { useCatalog } from "../../hooks/useCatalog";
import type { Category, ExtraIngredientDef } from "../../model/catalog.types";

interface ExtraDraft {
  id?: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  prices: Record<string, string>;
}

interface CategoryExtrasDialogProps {
  category: Category | null;
  onClose: () => void;
}

const toDraft = (extra: ExtraIngredientDef): ExtraDraft => ({
  id: extra.id,
  name: extra.name,
  isActive: extra.isActive ?? true,
  sortOrder: extra.sortOrder ?? 0,
  prices: Object.fromEntries(extra.prices.map((price) => [price.size, String(price.price)])),
});

export default function CategoryExtrasDialog({ category, onClose }: CategoryExtrasDialogProps) {
  const { saveCategoryExtra, deleteCategoryExtra } = useCatalog();
  const [drafts, setDrafts] = useState<ExtraDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);

  const sizes = useMemo(() => {
    if (!category) return ["único"];
    const available = new Set<string>();
    category.items.forEach((product) => product.prices.forEach((price) => available.add(price.size)));
    category.extras.forEach((extra) => extra.prices.forEach((price) => available.add(price.size)));
    if (available.size === 0) available.add("único");
    return Array.from(available).sort((left, right) => left.localeCompare(right));
  }, [category]);

  useEffect(() => {
    setDrafts(category?.extras.map(toDraft) ?? []);
    setError(null);
  }, [category]);

  const updateDraft = (index: number, patch: Partial<ExtraDraft>) => {
    setDrafts((current) => current.map((draft, draftIndex) => (
      draftIndex === index ? { ...draft, ...patch } : draft
    )));
  };

  const addDraft = () => {
    setDrafts((current) => [
      ...current,
      {
        name: "",
        isActive: true,
        sortOrder: current.length,
        prices: Object.fromEntries(sizes.map((size) => [size, ""])),
      },
    ]);
  };

  const saveDraft = async (draft: ExtraDraft, index: number) => {
    if (!category?.id) return;
    const name = draft.name.trim();
    if (!name) {
      setError("El nombre del extra es obligatorio.");
      return;
    }
    if (drafts.some((other, otherIndex) => otherIndex !== index && other.name.trim().toLowerCase() === name.toLowerCase())) {
      setError(`Ya existe el extra “${name}” en esta categoría.`);
      return;
    }
    const prices = Object.entries(draft.prices)
      .filter(([, price]) => price !== "" && Number(price) > 0)
      .map(([size, price]) => ({ size, price: Number(price) }));
    if (!prices.length) {
      setError("Agrega al menos un precio para el extra.");
      return;
    }

    try {
      setSavingIndex(index);
      setError(null);
      await saveCategoryExtra(category.id, {
        id: draft.id,
        name,
        isActive: draft.isActive,
        sortOrder: draft.sortOrder,
        prices,
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el extra.");
    } finally {
      setSavingIndex(null);
    }
  };

  const removeDraft = async (draft: ExtraDraft, index: number) => {
    if (!category?.id || !draft.id) {
      setDrafts((current) => current.filter((_, draftIndex) => draftIndex !== index));
      return;
    }
    try {
      setError(null);
      await deleteCategoryExtra(category.id, draft.id);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar el extra.");
    }
  };

  return (
    <Dialog open={Boolean(category)} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Extras de {category?.label}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Estos extras estarán disponibles automáticamente en todos los productos de la categoría.
          Los precios se configuran por tamaño.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack spacing={2}>
          {drafts.map((draft, index) => (
            <Paper key={draft.id ?? `new-${index}`} variant="outlined" sx={{ p: 2 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
                <TextField
                  size="small"
                  label="Nombre del extra"
                  value={draft.name}
                  onChange={(event) => updateDraft(index, { name: event.target.value })}
                  sx={{ flex: 1 }}
                />
                <FormControlLabel
                  control={(
                    <Switch
                      checked={draft.isActive}
                      onChange={(event) => updateDraft(index, { isActive: event.target.checked })}
                    />
                  )}
                  label={draft.isActive ? "Activo" : "Inactivo"}
                />
                <IconButton
                  color="primary"
                  aria-label="Guardar extra"
                  disabled={savingIndex === index}
                  onClick={() => saveDraft(draft, index)}
                >
                  <SaveIcon />
                </IconButton>
                <IconButton color="error" aria-label="Eliminar extra" onClick={() => removeDraft(draft, index)}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
              <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "repeat(3, 1fr)" }} gap={1.5} mt={2}>
                {sizes.map((size) => (
                  <TextField
                    key={size}
                    size="small"
                    type="number"
                    label={`Precio ${size}`}
                    value={draft.prices[size] ?? ""}
                    inputProps={{ min: 0, step: "0.01" }}
                    onKeyDown={blockInvalidChar}
                    onChange={(event) => updateDraft(index, {
                      prices: { ...draft.prices, [size]: event.target.value },
                    })}
                  />
                ))}
              </Box>
            </Paper>
          ))}
        </Stack>

        {drafts.length === 0 && (
          <Typography color="text.secondary" textAlign="center" sx={{ py: 3 }}>
            Esta categoría todavía no tiene extras.
          </Typography>
        )}

        <Button startIcon={<AddCircleOutlineIcon />} onClick={addDraft} sx={{ mt: 2 }}>
          Agregar extra
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
