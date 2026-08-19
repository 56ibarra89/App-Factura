import { Box, Grid } from "@mui/material";
import { BackButton, PageHeader } from "../../../shared/ui";
import { useAccountSettings } from "../hooks/useAccountSettings";
import AccountMenu from "../ui/AccountMenu";
import { ProfileCard } from "../ui/profile/ProfileCard";
import { AccountSettingsForm } from "../ui/profile/AccountSettingsForm";
import { LogoutAllDevicesModal } from "../ui/profile/LogoutAllDevicesModal";

export default function MyAccountPage() {
  const { data, loading, error, success, showLogoutModal, setShowLogoutModal, handleChange, handleSave } = useAccountSettings();

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: 'background.default',
        pt: 4,
        pb: 4,
        px: { xs: 2, md: 6 },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PageHeader
        title="Mi Cuenta"
        startContent={<BackButton to="/home" />}
        actions={<AccountMenu />}
      />

      <Grid container spacing={4} sx={{ mt: 1, flex: 1 }}>
        {}
        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <ProfileCard username={data.nombreUsuario} fullName={data.nombreCompleto} />
        </Grid>

        {}
        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
          <AccountSettingsForm
            data={data}
            loading={loading}
            error={error}
            success={success}
            onChange={handleChange}
            onSave={handleSave}
          />
        </Grid>
      </Grid>

      <LogoutAllDevicesModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </Box>
  );
}

