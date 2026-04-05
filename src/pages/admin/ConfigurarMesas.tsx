import { useState } from "react";
import { Box, Typography, Button, Paper, TextField, Divider, IconButton, Grid, alpha, Snackbar, Alert } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { useMesasConfig } from "../../hooks/useMesasConfig";
import { LOGIN_COLORS, LOGIN_GRADIENTS } from "../../theme/loginTheme";

export default function ConfigurarMesas() {
  const navigate = useNavigate();
  const { floorsConfig, updateFloorTables } = useMesasConfig();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleUpdate = (floorId: number, val: string) => {
    const count = parseInt(val) || 0;
    updateFloorTables(floorId, Math.max(0, count));
    setShowSuccess(true);
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
        startContent={
          <IconButton
            onClick={() => navigate("/admin")}
            sx={{ bgcolor: "white", boxShadow: 1, mr: 2, "&:hover": { bgcolor: "grey.100" } }}
          >
            <ArrowBackIcon color="primary" />
          </IconButton>
        }
      />

      <Paper elevation={0} sx={{ mt: 4, borderRadius: 5, p: { xs: 3, md: 5 }, boxShadow: "0 12px 40px rgba(0,0,0,0.08)" }}>
        <Box mb={4}>
          <Typography variant="h5" fontWeight="900" color="primary" display="flex" alignItems="center" gap={1}>
            <CheckCircleIcon /> Distribución de Mesas por Planta
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={1}>
            Ingresa la cantidad de mesas disponibles en cada área. La numeración se reinicia por planta.
            Si una planta tiene "0", se ocultará de la vista principal. Los cambios se guardan <strong>automáticamente</strong>.
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
                  "&:hover": {
                    borderColor: LOGIN_COLORS.primary,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.05)"
                  }
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1" fontWeight="800" color="text.primary">
                    {floor.name}
                  </Typography>
                  {floor.tableCount > 0 && (
                    <Typography variant="caption" fontWeight="bold" color="primary" sx={{ bgcolor: alpha(LOGIN_COLORS.primary, 0.08), px: 1, py: 0.3, borderRadius: 1 }}>
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
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={1}>
            <SaveIcon sx={{ fontSize: 16 }} />
            Los cambios se guardan automáticamente al escribir.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate("/mesas")}
            sx={{ borderRadius: 4, fontWeight: "bold", textTransform: "none" }}
          >
            Vista previa de Mesas →
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
    </Box>
  );
}
