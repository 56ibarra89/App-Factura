import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Divider,
  Button,
  Box,
} from "@mui/material";
import { Correlativo } from "../../../types/correlativo.types";

interface CorrelativoFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (formData: Partial<Correlativo>) => Promise<void>;
}

const CorrelativoFormModal: React.FC<CorrelativoFormModalProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Correlativo>>({
    documentType: "Factura",
    resolutionNumber: "",
    prefix: "",
    startNumber: 1,
    endNumber: 1000,
    currentNumber: 1,
    issueDate: new Date(),
    expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    status: "Activo",
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        documentType: "Factura",
        resolutionNumber: "",
        prefix: "",
        startNumber: 1,
        endNumber: 1000,
        currentNumber: 1,
        issueDate: new Date(),
        expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        status: "Activo",
      });
    }
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("Number") ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    await onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Agregar Nueva Secuencia</DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              select
              fullWidth
              label="Tipo de Documento"
              name="documentType"
              value={formData.documentType}
              onChange={handleInputChange}
              variant="outlined"
            >
              <MenuItem value="Factura">Factura</MenuItem>
            </TextField>
          </Box>
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              label="Resolución DGI"
              name="resolutionNumber"
              value={formData.resolutionNumber}
              onChange={handleInputChange}
              variant="outlined"
            />
          </Box>
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              label="Prefijo (Opcional)"
              name="prefix"
              placeholder="Ej. 000-001-01-"
              value={formData.prefix}
              onChange={handleInputChange}
              variant="outlined"
            />
          </Box>
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              select
              fullWidth
              label="Estado Inicial"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              variant="outlined"
            >
              <MenuItem value="Activo">Activo</MenuItem>
              <MenuItem value="Agotado">Agotado</MenuItem>
              <MenuItem value="Vencido">Vencido</MenuItem>
            </TextField>
          </Box>
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
            <TextField
              fullWidth
              type="number"
              label="Rango Inicial"
              name="startNumber"
              value={formData.startNumber}
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
              value={formData.endNumber}
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
              value={formData.currentNumber}
              onChange={handleInputChange}
              variant="outlined"
              helperText="Próximo número a emitir"
            />
          </Box>
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              type="date"
              label="Fecha de Emisión"
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
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              type="date"
              label="Fecha de Vencimiento"
              name="expirationDate"
              InputLabelProps={{ shrink: true }}
              value={
                formData.expirationDate
                  ? new Date(formData.expirationDate).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => setFormData({ ...formData, expirationDate: new Date(e.target.value) })}
              variant="outlined"
            />
          </Box>
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: "none" }}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ textTransform: "none", borderRadius: 2 }}>
          Guardar Secuencia
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CorrelativoFormModal;
