import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";
import { BackButton, PageHeader } from "../../../shared/ui";
import { paymentMethodsGateway } from "../api/paymentMethodsGateway";
import {
  DEFAULT_PAYMENT_METHODS_CONFIG,
  PAYMENT_CURRENCIES,
  PAYMENT_METHOD_TYPES,
  PAYMENT_METHOD_TYPE_LABELS,
  slugifyPaymentMethod,
  type ConfiguredPaymentMethod,
  type PaymentCurrency,
  type PaymentMethodsConfig,
  type PaymentMethodType,
  type PaymentMetrics,
} from "../model/paymentMethods.types";

const money = new Intl.NumberFormat("es-NI", {
  style: "currency",
  currency: "NIO",
});
const inputDate = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

export default function PaymentMethodsSettingsPage() {
  const today = useMemo(() => new Date(), []);
  const [config, setConfig] = useState<PaymentMethodsConfig>(
    DEFAULT_PAYMENT_METHODS_CONFIG,
  );
  const [metrics, setMetrics] = useState<PaymentMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<PaymentMethodType>("CARD_POS");
  const [startDate, setStartDate] = useState(
    inputDate(new Date(today.getFullYear(), today.getMonth(), 1)),
  );
  const [endDate, setEndDate] = useState(inputDate(today));
  const [message, setMessage] = useState<{
    text: string;
    severity: "success" | "error";
  } | null>(null);

  useEffect(() => {
    Promise.all([
      paymentMethodsGateway.load(),
      paymentMethodsGateway.metrics(
        new Date(today.getFullYear(), today.getMonth(), 1),
        today,
      ),
    ])
      .then(([saved, report]) => {
        setConfig(saved);
        setMetrics(report);
      })
      .catch(() =>
        setMessage({
          text: "No se pudo cargar la configuración.",
          severity: "error",
        }),
      )
      .finally(() => setLoading(false));
  }, [today]);

  const update = (id: string, changes: Partial<ConfiguredPaymentMethod>) =>
    setConfig((current) => ({
      methods: current.methods.map((method) =>
        method.id === id ? { ...method, ...changes } : method,
      ),
    }));

  const add = () => {
    const name = newName.trim();
    if (!name) return;
    const base = slugifyPaymentMethod(name) || "metodo";
    let id = base;
    let suffix = 2;
    while (config.methods.some((method) => method.id === id)) {
      id = `${base}-${suffix++}`;
    }
    setConfig((current) => ({
      methods: [
        ...current.methods,
        {
          id,
          name,
          type: newType,
          currency: "NIO",
          requiresReference: newType !== "CASH",
          commissionRate: 0,
          isActive: true,
        },
      ],
    }));
    setNewName("");
  };

  const save = async () => {
    if (!config.methods.some((method) => method.isActive)) {
      setMessage({
        text: "Debe existir al menos un método activo.",
        severity: "error",
      });
      return;
    }
    setSaving(true);
    try {
      await paymentMethodsGateway.save(config);
      setMessage({ text: "Métodos guardados.", severity: "success" });
    } catch {
      setMessage({ text: "No se pudieron guardar.", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const refreshReport = async () => {
    try {
      setMetrics(
        await paymentMethodsGateway.metrics(
          new Date(`${startDate}T00:00:00`),
          new Date(`${endDate}T23:59:59.999`),
        ),
      );
    } catch {
      setMessage({
        text: "No se pudo actualizar el reporte.",
        severity: "error",
      });
    }
  };

  return (
    <Box minHeight="100vh" bgcolor="background.default" p={{ xs: 2, md: 4 }}>
      <PageHeader
        title="Métodos de Pago y Bancos"
        startContent={<BackButton to="/admin" />}
        actions={
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
            disabled={loading || saving}
            onClick={() => void save()}
          >
            Guardar cambios
          </Button>
        }
      />
      <Typography color="text.secondary" mb={3} maxWidth={900}>
        Configura cuentas, terminales y billeteras. La comisión se guarda en
        cada transacción para conservar reportes históricos exactos.
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={900} mb={2}>
                Métodos disponibles en caja
              </Typography>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={2}>
                <TextField
                  fullWidth
                  label="Nombre del banco, cuenta o terminal"
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                />
                <FormControl sx={{ minWidth: 220 }}>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    label="Tipo"
                    value={newType}
                    onChange={(event) =>
                      setNewType(event.target.value as PaymentMethodType)
                    }
                  >
                    {PAYMENT_METHOD_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {PAYMENT_METHOD_TYPE_LABELS[type]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  disabled={!newName.trim()}
                  onClick={add}
                >
                  Agregar
                </Button>
              </Stack>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Moneda</TableCell>
                      <TableCell>Comisión %</TableCell>
                      <TableCell align="center">Referencia</TableCell>
                      <TableCell align="center">Activo</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {config.methods.map((method) => (
                      <TableRow key={method.id}>
                        <TableCell sx={{ minWidth: 220 }}>
                          <TextField
                            variant="standard"
                            fullWidth
                            value={method.name}
                            onChange={(event) =>
                              update(method.id, { name: event.target.value })
                            }
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 170 }}>
                          <Select
                            size="small"
                            fullWidth
                            value={method.type}
                            onChange={(event) =>
                              update(method.id, {
                                type: event.target.value as PaymentMethodType,
                              })
                            }
                          >
                            {PAYMENT_METHOD_TYPES.map((type) => (
                              <MenuItem key={type} value={type}>
                                {PAYMENT_METHOD_TYPE_LABELS[type]}
                              </MenuItem>
                            ))}
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            size="small"
                            value={method.currency}
                            onChange={(event) =>
                              update(method.id, {
                                currency: event.target.value as PaymentCurrency,
                              })
                            }
                          >
                            {PAYMENT_CURRENCIES.map((currency) => (
                              <MenuItem key={currency} value={currency}>
                                {currency === "NIO" ? "C$" : "US$"}
                              </MenuItem>
                            ))}
                          </Select>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={method.commissionRate}
                            onChange={(event) =>
                              update(method.id, {
                                commissionRate: Number(event.target.value),
                              })
                            }
                            slotProps={{
                              htmlInput: { min: 0, max: 100, step: 0.1 },
                            }}
                            sx={{ width: 100 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={method.requiresReference}
                            onChange={(_, checked) =>
                              update(method.id, { requiresReference: checked })
                            }
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={method.isActive}
                            onChange={(_, checked) =>
                              update(method.id, { isActive: checked })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() =>
                              setConfig((current) => ({
                                methods: current.methods.filter(
                                  (candidate) => candidate.id !== method.id,
                                ),
                              }))
                            }
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                spacing={2}
                mb={2}
              >
                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    Cuadre por banco y ganancia neta
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Solo incluye órdenes pagadas del período.
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <TextField
                    type="date"
                    size="small"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <TextField
                    type="date"
                    size="small"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => void refreshReport()}
                  >
                    Consultar
                  </Button>
                </Stack>
              </Stack>
              <Grid container spacing={2} mb={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Metric
                    label="Transacciones"
                    value={String(metrics?.transactionCount ?? 0)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Metric
                    label="Venta bruta"
                    value={money.format(metrics?.grossAmount ?? 0)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Metric
                    label="Comisiones"
                    value={money.format(metrics?.commissionAmount ?? 0)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Metric
                    label="Ingreso neto"
                    value={money.format(metrics?.netAmount ?? 0)}
                  />
                </Grid>
              </Grid>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Método / Cuenta</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell align="right">Operaciones</TableCell>
                      <TableCell align="right">Bruto</TableCell>
                      <TableCell align="right">Comisión</TableCell>
                      <TableCell align="right">Neto</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(metrics?.breakdown ?? []).map((row) => (
                      <TableRow key={row.methodId}>
                        <TableCell>
                          <strong>{row.name}</strong>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {row.referencedCount} con referencia
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              PAYMENT_METHOD_TYPE_LABELS[
                                row.type as PaymentMethodType
                              ] ?? row.type
                            }
                          />
                        </TableCell>
                        <TableCell align="right">
                          {row.transactionCount}
                        </TableCell>
                        <TableCell align="right">
                          {money.format(row.grossAmount)}
                        </TableCell>
                        <TableCell align="right">
                          {money.format(row.commissionAmount)}
                        </TableCell>
                        <TableCell align="right">
                          {money.format(row.netAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Stack>
      )}
      <Snackbar
        open={Boolean(message)}
        autoHideDuration={4500}
        onClose={() => setMessage(null)}
      >
        <Alert severity={message?.severity} onClose={() => setMessage(null)}>
          {message?.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Box bgcolor="action.hover" borderRadius={2} p={2} height="100%">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={900}>
        {value}
      </Typography>
    </Box>
  );
}
