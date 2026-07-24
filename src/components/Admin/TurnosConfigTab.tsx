import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Avatar,
  SelectChangeEvent,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  FormHelperText
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import DateRangeIcon from "@mui/icons-material/DateRange";
import ConfirmDialog from "../ConfirmDialog";
import { ShiftProfileConfig } from "../../types/shift.types";
import { LOGIN_COLORS } from "../../theme/loginTheme";
import { useAccountManager } from "../../hooks/useAccountManager";

const DAYS_OF_WEEK = [
  { value: 1, label: "L" },
  { value: 2, label: "M" },
  { value: 3, label: "X" },
  { value: 4, label: "J" },
  { value: 5, label: "V" },
  { value: 6, label: "S" },
  { value: 0, label: "D" },
];

interface Props {
  turnos: ShiftProfileConfig[];
  onAdd: (name: string, startTime: string, endTime: string, description?: string, assignedRole?: string, assignedUserIds?: string[], assignedUserNames?: string[], daysOfWeek?: number[]) => void;
  onUpdate: (id: string, name: string, startTime: string, endTime: string, description?: string, assignedRole?: string, assignedUserIds?: string[], assignedUserNames?: string[], daysOfWeek?: number[]) => void;
  onDelete: (id: string) => void;
}

export const TurnosConfigTab: React.FC<Props> = ({ turnos, onAdd, onUpdate, onDelete }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTurno, setEditingTurno] = useState<ShiftProfileConfig | null>(null);
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("16:00");
  const [description, setDescription] = useState("");
  const [assignedRole, setAssignedRole] = useState<string>("");
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [errors, setErrors] = useState<{ name?: string; time?: string }>({});

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const { users } = useAccountManager();
  
  // Available users for the selected role
  const availableUsers = assignedRole 
    ? users.filter(u => u.role === assignedRole) 
    : [];

  const handleOpenAdd = () => {
    setEditingTurno(null);
    setName("");
    setStartTime("08:00");
    setEndTime("16:00");
    setDescription("");
    setAssignedRole("");
    setAssignedUserIds([]);
    setDaysOfWeek([]);
    setErrors({});
    setOpenDialog(true);
  };

  const handleOpenEdit = (turno: ShiftProfileConfig) => {
    setEditingTurno(turno);
    setName(turno.name);
    setStartTime(turno.startTime);
    setEndTime(turno.endTime);
    setDescription(turno.description || "");
    setAssignedRole(turno.assignedRole || "");
    setAssignedUserIds(turno.assignedUserIds || []);
    setDaysOfWeek(turno.daysOfWeek || []);
    setErrors({});
    setOpenDialog(true);
  };

  const validate = () => {
    const nextErrors: typeof errors = {};
    if (!name.trim()) {
      nextErrors.name = "El nombre del turno es obligatorio.";
    }
    if (!startTime || !endTime) {
      nextErrors.time = "Las horas de inicio y fin son obligatorias.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let finalAssignedUserNames: string[] | undefined = undefined;
    
    if (assignedUserIds.length > 0) {
      finalAssignedUserNames = assignedUserIds.map(id => {
        const selectedUser = users.find((u) => u.id === id);
        return selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}`.trim() : "";
      }).filter(Boolean);
    }

    if (editingTurno) {
      onUpdate(editingTurno.id, name.trim(), startTime, endTime, description.trim(), assignedRole || undefined, assignedUserIds.length > 0 ? assignedUserIds : undefined, finalAssignedUserNames, daysOfWeek.length > 0 ? daysOfWeek : undefined);
    } else {
      onAdd(name.trim(), startTime, endTime, description.trim(), assignedRole || undefined, assignedUserIds.length > 0 ? assignedUserIds : undefined, finalAssignedUserNames, daysOfWeek.length > 0 ? daysOfWeek : undefined);
    }
    setOpenDialog(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      onDelete(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  const handleAssignedUsersChange = (
    event: SelectChangeEvent<string[]>,
  ) => {
    const value = event.target.value;
    setAssignedUserIds(
      typeof value === "string" ? value.split(",") : value,
    );
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h6" fontWeight={800} color="text.primary">
            Perfiles de Turnos ({turnos.length})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra los horarios laborales oficiales y plantillas de turnos para tus cajeros.
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
          Agregar Turno
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "grey.100", borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: "action.hover" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Nombre de Turno</TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">Horario de Trabajo</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Descripción</TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {turnos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  No hay turnos configurados. Agrega uno nuevo para comenzar.
                </TableCell>
              </TableRow>
            ) : (
              turnos.map((turno) => (
                <TableRow key={turno.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography fontWeight="bold">{turno.name}</Typography>
                      {turno.assignedRole && (
                        <Chip 
                          label={`Rol: ${turno.assignedRole}`} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: "bold", height: 20, fontSize: "0.7rem" }}
                        />
                      )}
                    </Box>
                    {turno.assignedUserNames && turno.assignedUserNames.length > 0 && (
                      <Box display="flex" alignItems="center" gap={0.5} mt={0.5} flexWrap="wrap">
                        {turno.assignedUserNames.length > 1 ? (
                          <GroupIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        ) : (
                          <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {turno.assignedUserNames.join(", ")}
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                      <AccessTimeIcon fontSize="small" sx={{ color: "grey.400" }} />
                      <Typography variant="body2" fontWeight="bold">
                        {turno.startTime} - {turno.endTime}
                      </Typography>
                    </Stack>
                    {turno.daysOfWeek && turno.daysOfWeek.length > 0 && (
                      <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center" mt={0.5}>
                        <DateRangeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {DAYS_OF_WEEK.filter(d => turno.daysOfWeek?.includes(d.value)).map(d => d.label).join(', ')}
                        </Typography>
                      </Stack>
                    )}
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{turno.description || "Sin descripción"}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton size="small" onClick={() => handleOpenEdit(turno)} sx={{ color: "info.main" }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteTargetId(turno.id)}
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
          {editingTurno ? "Editar Perfil de Turno" : "Nuevo Perfil de Turno"}
        </DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent dividers>
            <Stack spacing={3}>
              <TextField
                label="Nombre del Turno"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={!!errors.name}
                helperText={errors.name ?? "Ej. Matutino, Vespertino, Nocturno, Fin de Semana"}
                required
                autoFocus
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Hora de Inicio"
                  type="time"
                  fullWidth
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
                <TextField
                  label="Hora de Fin"
                  type="time"
                  fullWidth
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Stack>
              
              <FormControl fullWidth>
                <Typography variant="caption" color="text.secondary" mb={1}>
                  Días de la semana (Opcional)
                </Typography>
                <ToggleButtonGroup
                  value={daysOfWeek}
                  onChange={(e, newDays) => setDaysOfWeek(newDays)}
                  aria-label="días de la semana"
                  color="primary"
                  fullWidth
                  size="small"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <ToggleButton key={day.value} value={day.value} aria-label={day.label}>
                      {day.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
                <FormHelperText>
                  Si no seleccionas ningún día, el turno estará disponible todos los días.
                </FormHelperText>
              </FormControl>

              <TextField
                label="Descripción (Opcional)"
                fullWidth
                multiline
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve detalle sobre las funciones o límites del turno"
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
              
              <FormControl fullWidth>
                <InputLabel>Filtrar por Rol (Opcional)</InputLabel>
                <Select
                  value={assignedRole}
                  label="Filtrar por Rol (Opcional)"
                  onChange={(e) => {
                    setAssignedRole(e.target.value);
                    setAssignedUserIds([]); // Reset user selection when role changes
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">
                    <em>Sin filtro (No asignar rol)</em>
                  </MenuItem>
                  <MenuItem value="cajero">Cajero</MenuItem>
                  <MenuItem value="mesero">Mesero</MenuItem>
                  <MenuItem value="cocinero">Cocinero</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                </Select>
              </FormControl>

              {assignedRole && (
                <FormControl fullWidth>
                  <InputLabel>Usuarios Asignados (Opcional)</InputLabel>
                  <Select<string[]>
                    multiple
                    value={assignedUserIds}
                    label="Usuarios Asignados (Opcional)"
                    onChange={handleAssignedUsersChange}
                    renderValue={(selected: string[]) => {
                      if (!selected || selected.length === 0) {
                        return <em>Sin asignar a nadie en específico</em>;
                      }
                      return selected.map((id: string) => {
                        const user = users.find(u => u.id === id);
                        return user ? user.firstName : id;
                      }).join(', ');
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    {availableUsers.map((user) => (
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
              )}
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
              {editingTurno ? "Guardar Cambios" : "Crear Turno"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Confirmar Eliminación */}
      <ConfirmDialog
        open={deleteTargetId !== null}
        title="Eliminar Perfil de Turno"
        message="¿Estás seguro de que deseas eliminar este perfil de turno? No afectará a las sesiones de turno cerradas anteriormente."
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
};
