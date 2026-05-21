import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import ConfirmDialog from "../ConfirmDialog";
import { CashRegisterConfig } from "../../types/shift.types";
import { LOGIN_COLORS } from "../../theme/loginTheme";
import { formatCurrency } from "../../utils/formatUtils";

interface Props {
  cajas: CashRegisterConfig[];
  onAdd: (name: string, defaultOpeningAmount: number) => void;
  onUpdate: (id: string, name: string, defaultOpeningAmount: number) => void;
  onDelete: (id: string) => void;
}

export const CajasConfigTab: React.FC<Props> = ({ cajas, onAdd, onUpdate, onDelete }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCaja, setEditingCaja] = useState<CashRegisterConfig | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<{ name?: string; amount?: string }>({});

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingCaja(null);
    setName("");
    setAmount("");
    setErrors({});
    setOpenDialog(true);
  };

  const handleOpenEdit = (caja: CashRegisterConfig) => {
    setEditingCaja(caja);
    setName(caja.name);
    setAmount(String(caja.defaultOpeningAmount));
    setErrors({});
    setOpenDialog(true);
  };

  const validate = () => {
    const nextErrors: typeof errors = {};
    if (!name.trim()) {
      nextErrors.name = "El nombre de la caja es obligatorio.";
    }
    const val = parseFloat(amount);
    if (!amount.trim() || isNaN(val) || val < 0) {
      nextErrors.amount = "Ingresa un monto de apertura válido (>= 0).";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const val = parseFloat(amount);
    if (editingCaja) {
      onUpdate(editingCaja.id, name.trim(), val);
    } else {
      onAdd(name.trim(), val);
    }
    setOpenDialog(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      onDelete(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h6" fontWeight={800} color="text.primary">
            Estaciones de Caja ({cajas.length})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configura las terminales de venta y define el fondo inicial predeterminado.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{
            borderRadius: 2,
            bgcolor: LOGIN_COLORS.primary,
            "&:hover": { bgcolor: LOGIN_COLORS.primaryDark },
            fontWeight: "bold",
          }}
        >
          Agregar Caja
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "grey.100", borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: "grey.50" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Nombre de Estación</TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="right">Monto Apertura Predeterminado</TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cajas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  No hay cajas configuradas. Agrega una nueva caja para comenzar.
                </TableCell>
              </TableRow>
            ) : (
              cajas.map((caja) => (
                <TableRow key={caja.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell sx={{ fontWeight: "bold", color: "grey.600" }}>{caja.id}</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>{caja.name}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: "text.primary" }}>
                    {formatCurrency(caja.defaultOpeningAmount)}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton size="small" onClick={() => handleOpenEdit(caja)} sx={{ color: "info.main" }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteTargetId(caja.id)}
                        sx={{ color: "error.main" }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Agregar/Editar Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingCaja ? "Editar Estación de Caja" : "Nueva Estación de Caja"}
        </DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent dividers>
            <Stack spacing={3}>
              <TextField
                label="Nombre de la Caja"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={!!errors.name}
                helperText={errors.name ?? "Ej. Caja Principal, Caja Terraza, Caja Móvil"}
                required
                autoFocus
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
              <TextField
                label="Fondo de Apertura Predeterminado"
                type="number"
                fullWidth
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                error={!!errors.amount}
                helperText={errors.amount ?? "Monto de efectivo base inicial para este punto de cobro."}
                required
                inputProps={{ min: 0, step: "0.01" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalAtmIcon sx={{ color: "success.main" }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setOpenDialog(false)}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: "bold" }}
            >
              Cancelar
            </Button>
            <Button
              fullWidth
              variant="contained"
              type="submit"
              sx={{
                borderRadius: 2,
                bgcolor: LOGIN_COLORS.primary,
                "&:hover": { bgcolor: LOGIN_COLORS.primaryDark },
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              {editingCaja ? "Guardar Cambios" : "Crear Caja"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Confirmar Eliminación */}
      <ConfirmDialog
        open={deleteTargetId !== null}
        title="Eliminar Caja"
        message="¿Estás seguro de que deseas eliminar esta estación de caja? Esto no afectará las transacciones ni los turnos pasados."
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
};
