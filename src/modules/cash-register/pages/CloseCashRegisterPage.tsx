import {
  Alert,
  Box,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
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
        subtitle="Verifica que el efectivo físico coincida con las ventas y gastos registrados por el sistema."
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
          Arqueo de Caja
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Resumen del turno de <strong>{displayShift.cashierName}</strong>
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

        {closeCashRegister.showReconciliation && (
          <>
            <Grid container spacing={2} mb={3}>
              <SummaryCard
                label="Ventas Efectivo"
                value={closeCashRegister.sales.cash}
                icon={<LocalAtmIcon color="success" />}
              />
              <SummaryCard
                label="Ventas Tarjeta"
                value={closeCashRegister.sales.card}
                icon={<CreditCardIcon color="primary" />}
              />
              <SummaryCard
                label="Ventas App"
                value={closeCashRegister.sales.app}
                icon={<SmartphoneIcon color="info" />}
              />
              <SummaryCard
                label="Gastos / Egresos"
                value={-closeCashRegister.totalExpenses}
                icon={<MoneyOffIcon color="error" />}
                color="error.main"
              />
            </Grid>

            <Box
              sx={{
                bgcolor: "action.hover",
                p: 2,
                borderRadius: 3,
                mb: 4,
                border: "1px dashed",
                borderColor: "primary.main",
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
                <Typography variant="body1" fontWeight="bold">
                  Total teórico en efectivo esperado:
                </Typography>
                <Typography variant="h5" fontWeight="900" color="primary.main">
                  C${closeCashRegister.expectedCash.toFixed(2)}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Apertura C${displayShift.openingAmount.toFixed(2)} + ventas en efectivo C${closeCashRegister.sales.cash.toFixed(2)} - gastos C${closeCashRegister.totalExpenses.toFixed(2)}
              </Typography>
            </Box>
          </>
        )}

        <Divider sx={{ mb: 4 }} />
        <CloseCashRegisterForm
          amount={closeCashRegister.amount}
          onChangeAmount={closeCashRegister.setAmount}
          onApplyBreakdown={closeCashRegister.applyDenominationBreakdown}
          denominationBreakdown={closeCashRegister.denominationBreakdown}
          onSubmit={closeCashRegister.handleSubmit}
          onCancel={closeCashRegister.handleCancel}
          canSubmit={closeCashRegister.canSubmit}
          openingAmount={displayShift.openingAmount}
          expectedCash={closeCashRegister.expectedCash}
          showReconciliation={closeCashRegister.showReconciliation}
          requiresAuthorization={closeCashRegister.requiresAuthorization}
          discrepancyThreshold={closeCashRegister.discrepancyThreshold}
          discrepancyReason={closeCashRegister.discrepancyReason}
          onChangeDiscrepancyReason={closeCashRegister.setDiscrepancyReason}
          authorizationPin={closeCashRegister.authorizationPin}
          onChangeAuthorizationPin={closeCashRegister.setAuthorizationPin}
          primaryLabel={closeCashRegister.primaryLabel}
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

interface SummaryCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  color?: string;
}

function SummaryCard({ label, value, icon, color }: SummaryCardProps) {
  return (
    <Grid size={{ xs: 12, sm: 3 }}>
      <Paper variant="outlined" sx={{ p: 2, textAlign: "center", borderRadius: 3 }}>
        {icon}
        <Typography variant="caption" display="block">{label}</Typography>
        <Typography variant="h6" fontWeight="bold" color={color}>
          {value < 0 ? "- " : ""}C${Math.abs(value).toFixed(2)}
        </Typography>
      </Paper>
    </Grid>
  );
}
