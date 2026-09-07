import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Grid,
  Snackbar,
  Typography,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import PrintIcon from "@mui/icons-material/Print";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import { BackButton, PageHeader } from "../../../shared/ui";
import DeviceCard from "../ui/admin/DeviceCard";
import HardwareSettingsPanel from "../ui/admin/HardwareSettingsPanel";
import PrinterCard from "../ui/admin/PrinterCard";
import PrinterConfigDialog from "../ui/admin/PrinterConfigDialog";
import { useAdminDevices } from "../hooks/useAdminDevices";
import { LOGIN_COLORS } from "../../../shared/theme";
import type { DeviceGateway } from "../api/deviceGateway";
import type { PrinterConfig } from "../api/printerConfig.types";
import { printerDispatcherService } from "../services/printerDispatcherService";

interface PerifericosProps {
  gateway?: DeviceGateway;
}

const DevicesPage = ({ gateway }: PerifericosProps) => {
  const devices = useAdminDevices(gateway);
  const [printers, setPrinters] = useState<PrinterConfig[]>([]);
  const [loadingPrinters, setLoadingPrinters] = useState(false);

  // Estados del modal de edición de impresoras
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterConfig | null>(null);

  // Alerta de Failover / Respaldo
  const [failoverNotice, setFailoverNotice] = useState<{
    open: boolean;
    message: string;
    severity: "warning" | "error";
  }>({
    open: false,
    message: "",
    severity: "warning",
  });

  const loadPrinters = useCallback(async () => {
    setLoadingPrinters(true);
    try {
      const list = await printerDispatcherService.getPrinters(true);
      setPrinters(list);
    } catch (err) {
      console.error("Error cargando impresoras:", err);
    } finally {
      setLoadingPrinters(false);
    }
  }, []);

  useEffect(() => {
    void loadPrinters();

    // Escuchar eventos de Failover para alertar al usuario
    const handleFailoverEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{
        failedPrinterName: string;
        fallbackPrinterName: string;
        error: string;
        critical?: boolean;
      }>;
      const detail = customEvent.detail;
      if (detail) {
        setFailoverNotice({
          open: true,
          message: detail.critical
            ? `⚠️ ERROR CRÍTICO: ${detail.failedPrinterName} falló y no hay respaldo.`
            : `⚠️ AVISO: ${detail.failedPrinterName} no respondió (${detail.error}). La orden fue redirigida a ${detail.fallbackPrinterName}.`,
          severity: detail.critical ? "error" : "warning",
        });
      }
    };

    window.addEventListener("appfactura:printer-failover", handleFailoverEvent);
    return () => {
      window.removeEventListener("appfactura:printer-failover", handleFailoverEvent);
    };
  }, [loadPrinters]);

  const handleOpenAdd = () => {
    setSelectedPrinter(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (printer: PrinterConfig) => {
    setSelectedPrinter(printer);
    setDialogOpen(true);
  };

  const handleSavePrinter = async (printer: PrinterConfig) => {
    await printerDispatcherService.savePrinter(printer);
    await loadPrinters();
    await devices.refresh();
  };

  const handleDeletePrinter = async (id: string) => {
    if (window.confirm("¿Seguro que deseas eliminar esta impresora?")) {
      await printerDispatcherService.deletePrinter(id);
      await loadPrinters();
      await devices.refresh();
    }
  };

  const drawerDevices = devices.devices.filter((d) => d.type === "drawer");

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: "background.default",
        pt: 2,
        pb: 8,
        px: { xs: 2, md: 6 },
      }}
    >
      <PageHeader
        title="Gestión de Periféricos e Impresoras"
        startContent={<BackButton to="/admin" />}
        actions={
          <Box display="flex" gap={1.5}>
            <Button
              onClick={() => {
                devices.scan();
                loadPrinters();
              }}
              disabled={devices.scanning || loadingPrinters}
              variant="outlined"
              startIcon={<RefreshIcon />}
              sx={{
                borderRadius: 3,
                bgcolor: "background.paper",
                fontWeight: "bold",
                textTransform: "none",
              }}
            >
              {devices.scanning ? "Escaneando..." : "Actualizar Estado"}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAdd}
              sx={{
                borderRadius: 3,
                bgcolor: LOGIN_COLORS.primary,
                fontWeight: "bold",
                textTransform: "none",
              }}
            >
              Agregar Impresora
            </Button>
          </Box>
        }
      />

      <Box sx={{ mt: 3, mb: 6 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Configura y administra la impresión dual inteligente de tu restaurante.
          Controla impresoras térmicas conectadas por Cable USB (Windows) para Facturación
          y Red LAN / Wi-Fi (TCP/IP RAW 9100) para Cocina con enrutamiento de respaldo mutuo.
        </Typography>

        {/* Sección 1: Impresoras Térmicas (Dual Printing) */}
        <Box mb={5}>
          <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
            <PrintIcon color="primary" sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight="800">
                Impresoras Térmicas y Enrutamiento Inteligente
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Enrutamiento automático para Facturación (USB) y Cocina (LAN) con respaldo automático (Failover)
              </Typography>
            </Box>
            <Divider sx={{ flex: 1, opacity: 0.5, ml: 2 }} />
          </Box>

          <Grid container spacing={3}>
            {printers.map((printer) => {
              const fallbackPrinter = printers.find(
                (p) => p.id === printer.fallbackPrinterId,
              );
              return (
                <Grid size={{ xs: 12, md: 6 }} key={printer.id}>
                  <PrinterCard
                    printer={printer}
                    fallbackPrinterName={fallbackPrinter?.name}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeletePrinter}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Sección 2: Gavetas de Dinero */}
        <Box mb={5}>
          <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
            <PointOfSaleIcon color="primary" sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight="800">
                Gavetas de Dinero (RJ11)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Apertura automática mediante pulso eléctrico enviado a través de la impresora de facturación
              </Typography>
            </Box>
            <Divider sx={{ flex: 1, opacity: 0.5, ml: 2 }} />
          </Box>

          <Grid container spacing={3}>
            {drawerDevices.map((device) => (
              <Grid size={{ xs: 12, sm: 6 }} key={device.id}>
                <DeviceCard device={device} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      <HardwareSettingsPanel />

      {/* Modal de Configuración de Impresora */}
      <PrinterConfigDialog
        open={dialogOpen}
        printer={selectedPrinter}
        availablePrinters={printers}
        onClose={() => setDialogOpen(false)}
        onSave={handleSavePrinter}
      />

      {/* Snackbar de Notificación de Failover */}
      <Snackbar
        open={failoverNotice.open}
        autoHideDuration={7000}
        onClose={() => setFailoverNotice((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={failoverNotice.severity}
          variant="filled"
          onClose={() => setFailoverNotice((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%", fontWeight: 600 }}
        >
          {failoverNotice.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DevicesPage;
