import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import type {
  RedeemableCertificate,
} from "../model/promotion.types";
import {
  promotionsGateway,
  type CertificateLookupGateway,
} from "../api/promotionsGateway";
import { useCatalog } from "../../catalog";

interface CertificadoDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: (
    certificate: RedeemableCertificate,
    selectedSizes?: Record<string, string>,
  ) => void;
  gateway?: CertificateLookupGateway;
}

export default function CertificadoDialog({
  open,
  onClose,
  onApply,
  gateway = promotionsGateway,
}: CertificadoDialogProps) {
  const { categories } = useCatalog();
  const [serial, setSerial] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingCertificate, setPendingCertificate] =
    useState<RedeemableCertificate | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>(
    {},
  );

  const catalogProducts = useMemo(
    () => categories.flatMap((category) => category.items),
    [categories],
  );

  useEffect(() => {
    if (open) {
      setSerial("");
      setError("");
      setPendingCertificate(null);
      setSelectedSizes({});
    }
  }, [open]);

  const multiSizeItems = useMemo(() => {
    if (!pendingCertificate) return [];
    return pendingCertificate.items.flatMap((certificateItem) => {
      const product = catalogProducts.find(
        (candidate) => candidate.id === certificateItem.productId,
      );
      if (!product || product.isCombo || product.prices.length <= 1) {
        return [];
      }
      return [{ certificateItem, product }];
    });
  }, [catalogProducts, pendingCertificate]);

  const handleConfirmSizes = () => {
    if (!pendingCertificate) return;
    onApply(pendingCertificate, selectedSizes);
    onClose();
  };

  const handleApply = async () => {
    if (pendingCertificate) {
      handleConfirmSizes();
      return;
    }
    if (!serial.trim()) return;
    setError("");
    setLoading(true);

    try {
      const data = await gateway.findCertificate(serial);

      if (data.status !== "Disponible") {
        setError(`Este certificado no puede usarse (Estado: ${data.status}).`);
        return;
      }

      const initialSizes: Record<string, string> = {};
      let requiresSizeSelection = false;
      for (const certificateItem of data.items) {
        const product = catalogProducts.find(
          (candidate) => candidate.id === certificateItem.productId,
        );
        if (product && !product.isCombo && product.prices.length > 1) {
          requiresSizeSelection = true;
          initialSizes[certificateItem.productId] = product.prices[0].size;
        }
      }

      if (requiresSizeSelection) {
        setPendingCertificate(data);
        setSelectedSizes(initialSizes);
        return;
      }

      onApply(data);
      onClose();
    } catch (error: unknown) {
      const requestError = error as { status?: number; message?: string };
      if (requestError.status === 404) {
        setError("No se encontró ningún certificado con este número.");
      } else if (requestError.message) {
        setError(requestError.message);
      } else {
        setError("Error al validar el certificado.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isInputEmpty = serial.trim().length === 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
        <CardGiftcardIcon color="primary" />
        Canjear Vale / Certificado
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 1 }}>
          {pendingCertificate && multiSizeItems.length > 0 ? (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Certificado <strong>{pendingCertificate.serial}</strong> válido.
                Selecciona el tamaño para cada producto incluido:
              </Typography>
              {multiSizeItems.map(({ certificateItem, product }) => (
                <FormControl
                  key={certificateItem.productId}
                  fullWidth
                  size="small"
                >
                  <InputLabel>
                    Tamaño — {product.name} (x{certificateItem.quantity})
                  </InputLabel>
                  <Select
                    label={`Tamaño — ${product.name} (x${certificateItem.quantity})`}
                    value={
                      selectedSizes[certificateItem.productId] ??
                      product.prices[0]?.size ??
                      ""
                    }
                    onChange={(e) =>
                      setSelectedSizes((prev) => ({
                        ...prev,
                        [certificateItem.productId]: e.target.value,
                      }))
                    }
                  >
                    {product.prices.map((priceOption) => (
                      <MenuItem key={priceOption.size} value={priceOption.size}>
                        {priceOption.size}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}
            </Stack>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Ingresa el número de serie del certificado para canjear su beneficio.
              </Typography>
              <TextField
                autoFocus
                fullWidth
                label="Número de Serie"
                placeholder="Ej. VC-847291"
                value={serial}
                onChange={(e) => {
                  setSerial(e.target.value);
                  setError("");
                }}
                error={!!error}
                helperText={error}
                InputProps={{
                  startAdornment: <CardGiftcardIcon color="action" sx={{ mr: 1, fontSize: 20 }} />,
                  style: { fontSize: "1.2rem", fontWeight: "bold" },
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isInputEmpty) {
                    void handleApply();
                  }
                }}
              />
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => void handleApply()}
          disabled={(!pendingCertificate && isInputEmpty) || loading}
        >
          {loading
            ? "Verificando..."
            : pendingCertificate
              ? "Confirmar Canje"
              : "Canjear"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
