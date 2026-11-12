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
  CustomerPhone,
  CustomerFormData,
} from "../model/customer.types";
import CustomerAddressChips from "./CustomerAddressChips";
import CustomerPhoneChips from "./CustomerPhoneChips";

interface Props {
  open: boolean;
  customer?: Customer | null;
  onClose: () => void;
  onSave: (data: CustomerFormData) => Promise<void>;
  addPhone?: (phones: CustomerPhone[], text: string) => CustomerPhone[];
  removePhone?: (phones: CustomerPhone[], id: string) => CustomerPhone[];
  setDefaultPhone?: (phones: CustomerPhone[], id: string) => CustomerPhone[];
  addAddress: (addresses: CustomerAddress[], text: string) => CustomerAddress[];
  removeAddress: (
    addresses: CustomerAddress[],
    id: string,
  ) => CustomerAddress[];
  setDefaultAddress?: (
    addresses: CustomerAddress[],
    id: string,
  ) => CustomerAddress[];
}

const emptyForm = (): CustomerFormData => ({
  name: "",
  phones: [],
  addresses: [],
});

const CustomerFormModal: React.FC<Props> = ({
  open,
  customer,
  onClose,
  onSave,
  addPhone,
  removePhone,
  setDefaultPhone,
  addAddress,
  removeAddress,
  setDefaultAddress,
}) => {
  const isEditing = !!customer;
  const [form, setForm] = useState<CustomerFormData>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (customer) {
        let initialPhones: CustomerPhone[] = customer.phones ? [...customer.phones] : [];
        if (initialPhones.length === 0 && customer.phone) {
          initialPhones = [
            {
              id: "legacy-phone",
              phone: customer.phone,
              isDefault: true,
              lastUsed: new Date().toISOString(),
            },
          ];
        }
        setForm({
          id: customer.id,
          name: customer.name,
          phones: initialPhones,
          addresses: customer.addresses || [],
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

  const handleAddPhone = (text: string) => {
    if (addPhone) {
      setForm((prev) => ({ ...prev, phones: addPhone(prev.phones, text) }));
    } else {
      setForm((prev) => {
        const trimmed = text.trim();
        if (!trimmed || prev.phones.some((p) => p.phone === trimmed)) return prev;
        const isFirst = prev.phones.length === 0;
        return {
          ...prev,
          phones: [
            ...prev.phones,
            {
              id: Date.now().toString(),
              phone: trimmed,
              isDefault: isFirst,
              lastUsed: new Date().toISOString(),
            },
          ],
        };
      });
    }
  };

  const handleRemovePhone = (id: string) => {
    if (removePhone) {
      setForm((prev) => ({ ...prev, phones: removePhone(prev.phones, id) }));
    } else {
      setForm((prev) => {
        const next = prev.phones.filter((p) => p.id !== id);
        if (next.length > 0 && !next.some((p) => p.isDefault)) {
          next[0].isDefault = true;
        }
        return { ...prev, phones: next };
      });
    }
  };

  const handleSetDefaultPhone = (id: string) => {
    if (setDefaultPhone) {
      setForm((prev) => ({ ...prev, phones: setDefaultPhone(prev.phones, id) }));
    } else {
      setForm((prev) => ({
        ...prev,
        phones: prev.phones.map((p) => ({ ...p, isDefault: p.id === id })),
      }));
    }
  };

  const handleAddAddress = (text: string) => {
    if (addAddress) {
      setForm((prev) => ({ ...prev, addresses: addAddress(prev.addresses, text) }));
    }
  };

  const handleRemoveAddress = (id: string) => {
    if (removeAddress) {
      setForm((prev) => ({ ...prev, addresses: removeAddress(prev.addresses, id) }));
    }
  };

  const handleSetDefaultAddress = (id: string) => {
    if (setDefaultAddress) {
      setForm((prev) => ({
        ...prev,
        addresses: setDefaultAddress(prev.addresses, id),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        addresses: prev.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
      }));
    }
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
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
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

          <CustomerPhoneChips
            phones={form.phones}
            onAdd={handleAddPhone}
            onRemove={handleRemovePhone}
            onSetDefault={handleSetDefaultPhone}
          />

          <Divider sx={{ my: 0.5 }} />

          <CustomerAddressChips
            addresses={form.addresses}
            onAdd={handleAddAddress}
            onRemove={handleRemoveAddress}
            onSetDefault={handleSetDefaultAddress}
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
