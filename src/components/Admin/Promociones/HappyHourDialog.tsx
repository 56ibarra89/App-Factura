import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
} from "@mui/material";
import { useState, useEffect } from "react";
import { HappyHourRule } from "../../../types/promociones";
import { useProductContext } from "../../../hooks/useProductContext";

// ── Helpers ─────────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/** Genera los campos derivados `days`, `time` y `promotion` a partir del formulario */
function buildDerivedFields(
  daysOfWeek: string[],
  startTime: string,
  endTime: string,
  promotionType: HappyHourRule["promotionType"],
  promotionValue: string,
  appliesTo?: string,
): Pick<HappyHourRule, "days" | "time" | "promotion"> {
  const days = daysOfWeek.join(", ");
  const time = `${startTime} - ${endTime}`;
  let promotion = "";
  if (promotionType === "2x1") promotion = appliesTo ? `2x1 en ${appliesTo}` : "2x1";
  else if (promotionType === "porcentaje") promotion = `-${promotionValue}%`;
  else if (promotionType === "monto_fijo") promotion = `-C$${promotionValue}`;
  return { days, time, promotion };
}

// ── Tipos locales ────────────────────────────────────────────────────────────

type FormState = {
  name: string;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  promotionType: HappyHourRule["promotionType"];
  promotionValue: string;
  status: "Activo" | "Inactivo";
  appliesTo?: string;
};

const DEFAULT_FORM: FormState = {
  name: "",
  daysOfWeek: [],
  startTime: "18:00",
  endTime: "21:00",
  promotionType: "2x1",
  promotionValue: "",
  status: "Activo",
  appliesTo: "",
};

// ── Componente ───────────────────────────────────────────────────────────────

interface HappyHourDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (rule: HappyHourRule) => void;
  editingRule?: HappyHourRule | null;
}

