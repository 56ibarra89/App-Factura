import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { UserAccount } from "../../../../accounts";
import type { CashRegisterType } from "../../../model/cash-register.types";
import { LOGIN_COLORS } from "../../../../../shared/theme";
import { UserMultiSelect } from "../../../../accounts";
import type { CashRegisterFormController } from "./useCashRegisterForm";

interface CashRegisterDialogProps {
  form: CashRegisterFormController;
  users: UserAccount[];
}

export function CashRegisterDialog({
  form,
  users,
}: CashRegisterDialogProps) {
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
          ? "Editar Estación de Caja"
          : "Nueva Estación de Caja"}
      </DialogTitle>
      <form onSubmit={form.save}>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField
              label="Nombre de la Caja"
              fullWidth
              value={form.name}
              onChange={(event) =>
                form.setName(event.target.value)
              }
              error={!!form.errors.name}
              helperText={
                form.errors.name ??
                "Ej. Caja Principal, Caja Terraza, Caja Móvil"
              }
              required
              autoFocus
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <FormControl
              fullWidth
              error={!!form.errors.type}
            >
              <InputLabel>
                Rol / Etiqueta de la Caja
              </InputLabel>
              <Select
                value={form.type}
                label="Rol / Etiqueta de la Caja"
                onChange={(event) =>
                  form.setType(
                    event.target.value as CashRegisterType,
                  )
                }
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="Principal">
                  Caja Principal
                </MenuItem>
                <MenuItem value="Auxiliar">
                  Caja Auxiliar
                </MenuItem>
                <MenuItem value="Delivery">
                  Caja Delivery
                </MenuItem>
              </Select>
            </FormControl>
            <UserMultiSelect
              label="Usuarios Asignados (Opcional)"
              users={users}
              selectedUserIds={form.assignedUserIds}
              emptyLabel="Sin asignar (Cualquiera puede usarla)"
              onChange={form.setAssignedUserIds}
            />
            <TextField
              label="Fondo de Apertura Predeterminado"
              type="number"
              fullWidth
              value={form.amount}
              onChange={(event) =>
                form.setAmount(event.target.value)
              }
              error={!!form.errors.amount}
              helperText={
                form.errors.amount ??
                "Opcional. Deja vacío o en 0 si esta caja no maneja dinero físico."
              }
              inputProps={{ min: 0, step: "0.01" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocalAtmIcon
                      sx={{ color: "success.main" }}
                    />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 },
              }}
            />
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
              : "Crear Caja"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
