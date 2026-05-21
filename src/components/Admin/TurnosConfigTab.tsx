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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ConfirmDialog from "../ConfirmDialog";
import { ShiftProfileConfig } from "../../types/shift.types";
import { LOGIN_COLORS } from "../../theme/loginTheme";

interface Props {
  turnos: ShiftProfileConfig[];
  onAdd: (name: string, startTime: string, endTime: string, description?: string) => void;
  onUpdate: (id: string, name: string, startTime: string, endTime: string, description?: string) => void;
  onDelete: (id: string) => void;
}

export const TurnosConfigTab: React.FC<Props> = ({ turnos, onAdd, onUpdate, onDelete }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTurno, setEditingTurno] = useState<ShiftProfileConfig | null>(null);
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("16:00");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ name?: string; time?: string }>({});

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingTurno(null);
    setName("");
    setStartTime("08:00");
    setEndTime("16:00");
    setDescription("");
    setErrors({});
    setOpenDialog(true);
  };

  const handleOpenEdit = (turno: ShiftProfileConfig) => {
    setEditingTurno(turno);
    setName(turno.name);
    setStartTime(turno.startTime);
    setEndTime(turno.endTime);
    setDescription(turno.description || "");
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

    if (editingTurno) {
      onUpdate(editingTurno.id, name.trim(), startTime, endTime, description.trim());
    } else {
      onAdd(name.trim(), startTime, endTime, description.trim());
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
          <TableHead sx={{ bgcolor: "grey.50" }}>
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
                  <TableCell sx={{ fontWeight: "bold" }}>{turno.name}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                      <AccessTimeIcon fontSize="small" sx={{ color: "grey.400" }} />
                      <Typography variant="body2" fontWeight="bold">
                        {turno.startTime} - {turno.endTime}
                      </Typography>
                    </Stack>
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
