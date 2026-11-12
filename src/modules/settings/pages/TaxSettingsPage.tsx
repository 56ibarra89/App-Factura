import { Box, Container, Typography, Grid } from "@mui/material";
import { BackButton, PageHeader } from "../../../shared/ui";
import { useTaxConfig } from "../hooks/useTaxConfig";
import { TaxConfigCard } from "../ui/TaxConfigCard";
import { TaxExemptionToggle } from "../ui/TaxExemptionToggle";

const TaxSettingsPage = () => {
  const { taxes, isExonerated, toggleExoneration, updateTaxRate } = useTaxConfig();

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
          title="Administración de Impuestos"
          startContent={<BackButton to="/admin" />}
        />

        <Container maxWidth={false} disableGutters sx={{ mt: 3 }}>
          <Grid container spacing={4}>
            {/* Left Column: Lista de impuestos */}
            <Grid size={{ xs: 12, lg: 7 }}>
              <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ mb: 3 }}>
                Tasas Configuradas
              </Typography>
              <Grid container spacing={3}>
                {taxes.map((tax) => (
                  <Grid size={{ xs: 12 }} key={tax.id}>
                    <TaxConfigCard
                      tax={tax}
                      onUpdate={updateTaxRate}
                      disabled={isExonerated}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Right Column: Control de Exoneración */}
            <Grid size={{ xs: 12, lg: 5 }}>
              <Typography variant="h5" fontWeight={800} color="transparent" sx={{ mb: 3, userSelect: 'none' }}>
                -
              </Typography>
              <TaxExemptionToggle
                isExonerated={isExonerated}
                onToggle={toggleExoneration}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default TaxSettingsPage;

