import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
  CircularProgress,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import UsbIcon from "@mui/icons-material/Usb";
import LanIcon from "@mui/icons-material/Lan";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import WifiTetheringIcon from "@mui/icons-material/WifiTethering";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ReplyIcon from "@mui/icons-material/Reply";
import type { PrinterConfig } from "../../api/printerConfig.types";
import { printerDispatcherService } from "../../../../shared/printing/printerDispatcherService";

interface PrinterCardProps {
  printer: PrinterConfig;
  fallbackPrinterName?: string;
  onEdit: (printer: PrinterConfig) => void;
  onDelete: (id: string) => void;
}

export default function PrinterCard({
  printer,
  fallbackPrinterName,
  onEdit,
  onDelete,
}: PrinterCardProps) {
  const [printingTest, setPrintingTest] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    error?: string;
  } | null>(null);

  const isNetwork = printer.connectionType === "network";
  const isCashier = printer.role === "cashier";
  const isKitchen = printer.role === "kitchen";

  const handlePrintTest = async () => {
    setPrintingTest(true);
    setTestResult(null);
    try {
      const result = await printerDispatcherService.printTestTicket(printer);
      setTestResult(result);
    } catch (err: unknown) {
      setTestResult({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setPrintingTest(false);
    }
  };

  const roleColor = isCashier
    ? "primary"
    : isKitchen
      ? "warning"
      : "secondary";

  const roleLabel = isCashier
    ? "Facturación (Caja)"
    : isKitchen
      ? "Cocina (Comandas)"
      : "Doble Rol (Caja y Cocina)";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: "1.5px solid",
        borderColor: printer.isActive ? `${roleColor}.light` : "divider",
        bgcolor: "background.paper",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-2px)",
        },
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <Box>
        {/* Encabezado de la Tarjeta */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar
              sx={{
                bgcolor: (theme) => alpha(theme.palette[roleColor].main, 0.12),
                color: `${roleColor}.main`,
                width: 50,
                height: 50,
                borderRadius: 3,
              }}
            >
              {isKitchen ? <SoupKitchenIcon /> : <PrintIcon />}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} noWrap>
                {printer.name}
              </Typography>
              <Chip
                label={roleLabel}
                color={roleColor}
                size="small"
                sx={{ fontWeight: 700, height: 22, fontSize: "0.7rem", mt: 0.25 }}
              />
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={0.5}>
            <IconButton size="small" onClick={() => onEdit(printer)} color="primary">
              <SettingsIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(printer.id)}
              color="error"
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Detalles de Conexión */}
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Box display="flex" alignItems="center" gap={1}>
            {isNetwork ? (
              <LanIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            ) : (
              <UsbIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            )}
            <Typography variant="body2" fontWeight={600} color="text.primary">
              {isNetwork ? "Red LAN (TCP/IP RAW 9100)" : "Cable USB (Driver Windows)"}
            </Typography>
          </Box>

          <Box pl={3.25}>
            {isNetwork ? (
              <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                IP: <strong>{printer.ipAddress || "Sin IP"}</strong> : {printer.port || 9100}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Dispositivo: <strong>{printer.windowsDeviceName || "Predeterminada"}</strong>
              </Typography>
            )}
          </Box>

          {/* Gaveta de Dinero */}
          {printer.openCashDrawer && (
            <Box display="flex" alignItems="center" gap={1} pl={0.5}>
              <PointOfSaleIcon sx={{ fontSize: 16, color: "success.main" }} />
              <Typography variant="caption" color="success.main" fontWeight={700}>
                Abre Gaveta de Dinero (Pulso RJ11)
              </Typography>
            </Box>
          )}

          {/* Respaldo / Failover */}
          {fallbackPrinterName && (
            <Box display="flex" alignItems="center" gap={1} pl={0.5}>
              <ReplyIcon sx={{ fontSize: 16, color: "info.main", transform: "scaleX(-1)" }} />
              <Typography variant="caption" color="info.main">
                Respaldo: <strong>{fallbackPrinterName}</strong>
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      {/* Resultados de prueba y Botones de Acción */}
      <Box>
        {testResult && (
          <Box mb={1.5}>
            {testResult.success ? (
              <Chip
                icon={<CheckCircleIcon />}
                label="Ticket de prueba impreso correctamente"
                color="success"
                size="small"
                variant="outlined"
                sx={{ width: "100%", justifyContent: "flex-start" }}
              />
            ) : (
              <Tooltip title={testResult.error || "Error imprimiendo"}>
                <Chip
                  icon={<ErrorOutlineIcon />}
                  label={`Error: ${testResult.error || "Falla al imprimir"}`}
                  color="error"
                  size="small"
                  variant="outlined"
                  sx={{ width: "100%", justifyContent: "flex-start" }}
                />
              </Tooltip>
            )}
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        <Button
          fullWidth
          variant="outlined"
          color={roleColor}
          startIcon={
            printingTest ? <CircularProgress size={16} color="inherit" /> : <PrintIcon />
          }
          onClick={handlePrintTest}
          disabled={printingTest}
          sx={{
            fontWeight: 700,
            textTransform: "none",
            borderRadius: 2.5,
          }}
        >
          {printingTest ? "Imprimiendo..." : "Imprimir Ticket de Prueba"}
        </Button>
      </Box>
    </Paper>
  );
}
