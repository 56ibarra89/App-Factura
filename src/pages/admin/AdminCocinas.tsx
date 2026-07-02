import { Box, Button, TextField, Typography, Paper, IconButton, Switch, FormControlLabel } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { BackButton } from "../../components/BackButton";
import PageHeader from "../../components/PageHeader";
import { useAdminCocinas } from "../../hooks/useAdminCocinas";

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

      <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 600, mx: "auto", mb: 4 }}>
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

      <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h6" mb={3}>Cocinas Registradas</Typography>
        <Box display="flex" flexDirection="column" gap={2}>
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
    </Box>
  );
};

export default AdminCocinas;
