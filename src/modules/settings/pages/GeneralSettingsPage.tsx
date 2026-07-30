import { Box, Container, Typography, Grid } from "@mui/material";
import { BackButton, PageHeader } from "../../../shared/ui";

import { LOGIN_COLORS } from "../../../shared/theme";
import { useGeneralSettings } from "../hooks/useGeneralSettings";
import { CurrencyCard } from "../ui/CurrencyCard";
import { CashRegisterBehaviorCard } from "../ui/CashRegisterBehaviorCard";

const GeneralSettingsPage = () => {
  const { config, updatePreference, saveConfig } = useGeneralSettings();

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: 'background.default',
        pt: 4,
        pb: 8,
        px: { xs: 2, md: 6 },
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {/* Decorative Background Element */}
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
          pointerEvents: "none"
        }}
      />

      <Box position="relative" zIndex={1}>
        <PageHeader
          title="Control General e Idioma"
          startContent={<BackButton to="/admin" />}
        />

        <Box sx={{ mt: 2, mb: 5, pl: 1 }}>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 650 }}>
            Visualiza y define el comportamiento fundamental de tu sistema. Establece la divisa local, la apariencia y las reglas estrictas con las que tus cajeros abrirán o cerrarán sus turnos en el Punto de Venta.
          </Typography>
        </Box>

        <Container maxWidth={false} disableGutters>
          <Grid container spacing={4}>
            {/* Currency Block */}
            <Grid size={{ xs: 12, md: 6 }}>
              <CurrencyCard 
                config={config} 
                onUpdate={updatePreference} 
                onSave={saveConfig}
              />
            </Grid>

            {/* Behavior Block */}
            <Grid size={{ xs: 12, md: 6 }}>
              <CashRegisterBehaviorCard 
                config={config} 
                onUpdate={updatePreference} 
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default GeneralSettingsPage;
