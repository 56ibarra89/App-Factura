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
} from "@mui/material";
import { DgiConfig } from "../../../hooks/useDgiConfig";

interface CorrelativoFormModalProps {
  open: boolean;
  initialData?: DgiConfig | null;
  onClose: () => void;
  onSave: (formData: DgiConfig) => Promise<void>;
}

const CorrelativoFormModal: React.FC<CorrelativoFormModalProps> = ({
  open,
  initialData,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<DgiConfig>({
    resolutionNumber: "",
    startNumber: 1,
    endNumber: 100000,
    authorizationDate: new Date().toISOString(),
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          ...initialData,
        });
      } else {
        setFormData({
          resolutionNumber: "",
          startNumber: 1,
          endNumber: 100000,
          authorizationDate: new Date().toISOString(),
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
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Configurar Resolución DGI</DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
          <Box sx={{ gridColumn: 'span 12' }}>
            <TextField
              fullWidth
              label="Número de Resolución DGI"
              name="resolutionNumber"
              value={formData.resolutionNumber}
              onChange={handleInputChange}
              variant="outlined"
            />
          </Box>
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              type="number"
              label="Rango Autorizado Inicial"
              name="startNumber"
              value={formData.startNumber}
              onChange={handleInputChange}
              variant="outlined"
            />
          </Box>
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              type="number"
              label="Rango Autorizado Final"
              name="endNumber"
              value={formData.endNumber}
              onChange={handleInputChange}
              variant="outlined"
            />
          </Box>
          <Box sx={{ gridColumn: 'span 12' }}>
            <TextField
              fullWidth
              type="date"
              label="Fecha de Autorización de la Resolución"
              name="authorizationDate"
              InputLabelProps={{ shrink: true }}
              value={
                formData.authorizationDate
                  ? new Date(formData.authorizationDate).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => setFormData({ ...formData, authorizationDate: new Date(e.target.value).toISOString() })}
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
          Guardar Configuración
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CorrelativoFormModal;
