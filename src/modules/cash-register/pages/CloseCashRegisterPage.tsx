import { Alert, Box, Divider, LinearProgress, Typography } from "@mui/material";
import { AuthLayout, BrandingPanel } from "../../auth";
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
    <AuthLayout error="" onClearError={() => {}}>
      <BrandingPanel
        title={
          <>
            Cierre de
            <br />
            Turno
          </>
        }
        subtitle="Realiza el conteo físico del efectivo antes de cerrar tu turno."
      />
      <Box
        sx={{
          flex: 1,
          p: { xs: 4, md: 6 },
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.paper",
          overflowY: "auto",
        }}
      >
        <Typography variant="h4" fontWeight="900" color="text.primary" mb={1}>
          Arqueo Ciego de Caja
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Turno de <strong>{displayShift.cashierName}</strong>
          {displayShift.cashRegisterName && (
            <>
              {" "}en <strong>{displayShift.cashRegisterName}</strong>
            </>
          )}
        </Typography>

        {closeCashRegister.preflightLoading && <LinearProgress sx={{ mb: 2 }} />}
        {closeCashRegister.error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {closeCashRegister.error}
          </Alert>
        )}

        <Divider sx={{ mb: 4 }} />
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

        {closeCashRegister.printShift && (
          <ShiftTicketPrint shift={closeCashRegister.printShift} />
        )}
      </Box>

      <ShiftCloseBlockersDialog
        open={closeCashRegister.blockersOpen}
        preview={closeCashRegister.preview}
        onClose={() => closeCashRegister.setBlockersOpen(false)}
        onReviewOrders={closeCashRegister.handleReviewOrders}
        onRefresh={() => void closeCashRegister.refreshPreview()}
        loading={closeCashRegister.preflightLoading}
      />
    </AuthLayout>
  );
}
