import { Box, Grid } from "@mui/material";
import PageHeader from "../components/PageHeader";
import AccountMenu from "../components/AccountMenu";
import { LOGIN_GRADIENTS } from "../theme/loginTheme";
import { BackButton } from "../components/BackButton";
import { useAccountSettings } from "../hooks/useAccountSettings";
import { ProfileCard } from "../components/cuenta/ProfileCard";
import { AccountSettingsForm } from "../components/cuenta/AccountSettingsForm";

export default function MiCuenta() {
  const { data, loading, error, success, handleChange, handleSave } = useAccountSettings();

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
        {/* Columna Izquierda: Tarjeta de Perfil Oscura */}
        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
          <ProfileCard username={data.nombreUsuario} fullName={data.nombreCompleto} />
        </Grid>

        {/* Columna Derecha: Formularios Blancos */}
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
    </Box>
  );
}
