import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { useCustomerSearch } from "../hooks/useCustomerSearch";
import { Customer } from "../types/customer.types";

interface DeliveryCustomerDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (customer: Customer | null, phone: string) => void;
}

export default function DeliveryCustomerDialog({
  open,
  onClose,
  onConfirm,
}: DeliveryCustomerDialogProps) {
  const [phoneInput, setPhoneInput] = useState("");
  const { suggestions, search, clearSuggestions } = useCustomerSearch();

  // Reset y buscar automáticamente cuando se abre
  useEffect(() => {
    if (open) {
      setPhoneInput("");
      clearSuggestions();
    }
  }, [open, clearSuggestions]);

  // Ejecutar búsqueda cada vez que cambia el input
  useEffect(() => {
    search(phoneInput);
  }, [phoneInput, search]);

  const handleSelectExisting = (customer: Customer) => {
    // Si el cliente tiene un teléfono guardado, enviamos ese. Si no, enviamos lo que escribió el usuario.
    onConfirm(customer, customer.phone || phoneInput);
    onClose();
  };

  const handleContinueAsNew = () => {
    onConfirm(null, phoneInput);
    onClose();
  };

  const hasSuggestions = suggestions.length > 0;
  const isInputEmpty = phoneInput.trim().length === 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
        <PhoneIcon color="primary" />
        Buscar Cliente para Delivery
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Ingresa el número de teléfono del cliente para rellenar sus datos automáticamente al momento de facturar.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Número de Teléfono"
            placeholder="Ej. 88880000"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            InputProps={{
              startAdornment: <PhoneIcon color="action" sx={{ mr: 1, fontSize: 20 }} />,
              style: { fontSize: "1.2rem", fontWeight: "bold" },
            }}
          />
        </Box>

        {!isInputEmpty && (
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1} color="text.secondary">
              Resultados de la búsqueda:
            </Typography>

            {hasSuggestions ? (
              <List sx={{ bgcolor: "background.paper", borderRadius: 1, border: "1px solid", borderColor: "divider" }}>
                {suggestions.map((customer, index) => (
                  <React.Fragment key={customer.id}>
                    {index > 0 && <Divider />}
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => handleSelectExisting(customer)}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <PersonIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography fontWeight={700}>{customer.name}</Typography>
                          }
                          secondary={
                            customer.phone
                              ? `Tel: ${customer.phone}`
                              : "Sin teléfono registrado"
                          }
                        />
                        <Button variant="outlined" size="small" color="primary">
                          Seleccionar
                        </Button>
                      </ListItemButton>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box
                sx={{
                  p: 3,
                  textAlign: "center",
                  bgcolor: "grey.50",
                  borderRadius: 2,
                  border: "1px dashed",
                  borderColor: "grey.300",
                }}
              >
                <PersonAddAlt1Icon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
                <Typography variant="body1" fontWeight={600}>
                  Cliente nuevo
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No se encontró ningún cliente con este número.
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleContinueAsNew}
          disabled={isInputEmpty}
          startIcon={!hasSuggestions ? <PersonAddAlt1Icon /> : undefined}
        >
          {hasSuggestions
            ? "Continuar con este número (Nuevo)"
            : "Crear como Nuevo Cliente"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
