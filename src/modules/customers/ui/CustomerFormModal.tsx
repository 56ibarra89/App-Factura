/**
 * CustomerFormModal — SRP: gestiona el formulario de creación/edición de un cliente.
 * OCP: funciona en modo "crear" (sin initialData) y "editar" (con initialData).
 */

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Divider,
  CircularProgress,
  Alert,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import EditIcon from "@mui/icons-material/Edit";
import type {
  Customer,
  CustomerAddress,
  CustomerFormData,
} from "../model/customer.types";
import CustomerAddressChips from "./CustomerAddressChips";

interface Props {
  open: boolean;
  /** Si se pasa un cliente, el modal trabaja en modo edición */
  customer?: Customer | null;
  onClose: () => void;
  onSave: (data: CustomerFormData) => Promise<void>;
  addAddress: (addresses: CustomerAddress[], text: string) => CustomerAddress[];
  removeAddress: (
    addresses: CustomerAddress[],
    id: string,
  ) => CustomerAddress[];
}

const emptyForm = (): CustomerFormData => ({
  name: "",
  phone: "",
  addresses: [],
});

const CustomerFormModal: React.FC<Props> = ({
  open,
  customer,
  onClose,
  onSave,
  addAddress,
  removeAddress,
}) => {
  const isEditing = !!customer;
  const [form, setForm] = useState<CustomerFormData>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar el formulario cuando se abre/cambia el cliente
  useEffect(() => {
    if (open) {
      if (customer) {
        setForm({
          id: customer.id,
          name: customer.name,
          phone: customer.phone ?? "",
          addresses: customer.addresses,
        });
      } else {
        setForm(emptyForm());
      }
      setError(null);
    }
  }, [open, customer]);

  const handleChange =
    (field: keyof CustomerFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleAddAddress = (text: string) => {
    setForm((prev) => ({
      ...prev,
      addresses: addAddress(prev.addresses, text),
    }));
  };

  const handleRemoveAddress = (id: string) => {
    setForm((prev) => ({
      ...prev,
      addresses: removeAddress(prev.addresses, id),
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("El nombre del cliente es obligatorio.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err: unknown) {
      console.error("CustomerFormModal.handleSubmit:", err);
      setError("Ocurrió un error al guardar el cliente. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      {/* Encabezado */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          pb: 1,
          pr: 1,
        }}
      >
        {isEditing ? (
          <EditIcon color="primary" />
        ) : (
          <PersonAddAlt1Icon color="primary" />
        )}
        <Typography variant="h6" fontWeight={700} flex={1}>
          {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
        </Typography>
        <IconButton
          id="customer-modal-close-btn"
          size="small"
          onClick={onClose}
          disabled={saving}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        {/* Alerta de error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Nombre */}
          <TextField
            id="customer-form-name"
            label="Nombre completo *"
            fullWidth
            value={form.name}
            onChange={handleChange("name")}
            disabled={saving}
            helperText="Nombre o Razón Social del cliente."
            autoFocus={!isEditing}
          />

          {/* Teléfono */}
          <TextField
            id="customer-form-phone"
            label="Teléfono"
            fullWidth
            value={form.phone}
            onChange={handleChange("phone")}
            disabled={saving}
            placeholder="Ej: +505 9999-9999"
          />

          <Divider sx={{ my: 0.5 }} />

          {/* Sección de direcciones */}
          <CustomerAddressChips
            addresses={form.addresses}
            onAdd={handleAddAddress}
            onRemove={handleRemoveAddress}
          />
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          id="customer-form-cancel-btn"
          onClick={onClose}
          disabled={saving}
          color="inherit"
          variant="outlined"
        >
          Cancelar
        </Button>
        <Button
          id="customer-form-save-btn"
          onClick={handleSubmit}
          disabled={saving}
          variant="contained"
          startIcon={
            saving ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          {saving
            ? "Guardando..."
            : isEditing
              ? "Guardar Cambios"
              : "Crear Cliente"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerFormModal;
