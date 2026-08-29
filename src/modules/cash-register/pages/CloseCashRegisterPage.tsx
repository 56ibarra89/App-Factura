import {
  Box,
  Container,
  Paper,
  Typography,
  LinearProgress,
  Alert,
  Stack,
} from "@mui/material";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PersonIcon from "@mui/icons-material/Person";
import { BackButton, PageHeader } from "../../../shared/ui";
import { useCloseCashRegister } from "../hooks/useCloseCashRegister";
import { CloseCashRegisterForm } from "../ui/CloseCashRegisterForm";
import { ShiftCloseBlockersDialog } from "../ui/ShiftCloseBlockersDialog";
import ShiftTicketPrint from "../ui/ShiftTicketPrint";

export default function CloseCashRegisterPage() {
  const closeCashRegister = useCloseCashRegister();
  const displayShift =
    closeCashRegister.currentShift ?? closeCashRegister.printShift;

  if (!displayShift) return null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: { xs: 2, md: 3 },
        px: { xs: 2, md: 4 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="lg" disableGutters>
        <PageHeader
          title="Cierre de Turno y Arqueo de Caja"
          startContent={<BackButton to="/home" />}
        />
        {closeCashRegister.preflightLoading && (
          <LinearProgress sx={{ mb: 1.5, borderRadius: 1 }} />
        )}

        {closeCashRegister.error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {closeCashRegister.error}
          </Alert>
        )}

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 4,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 8px 32px rgba(0,0,0,0.04)",
          }}
        >
          {/* Barra Superior Compacta del Turno */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 1.5,
              px: 2,
              mb: 2.5,
              borderRadius: 2.5,
              bgcolor: "action.hover",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  p: 0.8,
                  borderRadius: 2,
                  bgcolor: "primary.main",
                  color: "#fff",
                  display: "flex",
                }}
              >
                <PointOfSaleIcon fontSize="small" />
              </Box>
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight="800"
                  color="text.primary"
                >
                  {displayShift.cashRegisterName || "Caja Principal"}
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <PersonIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary">
                    Cajero: <strong>{displayShift.cashierName}</strong>
                  </Typography>
                </Stack>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Fondo inicial:
              </Typography>
              <Typography
                variant="subtitle2"
                fontWeight="900"
                color="primary.main"
              >
                C${displayShift.openingAmount.toFixed(2)}
              </Typography>
            </Stack>
          </Box>

          <CloseCashRegisterForm
            closeType={closeCashRegister.closeType}
            onChangeCloseType={closeCashRegister.setCloseType}
            amount={closeCashRegister.amount}
            onChangeAmount={closeCashRegister.setAmount}
            onApplyBreakdown={closeCashRegister.applyDenominationBreakdown}
            denominationBreakdown={closeCashRegister.denominationBreakdown}
            onSubmit={closeCashRegister.handleSubmit}
            onCancel={closeCashRegister.handleCancel}
            canSubmit={closeCashRegister.canSubmit}
            openingAmount={displayShift.openingAmount}
            requiresAuthorization={closeCashRegister.requiresAuthorization}
            discrepancyReason={closeCashRegister.discrepancyReason}
            onChangeDiscrepancyReason={closeCashRegister.setDiscrepancyReason}
            authorizationPin={closeCashRegister.authorizationPin}
            onChangeAuthorizationPin={closeCashRegister.setAuthorizationPin}
            declaredCardAmount={closeCashRegister.declaredCardAmount}
            onChangeDeclaredCardAmount={closeCashRegister.setDeclaredCardAmount}
            declaredAppAmount={closeCashRegister.declaredAppAmount}
            onChangeDeclaredAppAmount={closeCashRegister.setDeclaredAppAmount}
            loading={closeCashRegister.loading}
          />
        </Paper>

        {closeCashRegister.printShift && (
          <ShiftTicketPrint shift={closeCashRegister.printShift} />
        )}
      </Container>

      <ShiftCloseBlockersDialog
        open={closeCashRegister.blockersOpen}
        preview={closeCashRegister.preview}
        onClose={() => closeCashRegister.setBlockersOpen(false)}
        onReviewOrders={closeCashRegister.handleReviewOrders}
        onRefresh={() => void closeCashRegister.refreshPreview()}
        loading={closeCashRegister.preflightLoading}
      />
    </Box>
  );
}