const HappyHourDialog = ({
  open,
  onClose,
  onSave,
  editingRule,
}: HappyHourDialogProps) => {
  const { categories } = useProductContext();
  const allProducts = categories.flatMap(c => c.items.map(item => item.name));

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [errorMsg, setErrorMsg] = useState("");

  // Pre-llenar al editar
  useEffect(() => {
    if (open) {
      if (editingRule) {
        setForm({
          name: editingRule.name,
          daysOfWeek: editingRule.daysOfWeek,
          startTime: editingRule.startTime,
          endTime: editingRule.endTime,
          promotionType: editingRule.promotionType,
          promotionValue: editingRule.promotionValue,
          status: editingRule.status,
          appliesTo: editingRule.appliesTo || "",
        });
      } else {
        setForm(DEFAULT_FORM);
      }
      setErrorMsg("");
    }
  }, [open, editingRule]);

  const handleDaysChange = (
    _: React.MouseEvent<HTMLElement>,
    newDays: string[]
  ) => {
    setForm((prev) => ({ ...prev, daysOfWeek: newDays }));
    setErrorMsg("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setErrorMsg("El nombre es obligatorio.");
      return;
    }
    if (form.daysOfWeek.length === 0) {
      setErrorMsg("Selecciona al menos un día de la semana.");
      return;
    }
    if (!form.startTime || !form.endTime) {
      setErrorMsg("El horario de inicio y fin son obligatorios.");
      return;
    }
    if (form.startTime >= form.endTime) {
      setErrorMsg("La hora de inicio debe ser antes de la hora de fin.");
      return;
    }
    if (
      form.promotionType !== "2x1" &&
      (!form.promotionValue || parseFloat(form.promotionValue) <= 0)
    ) {
      setErrorMsg("Ingresa un valor de promoción válido mayor a 0.");
      return;
    }

    if (form.promotionType === "2x1" && !form.appliesTo) {
      setErrorMsg("Debes seleccionar a qué producto aplica el 2x1.");
      return;
    }

    const derived = buildDerivedFields(
      form.daysOfWeek,
      form.startTime,
      form.endTime,
      form.promotionType,
      form.promotionValue,
      form.appliesTo
    );

    onSave({
      id: editingRule?.id ?? Date.now(),
      name: form.name,
      daysOfWeek: form.daysOfWeek,
      startTime: form.startTime,
      endTime: form.endTime,
      promotionType: form.promotionType,
      promotionValue: form.promotionValue,
      status: form.status,
      appliesTo: form.promotionType === "2x1" ? form.appliesTo : undefined,
      ...derived,
    });
    onClose();
  };

  const needsValue = form.promotionType !== "2x1";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>
        {editingRule ? "Editar Regla Happy Hour" : "Nueva Regla Happy Hour"}
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {/* Nombre */}
            <TextField
              autoFocus
              fullWidth
              label="Nombre de la regla"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                setErrorMsg("");
              }}
              required
              placeholder="Ej. Happy Hour Cervezas"
            />

            {/* Días de la semana */}
            <Box>
              <Typography
                variant="body2"
                fontWeight={600}
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Días de la semana
              </Typography>
              <ToggleButtonGroup
                value={form.daysOfWeek}
                onChange={handleDaysChange}
                aria-label="Días de la semana"
                size="small"
                sx={{ flexWrap: "wrap", gap: 0.5 }}
              >
                {DAYS_OF_WEEK.map((day) => (
                  <ToggleButton
                    key={day}
                    value={day}
                    aria-label={day}
                    sx={{
                      borderRadius: "20px !important",
                      border: "1px solid",
                      borderColor: "divider",
                      px: 1.5,
                      fontWeight: 600,
                      fontSize: "0.78rem",
                      "&.Mui-selected": {
                        bgcolor: "secondary.main",
                        color: "white",
                        "&:hover": { bgcolor: "secondary.dark" },
                      },
                    }}
                  >
                    {day}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            {/* Horario */}
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Hora inicio"
                type="time"
                value={form.startTime}
                onChange={(e) => {
                  setForm({ ...form, startTime: e.target.value });
                  setErrorMsg("");
                }}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                fullWidth
                label="Hora fin"
                type="time"
                value={form.endTime}
                onChange={(e) => {
                  setForm({ ...form, endTime: e.target.value });
                  setErrorMsg("");
                }}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Stack>

            {/* Tipo de promoción */}
            <FormControl fullWidth>
              <InputLabel>Tipo de Promoción</InputLabel>
              <Select
                value={form.promotionType}
                label="Tipo de Promoción"
                onChange={(e) =>
                  setForm({
                    ...form,
                    promotionType: e.target
                      .value as HappyHourRule["promotionType"],
                    promotionValue: "",
                  })
                }
              >
                <MenuItem value="2x1">2x1 (Paga uno lleva dos)</MenuItem>
                <MenuItem value="porcentaje">Porcentaje de descuento</MenuItem>
                <MenuItem value="monto_fijo">Monto fijo de descuento</MenuItem>
              </Select>
            </FormControl>

            {/* Producto Aplicable (solo para 2x1) */}
            {form.promotionType === "2x1" && (
              <FormControl fullWidth required>
                <InputLabel>Producto Aplicable</InputLabel>
                <Select
                  value={form.appliesTo || ""}
                  label="Producto Aplicable"
                  onChange={(e) => {
                    setForm({ ...form, appliesTo: e.target.value as string });
                    setErrorMsg("");
                  }}
                >
                  {allProducts.map((prodName) => (
                    <MenuItem key={prodName} value={prodName}>
                      {prodName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Valor de la promoción (oculto si es 2x1) */}
            {needsValue && (
              <TextField
                fullWidth
                label="Valor de la promoción"
                value={form.promotionValue}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, "");
                  setForm({ ...form, promotionValue: val });
                  setErrorMsg("");
                }}
                placeholder={
                  form.promotionType === "porcentaje" ? "Ej. 20" : "Ej. 150.00"
                }
                required
                InputProps={{
                  startAdornment:
                    form.promotionType === "monto_fijo" ? (
                      <InputAdornment position="start">C$</InputAdornment>
                    ) : null,
                  endAdornment:
                    form.promotionType === "porcentaje" ? (
                      <InputAdornment position="end">%</InputAdornment>
                    ) : null,
                }}
              />
            )}

            {/* Estado */}
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={form.status}
                label="Estado"
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as "Activo" | "Inactivo",
                  })
                }
              >
                <MenuItem value="Activo">Activo</MenuItem>
                <MenuItem value="Inactivo">Inactivo</MenuItem>
              </Select>
            </FormControl>

            {/* Mensaje de error global */}
            {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button fullWidth variant="outlined" onClick={onClose}>
            Cancelar
          </Button>
          <Button fullWidth variant="contained" color="secondary" type="submit">
            {editingRule ? "Actualizar" : "Guardar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default HappyHourDialog;
