import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { LOGIN_COLORS } from "../../../../../shared/theme";
import { UserMultiSelect } from "../../../../accounts";
import { SHIFT_PROFILE_DAYS } from "./shiftProfile.constants";
import type { ShiftProfileFormController } from "./useShiftProfileForm";

interface ShiftProfileDialogProps {
  form: ShiftProfileFormController;
}

export function ShiftProfileDialog({
  form,
}: ShiftProfileDialogProps) {
  return (
    <Dialog
      open={form.open}
      onClose={form.close}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle sx={{ fontWeight: 800 }}>
        {form.editing
          ? "Editar Perfil de Turno"
          : "Nuevo Perfil de Turno"}
      </DialogTitle>
      <form onSubmit={form.save}>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField
              label="Nombre del Turno"
              fullWidth
              value={form.name}
              onChange={(event) =>
                form.setName(event.target.value)
              }
              error={!!form.errors.name}
              helperText={
                form.errors.name ??
                "Ej. Matutino, Vespertino, Nocturno, Fin de Semana"
              }
              required
              autoFocus
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Hora de Inicio"
                type="time"
                fullWidth
                value={form.startTime}
                onChange={(event) =>
                  form.setStartTime(event.target.value)
                }
                InputLabelProps={{ shrink: true }}
                required
                error={!!form.errors.time}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <TextField
                label="Hora de Fin"
                type="time"
                fullWidth
                value={form.endTime}
                onChange={(event) =>
                  form.setEndTime(event.target.value)
                }
                InputLabelProps={{ shrink: true }}
                required
                error={!!form.errors.time}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
            </Stack>

            <FormControl fullWidth>
              <Typography
                variant="caption"
                color="text.secondary"
                mb={1}
              >
                Días de la semana (Opcional)
              </Typography>
              <ToggleButtonGroup
                value={form.daysOfWeek}
                onChange={(_, days: number[]) =>
                  form.setDaysOfWeek(days)
                }
                aria-label="días de la semana"
                color="primary"
                fullWidth
                size="small"
              >
                {SHIFT_PROFILE_DAYS.map((day) => (
                  <ToggleButton
                    key={day.value}
                    value={day.value}
                    aria-label={day.label}
                  >
                    {day.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              <FormHelperText>
                Si no seleccionas ningún día, el turno estará
                disponible todos los días.
              </FormHelperText>
            </FormControl>

            <TextField
              label="Descripción (Opcional)"
              fullWidth
              multiline
              rows={2}
              value={form.description}
              onChange={(event) =>
                form.setDescription(event.target.value)
              }
              placeholder="Breve detalle sobre las funciones o límites del turno"
              InputProps={{ sx: { borderRadius: 2 } }}
            />

            <FormControl fullWidth>
              <InputLabel>
                Filtrar por Rol (Opcional)
              </InputLabel>
              <Select
                value={form.assignedRole}
                label="Filtrar por Rol (Opcional)"
                onChange={(event) =>
                  form.changeAssignedRole(event.target.value)
                }
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">
                  <em>Sin filtro (No asignar rol)</em>
                </MenuItem>
                <MenuItem value="cajero">Cajero</MenuItem>
                <MenuItem value="mesero">Mesero</MenuItem>
                <MenuItem value="cocinero">Cocinero</MenuItem>
                <MenuItem value="admin">
                  Administrador
                </MenuItem>
              </Select>
            </FormControl>

            {form.assignedRole && (
              <UserMultiSelect
                label="Usuarios Asignados (Opcional)"
                users={form.availableUsers}
                selectedUserIds={form.assignedUserIds}
                emptyLabel="Sin asignar a nadie en específico"
                onChange={form.setAssignedUserIds}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={form.close}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: "bold",
            }}
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
              "&:hover": {
                bgcolor: LOGIN_COLORS.primaryDark,
              },
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            {form.editing
              ? "Guardar Cambios"
              : "Crear Turno"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
