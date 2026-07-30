import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useCookAssignments } from "../../hooks/useCookAssignments";
import type {
  CookUser,
  Kitchen,
} from "../../api/kitchensGateway";

const DAYS_OF_WEEK = [
  { value: "MONDAY", label: "Lunes" },
  { value: "TUESDAY", label: "Martes" },
  { value: "WEDNESDAY", label: "Miércoles" },
  { value: "THURSDAY", label: "Jueves" },
  { value: "FRIDAY", label: "Viernes" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
];

interface CookAssignmentsSectionProps {
  kitchens: Kitchen[];
}

export default function CookAssignmentsSection({
  kitchens,
}: CookAssignmentsSectionProps) {
  const { cooks, isLoading, updateAssignments } = useCookAssignments();
  const [editingCookId, setEditingCookId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<
    Record<string, string | null>
  >({});

  const startEditing = (cook: CookUser) => {
    setEditingCookId(cook.id);
    setAssignments(
      Object.fromEntries(
        DAYS_OF_WEEK.map((day) => [
          day.value,
          cook.kitchenAssignments?.find(
            (assignment) => assignment.dayOfWeek === day.value,
          )?.kitchenId ?? "",
        ]),
      ),
    );
  };

  const saveAssignments = async (cookId: string) => {
    await updateAssignments(
      cookId,
      Object.entries(assignments).map(([dayOfWeek, kitchenId]) => ({
        dayOfWeek,
        kitchenId: kitchenId || null,
      })),
    );
    setEditingCookId(null);
  };

  const cancelEditing = () => {
    setEditingCookId(null);
    setAssignments({});
  };

  if (isLoading) {
    return <Typography textAlign="center">Cargando cocineros...</Typography>;
  }

  return (
    <Paper sx={{ p: 4, borderRadius: 3, width: "100%" }}>
      <Typography variant="h6" mb={3}>
        Asignación de Horarios por Cocinero
      </Typography>
      <Box
        display="flex"
        flexDirection="column"
        gap={3}
        sx={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto", pr: 1 }}
      >
        {cooks.map((cook) => {
          const assignedDays = DAYS_OF_WEEK.flatMap((day) => {
            const kitchenId = cook.kitchenAssignments?.find(
              (assignment) => assignment.dayOfWeek === day.value,
            )?.kitchenId;
            const kitchen = kitchens.find((item) => item.id === kitchenId);
            return kitchen ? [{ day, kitchen }] : [];
          });

          return (
            <Box
              key={cook.id}
              p={3}
              border="1px solid"
              borderColor="divider"
              borderRadius={3}
              bgcolor="background.default"
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {cook.firstName} {cook.lastName}
                </Typography>
                {editingCookId !== cook.id && (
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => startEditing(cook)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>

              {editingCookId === cook.id ? (
                <>
                  <Box
                    display="grid"
                    gridTemplateColumns="repeat(auto-fill, minmax(90px, 1fr))"
                    gap={1.5}
                    mb={3}
                  >
                    {DAYS_OF_WEEK.filter((day) =>
                      cook.workDays?.includes(day.value),
                    ).map((day) => (
                      <FormControl key={day.value} size="small" fullWidth>
                        <Typography
                          variant="caption"
                          mb={0.5}
                          color="text.secondary"
                          fontWeight="bold"
                        >
                          {day.label}
                        </Typography>
                        <Select
                          size="small"
                          value={assignments[day.value] || ""}
                          onChange={(event) =>
                            setAssignments((current) => ({
                              ...current,
                              [day.value]: event.target.value,
                            }))
                          }
                          sx={{
                            fontSize: "0.75rem",
                            "& .MuiSelect-select": { py: 0.75 },
                          }}
                        >
                          <MenuItem value="" sx={{ fontSize: "0.75rem" }}>
                            <em>Libre</em>
                          </MenuItem>
                          {kitchens
                            .filter((kitchen) => kitchen.isActive)
                            .map((kitchen) => (
                              <MenuItem
                                key={kitchen.id}
                                value={kitchen.id}
                                sx={{ fontSize: "0.75rem" }}
                              >
                                {kitchen.name}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    ))}
                    {!cook.workDays?.length && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ gridColumn: "1 / -1" }}
                      >
                        Este cocinero no tiene días laborables configurados.
                      </Typography>
                    )}
                  </Box>
                  <Box display="flex" gap={1} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={cancelEditing}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => void saveAssignments(cook.id)}
                    >
                      Guardar Horario
                    </Button>
                  </Box>
                </>
              ) : (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {assignedDays.length > 0 ? (
                    assignedDays.map(({ day, kitchen }) => (
                      <Box
                        key={day.value}
                        sx={{
                          px: 1.5,
                          py: 1,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "primary.main",
                          bgcolor: "primary.dark",
                          color: "primary.contrastText",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          flex: "1 1 0",
                          minWidth: 60,
                        }}
                      >
                        <Typography variant="caption" fontWeight="bold">
                          {day.label.slice(0, 3)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.65rem",
                            opacity: 0.9,
                            textAlign: "center",
                            mt: 0.5,
                          }}
                        >
                          {kitchen.name}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: "italic", py: 1 }}
                    >
                      No hay días asignados para este cocinero.
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          );
        })}

        {cooks.length === 0 && (
          <Typography textAlign="center" color="text.secondary" py={4}>
            No hay cocineros registrados.
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
