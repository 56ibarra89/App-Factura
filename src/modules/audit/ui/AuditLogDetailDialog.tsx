import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Paper,
  Grid,
  Divider,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import CodeIcon from "@mui/icons-material/Code";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PaymentIcon from "@mui/icons-material/Payment";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { SystemLog } from "../model/audit.types";
import { getActionMetadata, parseLogDetails } from "../utils/logFormatter";
import { formatCurrency } from "../../../shared/format";

interface AuditLogDetailDialogProps {
  log: SystemLog | null;
  open: boolean;
  onClose: () => void;
}

export const AuditLogDetailDialog: React.FC<AuditLogDetailDialogProps> = ({
  log,
  open,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!log) return null;

  const meta = getActionMetadata(log.action);
  const parsed = parseLogDetails(log.details);
  const isError = log.level.toUpperCase() === "ERROR";
  const isWarn = log.level.toUpperCase() === "WARN";

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const levelColor = isError ? "error" : isWarn ? "warning" : "info";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ m: 0, p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Chip label={meta.label} color={meta.color} sx={{ fontWeight: 700, borderRadius: 1.5 }} />
          <Chip label={log.level.toUpperCase()} color={levelColor} size="small" sx={{ fontWeight: 800 }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Categoría: {meta.category}
          </Typography>
        </Box>
        <IconButton aria-label="close" onClick={onClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {/* Metadatos Generales */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            bgcolor: "action.hover",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                Fecha y Hora
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                {format(log.timestamp, "dd MMMM yyyy, HH:mm:ss", { locale: es })}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                Usuario Responsable
              </Typography>
              <Typography variant="body2" fontWeight={700} color="primary" sx={{ mt: 0.5 }}>
                {log.user}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                Rol
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={log.role || "N/A"}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600, textTransform: "uppercase", fontSize: "0.7rem" }}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                Identificador de Registro
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontFamily: "monospace" }}>
                #{log.id ?? "N/A"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Sección Especializada: Error / Fallo Crítico */}
        {isError && (
          <Box sx={{ mb: 3 }}>
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  startIcon={copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                  onClick={() => handleCopyText(log.details || "")}
                >
                  {copied ? "Copiado" : "Copiar Error"}
                </Button>
              }
              sx={{ mb: 2, alignItems: "center" }}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                Incidente o Fallo Crítico de Aplicación
              </Typography>
            </Alert>

            <Box
              component="pre"
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "#1e1e1e",
                color: "#f8f8f2",
                fontSize: "0.8rem",
                fontFamily: "monospace",
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                maxHeight: "260px",
                border: "1px solid #333",
              }}
            >
              {log.details || "Sin descripción de error"}
            </Box>
          </Box>
        )}

        {/* Sección Especializada: Información de Facturación y Pagos */}
        {parsed.orderInfo && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
              Desglose de Operación Comercial
            </Typography>

            <Grid container spacing={1.5}>
              {parsed.orderInfo.invoiceNumber && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <ReceiptIcon color="primary" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Número Factura
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {parsed.orderInfo.invoiceNumber}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              )}

              {parsed.orderInfo.orderId && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <ShoppingBagIcon color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          ID de Orden
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {parsed.orderInfo.orderId}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              )}

              {parsed.orderInfo.finalTotal !== undefined && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: "success.subtle" }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AttachMoneyIcon color="success" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Total Cobrado
                        </Typography>
                        <Typography variant="body2" fontWeight={800} color="success.main">
                          {formatCurrency(parsed.orderInfo.finalTotal)}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              )}
            </Grid>

            {/* Pagos desglosados */}
            {parsed.orderInfo.payments && parsed.orderInfo.payments.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Métodos de Pago Utilizados:
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
                  {parsed.orderInfo.payments.map((p, idx) => (
                    <Chip
                      key={idx}
                      icon={<PaymentIcon />}
                      label={`${p.method}: ${formatCurrency(p.amount)}`}
                      size="small"
                      variant="filled"
                      sx={{ fontWeight: 600 }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {parsed.orderInfo.promotionCode && (
              <Box sx={{ mt: 1.5 }}>
                <Chip
                  icon={<LocalOfferIcon />}
                  label={`Cupón Aplicado: ${parsed.orderInfo.promotionCode}`}
                  color="secondary"
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            )}
          </Box>
        )}

        {/* Claves adicionales estructuradas o texto simple */}
        {!isError && !parsed.orderInfo && parsed.keyValuePairs && parsed.keyValuePairs.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
              Parámetros y Métricas del Evento
            </Typography>
            <Grid container spacing={1.5}>
              {parsed.keyValuePairs.map((kv) => {
                const isDiscrepancy =
                  kv.key.toLowerCase().includes("diff") ||
                  kv.key.toLowerCase().includes("discrepanc");
                const hasValue = kv.value !== "0" && kv.value !== "0.00";
                const isAlert = isDiscrepancy && hasValue;

                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={kv.key}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: isAlert ? "rgba(211, 47, 47, 0.05)" : "background.paper",
                        borderColor: isAlert ? "rgba(211, 47, 47, 0.3)" : "divider",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color={isAlert ? "error.main" : "text.secondary"}
                        fontWeight={600}
                        sx={{ display: "block" }}
                      >
                        {kv.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={isAlert ? "error.main" : "text.primary"}
                        sx={{ mt: 0.3 }}
                      >
                        {kv.value}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {!isError && !parsed.orderInfo && (!parsed.keyValuePairs || parsed.keyValuePairs.length === 0) && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Detalles del Registro
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {parsed.raw || "Sin información adicional registrada."}
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Visor de Payload Técnico JSON (si aplica) */}
        {parsed.isJson && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} display="flex" alignItems="center" gap={0.5}>
                <CodeIcon fontSize="small" /> Payload JSON Estructurado
              </Typography>
              <Tooltip title={copied ? "Copiado" : "Copiar JSON"}>
                <IconButton size="small" onClick={() => handleCopyText(parsed.raw)}>
                  {copied ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>

            <Box
              component="pre"
              sx={{
                p: 1.8,
                borderRadius: 2,
                bgcolor: "grey.900",
                color: "grey.100",
                fontSize: "0.75rem",
                fontFamily: "monospace",
                overflowX: "auto",
                maxHeight: "180px",
              }}
            >
              {JSON.stringify(JSON.parse(parsed.raw), null, 2)}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={onClose} variant="contained" sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
