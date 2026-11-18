import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";
import { BackButton, PageHeader } from "../../../shared/ui";
import { productGateway, type Category } from "../../catalog";
import { kitchenModifiersGateway } from "../api/kitchenModifiersGateway";
import {
  DEFAULT_KITCHEN_MODIFIERS_CONFIG,
  KITCHEN_MODIFIER_COLORS,
  KITCHEN_MODIFIER_KIND_LABELS,
  AVAILABLE_KITCHEN_MODIFIER_KINDS,
  KITCHEN_MODIFIER_PREFIXES,
  slugifyKitchenModifier,
  type KitchenModifier,
  type KitchenModifierKind,
  type KitchenModifiersConfig,
} from "../model/kitchenModifiers.types";

export default function KitchenModifiersSettingsPage() {
  const [config, setConfig] = useState<KitchenModifiersConfig>(
    DEFAULT_KITCHEN_MODIFIERS_CONFIG,
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [emptyCategoryDrafts, setEmptyCategoryDrafts] = useState<Set<string>>(() => new Set());
  const categoryIds = categories.flatMap((category) => category.id ? [category.id] : []);
  const [newLabel, setNewLabel] = useState("");
  const [newKind, setNewKind] = useState<KitchenModifierKind>("REMOVE");
  const [loading, setLoading] = useState(true);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    severity: "success" | "error";
  } | null>(null);

  useEffect(() => {
    Promise.all([
      kitchenModifiersGateway.load(),
      productGateway.listCategories(),
    ])
      .then(([saved, catalogCategories]) => {
        setConfig(saved);
        setCategories(catalogCategories);
        setConfigLoaded(true);
      })
      .catch(() =>
        setMessage({
          text: "No se pudo cargar la configuración.",
          severity: "error",
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  const update = (id: string, changes: Partial<KitchenModifier>) =>
    setConfig((current) => ({
      modifiers: current.modifiers.map((modifier) =>
        modifier.id === id ? { ...modifier, ...changes } : modifier,
      ),
    }));

  const add = () => {
    const label = newLabel.trim();
    if (!label) return;
    const base = slugifyKitchenModifier(label) || "modificador";
    let id = base;
    let suffix = 2;
    while (config.modifiers.some((modifier) => modifier.id === id)) {
      id = `${base}-${suffix++}`;
    }
    setConfig((current) => ({
      modifiers: [
        ...current.modifiers,
        {
          id,
          label,
          kind: newKind,
          categoryIds: [],
          isActive: true,
          sortOrder: current.modifiers.length,
        },
      ],
    }));
    setNewLabel("");
  };

  const save = async () => {
    if (config.modifiers.some((modifier) => emptyCategoryDrafts.has(modifier.id))) {
      setMessage({
        text: "Selecciona al menos una categoría o elige todas para cada modificador.",
        severity: "error",
      });
      return;
    }
    if (config.modifiers.some((modifier) => !modifier.label.trim())) {
      setMessage({
        text: "Todos los modificadores deben tener nombre.",
        severity: "error",
      });
      return;
    }
    setSaving(true);
    try {
      await kitchenModifiersGateway.save(config);
      setMessage({
        text: "Modificadores de cocina guardados.",
        severity: "success",
      });
    } catch {
      setMessage({
        text: "No se pudieron guardar los modificadores.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      minHeight="100vh"
      bgcolor="background.default"
      sx={{ pt: 4, pb: 4, px: { xs: 2, md: 6 } }}
    >
      <PageHeader
        title="Modificadores de Cocina"
        startContent={<BackButton to="/admin" />}
        actions={
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
            disabled={loading || saving || !configLoaded}
            onClick={() => void save()}
          >
            Guardar cambios
          </Button>
        }
      />
      <Typography color="text.secondary" mb={3} maxWidth={950}>
        Estandariza las instrucciones que el cajero envía a cocina. Elige todas
        las categorías o selecciona las categorías donde aparecerá cada modificador.
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={3}>
          <Card elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={900} mb={2}>
                Nuevo modificador
              </Typography>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="Instrucción visible en cocina"
                  placeholder="Ej. Sin aceitunas"
                  value={newLabel}
                  onChange={(event) => setNewLabel(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") add();
                  }}
                />
                <FormControl sx={{ minWidth: 235 }}>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    label="Tipo"
                    value={newKind}
                    onChange={(event) =>
                      setNewKind(event.target.value as KitchenModifierKind)
                    }
                  >
                    {AVAILABLE_KITCHEN_MODIFIER_KINDS.map((kind) => (
                      <MenuItem key={kind} value={kind}>
                        {KITCHEN_MODIFIER_PREFIXES[kind]}{" "}
                        {KITCHEN_MODIFIER_KIND_LABELS[kind]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  disabled={!newLabel.trim()}
                  onClick={add}
                >
                  Agregar
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Grid container spacing={2}>
            {config.modifiers.filter((modifier) => modifier.kind !== "ADD").map((modifier) => (
              <Grid key={modifier.id} size={{ xs: 12, lg: 6 }}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    opacity: modifier.isActive ? 1 : 0.6,
                  }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      mb={2}
                    >
                      <Chip
                        color={KITCHEN_MODIFIER_COLORS[modifier.kind]}
                        label={KITCHEN_MODIFIER_PREFIXES[modifier.kind]}
                        sx={{ fontWeight: 900 }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Texto del modificador"
                        value={modifier.label}
                        onChange={(event) =>
                          update(modifier.id, {
                            label: event.target.value.slice(0, 80),
                          })
                        }
                      />
                      <IconButton
                        aria-label={`Eliminar ${modifier.label}`}
                        color="error"
                        onClick={() => {
                          setEmptyCategoryDrafts((current) => {
                            const next = new Set(current);
                            next.delete(modifier.id);
                            return next;
                          });
                          setConfig((current) => ({
                            modifiers: current.modifiers.filter(
                              (candidate) => candidate.id !== modifier.id,
                            ),
                          }));
                        }}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Stack>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Tipo visual</InputLabel>
                        <Select
                          label="Tipo visual"
                          value={modifier.kind}
                          onChange={(event) =>
                            update(modifier.id, {
                              kind: event.target.value as KitchenModifierKind,
                            })
                          }
                        >
                          {AVAILABLE_KITCHEN_MODIFIER_KINDS.map((kind) => (
                            <MenuItem key={kind} value={kind}>
                              {KITCHEN_MODIFIER_PREFIXES[kind]}{" "}
                              {KITCHEN_MODIFIER_KIND_LABELS[kind]}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl fullWidth size="small">
                        <InputLabel shrink>Categorías</InputLabel>
                        <Select
                          multiple
                          label="Categorías"
                          notched
                          value={emptyCategoryDrafts.has(modifier.id) ? [] : modifier.categoryIds.length === 0 ? categoryIds : modifier.categoryIds}
                          onChange={(event) => {
                            const selected = typeof event.target.value === "string"
                              ? event.target.value.split(",")
                              : event.target.value;
                            const selectAll = selected.includes("__all_categories__");
                            const hasEveryCategory = categoryIds.length > 0 &&
                              selected.length === categoryIds.length &&
                              categoryIds.every((id) => selected.includes(id));
                            if (selectAll && modifier.categoryIds.length === 0 && !emptyCategoryDrafts.has(modifier.id)) {
                              setEmptyCategoryDrafts((current) => new Set(current).add(modifier.id));
                            } else if (selected.length === 0 && !selectAll) {
                              setEmptyCategoryDrafts((current) => new Set(current).add(modifier.id));
                            } else if (selectAll || hasEveryCategory) {
                              setEmptyCategoryDrafts((current) => {
                                const next = new Set(current);
                                next.delete(modifier.id);
                                return next;
                              });
                              update(modifier.id, { categoryIds: [] });
                            } else if (selected.length <= 50) {
                              setEmptyCategoryDrafts((current) => {
                                const next = new Set(current);
                                next.delete(modifier.id);
                                return next;
                              });
                              update(modifier.id, { categoryIds: selected });
                            }
                          }}
                          renderValue={(selected) => {
                            if (emptyCategoryDrafts.has(modifier.id)) {
                              return "Selecciona categorías";
                            }
                            if (modifier.categoryIds.length === 0) {
                              return "Todas las categorías";
                            }
                            const selectedNames = categories
                              .filter((category) =>
                                category.id
                                  ? selected.includes(category.id)
                                  : false,
                              )
                              .map((category) => category.label);
                            const unavailableCount = selected.length - selectedNames.length;
                            if (unavailableCount > 0) {
                              selectedNames.push(`${unavailableCount} no disponible(s)`);
                            }
                            return selectedNames.length <= 2
                              ? selectedNames.join(", ")
                              : `${selected.length} categorías seleccionadas`;
                          }}
                          displayEmpty
                        >
                          <MenuItem value="__all_categories__">
                            <Checkbox
                              checked={modifier.categoryIds.length === 0 && !emptyCategoryDrafts.has(modifier.id)}
                              tabIndex={-1}
                              disableRipple
                            />
                            <ListItemText primary="Todas las categorías" />
                          </MenuItem>
                          {categories
                            .filter((category) => category.id)
                            .map((category) => (
                              <MenuItem
                                key={category.id}
                                value={category.id}
                                disabled={modifier.categoryIds.length >= 50 && !modifier.categoryIds.includes(category.id ?? "")}
                              >
                                <Checkbox
                                  checked={!emptyCategoryDrafts.has(modifier.id) && (modifier.categoryIds.length === 0 || modifier.categoryIds.includes(category.id ?? ""))}
                                  tabIndex={-1}
                                  disableRipple
                                />
                                <ListItemText primary={category.label} />
                              </MenuItem>
                            ))}
                          {(emptyCategoryDrafts.has(modifier.id) ? [] : modifier.categoryIds)
                            .filter((id) => !categories.some((category) => category.id === id))
                            .map((id) => (
                              <MenuItem key={id} value={id}>
                                <Checkbox checked tabIndex={-1} disableRipple />
                                <ListItemText primary="Categoría no disponible" secondary={id} />
                              </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>
                          {emptyCategoryDrafts.has(modifier.id)
                            ? "Elige al menos una categoría o selecciona todas antes de guardar."
                            : "Elige todas o desmarca las categorías que no apliquen."}
                        </FormHelperText>
                      </FormControl>
                    </Stack>
                    <FormControlLabel
                      sx={{ mt: 1 }}
                      control={
                        <Switch
                          checked={modifier.isActive}
                          onChange={(_, checked) =>
                            update(modifier.id, { isActive: checked })
                          }
                        />
                      }
                      label={modifier.isActive ? "Activo en caja" : "Inactivo"}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      )}

      <Snackbar
        open={Boolean(message)}
        autoHideDuration={4500}
        onClose={() => setMessage(null)}
      >
        <Alert severity={message?.severity} onClose={() => setMessage(null)}>
          {message?.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}
