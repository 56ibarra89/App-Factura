import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { KitchenModifierSelection } from "../../settings/model/kitchenModifiers.types";
import {
  KITCHEN_MODIFIER_COLORS,
  KITCHEN_MODIFIER_KIND_LABELS,
  KITCHEN_MODIFIER_KINDS,
  KITCHEN_MODIFIER_PREFIXES,
} from "../../settings/model/kitchenModifiers.types";
import { kitchenModifiersGateway } from "../../settings/api/kitchenModifiersGateway";

const toSelection = ({
  id,
  label,
  kind,
}: KitchenModifierSelection): KitchenModifierSelection => ({
  id,
  label,
  kind,
});

interface KitchenModifiersDialogProps {
  open: boolean;
  productName: string;
  categoryId?: string;
  selected: KitchenModifierSelection[];
  note?: string;
  onClose(): void;
  onSave(modifiers: KitchenModifierSelection[], note: string): void;
}

export default function KitchenModifiersDialog({
  open,
  productName,
  categoryId,
  selected,
  note,
  onClose,
  onSave,
}: KitchenModifiersDialogProps) {
  const [available, setAvailable] = useState<KitchenModifierSelection[]>([]);
  const [selection, setSelection] = useState<KitchenModifierSelection[]>([]);
  const [freeNote, setFreeNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelection(selected.map(toSelection));
    setFreeNote(note ?? "");
    setLoading(true);
    setFailed(false);
    kitchenModifiersGateway
      .load()
      .then((config) =>
        setAvailable(
          config.modifiers
            .filter(
              (modifier) =>
                modifier.isActive &&
                (modifier.categoryIds.length === 0 ||
                  (categoryId
                    ? modifier.categoryIds.includes(categoryId)
                    : false)),
            )
            .map(toSelection),
        ),
      )
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [categoryId, note, open, selected]);

  const byKind = useMemo(
    () =>
      KITCHEN_MODIFIER_KINDS.map((kind) => ({
        kind,
        modifiers: available.filter((modifier) => modifier.kind === kind),
      })).filter((group) => group.modifiers.length > 0),
    [available],
  );

  const toggle = (modifier: KitchenModifierSelection) =>
    setSelection((current) =>
      current.some((item) => item.id === modifier.id)
        ? current.filter((item) => item.id !== modifier.id)
        : [...current, modifier],
    );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Instrucciones de cocina
        <Typography variant="body2" color="text.secondary">
          {productName}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : failed ? (
          <Alert severity="error">
            No se pudo cargar el catálogo de modificadores.
          </Alert>
        ) : available.length === 0 ? (
          <Alert severity="info">
            No hay modificadores activos para esta categoría. Puedes crearlos en
            Centro de Control → Operativa → Modificadores de Cocina.
          </Alert>
        ) : (
          <Stack spacing={2}>
            {byKind.map(({ kind, modifiers }) => (
              <Box key={kind}>
                <Typography variant="subtitle2" fontWeight={900} mb={1}>
                  {KITCHEN_MODIFIER_PREFIXES[kind]}{" "}
                  {KITCHEN_MODIFIER_KIND_LABELS[kind]}
                </Typography>
                <Stack direction="row" gap={1} flexWrap="wrap">
                  {modifiers.map((modifier) => {
                    const active = selection.some(
                      (item) => item.id === modifier.id,
                    );
                    return (
                      <Chip
                        key={modifier.id}
                        label={modifier.label}
                        color={KITCHEN_MODIFIER_COLORS[kind]}
                        variant={active ? "filled" : "outlined"}
                        onClick={() => toggle(modifier)}
                        sx={{
                          minHeight: 38,
                          fontWeight: 800,
                          fontSize: "0.9rem",
                        }}
                      />
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
        <Divider sx={{ my: 2 }} />
        <TextField
          fullWidth
          multiline
          minRows={2}
          label="Nota libre adicional"
          value={freeNote}
          onChange={(event) => setFreeNote(event.target.value.slice(0, 200))}
          helperText={`${freeNote.length}/200. Úsala solo para instrucciones no incluidas en el catálogo.`}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={loading || failed}
          onClick={() => onSave(selection.map(toSelection), freeNote.trim())}
        >
          Aplicar instrucciones
        </Button>
      </DialogActions>
    </Dialog>
  );
}
