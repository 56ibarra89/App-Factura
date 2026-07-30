import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useUserDirectory } from "../../../accounts";
import { LOGIN_COLORS } from "../../../../shared/theme";
import type {
  CashRegisterConfig,
  CashRegisterType,
} from "../../model/cash-register.types";
import { ConfirmDialog } from "../../../../shared/ui";
import { CashRegisterDialog } from "./cash-registers/CashRegisterDialog";
import { CashRegisterTable } from "./cash-registers/CashRegisterTable";
import { useCashRegisterForm } from "./cash-registers/useCashRegisterForm";

interface CashRegisterConfigTabProps {
  cajas: CashRegisterConfig[];
  onAdd(
    name: string,
    defaultOpeningAmount: number,
    type?: CashRegisterType,
    assignedUserIds?: string[],
    assignedUserNames?: string[],
  ): void;
  onUpdate(
    id: string,
    name: string,
    defaultOpeningAmount: number,
    type?: CashRegisterType,
    assignedUserIds?: string[],
    assignedUserNames?: string[],
  ): void;
  onDelete(id: string): void;
}

export function CashRegisterConfigTab({
  cajas,
  onAdd,
  onUpdate,
  onDelete,
}: CashRegisterConfigTabProps) {
  const { users } = useUserDirectory();
  const cashiers = useMemo(
    () => users.filter((user) => user.role === "cajero"),
    [users],
  );
  const form = useCashRegisterForm({
    users: cashiers,
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
            Estaciones de Caja ({cajas.length})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configura las terminales de venta y define el fondo
            inicial predeterminado.
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
          Agregar Caja
        </Button>
      </Box>

      <CashRegisterTable
        cashRegisters={cajas}
        onEdit={form.openForEditing}
        onDelete={setDeleteTargetId}
      />
      <CashRegisterDialog form={form} users={cashiers} />
      <ConfirmDialog
        open={deleteTargetId !== null}
        title="Eliminar Caja"
        message="¿Estás seguro de que deseas eliminar esta estación de caja? Esto no afectará las transacciones ni los turnos pasados."
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
      />
    </Box>
  );
}
