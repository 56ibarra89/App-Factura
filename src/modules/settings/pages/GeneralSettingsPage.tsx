import { Box, Container, Grid } from "@mui/material";
import { BackButton, PageHeader } from "../../../shared/ui";

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
      <Box>
        <PageHeader
          title="Control General e Idioma"
          startContent={<BackButton to="/admin" />}
        />

        <Container maxWidth={false} disableGutters sx={{ mt: 3 }}>
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

