import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Stack,
  Divider,
  CircularProgress,
  Chip,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import type { Customer } from "../../customers";

interface CustomerMatchDialogProps {
  open: boolean;
  existingCustomer: Customer | null;
  newCustomerData: {
    name: string;
    phone?: string;
    address?: string;
  };
  onConfirmAsNew: () => Promise<void> | void;
  onConfirmAsExisting: () => Promise<void> | void;
  onCancel: () => void;
  loading?: boolean;
}

export default function CustomerMatchDialog({
  open,
  existingCustomer,
  newCustomerData,
  onConfirmAsNew,
  onConfirmAsExisting,
  onCancel,
  loading = false,
}: CustomerMatchDialogProps) {
  if (!existingCustomer) return null;

  const existingPhones =
    existingCustomer.phones && existingCustomer.phones.length > 0
      ? existingCustomer.phones.map((p) => p.phone).join(" • ")
      : existingCustomer.phone || "Sin teléfono registrado";

  const existingAddresses =
    existingCustomer.addresses && existingCustomer.addresses.length > 0
      ? existingCustomer.addresses.map((a) => (a.isDefault ? `⭐ ${a.address}` : a.address)).join(" | ")
      : "Sin direcciones registradas";

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: 24,
        },
      }}
    >
      {/* Encabezado de Advertencia */}
      <DialogTitle
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "warning.dark" : "#fff8e1",
          borderBottom: "1px solid",
          borderColor: "warning.light",
          py: 2,
          px: 3,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <WarningAmberIcon color="warning" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h6" fontWeight={700} color="warning.dark">
            Coincidencia de Cliente Detectada
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Ya existe un cliente registrado con el mismo nombre
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
        {/* Ficha: Datos Registrados Previamente */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "grey.900" : "grey.50",
            borderColor: "divider",
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                Cliente Registrado: "{existingCustomer.name}"
              </Typography>
            </Box>
            <Chip label="En Base de Datos" size="small" variant="outlined" color="default" />
          </Box>

          <Stack spacing={0.75} sx={{ pl: 3.5 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <PhoneIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                <strong>Teléfono(s):</strong> {existingPhones}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <LocationOnIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                <strong>Dirección(es):</strong> {existingAddresses}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Ficha: Datos Ingresados en esta Orden */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "primary.dark" : "#e8f4fd",
            borderColor: "primary.light",
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="subtitle2" fontWeight={700} color="primary.main">
              Datos Ingresados en este Pedido
            </Typography>
            <Chip label="Nuevo Pedido" size="small" color="primary" />
          </Box>

          <Stack spacing={0.75} sx={{ pl: 1 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <PhoneIcon sx={{ fontSize: 16, color: "primary.main" }} />
              <Typography variant="body2" color="text.primary">
                <strong>Nuevo Teléfono:</strong> {newCustomerData.phone || "(No especificado)"}
              </Typography>
            </Box>
            {newCustomerData.address && (
              <Box display="flex" alignItems="center" gap={1}>
                <LocationOnIcon sx={{ fontSize: 16, color: "primary.main" }} />
                <Typography variant="body2" color="text.primary">
                  <strong>Nueva Dirección:</strong> {newCustomerData.address}
                </Typography>
              </Box>
            )}
          </Stack>
        </Paper>

        <Divider />

        {/* Opciones de Acción */}
        <Typography variant="subtitle2" fontWeight={700} textAlign="center" color="text.secondary">
          ¿Cómo deseas procesar a este cliente?
        </Typography>

        <Stack spacing={1.5}>
          {/* Opción 1: Crear como Nuevo Cliente */}
          <Paper
            component="button"
            type="button"
            onClick={() => !loading && onConfirmAsNew()}
            disabled={loading}
            sx={{
              p: 2,
              borderRadius: 2,
              textAlign: "left",
              border: "1.5px solid",
              borderColor: "primary.main",
              bgcolor: (theme) =>
                theme.palette.mode === "dark" ? "background.paper" : "#f0f7ff",
              cursor: loading ? "default" : "pointer",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                bgcolor: (theme) =>
                  theme.palette.mode === "dark" ? "action.hover" : "#e0efff",
                borderColor: "primary.dark",
                transform: "translateY(-1px)",
                boxShadow: 2,
              },
              display: "flex",
              alignItems: "flex-start",
              gap: 2,
            }}
          >
            <Box
              sx={{
                p: 1,
                borderRadius: "50%",
                bgcolor: "primary.main",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mt: 0.25,
              }}
            >
              <PersonAddAlt1Icon fontSize="small" />
            </Box>
            <Box flex={1}>
              <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                👤 Crear como Nuevo Cliente
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                Es otra persona con el mismo nombre (homónimo). Creará un nuevo perfil independiente sin alterar al cliente anterior.
              </Typography>
            </Box>
          </Paper>

          {/* Opción 2: Vincular al Cliente Existente */}
          <Paper
            component="button"
            type="button"
            onClick={() => !loading && onConfirmAsExisting()}
            disabled={loading}
            sx={{
              p: 2,
              borderRadius: 2,
              textAlign: "left",
              border: "1.5px solid",
              borderColor: "success.main",
              bgcolor: (theme) =>
                theme.palette.mode === "dark" ? "background.paper" : "#f4fbf7",
              cursor: loading ? "default" : "pointer",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                bgcolor: (theme) =>
                  theme.palette.mode === "dark" ? "action.hover" : "#e6f7ed",
                borderColor: "success.dark",
                transform: "translateY(-1px)",
                boxShadow: 2,
              },
              display: "flex",
              alignItems: "flex-start",
              gap: 2,
            }}
          >
            <Box
              sx={{
                p: 1,
                borderRadius: "50%",
                bgcolor: "success.main",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mt: 0.25,
              }}
            >
              <SyncAltIcon fontSize="small" />
            </Box>
            <Box flex={1}>
              <Typography variant="subtitle1" fontWeight={700} color="success.main">
                🔄 Vincular al Cliente Existente
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                Es el mismo cliente con otro número o dirección. Agregará este teléfono y domicilio a su historial existente.
              </Typography>
            </Box>
          </Paper>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: "background.default", borderTop: "1px solid", borderColor: "divider" }}>
        <Button onClick={onCancel} disabled={loading} color="inherit" variant="text">
          Volver y Corregir
        </Button>
        {loading && <CircularProgress size={20} sx={{ ml: 2 }} />}
      </DialogActions>
    </Dialog>
  );
}
