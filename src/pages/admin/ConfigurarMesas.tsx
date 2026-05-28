import { useState } from "react";
import { Box, Typography, Button, Paper, TextField, Divider, Grid, alpha, Snackbar, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress } from "@mui/material";
import { BackButton } from "../../components/BackButton";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { useMesasConfig } from "../../hooks/useMesasConfig";
import { LOGIN_COLORS, LOGIN_GRADIENTS } from "../../theme/loginTheme";
import { useAuth } from "../../context/AuthContext";
import { logService } from "../../services/logService";

export default function ConfigurarMesas() {
  const navigate = useNavigate();
  const { username, role } = useAuth();
  const { floorsConfig, updateFloorTables, addFloor, removeFloor, updateFloorName, error, clearError, saveAllChanges, hasUnsavedChanges, isSaving } = useMesasConfig();
  const [showSuccess, setShowSuccess] = useState(false);
  const [deleteData, setDeleteData] = useState<{ id: number; name: string } | null>(null);

  const handleUpdate = (floorId: number, val: string) => {
    const count = parseInt(val) || 0;
    updateFloorTables(floorId, Math.max(0, count));
  };

  const handleAddFloor = () => {
    const name = `Nueva Planta ${floorsConfig.length + 1}`;
    addFloor(name);
  };

  const handleDeleteFloor = (floorId: number, name: string) => {
    setDeleteData({ id: floorId, name });
  };

  const handleConfirmDelete = () => {
    if (deleteData) {
      removeFloor(deleteData.id);
      setDeleteData(null);
    }
  };

  const handleUpdateName = (floorId: number, name: string) => {
    updateFloorName(floorId, name);
  };

  const handleSave = async () => {
    const success = await saveAllChanges();
    if (success) {
      setShowSuccess(true);
      logService.log(
        username, 
        role, 
        "CONFIG_CHANGE", 
        `Cambio en plano de mesas: Configuración actualizada manualmente`
      );
    }
  };

  return (
    <Box
      minHeight="100vh"
      sx={{
        background: LOGIN_GRADIENTS.pageBackground,
        pt: 4,
        pb: 8,
        px: { xs: 2, md: 6 },
      }}
    >
      <PageHeader
        title="Plano de Mesas y Áreas"
        startContent={<BackButton to="/admin" />}
      />

      <Paper elevation={0} sx={{ mt: 4, borderRadius: 5, p: { xs: 3, md: 5 }, boxShadow: "0 12px 40px rgba(0,0,0,0.08)" }}>
        <Box mb={4}>
          <Typography variant="h5" fontWeight="900" color="primary" display="flex" alignItems="center" gap={1}>
            <CheckCircleIcon /> Distribución de Mesas por Planta
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={1}>
            Ingresa la cantidad de mesas disponibles en cada área. La numeración se reinicia por planta.
            Si una planta tiene "0", se ocultará de la vista principal. 
            {hasUnsavedChanges && (
              <Typography component="span" color="warning.main" fontWeight="bold">
                {" "}¡Tienes cambios sin guardar!
              </Typography>
            )}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {floorsConfig.map((floor) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={floor.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: floor.tableCount > 0 ? alpha(LOGIN_COLORS.primary, 0.3) : "divider",
                  bgcolor: floor.tableCount > 0 ? alpha(LOGIN_COLORS.primary, 0.03) : "white",
                  transition: "all 0.2s",
                  position: "relative",
                  "&:hover": {
                    borderColor: LOGIN_COLORS.primary,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.05)"
                  }
                }}
              >
                <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex" }}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      document.getElementById(`floor-name-${floor.id}`)?.focus();
                    }}
                    sx={{ color: "text.secondary" }}
                    title="Editar nombre"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteFloor(floor.id, floor.name)}
                    title="Eliminar planta"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Box display="flex" flexDirection="column" gap={1} mb={2} pr={7}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TextField
                      id={`floor-name-${floor.id}`}
                      variant="standard"
                      value={floor.name}
                      onChange={(e) => handleUpdateName(floor.id, e.target.value)}
                      InputProps={{ disableUnderline: true }}
                      sx={{
                        "& input": {
                          fontWeight: "800",
                          fontSize: "1.1rem",
                          color: "text.primary",
                          p: 0,
                        }
                      }}
                    />
                  </Box>
                  {floor.tableCount > 0 && (
                    <Typography variant="caption" fontWeight="bold" color="primary" sx={{ bgcolor: alpha(LOGIN_COLORS.primary, 0.08), px: 1, py: 0.3, borderRadius: 1, alignSelf: "flex-start" }}>
                      {floor.tableCount} mesas
                    </Typography>
                  )}
                </Box>
                <TextField
                  fullWidth
                  label="Número de Mesas"
                  type="number"
                  variant="outlined"
                  value={floor.tableCount === 0 ? "" : floor.tableCount}
                  onChange={(e) => handleUpdate(floor.id, e.target.value)}
                  inputProps={{ min: 0 }}
                  sx={{ bgcolor: "white" }}
                />
              </Paper>
            </Grid>
          ))}
          
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleAddFloor}
              sx={{
                height: "100%",
                minHeight: 140,
                borderRadius: 4,
                borderStyle: "dashed",
                borderWidth: 2,
                color: "text.secondary",
                borderColor: "divider",
                "&:hover": {
                  borderStyle: "dashed",
                  borderWidth: 2,
                }
              }}
            >
              <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                <AddIcon fontSize="large" />
                <Typography fontWeight="bold">Añadir Planta</Typography>
              </Box>
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Button
            variant="outlined"
            onClick={() => navigate("/mesas")}
            sx={{ borderRadius: 4, fontWeight: "bold", textTransform: "none", color: "text.secondary", borderColor: "divider" }}
          >
            ← Volver a Vista de Mesas
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{ borderRadius: 4, fontWeight: "bold", textTransform: "none", px: 4, py: 1.5, boxShadow: hasUnsavedChanges ? "0 4px 14px rgba(0,0,0,0.2)" : "none" }}
          >
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </Box>
      </Paper>

      {/* Snackbar de confirmación visual */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={2000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          variant="filled"
          sx={{ borderRadius: 3, fontWeight: "bold" }}
        >
          ✓ Configuración guardada correctamente
        </Alert>
      </Snackbar>

      {/* Snackbar de error */}
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={clearError}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={clearError}
          severity="error"
          variant="filled"
          sx={{ borderRadius: 3, fontWeight: "bold" }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Diálogo de Confirmación para Eliminar */}
      <Dialog
        open={deleteData !== null}
        onClose={() => setDeleteData(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro que deseas eliminar la planta <strong>"{deleteData?.name}"</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteData(null)} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disableElevation
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
