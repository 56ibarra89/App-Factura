import {
  Alert,
  Box,
  Divider,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../../components/BackButton";
import PageHeader from "../../components/PageHeader";
import FloorConfigurationGrid from "../../components/Admin/Mesas/FloorConfigurationGrid";
import FloorManagementDialogs from "../../components/Admin/Mesas/FloorManagementDialogs";
import TableLayoutActions from "../../components/Admin/Mesas/TableLayoutActions";
import { useAdminTableLayout } from "../../hooks/useAdminTableLayout";

export default function ConfigurarMesas() {
  const navigate = useNavigate();
  const layout = useAdminTableLayout();

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: "background.default",
        pt: 4,
        pb: 8,
        px: { xs: 2, md: 6 },
      }}
    >
      <PageHeader
        title="Plano de Mesas y Áreas"
        startContent={<BackButton to="/admin" />}
      />

      <Paper
        elevation={0}
        sx={{
          mt: 4,
          borderRadius: 5,
          p: { xs: 3, md: 5 },
          boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
        }}
      >
        <Box mb={4}>
          <Typography
            variant="h5"
            fontWeight="900"
            color="primary"
            display="flex"
            alignItems="center"
            gap={1}
          >
            <CheckCircleIcon /> Distribución de Mesas por Planta
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={1}>
            Ingresa la cantidad de mesas disponibles en cada área. La numeración
            se reinicia por planta. Si una planta tiene "0", se ocultará de la
            vista principal.
            {layout.hasUnsavedChanges && (
              <Typography
                component="span"
                color="warning.main"
                fontWeight="bold"
              >
                {" "}
                ¡Tienes cambios sin guardar!
              </Typography>
            )}
          </Typography>
        </Box>

        <FloorConfigurationGrid
          floors={layout.floorsConfig}
          onAdd={layout.addFloor}
          onChangeTableCount={layout.updateTableCount}
          onDelete={layout.requestFloorDeletion}
          onRename={layout.requestFloorRename}
        />

        <Divider sx={{ my: 4 }} />

        <TableLayoutActions
          hasUnsavedChanges={layout.hasUnsavedChanges}
          isSaving={layout.isSaving}
          onBackToTables={() => navigate("/mesas")}
          onSave={layout.save}
        />
      </Paper>

      <Snackbar
        open={layout.showSuccess}
        autoHideDuration={2000}
        onClose={layout.hideSuccess}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={layout.hideSuccess}
          severity="success"
          variant="filled"
          sx={{ borderRadius: 3, fontWeight: "bold" }}
        >
          ✓ Configuración guardada correctamente
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(layout.error)}
        autoHideDuration={4000}
        onClose={layout.clearError}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={layout.clearError}
          severity="error"
          variant="filled"
          sx={{ borderRadius: 3, fontWeight: "bold" }}
        >
          {layout.error}
        </Alert>
      </Snackbar>

      <FloorManagementDialogs
        deleteCandidate={layout.deleteCandidate}
        editCandidate={layout.editCandidate}
        onCancelDelete={layout.cancelFloorDeletion}
        onConfirmDelete={layout.confirmFloorDeletion}
        onCancelEdit={layout.cancelFloorRename}
        onConfirmEdit={layout.confirmFloorRename}
        onEditNameChange={layout.updatePendingFloorName}
      />
    </Box>
  );
}
