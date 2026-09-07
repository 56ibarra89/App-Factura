import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  RadioGroup,
  Radio,
  FormLabel,
  Paper,
  CircularProgress,
  Chip,
  Alert,
  Stack,
  Divider,
} from "@mui/material";
import UsbIcon from "@mui/icons-material/Usb";
import LanIcon from "@mui/icons-material/Lan";
import WifiTetheringIcon from "@mui/icons-material/WifiTethering";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import type {
  ElectronSystemPrinter,
  PrinterConfig,
  PrinterConnectionType,
  PrinterRole,
} from "../../api/printerConfig.types";
import { printerDispatcherService } from "../../services/printerDispatcherService";

interface PrinterConfigDialogProps {
  open: boolean;
  printer: PrinterConfig | null;
  availablePrinters: PrinterConfig[];
  onClose: () => void;
  onSave: (printer: PrinterConfig) => Promise<void>;
}

export default function PrinterConfigDialog({
  open,
  printer,
  availablePrinters,
  onClose,
  onSave,
}: PrinterConfigDialogProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<PrinterRole>("kitchen");
  const [connectionType, setConnectionType] =
    useState<PrinterConnectionType>("network");
  const [windowsDeviceName, setWindowsDeviceName] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [port, setPort] = useState<number>(9100);
  const [openCashDrawer, setOpenCashDrawer] = useState(false);
  const [fallbackPrinterId, setFallbackPrinterId] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [systemPrinters, setSystemPrinters] = useState<ElectronSystemPrinter[]>([]);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    error?: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Cargar datos al abrir
  useEffect(() => {
    if (!open) return;
    setFormError("");
    setTestResult(null);

    if (printer) {
      setName(printer.name);
      setRole(printer.role);
      setConnectionType(printer.connectionType);
      setWindowsDeviceName(printer.windowsDeviceName || "");
      setIpAddress(printer.ipAddress || "");
      setPort(printer.port || 9100);
      setOpenCashDrawer(!!printer.openCashDrawer);
      setFallbackPrinterId(printer.fallbackPrinterId || "");
      setIsActive(printer.isActive);
    } else {
      setName("Nueva Impresora Térmica");
      setRole("kitchen");
      setConnectionType("network");
      setWindowsDeviceName("");
      setIpAddress("192.168.1.200");
      setPort(9100);
      setOpenCashDrawer(false);
      setFallbackPrinterId("");
      setIsActive(true);
    }

    // Obtener lista de impresoras del sistema desde Electron
    if (window.printAPI?.getSystemPrinters) {
      window.printAPI
        .getSystemPrinters()
        .then((printers: ElectronSystemPrinter[]) => {
          setSystemPrinters(printers);
          if (!printer?.windowsDeviceName && printers.length > 0) {
            const defaultPrinter = printers.find((p: ElectronSystemPrinter) => p.isDefault);
            setWindowsDeviceName(defaultPrinter ? defaultPrinter.name : printers[0].name);
          }
        })
        .catch((err: unknown) => console.error("Error obteniendo impresoras:", err));
    }
  }, [open, printer]);

  const handleTestPing = async () => {
    if (!ipAddress.trim()) {
      setFormError("Ingresa una dirección IP válida para probar la conexión.");
      return;
    }
    setTestingConnection(true);
    setTestResult(null);
    setFormError("");

    try {
      const result = await printerDispatcherService.testNetwork(ipAddress.trim(), port);
      setTestResult(result);
    } catch (err: unknown) {
      setTestResult({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setFormError("El nombre de la impresora es obligatorio.");
      return;
    }
    if (connectionType === "network" && !ipAddress.trim()) {
      setFormError("Debes especificar la dirección IP de la impresora de red.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const payload: PrinterConfig = {
        id: printer?.id || `printer-${Date.now()}`,
        name: name.trim(),
        role,
        connectionType,
        windowsDeviceName:
          connectionType === "usb" ? windowsDeviceName || undefined : undefined,
        ipAddress:
          connectionType === "network" ? ipAddress.trim() || undefined : undefined,
        port: connectionType === "network" ? port || 9100 : undefined,
        openCashDrawer,
        fallbackPrinterId: fallbackPrinterId || undefined,
        isActive,
      };

      await onSave(payload);
      onClose();
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Error guardando la impresora.",
      );
    } finally {
      setSaving(false);
    }
  };

  const otherPrinters = availablePrinters.filter(
    (p) => !printer || p.id !== printer.id,
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>
        {printer ? "Configurar Impresora Térmica" : "Agregar Impresora Térmica"}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {formError && <Alert severity="error">{formError}</Alert>}

          {/* Nombre y Rol */}
          <TextField
            label="Nombre de la Impresora"
            placeholder="ej. Impresora Cocina o Impresora Caja"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />

          <FormControl fullWidth>
            <InputLabel>Rol / Propósito en el Restaurante</InputLabel>
            <Select
              value={role}
              label="Rol / Propósito en el Restaurante"
              onChange={(e) => {
                const newRole = e.target.value as PrinterRole;
                setRole(newRole);
                if (newRole === "cashier") {
                  setOpenCashDrawer(true);
                }
              }}
            >
              <MenuItem value="cashier">
                🖨️ Facturación y Caja (Recibos de clientes y gaveta)
              </MenuItem>
              <MenuItem value="kitchen">
                🍳 Cocina y Comandas (Órdenes de preparación)
              </MenuItem>
              <MenuItem value="both">
                🔀 Ambos Roles (Imprime facturas y comandas en la misma impresora)
              </MenuItem>
            </Select>
          </FormControl>

          {/* Tipo de Conexión */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
            <FormLabel sx={{ fontWeight: 700, mb: 1, display: "block" }}>
              Tipo de Conexión
            </FormLabel>
            <RadioGroup
              row
              value={connectionType}
              onChange={(e) => {
                setConnectionType(e.target.value as PrinterConnectionType);
                setTestResult(null);
              }}
            >
              <FormControlLabel
                value="usb"
                control={<Radio />}
                label={
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <UsbIcon fontSize="small" color="primary" />
                    <Typography variant="body2" fontWeight={600}>
                      Cable USB (Windows)
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="network"
                control={<Radio />}
                label={
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <LanIcon fontSize="small" color="secondary" />
                    <Typography variant="body2" fontWeight={600}>
                      Red LAN / Wi-Fi (TCP/IP)
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>

            <Divider sx={{ my: 2 }} />

            {connectionType === "usb" ? (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  Selecciona la impresora térmica conectada por cable y configurada en Windows:
                </Typography>
                <FormControl fullWidth size="small">
                  <InputLabel>Impresora en Windows</InputLabel>
                  <Select
                    value={windowsDeviceName}
                    label="Impresora en Windows"
                    onChange={(e) => setWindowsDeviceName(e.target.value)}
                  >
                    {systemPrinters.length > 0 ? (
                      systemPrinters.map((sp) => (
                        <MenuItem key={sp.name} value={sp.name}>
                          {sp.name} {sp.isDefault ? "(Predeterminada)" : ""}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="">
                        (Impresora predeterminada del sistema)
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Box>
            ) : (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                  Ingresa la IP asignada a la impresora en el router y el puerto RAW (9100 por defecto):
                </Typography>
                <Box display="flex" gap={2} alignItems="center">
                  <TextField
                    label="Dirección IP (LAN)"
                    placeholder="192.168.1.200"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    size="small"
                    sx={{ flex: 2 }}
                    required
                  />
                  <TextField
                    label="Puerto"
                    type="number"
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value) || 9100)}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="outlined"
                    size="medium"
                    startIcon={
                      testingConnection ? (
                        <CircularProgress size={16} />
                      ) : (
                        <WifiTetheringIcon />
                      )
                    }
                    onClick={handleTestPing}
                    disabled={testingConnection}
                    sx={{ textTransform: "none", fontWeight: 700, whiteSpace: "nowrap" }}
                  >
                    Probar Conexión
                  </Button>
                </Box>

                {testResult && (
                  <Box mt={1.5}>
                    {testResult.success ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label={`Conexión Exitosa (${testResult.latencyMs ?? 0}ms)`}
                        color="success"
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      <Chip
                        icon={<ErrorIcon />}
                        label={testResult.error || "Falla de conexión"}
                        color="error"
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Paper>

          {/* Respaldo y Gaveta */}
          <Box display="flex" flexDirection="column" gap={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Impresora de Respaldo (Fallback)</InputLabel>
              <Select
                value={fallbackPrinterId}
                label="Impresora de Respaldo (Fallback)"
                onChange={(e) => setFallbackPrinterId(e.target.value)}
              >
                <MenuItem value="">(Sin impresora de respaldo específica)</MenuItem>
                {otherPrinters.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name} ({p.connectionType === "usb" ? "Cable USB" : "Red LAN"} - {p.role})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              Si esta impresora se apaga o pierde conexión Wi-Fi, los pedidos se redirigirán
              automáticamente a la impresora de respaldo seleccionada.
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={openCashDrawer}
                  onChange={(e) => setOpenCashDrawer(e.target.checked)}
                  color="primary"
                />
              }
              label="Abrir gaveta de dinero al cobrar en efectivo (Pulso RJ11)"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  color="success"
                />
              }
              label="Impresora Activa"
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={saving} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={saving}
          sx={{ fontWeight: 700 }}
        >
          {saving ? "Guardando..." : "Guardar Impresora"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
