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
  MenuItem,
} from "@mui/material";
import type { Correlativo } from "../../model/fiscal.types";

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
    issueDate: new Date(),
    expirationDate: new Date("2099-12-31"),
    status: "Activo",
  });

  useEffect(() => {
    if (open) {
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
          issueDate: new Date(),
          expirationDate: new Date("2099-12-31"),
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
    await onSave(formData);
    onClose();
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
                  ? new Date(formData.issueDate).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => setFormData({ ...formData, issueDate: new Date(e.target.value) })}
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
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: "none" }}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ textTransform: "none", borderRadius: 2 }}>
          {initialData?.id ? "Actualizar" : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CorrelativoFormModal;
