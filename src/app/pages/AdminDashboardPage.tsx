import {
  Box,
  Container,
  Typography,
  Divider,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { BackButton, PageHeader } from "../../shared/ui";
import { AdminModuleCard } from "../ui/AdminModuleCard";
import { LOGIN_COLORS } from "../../shared/theme";
import {
  adminModules,
  type AdminCategory,
} from "../navigation/adminModules";

const AdminDashboardPage = () => {
  const navigate = useNavigate();

  // Helper para renderizar categorías
  const renderCategory = (categoryName: AdminCategory) => {
    const modules = adminModules.filter((m) => m.category === categoryName);
    if (modules.length === 0) return null;

    return (
      <Box key={categoryName} sx={{ mb: 6 }}>
        <Typography
          variant="h5"
          fontWeight={800}
          color="text.primary"
          sx={{ mb: 1 }}
        >
          {categoryName}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {modules.map((module) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={module.id}>
              <AdminModuleCard
                title={module.title}
                description={module.description}
                icon={module.icon}
                onClick={() =>
                  module.path ? navigate(module.path) : module.action?.()
                }
                disabled={module.disabled}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: 'background.default',
        pt: 4,
        pb: 8,
        px: { xs: 2, md: 6 },
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Fondo decorativo enorme para darle "aire" de Control Center */}
      <Box
        sx={{
          position: "absolute",
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          background: `radial-gradient(circle, ${LOGIN_COLORS.primarySubtle} 0%, rgba(255,255,255,0) 70%)`,
          borderRadius: "50%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <Box position="relative" zIndex={1}>
        <PageHeader
          title="Centro de Control"
          startContent={<BackButton to="/home" />}
        />

        {/* Hero Section */}
        <Box sx={{ mt: 2, mb: 6, pl: 1 }}>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              maxWidth: "100%",
              lineHeight: 1.8,
              fontSize: "1.1rem",
              "& b": { color: LOGIN_COLORS.primary, fontWeight: 800 },
            }}
          >
            Bienvenido al panel de administración avanzado. Agrupamos todas las
            herramientas necesarias para que tengas el <b>control absoluto</b>{" "}
            sobre la configuración, escalabilidad y hardware de tu negocio, con
            un diseño intuitivo.
          </Typography>
        </Box>

        <Container maxWidth="xl" disableGutters>
          {renderCategory("General")}
          {renderCategory("Operativa")}
          {renderCategory("Hardware y Sistema")}
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboardPage;
