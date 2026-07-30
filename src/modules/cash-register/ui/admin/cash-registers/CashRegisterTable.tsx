import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { CashRegisterConfig } from "../../../model/cash-register.types";
import { formatCurrency } from "../../../../../shared/format";

interface CashRegisterTableProps {
  cashRegisters: CashRegisterConfig[];
  onEdit(cashRegister: CashRegisterConfig): void;
  onDelete(id: string): void;
}

function AssignedUsers({
  cashRegister,
}: {
  cashRegister: CashRegisterConfig;
}) {
  if (cashRegister.assignedUserNames?.length) {
    const AssignmentIcon =
      cashRegister.assignedUserNames.length > 1
        ? GroupIcon
        : PersonIcon;
    return (
      <Box
        display="flex"
        alignItems="center"
        gap={0.5}
        mt={0.5}
        flexWrap="wrap"
      >
        <AssignmentIcon
          sx={{ fontSize: 14, color: "text.secondary" }}
        />
        <Typography variant="caption" color="text.secondary">
          {cashRegister.assignedUserNames.join(", ")}
        </Typography>
      </Box>
    );
  }

  if (!cashRegister.assignedUserName) return null;
  return (
    <Box
      display="flex"
      alignItems="center"
      gap={0.5}
      mt={0.5}
    >
      <PersonIcon
        sx={{ fontSize: 14, color: "text.secondary" }}
      />
      <Typography variant="caption" color="text.secondary">
        {cashRegister.assignedUserName}
      </Typography>
    </Box>
  );
}

export function CashRegisterTable({
  cashRegisters,
  onEdit,
  onDelete,
}: CashRegisterTableProps) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "grey.100",
        borderRadius: 3,
      }}
    >
      <Table>
        <TableHead sx={{ bgcolor: "action.hover" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>
              Nombre de Estación
            </TableCell>
            <TableCell
              sx={{ fontWeight: "bold" }}
              align="right"
            >
              Monto Apertura Predeterminado
            </TableCell>
            <TableCell
              sx={{ fontWeight: "bold" }}
              align="center"
            >
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cashRegisters.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                align="center"
                sx={{ py: 6, color: "text.secondary" }}
              >
                No hay cajas configuradas. Agrega una nueva
                caja para comenzar.
              </TableCell>
            </TableRow>
          ) : (
            cashRegisters.map((cashRegister) => (
              <TableRow
                key={cashRegister.id}
                hover
                sx={{
                  "&:last-child td, &:last-child th": {
                    border: 0,
                  },
                }}
              >
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    color: "grey.600",
                  }}
                >
                  {cashRegister.id}
                </TableCell>
                <TableCell>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <Typography fontWeight="bold">
                      {cashRegister.name}
                    </Typography>
                    {cashRegister.type && (
                      <Chip
                        label={cashRegister.type}
                        size="small"
                        color={
                          cashRegister.type === "Principal"
                            ? "primary"
                            : cashRegister.type === "Delivery"
                              ? "warning"
                              : "secondary"
                        }
                        variant="outlined"
                        sx={{
                          fontWeight: "bold",
                          height: 20,
                          fontSize: "0.7rem",
                        }}
                      />
                    )}
                  </Box>
                  <AssignedUsers cashRegister={cashRegister} />
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  {formatCurrency(
                    cashRegister.defaultOpeningAmount,
                  )}
                </TableCell>
                <TableCell align="center">
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                  >
                    <IconButton
                      size="small"
                      onClick={() => onEdit(cashRegister)}
                      sx={{ color: "info.main" }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(cashRegister.id)}
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
  );
}
