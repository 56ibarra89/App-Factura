import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Switch,
  FormControlLabel,
  InputAdornment,
  Button,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Tooltip,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SecurityIcon from "@mui/icons-material/Security";
import SaveIcon from "@mui/icons-material/Save";
import RestoreIcon from "@mui/icons-material/Restore";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import PrintIcon from "@mui/icons-material/Print";

import { BackButton, PageHeader } from "../../../shared/ui";
import { LOGIN_COLORS } from "../../../shared/theme";
import { useAuth } from "../../auth";
import { logService } from "../../audit";
import {
  CASH_EXPENSE_CATEGORY_LABELS,
  DEFAULT_PETTY_CASH_POLICY,
  type CashExpenseCategory,
  type PettyCashPolicy,
} from "../model/cash-expense.types";
import { usePettyCashPolicy } from "../hooks/usePettyCashPolicy";

export default function PettyCashPolicyPage() {
  const { username, role } = useAuth();
  const {
    policy,
    setPolicy,
    loading,
    saving,
    savePolicy,
    updateCategoryPolicy,
    updatePolicyField,
  } = usePettyCashPolicy();

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSave = async () => {
    if (policy.maxAmountWithoutAuth < 0 || policy.maxShiftTotal < 0) {
      setSnackbar({
        open: true,
        message: "Los límites financieros deben ser valores positivos o cero.",
        severity: "error",
      });
      return;
    }

    const success = await savePolicy(policy);
    if (success) {
      logService.log(
        username || "admin",
        role || "admin",
        "CONFIG_CHANGE",
        `Actualizó las políticas de gastos de caja chica (Límite sin PIN: C$${policy.maxAmountWithoutAuth}, Turno: C$${policy.maxShiftTotal}).`,
        "info",
      );
      setSnackbar({
        open: true,
        message: "Políticas de caja chica guardadas exitosamente.",
        severity: "success",
      });
    } else {
      setSnackbar({
        open: true,
        message: "Error al guardar las políticas. Intenta nuevamente.",
        severity: "error",
      });
    }
  };

  const handleResetDefaults = () => {
    setPolicy({ ...DEFAULT_PETTY_CASH_POLICY });
    setSnackbar({
      open: true,
      message: "Se restablecieron los valores predeterminados (recuerda pulsar Guardar).",
      severity: "info",
    });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="70vh"
        gap={2}
      >
        <CircularProgress color="error" />
        <Typography color="text.secondary">Cargando políticas de egresos...</Typography>
      </Box>
    );
  }

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: "background.default",
        pt: 4,
        pb: 8,
        px: { xs: 2, md: 6 },
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Background ambient gradient */}
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
          pointerEvents: "none",
        }}
      />

      <Box position="relative" zIndex={1}>
        <PageHeader
          title="Políticas de Caja Chica (Egresos)"
          startContent={<BackButton to="/admin" />}
          actions={
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<RestoreIcon />}
                onClick={handleResetDefaults}
                disabled={saving}
                sx={{ borderRadius: 2 }}
              >
                Predeterminados
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  bgcolor: LOGIN_COLORS.primary,
                  "&:hover": { bgcolor: LOGIN_COLORS.primaryDark },
                }}
              >
                {saving ? "Guardando..." : "Guardar Políticas"}
              </Button>
            </Stack>
          }
        />

        <Box sx={{ mt: 2, mb: 4, pl: 1 }}>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 850 }}>
            Configura los límites financieros de retiro, comprobantes físicos requeridos y
            autorizaciones obligatorias por PIN de Administrador/Supervisor para prevenir fugas y
            descuadres al cuadrar caja.
          </Typography>
        </Box>

        <Container maxWidth={false} disableGutters>
          <Grid container spacing={3}>
            {/* Card 1: Umbrales Financieros */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                }}
              >
                <CardHeader
                  avatar={
                    <Box
                      sx={{
                        bgcolor: "rgba(211, 47, 47, 0.08)",
                        color: "error.main",
                        p: 1,
                        borderRadius: 2,
                        display: "flex",
                      }}
                    >
                      <MonetizationOnIcon />
                    </Box>
                  }
                  title={
                    <Typography variant="h6" fontWeight="bold">
                      Límites Financieros por Egreso
                    </Typography>
                  }
                  subheader="Topes máximos permitidos antes de solicitar PIN de supervisor"
                />
                <Divider />
                <CardContent sx={{ pt: 3 }}>
                  <Stack spacing={3}>
                    <TextField
                      label="Monto Máximo Libre sin PIN (C$)"
                      type="number"
                      fullWidth
                      value={policy.maxAmountWithoutAuth}
                      onChange={(e) =>
                        updatePolicyField(
                          "maxAmountWithoutAuth",
                          Math.max(0, parseFloat(e.target.value) || 0),
                        )
                      }
                      helperText="Cualquier gasto individual superior a este monto exigirá el PIN de autorización de un Administrador."
                      slotProps={{
                        htmlInput: { min: 0, step: "10" },
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography fontWeight="bold" color="error.main">
                                C$
                              </Typography>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />

                    <TextField
                      label="Tope Acumulado por Turno (C$)"
                      type="number"
                      fullWidth
                      value={policy.maxShiftTotal}
                      onChange={(e) =>
                        updatePolicyField(
                          "maxShiftTotal",
                          Math.max(0, parseFloat(e.target.value) || 0),
                        )
                      }
                      helperText="Tope máximo combinado de gastos en un mismo turno. Superarlo bloqueará egresos sin PIN supervisor."
                      slotProps={{
                        htmlInput: { min: 0, step: "50" },
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography fontWeight="bold" color="text.secondary">
                                C$
                              </Typography>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />

                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      <Typography variant="caption" display="block">
                        💡 <strong>Recomendación:</strong> Fija un monto libre suficiente para
                        compras menores cotidianas (ej. C$200 - C$300). Montos mayores requerirán
                        presencia y validación del supervisor en caja.
                      </Typography>
                    </Alert>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Card 2: Reglas de Comprobantes y Vales */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                }}
              >
                <CardHeader
                  avatar={
                    <Box
                      sx={{
                        bgcolor: "rgba(2, 136, 209, 0.08)",
                        color: "info.main",
                        p: 1,
                        borderRadius: 2,
                        display: "flex",
                      }}
                    >
                      <ReceiptLongIcon />
                    </Box>
                  }
                  title={
                    <Typography variant="h6" fontWeight="bold">
                      Comprobantes y Respaldo Físico
                    </Typography>
                  }
                  subheader="Políticas de justificación documental e impresión de vales"
                />
                <Divider />
                <CardContent sx={{ pt: 3 }}>
                  <Stack spacing={2.5}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={policy.requireVoucherAlways}
                          onChange={(e) =>
                            updatePolicyField("requireVoucherAlways", e.target.checked)
                          }
                          color="error"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle2" fontWeight="600">
                            Exigir comprobante en TODOS los gastos
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            El cajero no podrá confirmar ningún egreso sin ingresar el número de
                            factura o recibo.
                          </Typography>
                        </Box>
                      }
                    />

                    <TextField
                      label="Exigir Comprobante a partir de (C$)"
                      type="number"
                      fullWidth
                      disabled={policy.requireVoucherAlways}
                      value={policy.requireVoucherOver}
                      onChange={(e) =>
                        updatePolicyField(
                          "requireVoucherOver",
                          Math.max(0, parseFloat(e.target.value) || 0),
                        )
                      }
                      helperText={
                        policy.requireVoucherAlways
                          ? "Deshabilitado porque los comprobantes se exigen siempre."
                          : "Si el gasto es igual o mayor a este monto, el número de comprobante es obligatorio."
                      }
                      slotProps={{
                        htmlInput: { min: 0, step: "10" },
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography fontWeight="bold" color="text.secondary">
                                C$
                              </Typography>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />

                    <Divider sx={{ my: 1 }} />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={policy.autoPrintVoucher}
                          onChange={(e) =>
                            updatePolicyField("autoPrintVoucher", e.target.checked)
                          }
                          color="primary"
                        />
                      }
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          <PrintIcon fontSize="small" color="action" />
                          <Box>
                            <Typography variant="subtitle2" fontWeight="600">
                              Auto-imprimir vale de salida por defecto
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Marca por defecto la casilla de impresión térmica en el modal de
                              registro del cajero.
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Card 3: Control y Seguridad por Categoría */}
            <Grid size={{ xs: 12 }}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                }}
              >
                <CardHeader
                  avatar={
                    <Box
                      sx={{
                        bgcolor: "rgba(123, 31, 162, 0.08)",
                        color: "#7b1fa2",
                        p: 1,
                        borderRadius: 2,
                        display: "flex",
                      }}
                    >
                      <SecurityIcon />
                    </Box>
                  }
                  title={
                    <Typography variant="h6" fontWeight="bold">
                      Control y Restricciones por Categoría de Gasto
                    </Typography>
                  }
                  subheader="Habilita categorías disponibles para el cajero y define cuáles requieren PIN supervisor obligatoriamente"
                />
                <Divider />
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "action.hover" }}>
                        <TableCell sx={{ fontWeight: "bold" }}>Categoría</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Descripción</TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold", width: 160 }}>
                          Disponible en Caja
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold", width: 220 }}>
                          Seguridad Requerida
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(
                        Object.keys(
                          CASH_EXPENSE_CATEGORY_LABELS,
                        ) as CashExpenseCategory[]
                      ).map((catKey) => {
                        const meta = CASH_EXPENSE_CATEGORY_LABELS[catKey];
                        const catConfig = policy.categoryPolicies[catKey] || {
                          enabled: true,
                          requiresPin: false,
                        };

                        return (
                          <TableRow
                            key={catKey}
                            hover
                            sx={{
                              opacity: catConfig.enabled ? 1 : 0.5,
                              transition: "opacity 0.2s",
                            }}
                          >
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1.5}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: "50%",
                                    bgcolor: meta.color,
                                    flexShrink: 0,
                                  }}
                                />
                                <Typography variant="subtitle2" fontWeight="700">
                                  {meta.label}
                                </Typography>
                              </Box>
                            </TableCell>

                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {meta.description}
                              </Typography>
                            </TableCell>

                            <TableCell align="center">
                              <Tooltip
                                title={
                                  catConfig.enabled
                                    ? "Visible para el cajero"
                                    : "Oculta y deshabilitada en caja"
                                }
                              >
                                <Switch
                                  checked={catConfig.enabled}
                                  onChange={(e) =>
                                    updateCategoryPolicy(catKey, {
                                      enabled: e.target.checked,
                                    })
                                  }
                                  color="success"
                                />
                              </Tooltip>
                            </TableCell>

                            <TableCell align="center">
                              <Box display="flex" justifyContent="center">
                                <Button
                                  size="small"
                                  variant={catConfig.requiresPin ? "contained" : "outlined"}
                                  color={catConfig.requiresPin ? "error" : "inherit"}
                                  disabled={!catConfig.enabled}
                                  startIcon={
                                    catConfig.requiresPin ? (
                                      <LockIcon fontSize="small" />
                                    ) : (
                                      <LockOpenIcon fontSize="small" />
                                    )
                                  }
                                  onClick={() =>
                                    updateCategoryPolicy(catKey, {
                                      requiresPin: !catConfig.requiresPin,
                                    })
                                  }
                                  sx={{
                                    borderRadius: 3,
                                    textTransform: "none",
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                    px: 2,
                                  }}
                                >
                                  {catConfig.requiresPin ? "Siempre con PIN" : "Libre hasta tope"}
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
