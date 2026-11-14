import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Button,
  Box,
  Alert,
  MenuItem,
} from "@mui/material";
import type { Correlativo } from "../../model/fiscal.types";

const MANAGUA_TIMEZONE = "America/Managua";

const toManaguaDateInput = (value?: Date | string): string => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return value.trim();
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: MANAGUA_TIMEZONE,
  }).format(date);
};

const fromManaguaDateInput = (value: string): Date | undefined => {
  const clean = value.trim();
  if (!clean) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return new Date(`${clean}T12:00:00-06:00`);
  }
  const parsed = new Date(clean);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const todayManaguaDate = (): Date =>
  fromManaguaDateInput(toManaguaDateInput(new Date())) ?? new Date();

interface CorrelativoFormModalProps {
  open: boolean;
  initialData?: Partial<Correlativo> | null;
  onClose: () => void;
  onSave: (formData: Partial<Correlativo>) => Promise<void>;
}

const CorrelativoFormModal: React.FC<CorrelativoFormModalProps> = ({
  open,
  initialData,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Correlativo>>({
    documentType: "Factura",
    resolutionNumber: "",
    prefix: "",
    startNumber: 1,
    endNumber: 100000,
    currentNumber: 1,
    issueDate: todayManaguaDate(),
    expirationDate: new Date("2099-12-31T12:00:00-06:00"),
    status: "Activo",
  });

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setErrorMessage(null);
      setSaving(false);
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData({
          documentType: "Factura",
          resolutionNumber: "",
          prefix: "",
          startNumber: 1,
          endNumber: 100000,
          currentNumber: 1,
          issueDate: todayManaguaDate(),
          expirationDate: new Date("2099-12-31T12:00:00-06:00"),
          status: "Activo",
        });
      }
    }
  }, [open, initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("Number") && name !== "resolutionNumber" ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    const issueDateStr = toManaguaDateInput(formData.issueDate);
    const expirationDateStr = toManaguaDateInput(formData.expirationDate);
    const startNumber = Number(formData.startNumber ?? 0);
    const endNumber = Number(formData.endNumber ?? 0);
    const currentNumber = Number(formData.currentNumber ?? 0);

    if (!formData.resolutionNumber?.trim()) {
      setErrorMessage("Ingresa el número de resolución.");
      return;
    }
    if (
      !Number.isInteger(startNumber) ||
      startNumber < 1 ||
      !Number.isInteger(endNumber) ||
      endNumber < startNumber
    ) {
      setErrorMessage(
        "El rango final debe ser un entero mayor o igual al rango inicial (mínimo 1).",
      );
      return;
    }
    if (
      !Number.isInteger(currentNumber) ||
      currentNumber < startNumber ||
      currentNumber > endNumber
    ) {
      setErrorMessage(
        "El número actual debe estar dentro del rango inicial y final.",
      );
      return;
    }
    if (!issueDateStr || !expirationDateStr) {
      setErrorMessage(
        "Selecciona la fecha de aprobación y la fecha de vencimiento.",
      );
      return;
    }
    if (issueDateStr > expirationDateStr) {
      setErrorMessage(
        "La fecha de vencimiento debe ser igual o posterior a la fecha de aprobación.",
      );
      return;
    }

    setErrorMessage(null);
    setSaving(true);
    try {
      await onSave({
        ...formData,
        issueDate: fromManaguaDateInput(issueDateStr),
        expirationDate: fromManaguaDateInput(expirationDateStr),
      });
      onClose();
    } catch (error) {
      const msg =
        error instanceof Error && error.message
          ? error.message
          : "No se pudo guardar el correlativo.";
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        {initialData?.id ? "Actualizar Correlativo" : "Nuevo Correlativo"}
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
          <Box sx={{ gridColumn: 'span 12' }}>
            <TextField
              fullWidth
              label="Número de Resolución DGI"
              name="resolutionNumber"
              value={formData.resolutionNumber || ""}
              onChange={handleInputChange}
              variant="outlined"
            />
          </Box>
          <Box sx={{ gridColumn: 'span 12' }}>
            <TextField
              fullWidth
              label="Prefijo (Opcional)"
              name="prefix"
              value={formData.prefix || ""}
              onChange={handleInputChange}
              variant="outlined"
            />
          </Box>
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
            <TextField
              fullWidth
              type="number"
              label="Rango Inicial"
              name="startNumber"
              value={formData.startNumber || ""}
              onChange={handleInputChange}
              variant="outlined"
            />
          </Box>
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
            <TextField
              fullWidth
              type="number"
              label="Rango Final"
              name="endNumber"
              value={formData.endNumber || ""}
              onChange={handleInputChange}
              variant="outlined"
            />
          </Box>
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
            <TextField
              fullWidth
              type="number"
              label="Número Actual"
              name="currentNumber"
              value={formData.currentNumber || ""}
              onChange={handleInputChange}
              variant="outlined"
            />
          </Box>
          <Box sx={{ gridColumn: 'span 6' }}>
            <TextField
              fullWidth
              type="date"
              label="Fecha de Aprobación"
              name="issueDate"
              InputLabelProps={{ shrink: true }}
              value={
                formData.issueDate
                  ? new Intl.DateTimeFormat("en-CA", {
                      timeZone: "America/Managua",
                    }).format(new Date(formData.issueDate))
                  : ""
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  issueDate: fromManaguaDateInput(e.target.value),
                })
              }
              variant="outlined"
            />
          </Box>
          <Box sx={{ gridColumn: 'span 6' }}>
            <TextField
              fullWidth
              type="date"
              label="Fecha de Vencimiento"
              name="expirationDate"
              InputLabelProps={{ shrink: true }}
              value={toManaguaDateInput(formData.expirationDate)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  expirationDate: fromManaguaDateInput(e.target.value),
                })
              }
              variant="outlined"
            />
          </Box>
          <Box sx={{ gridColumn: 'span 12' }}>
            <TextField
              select
              fullWidth
              label="Estado"
              name="status"
              value={formData.status || "Activo"}
              onChange={handleInputChange}
              variant="outlined"
            >
              <MenuItem value="Activo">Activo</MenuItem>
              <MenuItem value="Agotado">Agotado</MenuItem>
              <MenuItem value="Vencido">Vencido</MenuItem>
            </TextField>
          </Box>
        </Box>
      </DialogContent>
      <Divider />
      {errorMessage && (
        <Box sx={{ px: 3, pb: 1 }}>
          <Alert severity="error">{errorMessage}</Alert>
        </Box>
      )}
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={saving} sx={{ textTransform: "none" }}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={saving} sx={{ textTransform: "none", borderRadius: 2 }}>
          {saving ? "Guardando..." : initialData?.id ? "Actualizar" : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CorrelativoFormModal;
