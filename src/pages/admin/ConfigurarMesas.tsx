import { Box, Typography, Button, Paper, TextField, Divider, IconButton, Grid, alpha } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { useMesasConfig } from "../../hooks/useMesasConfig";
import { LOGIN_COLORS, LOGIN_GRADIENTS } from "../../theme/loginTheme";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function ConfigurarMesas() {
  const navigate = useNavigate();
  const { floorsConfig, updateFloorTables } = useMesasConfig();

  const handleGoBack = () => {
    navigate("/admin");
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
          <IconButton onClick={handleGoBack} sx={{ bgcolor: "white", boxShadow: 1, mr: 2, "&:hover": { bgcolor: "grey.100" } }}>
            <ArrowBackIcon color="primary" />
          </IconButton>
        }
      />

      <Paper elevation={0} sx={{ mt: 4, borderRadius: 5, p: { xs: 3, md: 5 }, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}>
        <Box mb={4}>
          <Typography variant="h5" fontWeight="900" color="primary" display="flex" alignItems="center" gap={1}>
            <CheckCircleIcon /> Distribución de Mesas por Planta
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={1}>
            Ingresa la cantidad de mesas que estarán disponibles en cada una de las áreas del restaurante. La numeración de las mesas se reiniciará automáticamente por cada planta. Si una planta tiene "0", se ocultará de la vista principal.
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
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: alpha(LOGIN_COLORS.primary, 0.02),
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: LOGIN_COLORS.primary,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.05)'
                  }
                }}
              >
                <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2, color: 'text.primary' }}>
                  {floor.name}
                </Typography>
                <TextField
                  fullWidth
                  label="Número de Mesas"
                  type="number"
                  variant="outlined"
                  value={floor.tableCount === 0 ? "" : floor.tableCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    updateFloorTables(floor.id, Math.max(0, val));
                  }}
                  inputProps={{ min: 0 }}
                  sx={{ bgcolor: 'white' }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4 }} />
        
        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            onClick={() => alert("Configuración guardada en el local storage de forma automática.")}
            sx={{
              px: 5, py: 1.5,
              borderRadius: 8,
              fontWeight: 800,
              textTransform: "none",
              fontSize: "1.05rem",
              background: LOGIN_COLORS.primary,
              boxShadow: `0 8px 24px ${LOGIN_COLORS.primaryHoverShadow}`,
              "&:hover": { background: LOGIN_COLORS.primaryDark, transform: "translateY(-2px)" },
            }}
          >
            Guardar Configuración
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
