
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Stack,
  Alert,
} from "@mui/material";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import type {
  CertificadoRule,
} from "../../model/promotion.types";

function statusColor(
  s: CertificadoRule["status"]
): "success" | "default" | "error" {
  if (s === "Disponible") return "success";
  if (s === "Anulado") return "error";
  return "default";
}

function statusLabel(s: CertificadoRule["status"]): string {
  if (s === "Disponible") return "✅ Disponible para canje";
  if (s === "Entregado") return "📦 Ya entregado";
  return "🚫 Anulado";
}

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.75 }}>
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600} textAlign="right">
      {value}
    </Typography>
  </Box>
);

interface CertificadoDetailDialogProps {
  open: boolean;
  onClose: () => void;
  certificado: CertificadoRule | null;

  onMarkDelivered?: (id: number) => void;

  onCancel?: (id: number) => void;
}

const CertificadoDetailDialog = ({
  open,
  onClose,
  certificado,
  onMarkDelivered,
  onCancel,
}: CertificadoDetailDialogProps) => {
  if (!certificado) return null;

  const isAvailable = certificado.status === "Disponible";

  const handleMarkDelivered = () => {
    onMarkDelivered?.(certificado.id);
    onClose();
  };

  const handleCancel = () => {
    onCancel?.(certificado.id);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
        <CardMembershipIcon color="primary" />
        Detalle del Certificado
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {}
          <Box
            sx={{
              textAlign: "center",
              bgcolor: "action.hover",
              border: "2px dashed",
              borderColor: "primary.light",
              borderRadius: 2,
              py: 2,
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block">
              SERIAL ÚNICO
            </Typography>
            <Typography
              variant="h5"
              fontWeight={800}
              color="primary.main"
              letterSpacing={3}
            >
              {certificado.serial}
            </Typography>
            <Chip
              label={certificado.status}
              color={statusColor(certificado.status)}
              size="small"
              sx={{ mt: 1, fontWeight: 600 }}
            />
          </Box>

          {}
          <Box>
            <Divider sx={{ mb: 1 }} />
            <DetailRow label="Origen / Empresa" value={certificado.origin} />
            <Divider />
            <DetailRow label="Producto a Canjear" value={certificado.product} />
            <Divider />
            <DetailRow label="Fecha de Emisión" value={certificado.issueDate} />
            <Divider />
            <DetailRow
              label="Estado"
              value={
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color={
                    certificado.status === "Disponible"
                      ? "success.main"
                      : certificado.status === "Anulado"
                      ? "error.main"
                      : "text.secondary"
                  }
                >
                  {statusLabel(certificado.status)}
                </Typography>
              }
            />
            {certificado.notes && (
              <>
                <Divider />
                <DetailRow label="Notas" value={certificado.notes} />
              </>
            )}
          </Box>

          {}
          {isAvailable && (
            <Stack spacing={1.5}>
              {onMarkDelivered && (
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={handleMarkDelivered}
                  size="large"
                >
                  Marcar como Entregado (Canjear)
                </Button>
              )}
              {onCancel && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<CancelOutlinedIcon />}
                  onClick={handleCancel}
                >
                  Anular Certificado
                </Button>
              )}
            </Stack>
          )}

          {}
          {!isAvailable && (
            <Alert
              severity={certificado.status === "Entregado" ? "info" : "error"}
              sx={{ fontSize: "0.82rem" }}
            >
              {certificado.status === "Entregado"
                ? "Este certificado ya fue entregado al cliente y no puede modificarse."
                : "Este certificado fue anulado y ya no es válido para canje."}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button fullWidth variant="outlined" onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CertificadoDetailDialog;

