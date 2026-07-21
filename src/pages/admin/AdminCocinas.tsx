import { Box, Button, TextField, Typography, Paper, IconButton, Switch, FormControlLabel, FormControl, InputLabel, Select, MenuItem, Grid } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";
import { BackButton } from "../../components/BackButton";
import PageHeader from "../../components/PageHeader";
import { useAdminCocinas } from "../../hooks/useAdminCocinas";
import { useCookAssignments } from "../../hooks/useCookAssignments";

const AdminCocinas = () => {
  const {
    kitchens,
    newKitchenName,
    setNewKitchenName,
    editingId,
    editingName,
    setEditingName,
    editingActive,
    setEditingActive,
    handleAdd,
    handleEditSave,
    handleDelete,
    handleEditStart,
    handleEditCancel,
  } = useAdminCocinas();

  return (
    <Box minHeight="100vh" sx={{ bgcolor: "background.default", pt: 4, pb: 8, px: { xs: 2, md: 6 } }}>
      <Box mb={4} display="flex" alignItems="center" gap={2}>
        <BackButton to="/admin" />
        <PageHeader title="Gestión de Cocinas" />
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
            <Typography variant="h6" mb={2}>Agregar Nueva Cocina</Typography>
            <Box display="flex" gap={2}>
              <TextField
                size="small"
                fullWidth
                label="Nombre de la Cocina"
                value={newKitchenName}
                onChange={(e) => setNewKitchenName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <Button variant="contained" onClick={handleAdd} disabled={!newKitchenName.trim()}>
                Agregar
              </Button>
            </Box>
          </Paper>

          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" mb={3}>Cocinas Registradas</Typography>
            <Box display="flex" flexDirection="column" gap={2} sx={{ maxHeight: 400, overflowY: 'auto', pr: 1, pb: 1 }}>
              {kitchens.map((k) => (
                <Box key={k.id} display="flex" alignItems="center" justifyContent="space-between" p={2} border="1px solid" borderColor="divider" borderRadius={2}>
                  {editingId === k.id ? (
                    <Box display="flex" alignItems="center" gap={2} flex={1}>
                      <TextField
                        size="small"
                        fullWidth
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                      />
                      <FormControlLabel
                        control={<Switch checked={editingActive} onChange={(e) => setEditingActive(e.target.checked)} />}
                        label={editingActive ? "Activo" : "Inactivo"}
                      />
                      <Button variant="contained" size="small" onClick={handleEditSave}>Guardar</Button>
                      <Button variant="outlined" size="small" onClick={handleEditCancel}>Cancelar</Button>
                    </Box>
                  ) : (
                    <>
                      <Box>
                        <Typography fontWeight="bold">{k.name}</Typography>
                        <Typography variant="body2" color={k.isActive ? "success.main" : "error.main"}>
                          {k.isActive ? "Activo" : "Inactivo"}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton onClick={() => handleEditStart(k.id, k.name, k.isActive)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(k.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </>
                  )}
                </Box>
              ))}
              {kitchens.length === 0 && (
                <Typography textAlign="center" color="text.secondary">No hay cocinas registradas.</Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <CookAssignmentsSection kitchens={kitchens} />
        </Grid>
      </Grid>
    </Box>
  );
};

const CookAssignmentsSection = ({ kitchens }: { kitchens: any[] }) => {
  const { cooks, isLoading, updateAssignments } = useCookAssignments();
  const [editingCookId, setEditingCookId] = useState<string | null>(null);
  const [localAssignments, setLocalAssignments] = useState<Record<string, string | null>>({});

  const daysOfWeek = [
    { value: 'MONDAY', label: 'Lunes' },
    { value: 'TUESDAY', label: 'Martes' },
    { value: 'WEDNESDAY', label: 'Miércoles' },
    { value: 'THURSDAY', label: 'Jueves' },
    { value: 'FRIDAY', label: 'Viernes' },
    { value: 'SATURDAY', label: 'Sábado' },
    { value: 'SUNDAY', label: 'Domingo' },
  ];

  const handleEditClick = (cook: any) => {
    setEditingCookId(cook.id);
    const initialAssignments: Record<string, string | null> = {};
    daysOfWeek.forEach(day => {
      const assignment = cook.kitchenAssignments?.find((a: any) => a.dayOfWeek === day.value);
      initialAssignments[day.value] = assignment ? assignment.kitchenId : '';
    });
    setLocalAssignments(initialAssignments);
  };

  const handleSaveClick = async (cookId: string) => {
    const formattedAssignments = Object.keys(localAssignments).map(day => ({
      dayOfWeek: day,
      kitchenId: localAssignments[day] || null,
    }));
    await updateAssignments(cookId, formattedAssignments);
    setEditingCookId(null);
  };

  const handleCancelClick = () => {
    setEditingCookId(null);
    setLocalAssignments({});
  };

  if (isLoading) {
    return <Typography textAlign="center">Cargando cocineros...</Typography>;
  }

  return (
    <Paper sx={{ p: 4, borderRadius: 3, width: '100%' }}>
      <Typography variant="h6" mb={3}>Asignación de Horarios por Cocinero</Typography>
      <Box display="flex" flexDirection="column" gap={3} sx={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', pr: 1, pb: 1 }}>
        {cooks.map((cook) => (
          <Box key={cook.id} p={3} border="1px solid" borderColor="divider" borderRadius={3} bgcolor="background.default" sx={{ position: 'relative', overflow: 'hidden' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                {cook.firstName} {cook.lastName}
              </Typography>
              {editingCookId !== cook.id && (
                <IconButton size="small" color="primary" onClick={() => handleEditClick(cook)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            {editingCookId === cook.id ? (
              <Box>
                <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(90px, 1fr))" gap={1.5} mb={3}>
                  {daysOfWeek
                    .filter((day) => cook.workDays?.includes(day.value))
                    .map((day) => (
                    <FormControl key={day.value} size="small" fullWidth>
                      <Typography variant="caption" mb={0.5} color="text.secondary" fontWeight="bold">{day.label}</Typography>
                      <Select
                        size="small"
                        sx={{ fontSize: '0.75rem', '& .MuiSelect-select': { py: 0.75 } }}
                        value={localAssignments[day.value] || ''}
                        onChange={(e) => setLocalAssignments({ ...localAssignments, [day.value]: e.target.value as string })}
                      >
                        <MenuItem value="" sx={{ fontSize: '0.75rem' }}><em>Libre</em></MenuItem>
                        {kitchens.filter(k => k.isActive).map(k => (
                          <MenuItem key={k.id} value={k.id} sx={{ fontSize: '0.75rem' }}>{k.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ))}
                  {(!cook.workDays || cook.workDays.length === 0) && (
                    <Typography variant="body2" color="text.secondary" sx={{ gridColumn: '1 / -1' }}>
                      Este cocinero no tiene días laborables configurados.
                    </Typography>
                  )}
                </Box>
                <Box display="flex" gap={1} justifyContent="flex-end">
                  <Button variant="outlined" size="small" onClick={handleCancelClick}>Cancelar</Button>
                  <Button variant="contained" size="small" onClick={() => handleSaveClick(cook.id)}>Guardar Horario</Button>
                </Box>
              </Box>
            ) : (
              <Box display="flex" flexWrap="wrap" gap={1}>
                {daysOfWeek.map(day => {
                  const assignment = cook.kitchenAssignments?.find((a: any) => a.dayOfWeek === day.value);
                  const kitchen = kitchens.find(k => k.id === assignment?.kitchenId);
                  return { day, kitchen, isAssigned: !!kitchen };
                }).filter(d => d.isAssigned).length > 0 ? (
                  daysOfWeek.map(day => {
                    const assignment = cook.kitchenAssignments?.find((a: any) => a.dayOfWeek === day.value);
                    const kitchen = kitchens.find(k => k.id === assignment?.kitchenId);
                    const isAssigned = !!kitchen;
                    if (!isAssigned) return null;
                    return (
                      <Box 
                        key={day.value} 
                        sx={{ 
                          px: 1.5, py: 1, 
                          borderRadius: 2, 
                          border: '1px solid',
                          borderColor: 'primary.main',
                          bgcolor: 'primary.dark',
                          color: 'primary.contrastText',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', 
                          flex: '1 1 0', minWidth: 60,
                          transition: 'all 0.2s'
                        }}
                      >
                        <Typography variant="caption" fontWeight="bold">{day.label.slice(0, 3)}</Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.9, textAlign: 'center', mt: 0.5 }}>
                          {kitchen.name}
                        </Typography>
                      </Box>
                    );
                  })
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 1 }}>
                    No hay días asignados para este cocinero.
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        ))}
        {cooks.length === 0 && (
          <Typography textAlign="center" color="text.secondary" py={4}>No hay cocineros registrados.</Typography>
        )}
      </Box>
    </Paper>
  );
};

export default AdminCocinas;
