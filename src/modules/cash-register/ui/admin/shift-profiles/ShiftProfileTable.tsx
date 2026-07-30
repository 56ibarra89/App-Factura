import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DateRangeIcon from "@mui/icons-material/DateRange";
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
import type { ShiftProfileConfig } from "../../../model/cash-register.types";
import { SHIFT_PROFILE_DAYS } from "./shiftProfile.constants";

interface ShiftProfileTableProps {
  shifts: ShiftProfileConfig[];
  onEdit(shift: ShiftProfileConfig): void;
  onDelete(id: string): void;
}

function ShiftAssignments({
  shift,
}: {
  shift: ShiftProfileConfig;
}) {
  if (!shift.assignedUserNames?.length) return null;
  const AssignmentIcon =
    shift.assignedUserNames.length > 1
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
        {shift.assignedUserNames.join(", ")}
      </Typography>
    </Box>
  );
}

function ShiftSchedule({
  shift,
}: {
  shift: ShiftProfileConfig;
}) {
  const selectedDays = SHIFT_PROFILE_DAYS.filter((day) =>
    shift.daysOfWeek?.includes(day.value),
  )
    .map((day) => day.label)
    .join(", ");

  return (
    <>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="center"
      >
        <AccessTimeIcon
          fontSize="small"
          sx={{ color: "grey.400" }}
        />
        <Typography variant="body2" fontWeight="bold">
          {shift.startTime} - {shift.endTime}
        </Typography>
      </Stack>
      {selectedDays && (
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          justifyContent="center"
          mt={0.5}
        >
          <DateRangeIcon
            sx={{ fontSize: 14, color: "text.secondary" }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
          >
            {selectedDays}
          </Typography>
        </Stack>
      )}
    </>
  );
}

export function ShiftProfileTable({
  shifts,
  onEdit,
  onDelete,
}: ShiftProfileTableProps) {
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
            <TableCell sx={{ fontWeight: "bold" }}>
              Nombre de Turno
            </TableCell>
            <TableCell
              sx={{ fontWeight: "bold" }}
              align="center"
            >
              Horario de Trabajo
            </TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>
              Descripción
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
          {shifts.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                align="center"
                sx={{ py: 6, color: "text.secondary" }}
              >
                No hay turnos configurados. Agrega uno nuevo
                para comenzar.
              </TableCell>
            </TableRow>
          ) : (
            shifts.map((shift) => (
              <TableRow
                key={shift.id}
                hover
                sx={{
                  "&:last-child td, &:last-child th": {
                    border: 0,
                  },
                }}
              >
                <TableCell>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                  >
                    <Typography fontWeight="bold">
                      {shift.name}
                    </Typography>
                    {shift.assignedRole && (
                      <Chip
                        label={`Rol: ${shift.assignedRole}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{
                          fontWeight: "bold",
                          height: 20,
                          fontSize: "0.7rem",
                        }}
                      />
                    )}
                  </Box>
                  <ShiftAssignments shift={shift} />
                </TableCell>
                <TableCell align="center">
                  <ShiftSchedule shift={shift} />
                </TableCell>
                <TableCell sx={{ color: "text.secondary" }}>
                  {shift.description || "Sin descripción"}
                </TableCell>
                <TableCell align="center">
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                  >
                    <IconButton
                      size="small"
                      onClick={() => onEdit(shift)}
                      sx={{ color: "info.main" }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(shift.id)}
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
