import {
  Box,
  Container,
  Typography,
} from "@mui/material";
import { BackButton } from "../../components/BackButton";
import PromotionDialogs from "../../components/Admin/Promociones/PromotionDialogs";
import PromotionsWorkspace from "../../components/Admin/Promociones/PromotionsWorkspace";
import { useAdminPromotions } from "../../hooks/useAdminPromotions";
import { LOGIN_COLORS } from "../../theme/loginTheme";

const AdminPromociones = () => {
  const promotions = useAdminPromotions();

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: "background.default",
        pt: 4,
        pb: 8,
        px: { xs: 2, md: 6 },
        position: "relative",
        overflowX: "hidden",
      }}
    >
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
        <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
          <BackButton to="/admin" />
          <Typography
            variant="h4"
            fontWeight={800}
            color="text.primary"
            sx={{ letterSpacing: "-1px" }}
          >
            Gestión de Promociones
          </Typography>
        </Box>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 5, pl: 1 }}
        >
          Gestiona descuentos inteligentes, horarios de <b>Happy Hour</b>,
          campañas de <b>cupones personalizados</b> y{" "}
          <b>certificados de producto</b> desde una sola sección.
        </Typography>

        <Container maxWidth="xl" disableGutters>
          <PromotionsWorkspace promotions={promotions} />
        </Container>
      </Box>

      <PromotionDialogs promotions={promotions} />
    </Box>
  );
};

export default AdminPromociones;
