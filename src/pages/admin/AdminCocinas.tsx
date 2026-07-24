import {
  Box,
  Grid,
} from "@mui/material";
import { BackButton } from "../../components/BackButton";
import PageHeader from "../../components/PageHeader";
import CookAssignmentsSection from "../../components/Admin/Cocinas/CookAssignmentsSection";
import KitchenManagementPanel from "../../components/Admin/Cocinas/KitchenManagementPanel";
import { useAdminCocinas } from "../../hooks/useAdminCocinas";

const AdminCocinas = () => {
  const kitchenManager = useAdminCocinas();

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
        title="Gestión de Cocinas"
        startContent={<BackButton to="/admin" />}
      />

      <Grid container spacing={4} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <KitchenManagementPanel manager={kitchenManager} />
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
          <CookAssignmentsSection kitchens={kitchenManager.kitchens} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminCocinas;
