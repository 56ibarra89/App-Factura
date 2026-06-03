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
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  Checkbox,
  ListItemText,
  SelectChangeEvent
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import ConfirmDialog from "../ConfirmDialog";
import { CashRegisterConfig, CashRegisterType } from "../../types/shift.types";
import { LOGIN_COLORS } from "../../theme/loginTheme";
import { formatCurrency } from "../../utils/formatUtils";
import { useAccountManager } from "../../hooks/useAccountManager";

interface Props {
  cajas: CashRegisterConfig[];
  onAdd: (name: string, defaultOpeningAmount: number, type?: CashRegisterType, assignedUserIds?: string[], assignedUserNames?: string[]) => void;
  onUpdate: (id: string, name: string, defaultOpeningAmount: number, type?: CashRegisterType, assignedUserIds?: string[], assignedUserNames?: string[]) => void;
  onDelete: (id: string) => void;
}

export const CajasConfigTab: React.FC<Props> = ({ cajas, onAdd, onUpdate, onDelete }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCaja, setEditingCaja] = useState<CashRegisterConfig | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<CashRegisterType | "">("");
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ name?: string; amount?: string; type?: string }>({});

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const { users } = useAccountManager();
  const cajeroUsers = users.filter((u) => u.role === "cajero");

  const handleOpenAdd = () => {
    setEditingCaja(null);
    setName("");
    setAmount("");
    setType("Principal");
    setAssignedUserIds([]);
    setErrors({});
    setOpenDialog(true);
  };

  const handleOpenEdit = (caja: CashRegisterConfig) => {
    setEditingCaja(caja);
    setName(caja.name);
    setAmount(String(caja.defaultOpeningAmount));
    setType(caja.type || "Principal");
    setAssignedUserIds(caja.assignedUserIds || (caja.assignedUserId ? [caja.assignedUserId] : []));
    setErrors({});
    setOpenDialog(true);
  };

  const validate = () => {
    const nextErrors: typeof errors = {};
    if (!name.trim()) {
      nextErrors.name = "El nombre de la caja es obligatorio.";
    }
    if (!type) {
      nextErrors.type = "El rol de la caja es obligatorio.";
    }
    const val = amount.trim() ? parseFloat(amount) : 0;
    if (isNaN(val) || val < 0) {
      nextErrors.amount = "Ingresa un monto válido (puede ser 0 o vacío).";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const val = amount.trim() ? parseFloat(amount) : 0;
    const finalType = type as CashRegisterType;
    let finalAssignedUserNames: string[] | undefined = undefined;
    
    if (assignedUserIds.length > 0) {
      finalAssignedUserNames = assignedUserIds.map(id => {
        const selectedUser = users.find((u) => u.id === id);
        return selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}`.trim() : "";
      }).filter(Boolean);
    }

    if (editingCaja) {
      onUpdate(editingCaja.id, name.trim(), val, finalType, assignedUserIds.length > 0 ? assignedUserIds : undefined, finalAssignedUserNames);
    } else {
      onAdd(name.trim(), val, finalType, assignedUserIds.length > 0 ? assignedUserIds : undefined, finalAssignedUserNames);
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
          <TableHead sx={{ bgcolor: "action.hover" }}>
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
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography fontWeight="bold">{caja.name}</Typography>
                      {caja.type && (
                        <Chip 
                          label={caja.type} 
                          size="small" 
                          color={caja.type === 'Principal' ? 'primary' : caja.type === 'Delivery' ? 'warning' : 'secondary'}
                          variant="outlined"
                          sx={{ fontWeight: "bold", height: 20, fontSize: "0.7rem" }}
                        />
                      )}
                    </Box>
                    {caja.assignedUserNames && caja.assignedUserNames.length > 0 && (
                      <Box display="flex" alignItems="center" gap={0.5} mt={0.5} flexWrap="wrap">
                        {caja.assignedUserNames.length > 1 ? (
                          <GroupIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        ) : (
                          <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {caja.assignedUserNames.join(", ")}
                        </Typography>
                      </Box>
                    )}
                    {/* Fallback for old data without assignedUserNames but with assignedUserName */}
                    {!caja.assignedUserNames && caja.assignedUserName && (
                      <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                        <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {caja.assignedUserName}
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
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
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel>Rol / Etiqueta de la Caja</InputLabel>
                <Select
                  value={type}
                  label="Rol / Etiqueta de la Caja"
                  onChange={(e) => setType(e.target.value as CashRegisterType)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="Principal">Caja Principal</MenuItem>
                  <MenuItem value="Auxiliar">Caja Auxiliar</MenuItem>
                  <MenuItem value="Delivery">Caja Delivery</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Usuarios Asignados (Opcional)</InputLabel>
                <Select
                  multiple
                  value={assignedUserIds}
                  label="Usuarios Asignados (Opcional)"
                  onChange={(e: SelectChangeEvent<typeof assignedUserIds>) => {
                    const value = e.target.value;
                    setAssignedUserIds(typeof value === 'string' ? value.split(',') : value);
                  }}
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return <em>Sin asignar (Cualquiera puede usarla)</em>;
                    }
                    return selected.map(id => {
                      const user = users.find(u => u.id === id);
                      return user ? user.firstName : id;
                    }).join(', ');
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  {cajeroUsers.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <Checkbox checked={assignedUserIds.indexOf(user.id) > -1} />
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem', bgcolor: LOGIN_COLORS.primary }}>
                          {user.firstName[0]}
                        </Avatar>
                        <ListItemText primary={`${user.firstName} ${user.lastName} (@${user.username})`} />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Fondo de Apertura Predeterminado"
                type="number"
                fullWidth
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                error={!!errors.amount}
                helperText={errors.amount ?? "Opcional. Deja vacío o en 0 si esta caja no maneja dinero físico."}
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
