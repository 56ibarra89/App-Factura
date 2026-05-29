// src/components/ExtrasDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  Divider,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { ExtraIngredientDef } from "../types/extras";
import { SelectedExtra } from "../types/extras";
import { ProductSize } from "../types/product";

interface ExtrasDialogProps {
  open: boolean;
  productName: string;
  size: ProductSize;
  extras: ExtraIngredientDef[];
  onClose: () => void;
  onConfirm: (selectedExtras: SelectedExtra[], note?: string) => void;
}

export default function ExtrasDialog({
  open,
  productName,
  size,
  extras,
  onClose,
  onConfirm,
}: ExtrasDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");

  const handleToggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  /** Obtiene el precio del extra para el tamaño seleccionado */
  const getPriceForSize = (extra: ExtraIngredientDef): number => {
    const priceObj = extra.prices.find((p) => p.size === size);
    return priceObj?.price ?? 0;
  };

  const extrasTotal = extras
    .filter((e) => selected.has(e.name))
    .reduce((sum, e) => sum + getPriceForSize(e), 0);

  const handleConfirm = () => {
    const selectedExtras: SelectedExtra[] = extras
      .filter((e) => selected.has(e.name))
      .map((e) => ({
        name: e.name,
        price: getPriceForSize(e),
      }));

    onConfirm(selectedExtras, note.trim() || undefined);
    setSelected(new Set());
    setNote("");
  };

  const handleClose = () => {
    onClose();
    setSelected(new Set());
    setNote("");
  };

  const handleSkip = () => {
    onConfirm([], note.trim() || undefined);
    setSelected(new Set());
    setNote("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        Extras para {productName}
        <Typography variant="body2" color="text.secondary">
          Tamaño: {size}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={0.5} mt={1}>
          {extras.map((extra) => {
            const price = getPriceForSize(extra);
            if (price <= 0) return null;

            return (
              <FormControlLabel
                key={extra.name}
                control={
                  <Checkbox
                    checked={selected.has(extra.name)}
                    onChange={() => handleToggle(extra.name)}
                    color="primary"
                  />
                }
                label={
                  <Box display="flex" justifyContent="space-between" width="100%">
                    <Typography>{extra.name}</Typography>
                    <Typography color="text.secondary" sx={{ ml: 2 }}>
                      +C${price.toFixed(2)}
                    </Typography>
                  </Box>
                }
                sx={{ width: "100%", mr: 0 }}
              />
            );
          })}
        </Box>

        {selected.size > 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Box display="flex" justifyContent="space-between">
              <Typography fontWeight="bold">Extras seleccionados:</Typography>
              <Typography fontWeight="bold" color="primary">
                +C${extrasTotal.toFixed(2)}
              </Typography>
            </Box>
          </>
        )}

        <Box mt={2}>
          <TextField
            fullWidth
            size="small"
            label="Notas / Instrucciones especiales"
            placeholder="Ej: Sin cebolla, sin aceitunas, extra dorada..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            rows={2}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button variant="outlined" onClick={handleSkip}>
          Sin extras
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={selected.size === 0}
        >
          Agregar con extras
        </Button>
      </DialogActions>
    </Dialog>
  );
}
