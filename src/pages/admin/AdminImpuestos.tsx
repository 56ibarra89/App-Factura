import { Box, Container, Typography, Grid } from "@mui/material";
import { BackButton } from "../../components/BackButton";
import PageHeader from "../../components/PageHeader";
import { LOGIN_COLORS } from "../../theme/loginTheme";
import { useImpuestosConfig } from "../../hooks/useImpuestosConfig";
import { TaxConfigCard } from "../../components/Admin/TaxConfigCard";
import { TaxExemptionToggle } from "../../components/Admin/TaxExemptionToggle";

const AdminImpuestos = () => {
  const { taxes, isExonerated, toggleExoneration, updateTaxRate } = useImpuestosConfig();

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
          title="Administración de Impuestos"
          startContent={<BackButton to="/admin" />}
        />

        <Box sx={{ mt: 2, mb: 5, pl: 1 }}>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 650 }}>
            Administra las tasas de impuestos aplicadas a tu sistema de facturación. 
            Puedes realizar ajustes y activar planes de exoneración temporales en cumplimiento con la normativa.
          </Typography>
        </Box>

        <Container maxWidth={false} disableGutters>
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

export default AdminImpuestos;
