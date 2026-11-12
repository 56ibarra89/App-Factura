import {
  Box,
  Container,
  Typography,
} from "@mui/material";
import { BackButton } from "../../../shared/ui";
import PromotionDialogs from "../ui/admin/PromotionDialogs";
import PromotionsWorkspace from "../ui/admin/PromotionsWorkspace";
import { useAdminPromotions } from "../hooks/useAdminPromotions";

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
      <Box>
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

        <Container maxWidth="xl" disableGutters sx={{ mt: 3 }}>
          <PromotionsWorkspace promotions={promotions} />
        </Container>
      </Box>

      <PromotionDialogs promotions={promotions} />
    </Box>
  );
};

export default AdminPromociones;
