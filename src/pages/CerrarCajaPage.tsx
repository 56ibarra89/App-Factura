import { Box, Typography, Divider, Grid, Paper, Alert } from "@mui/material";
import { AuthLayout } from "../components/auth/AuthLayout";
import { BrandingPanel } from "../components/auth/BrandingPanel";
import { CerrarCajaForm } from "../components/CerrarCajaForm";
import { useCerrarCaja } from "../hooks/useCerrarCaja";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import ShiftTicketPrint from "../components/ShiftTicketPrint";

export default function CerrarCajaPage() {
  const {
    amount,
    setAmount,
    loading,
    error,
    sales,
    expectedCash,
    canSubmit,
    currentShift,
    printShift,
    blindCashCount,
    handleSubmit,
    handleCancel,
  } = useCerrarCaja();

  if (!currentShift) return null;

  return (
    <AuthLayout error="" onClearError={() => {}}>
      <BrandingPanel
        title={
          <>
            Cierre de
            <br />
            Turno
          </>
        }
        subtitle="Verifica que el efectivo físico coincida con las ventas registradas por el sistema."
      />
      <Box
        sx={{
          flex: 1,
          p: { xs: 4, md: 6 },
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.paper",
          overflowY: "auto"
        }}
      >
        <Typography variant="h4" fontWeight="900" color="text.primary" mb={1}>
          Arqueo de Caja
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Resumen del turno de <strong>{currentShift.cashierName}</strong>
          {currentShift.cashRegisterName && (
            <> en <strong>{currentShift.cashRegisterName}</strong></>
          )}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {!blindCashCount && (
          <>
            <Grid container spacing={2} mb={4}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                  <LocalAtmIcon color="success" />
                  <Typography variant="caption" display="block">Ventas Efectivo</Typography>
                  <Typography variant="h6" fontWeight="bold">C${sales.cash.toFixed(2)}</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                  <CreditCardIcon color="primary" />
                  <Typography variant="caption" display="block">Ventas Tarjeta</Typography>
                  <Typography variant="h6" fontWeight="bold">C${sales.card.toFixed(2)}</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                  <SmartphoneIcon color="info" />
                  <Typography variant="caption" display="block">Ventas App</Typography>
                  <Typography variant="h6" fontWeight="bold">C${sales.app.toFixed(2)}</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ bgcolor: 'rgba(211, 47, 47, 0.05)', p: 2, borderRadius: 3, mb: 4, border: '1px dashed #d32f2f' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body1" fontWeight="bold">Total Teórico en Efectivo:</Typography>
                <Typography variant="h5" fontWeight="900" color="primary.main">
                  C${expectedCash.toFixed(2)}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                (Apertura: C${currentShift.openingAmount.toFixed(2)} + Ventas: C${sales.cash.toFixed(2)})
              </Typography>
            </Box>
          </>
        )}

        <Divider sx={{ mb: 4 }} />

        <CerrarCajaForm
          amount={amount}
          onChangeAmount={setAmount}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          canSubmit={canSubmit}
          openingAmount={currentShift.openingAmount}
          loading={loading}
        />

        {printShift && <ShiftTicketPrint shift={printShift} />}
      </Box>
    </AuthLayout>
  );
}
