import { useMemo, useState } from "react";
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
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Switch,
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
import { useVoidWastePolicy } from "../hooks/useVoidWastePolicy";
import {
  CANCELLATION_CATEGORIES,
  CANCELLATION_CATEGORY_LABELS,
  slugifyCancellationReason,
  type CancellationCategory,
} from "../model/voidWastePolicy.types";

const toInputDate = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);

const money = new Intl.NumberFormat("es-NI", {
  style: "currency",
  currency: "NIO",
});

export default function VoidWastePolicyPage() {
  const policy = useVoidWastePolicy();
  const now = useMemo(() => new Date(), []);
  const [startDate, setStartDate] = useState(
    toInputDate(new Date(now.getFullYear(), now.getMonth(), 1)),
  );
  const [endDate, setEndDate] = useState(toInputDate(now));
  const [newLabel, setNewLabel] = useState("");
  const [newCategory, setNewCategory] = useState<CancellationCategory>("OTHER");
  const [message, setMessage] = useState<{
    text: string;
    severity: "success" | "error";
  } | null>(null);

  const updateReason = (
    id: string,
    changes: Partial<(typeof policy.config.reasons)[number]>,
  ) => {
    policy.setConfig((current) => ({
      ...current,
      reasons: current.reasons.map((reason) =>
        reason.id === id ? { ...reason, ...changes } : reason,
      ),
    }));
  };

  const addReason = () => {
    const label = newLabel.trim();
    if (!label) return;
    const baseId = slugifyCancellationReason(label) || "motivo";
    let id = baseId;
    let suffix = 2;
    while (policy.config.reasons.some((reason) => reason.id === id)) {
      id = `${baseId}-${suffix++}`;
    }
    policy.setConfig((current) => ({
      ...current,
      reasons: [
        ...current.reasons,
        {
          id,
          label,
          category: newCategory,
          isActive: true,
          countsAsWaste: false,
          requiresSupervisor: false,
        },
      ],
    }));
    setNewLabel("");
  };

  const save = async () => {
    if (!policy.config.reasons.some((reason) => reason.isActive)) {
      setMessage({
        text: "Debe existir al menos un motivo activo.",
        severity: "error",
      });
      return;
    }
    try {
      await policy.save();
      setMessage({ text: "Políticas guardadas.", severity: "success" });
    } catch {
      setMessage({
        text: "No se pudieron guardar las políticas.",
        severity: "error",
      });
    }
  };

  const refreshMetrics = async () => {
    try {
      await policy.loadMetrics(
        new Date(`${startDate}T00:00:00`),
        new Date(`${endDate}T23:59:59.999`),
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
        title="Anulaciones, Mermas y Cortesías"
        startContent={<BackButton to="/admin" />}
        actions={
          <Button
            variant="contained"
            startIcon={
              policy.isSaving ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            disabled={policy.isLoading || policy.isSaving}
            onClick={() => void save()}
          >
            Guardar cambios
          </Button>
        }
      />
      <Typography color="text.secondary" maxWidth={900} mb={3}>
        Define motivos oficiales y cuándo debe intervenir un supervisor. El
        reporte usa el valor de venta de la orden afectada; no representa el
        costo contable de ingredientes.
      </Typography>

      {policy.isLoading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={900} mb={1}>
                Protección con PIN supervisor
              </Typography>
              <Stack>
                <FormControlLabel
                  control={
                    <Switch
                      checked={policy.config.requireSupervisorForPaidOrders}
                      onChange={(_, checked) =>
                        policy.setConfig((current) => ({
                          ...current,
                          requireSupervisorForPaidOrders: checked,
                        }))
                      }
                    />
                  }
                  label="Exigir PIN al anular órdenes ya pagadas"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={
                        policy.config.requireSupervisorWhenPreparationStarted
                      }
                      onChange={(_, checked) =>
                        policy.setConfig((current) => ({
                          ...current,
                          requireSupervisorWhenPreparationStarted: checked,
                        }))
                      }
                    />
                  }
                  label="Exigir PIN cuando cocina ya inició la preparación"
                />
              </Stack>
              <Alert severity="info" sx={{ mt: 1 }}>
                Un motivo marcado como “PIN siempre” conserva esa protección
                aunque los interruptores generales estén desactivados.
              </Alert>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={900} mb={2}>
                Catálogo de motivos oficiales
              </Typography>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={2}>
                <TextField
                  fullWidth
                  label="Nuevo motivo"
                  value={newLabel}
                  onChange={(event) => setNewLabel(event.target.value)}
                />
                <FormControl sx={{ minWidth: 220 }}>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    label="Categoría"
                    value={newCategory}
                    onChange={(event) =>
                      setNewCategory(event.target.value as CancellationCategory)
                    }
                  >
                    {CANCELLATION_CATEGORIES.map((category) => (
                      <MenuItem key={category} value={category}>
                        {CANCELLATION_CATEGORY_LABELS[category]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  disabled={!newLabel.trim()}
                  onClick={addReason}
                >
                  Agregar
                </Button>
              </Stack>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Motivo</TableCell>
                      <TableCell>Categoría</TableCell>
                      <TableCell align="center">Activo</TableCell>
                      <TableCell align="center">Merma</TableCell>
                      <TableCell align="center">PIN siempre</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {policy.config.reasons.map((reason) => (
                      <TableRow key={reason.id}>
                        <TableCell sx={{ minWidth: 250 }}>
                          <TextField
                            fullWidth
                            variant="standard"
                            value={reason.label}
                            onChange={(event) =>
                              updateReason(reason.id, {
                                label: event.target.value,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 190 }}>
                          <Select
                            fullWidth
                            size="small"
                            value={reason.category}
                            onChange={(event) =>
                              updateReason(reason.id, {
                                category: event.target
                                  .value as CancellationCategory,
                              })
                            }
                          >
                            {CANCELLATION_CATEGORIES.map((category) => (
                              <MenuItem key={category} value={category}>
                                {CANCELLATION_CATEGORY_LABELS[category]}
                              </MenuItem>
                            ))}
                          </Select>
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={reason.isActive}
                            onChange={(_, checked) =>
                              updateReason(reason.id, { isActive: checked })
                            }
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={reason.countsAsWaste}
                            onChange={(_, checked) =>
                              updateReason(reason.id, {
                                countsAsWaste: checked,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={reason.requiresSupervisor}
                            onChange={(_, checked) =>
                              updateReason(reason.id, {
                                requiresSupervisor: checked,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            aria-label={`Eliminar ${reason.label}`}
                            onClick={() =>
                              policy.setConfig((current) => ({
                                ...current,
                                reasons: current.reasons.filter(
                                  (candidate) => candidate.id !== reason.id,
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
                    Reporte de pérdidas operativas
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Agrupado por el motivo registrado al momento de anular.
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <TextField
                    type="date"
                    size="small"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                  />
                  <TextField
                    type="date"
                    size="small"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => void refreshMetrics()}
                  >
                    Consultar
                  </Button>
                </Stack>
              </Stack>
              <Grid container spacing={2} mb={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Metric
                    label="Órdenes anuladas"
                    value={String(policy.metrics?.totalCancelledOrders ?? 0)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Metric
                    label="Valor de venta afectado"
                    value={money.format(
                      policy.metrics?.totalAffectedAmount ?? 0,
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Metric
                    label="Valor clasificado como merma"
                    value={money.format(policy.metrics?.totalWasteAmount ?? 0)}
                  />
                </Grid>
              </Grid>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Motivo</TableCell>
                      <TableCell>Categoría</TableCell>
                      <TableCell align="right">Casos</TableCell>
                      <TableCell align="right">Valor afectado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(policy.metrics?.byReason ?? []).map((row) => (
                      <TableRow key={row.reasonId}>
                        <TableCell>{row.label}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              CANCELLATION_CATEGORY_LABELS[
                                row.category as CancellationCategory
                              ] ?? row.category
                            }
                          />
                        </TableCell>
                        <TableCell align="right">{row.count}</TableCell>
                        <TableCell align="right">
                          {money.format(row.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!policy.metrics?.byReason.length && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No hay anulaciones en el período seleccionado.
                        </TableCell>
                      </TableRow>
                    )}
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
