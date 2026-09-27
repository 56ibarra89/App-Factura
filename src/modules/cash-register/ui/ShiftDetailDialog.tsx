import {
  Alert,
  alpha,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import NightlightRoundIcon from "@mui/icons-material/NightlightRound";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import CalculateIcon from "@mui/icons-material/Calculate";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ShieldIcon from "@mui/icons-material/Shield";
import PrintIcon from "@mui/icons-material/Print";
import type { Shift, CashDenominationCount } from "../model/cash-register.types";
import {
  calculateDuration,
  formatDate,
  getShiftDifference,
} from "../model/shiftAuditDomain";

interface Props {
  shift: Shift | null;
  onClose: () => void;
  onPrint: (shift: Shift) => void;
  onOpenDenominations: (denominations: CashDenominationCount[]) => void;
}

export function ShiftDetailDialog({
  shift,
  onClose,
  onPrint,
  onOpenDenominations,
}: Props) {
  if (!shift) return null;

  const duration = calculateDuration(shift.startTime, shift.endTime);
  const diffs = getShiftDifference(shift);

  return (
    <Dialog
      open={Boolean(shift)}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 1 },
      }}
    >
      {/* Cabecera idéntica a CloseCashRegisterForm */}
      <DialogTitle sx={{ pb: 1 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={1}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                bgcolor: "error.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <PointOfSaleIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {shift.cashRegisterName || "Caja Principal"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cajero: @{shift.cashierName} • Turno #{shift.id.slice(0, 8)}
              </Typography>
            </Box>
          </Box>

          <Box textAlign={{ xs: "left", sm: "right" }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Fondo Inicial (Apertura)
            </Typography>
            <Typography variant="body1" fontWeight="bold" color="error.main">
              C${shift.openingAmount.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2.5}>
          {/* COLUMNA IZQUIERDA: Modalidad de Cierre y Trazabilidad */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2}>
              {/* Recuadro de Modalidad */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  color="text.secondary"
                  textTransform="uppercase"
                  display="block"
                  mb={1}
                >
                  ⚙️ Modalidad de Cierre
                </Typography>

                {shift.status === "open" ? (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha("#2e7d32", 0.08),
                      border: "1px solid #2e7d32",
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccessTimeIcon sx={{ color: "#2e7d32" }} />
                      <Typography variant="body2" fontWeight="bold" color="#2e7d32">
                        Turno En Curso
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Caja actualmente operando y abierta.
                    </Typography>
                  </Box>
                ) : shift.closeType === "HANDOVER" ? (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha("#0288d1", 0.08),
                      border: "1px solid #0288d1",
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <SyncAltIcon sx={{ color: "#0288d1" }} />
                      <Typography variant="body2" fontWeight="bold" color="#0288d1">
                        Relevo de Turno
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Cambio de cajero. Las mesas ocupadas continuaron abiertas.
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha("#ed6c02", 0.08),
                      border: "1px solid #ed6c02",
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <NightlightRoundIcon sx={{ color: "#ed6c02" }} />
                      <Typography variant="body2" fontWeight="bold" color="#ed6c02">
                        Cierre Final
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Fin de jornada operativa del día.
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Tiempos y Duración */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  color="text.secondary"
                  textTransform="uppercase"
                  display="block"
                  mb={1}
                >
                  ⏱️ Horario y Trazabilidad
                </Typography>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Apertura
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      {formatDate(shift.startTime)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Cierre
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      {shift.endTime ? formatDate(shift.endTime) : "En curso"}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 1 }} />

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Duración total:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {duration.durationText}
                  </Typography>
                </Box>
              </Box>

              {/* Desglose de Gastos de Caja Menor */}
              {shift.expenses && shift.expenses.length > 0 && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: "1px solid",
                    borderColor: alpha("#d32f2f", 0.3),
                    bgcolor: alpha("#d32f2f", 0.02),
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <ReceiptLongIcon color="error" fontSize="small" />
                      <Typography variant="subtitle2" fontWeight="bold" color="error">
                        Egresos de Caja ({shift.expenses.length})
                      </Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight="bold" color="error.main">
                      - C${(shift.totalExpenses || 0).toFixed(2)}
                    </Typography>
                  </Box>
                  <Stack spacing={0.8}>
                    {shift.expenses.map((exp) => (
                      <Box
                        key={exp.id}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                          p: 0.8,
                          borderRadius: 1.5,
                          bgcolor: "background.paper",
                        }}
                      >
                        <Box>
                          <Typography variant="caption" fontWeight="600" display="block">
                            {exp.reason}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {exp.category}{" "}
                            {exp.voucherNumber ? `• Nº ${exp.voucherNumber}` : ""}
                          </Typography>
                        </Box>
                        <Typography variant="caption" fontWeight="bold" color="error.main">
                          - C${Number(exp.amount).toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {shift.notes && (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    borderLeft: "3px solid",
                    borderColor: "primary.main",
                  }}
                >
                  <Typography variant="caption" fontWeight="bold" color="text.secondary">
                    Notas del Turno:
                  </Typography>
                  <Typography variant="body2">{shift.notes}</Typography>
                </Box>
              )}
            </Stack>
          </Grid>

          {/* COLUMNA DERECHA: Los 3 Pilares del Arqueo de Caja */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={2}>
              {/* PILAR 1: Efectivo en Cajón */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  borderColor: "divider",
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1.5}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AttachMoneyIcon sx={{ color: "#2e7d32" }} />
                    <Typography variant="subtitle2" fontWeight="bold">
                      1. Efectivo en Cajón
                    </Typography>
                  </Stack>
                  {shift.denominationBreakdown &&
                    shift.denominationBreakdown.length > 0 && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CalculateIcon />}
                        onClick={() =>
                          onOpenDenominations(shift.denominationBreakdown || [])
                        }
                        sx={{ textTransform: "none", fontSize: "0.75rem" }}
                      >
                        Ver denominaciones
                      </Button>
                    )}
                </Box>

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant="caption" color="text.secondary">
                      Esperado
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      C$
                      {(
                        shift.expectedCash ??
                        shift.openingAmount +
                          shift.totalSales.cash -
                          (shift.totalExpenses || 0)
                      ).toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant="caption" color="text.secondary">
                      Declarado
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {shift.closingAmount !== undefined
                        ? `C$${shift.closingAmount.toFixed(2)}`
                        : "---"}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 4 }} textAlign="right">
                    <Typography variant="caption" color="text.secondary">
                      Diferencia
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color={
                        Math.abs(diffs.cashDiff) < 0.01
                          ? "success.main"
                          : diffs.cashDiff > 0
                            ? "info.main"
                            : "error.main"
                      }
                    >
                      {Math.abs(diffs.cashDiff) < 0.01
                        ? "C$0.00"
                        : `${diffs.cashDiff > 0 ? "+" : ""}C$${diffs.cashDiff.toFixed(2)}`}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* PILAR 2: Vouchers de Tarjeta (POS) */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  borderColor: "divider",
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1.5}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CreditCardIcon sx={{ color: "#0288d1" }} />
                    <Typography variant="subtitle2" fontWeight="bold">
                      2. Vouchers de Tarjeta (POS)
                    </Typography>
                  </Stack>
                </Box>

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant="caption" color="text.secondary">
                      Ventas Sistema
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      C${(shift.totalSales.card || 0).toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant="caption" color="text.secondary">
                      Declarado POS
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      C$
                      {(
                        shift.declaredCardAmount ??
                        shift.totalSales.card ??
                        0
                      ).toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 4 }} textAlign="right">
                    <Typography variant="caption" color="text.secondary">
                      Diferencia
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color={
                        Math.abs(diffs.cardDiff) < 0.01
                          ? "success.main"
                          : diffs.cardDiff > 0
                            ? "info.main"
                            : "error.main"
                      }
                    >
                      {Math.abs(diffs.cardDiff) < 0.01
                        ? "C$0.00"
                        : `${diffs.cardDiff > 0 ? "+" : ""}C$${diffs.cardDiff.toFixed(2)}`}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* PILAR 3: Transferencias / Apps */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  borderColor: "divider",
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1.5}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PhoneAndroidIcon sx={{ color: "#ed6c02" }} />
                    <Typography variant="subtitle2" fontWeight="bold">
                      3. Transferencias / Apps
                    </Typography>
                  </Stack>
                </Box>

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant="caption" color="text.secondary">
                      Ventas Sistema
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      C${(shift.totalSales.app || 0).toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant="caption" color="text.secondary">
                      Declarado App
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      C$
                      {(
                        shift.declaredAppAmount ??
                        shift.totalSales.app ??
                        0
                      ).toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 4 }} textAlign="right">
                    <Typography variant="caption" color="text.secondary">
                      Diferencia
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color={
                        Math.abs(diffs.appDiff) < 0.01
                          ? "success.main"
                          : diffs.appDiff > 0
                            ? "info.main"
                            : "error.main"
                      }
                    >
                      {Math.abs(diffs.appDiff) < 0.01
                        ? "C$0.00"
                        : `${diffs.appDiff > 0 ? "+" : ""}C$${diffs.appDiff.toFixed(2)}`}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* TOTAL NETO DE DIFERENCIA */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: "action.hover",
                  borderRadius: 2.5,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    DIFERENCIA NETA TOTAL:
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Suma de descuadres en los 3 métodos
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color={
                    diffs.isBalanced
                      ? "success.main"
                      : diffs.totalDiff > 0
                        ? "info.main"
                        : "error.main"
                  }
                >
                  {diffs.isBalanced
                    ? "Exacto (C$0.00)"
                    : `${diffs.totalDiff > 0 ? "+" : ""}C$${diffs.totalDiff.toFixed(2)}`}
                </Typography>
              </Box>

              {/* SECCIÓN ANTIFRAUDE Y AUTORIZACIÓN PIN */}
              {shift.discrepancyReason && (
                <Alert
                  severity="warning"
                  icon={<ShieldIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    Descuadre Autorizado con PIN
                  </Typography>
                  <Typography variant="body2" mt={0.5}>
                    Justificación: &ldquo;{shift.discrepancyReason}&rdquo;
                  </Typography>
                  {shift.authorizedByName && (
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                      mt={0.5}
                    >
                      Autorizado por @{shift.authorizedByName} (
                      {shift.authorizedByRole || "Supervisor"})
                    </Typography>
                  )}
                </Alert>
              )}
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
        <Button
          startIcon={<PrintIcon />}
          variant="outlined"
          onClick={() => onPrint(shift)}
        >
          Imprimir Arqueo
        </Button>
        <Button variant="contained" onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
