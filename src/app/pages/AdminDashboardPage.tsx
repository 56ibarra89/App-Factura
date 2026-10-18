import { useState } from "react";
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
import {
  adminModules,
  type AdminCategory,
} from "../navigation/adminModules";
import { DeliveryPricesDialog } from "../../modules/delivery";
import { useAuth } from "../../modules/auth";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [openDeliveryDialog, setOpenDeliveryDialog] = useState(false);
  const { hasPermission } = useAuth();

  const renderCategory = (categoryName: AdminCategory) => {
    const modules = adminModules.filter(
      (module) =>
        module.category === categoryName && hasPermission(module.permission),
    );
    if (modules.length === 0) return null;

    return (
      <Box key={categoryName} sx={{ mb: 4 }}>
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
                onClick={() => {
                  if (
                    module.id === "tarifas-delivery" ||
                    module.actionId === "OPEN_DELIVERY_PRICES"
                  ) {
                    setOpenDeliveryDialog(true);
                  } else if (module.path) {
                    navigate(module.path);
                  } else {
                    module.action?.();
                  }
                }}
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
      <Box>
        <PageHeader
          title="Centro de Control"
          startContent={<BackButton to="/home" />}
        />

        <Container maxWidth="xl" disableGutters sx={{ mt: 3 }}>
          {renderCategory("General")}
          {renderCategory("Operativa")}
          {renderCategory("Hardware y Sistema")}
        </Container>
      </Box>

      <DeliveryPricesDialog
        open={openDeliveryDialog}
        onClose={() => setOpenDeliveryDialog(false)}
      />
    </Box>
  );
};

export default AdminDashboardPage;

