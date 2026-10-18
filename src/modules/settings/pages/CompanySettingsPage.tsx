import {
  Alert,
  Box,
  Container,
  Snackbar,
} from "@mui/material";
import {
  BackButton,
  ConfirmDialog,
  PageHeader,
} from "../../../shared/ui";
import CompanyIdentityCard from "../ui/company/CompanyIdentityCard";
import { useAdminCompanyIdentity } from "../hooks/useAdminCompanyIdentity";

const CompanySettingsPage = () => {
  const company = useAdminCompanyIdentity();

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
        <PageHeader
          title="Identidad de la Empresa"
          startContent={<BackButton to="/admin" />}
        />

        <Container maxWidth="md" disableGutters sx={{ mt: 3 }}>
          <CompanyIdentityCard
            config={company.config}
            loading={company.loading}
            fileInputRef={company.fileInputRef}
            onChange={company.updateField}
            onLogoChange={company.uploadLogo}
            onRemoveLogo={company.removeLogo}
            onReset={company.requestReset}
            onSave={company.save}
          />
        </Container>
      </Box>

      <Snackbar
        open={company.toastOpen}
        autoHideDuration={4000}
        onClose={company.closeToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={company.closeToast}
          severity="success"
          variant="filled"
          sx={{ width: "100%", borderRadius: 2, boxShadow: 3, fontWeight: 600 }}
        >
          {company.toastMessage}
        </Alert>
      </Snackbar>

      <ConfirmDialog
        open={company.confirmOpen}
        title="Restablecer Configuración"
        message="¿Estás seguro de que deseas eliminar el logotipo y restablecer toda la configuración de la empresa a sus valores por defecto? Esta acción no se puede deshacer."
        onClose={company.cancelReset}
        onConfirm={company.confirmReset}
      />
    </Box>
  );
};

export default CompanySettingsPage;
