import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import { useUserDirectory } from "../../../accounts";
import { LOGIN_COLORS } from "../../../../shared/theme";
import type { ShiftProfileConfig } from "../../model/cash-register.types";
import { ConfirmDialog } from "../../../../shared/ui";
import { ShiftProfileDialog } from "./shift-profiles/ShiftProfileDialog";
import { ShiftProfileTable } from "./shift-profiles/ShiftProfileTable";
import { useShiftProfileForm } from "./shift-profiles/useShiftProfileForm";

interface ShiftProfileConfigTabProps {
  turnos: ShiftProfileConfig[];
  onAdd(
    name: string,
    startTime: string,
    endTime: string,
    description?: string,
    assignedRole?: string,
    assignedUserIds?: string[],
    assignedUserNames?: string[],
    daysOfWeek?: number[],
  ): void;
  onUpdate(
    id: string,
    name: string,
    startTime: string,
    endTime: string,
    description?: string,
    assignedRole?: string,
    assignedUserIds?: string[],
    assignedUserNames?: string[],
    daysOfWeek?: number[],
  ): void;
  onDelete(id: string): void;
}

export function ShiftProfileConfigTab({
  turnos,
  onAdd,
  onUpdate,
  onDelete,
}: ShiftProfileConfigTabProps) {
  const { users } = useUserDirectory();
  const form = useShiftProfileForm({
    users,
    onAdd,
    onUpdate,
  });
  const [deleteTargetId, setDeleteTargetId] = useState<
    string | null
  >(null);

  const confirmDelete = () => {
    if (!deleteTargetId) return;
    onDelete(deleteTargetId);
    setDeleteTargetId(null);
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography
            variant="h6"
            fontWeight={800}
            color="text.primary"
          >
            Perfiles de Turnos ({turnos.length})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra los horarios laborales oficiales y
            plantillas de turnos para tus cajeros.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={form.openForCreation}
          sx={{
            borderRadius: 2,
            bgcolor: LOGIN_COLORS.primary,
            "&:hover": {
              bgcolor: LOGIN_COLORS.primaryDark,
            },
            fontWeight: "bold",
          }}
        >
          Agregar Turno
        </Button>
      </Box>

      <ShiftProfileTable
        shifts={turnos}
        onEdit={form.openForEditing}
        onDelete={setDeleteTargetId}
      />
      <ShiftProfileDialog form={form} />
      <ConfirmDialog
        open={deleteTargetId !== null}
        title="Eliminar Perfil de Turno"
        message="¿Estás seguro de que deseas eliminar este perfil de turno? No afectará a las sesiones de turno cerradas anteriormente."
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
      />
    </Box>
  );
}
