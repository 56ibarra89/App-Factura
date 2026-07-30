import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  InputAdornment,
  Tabs,
  Tab,
} from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import type {
  AppliedPromotion,
  CuponRule,
  DescuentoRule,
} from "../model/promotion.types";
import {
  computeCuponStatus,
  useCupones,
} from "../hooks/useCupones";
import { useDescuentos } from "../hooks/useDescuentos";

interface PromocionesSelectorProps {
  currentPromotion: AppliedPromotion | null;
  onApply: (promo: AppliedPromotion) => void;
  onRemove: () => void;
}

export default function PromocionesSelector({
  currentPromotion,
  onApply,
  onRemove,
}: PromocionesSelectorProps) {
  const [open, setOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  
  const { cupones: currentCupones } = useCupones();
  const { descuentos: currentDescuentos } = useDescuentos();

  const handleApplyCode = () => {
    setError("");
    const cupon = currentCupones.find((c) => c.code === code.trim().toUpperCase());
    if (!cupon) {
      setError("Código no encontrado");
      return;
    }

    const status = computeCuponStatus(
      cupon.maxUses,
      cupon.currentUses,
      cupon.expiresDate,
      cupon.status
    );

    if (status !== "Activo") {
      setError(`Cupón no válido: ${status}`);
      return;
    }

    onApply({
      code: cupon.code,
      discountType: cupon.discountType,
      discountValue: parseFloat(cupon.discountValue),
    });
    setCode("");
    setOpen(false);
  };

  const handleSelectCupon = (cupon: CuponRule) => {
    onApply({
      code: cupon.code,
      discountType: cupon.discountType,
      discountValue: parseFloat(cupon.discountValue),
    });
    setOpen(false);
  };

  const handleSelectDescuento = (desc: DescuentoRule) => {
    // Convert "Porcentaje" to "porcentaje", "Monto Fijo" to "monto_fijo"
    const isPercent = desc.type.toLowerCase() === "porcentaje";
    const cleanValue = desc.value.replace(/[^0-9.]/g, "");
    onApply({
      code: desc.name,
      discountType: isPercent ? "porcentaje" : "monto_fijo",
      discountValue: parseFloat(cleanValue),
    });
    setOpen(false);
  };

  return (
    <Box mb={2}>
      {currentPromotion ? (
        <Box display="flex" alignItems="center" gap={1} justifyContent="space-between">
          <Chip
            icon={<LocalOfferIcon fontSize="small" />}
            label={`Promoción aplicada: ${currentPromotion.code}`}
            color="success"
            variant="outlined"
          />
          <Button size="small" color="error" onClick={onRemove}>
            Quitar
          </Button>
        </Box>
      ) : (
        <Button
          variant="outlined"
          startIcon={<LocalOfferIcon />}
          fullWidth
          onClick={() => setOpen(true)}
          sx={{ py: 1 }}
        >
          Aplicar Promoción o Descuento
        </Button>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 0 }}>
          Seleccionar Promoción
          <Tabs
            value={tabIndex}
            onChange={(_, val) => setTabIndex(val)}
            sx={{ mt: 1, borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Cupones" />
            <Tab label="Descuentos" />
          </Tabs>
        </DialogTitle>
        <DialogContent dividers>
          {tabIndex === 0 && (
            <>
              <Box mb={3} mt={1} display="flex" gap={1}>
                <TextField
                  label="Código de Cupón"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  error={!!error}
                  helperText={error}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalOfferIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  disableElevation
                  onClick={handleApplyCode}
                  disabled={!code.trim()}
                >
                  Aplicar
                </Button>
              </Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Promociones Disponibles
              </Typography>
              <List disablePadding>
                {currentCupones.filter(
                  (c) =>
                    computeCuponStatus(c.maxUses, c.currentUses, c.expiresDate, c.status) ===
                    "Activo"
                ).map((cupon) => (
                  <ListItem key={cupon.id} disablePadding divider>
                    <ListItemButton onClick={() => handleSelectCupon(cupon)}>
                      <ListItemText
                        primary={cupon.code}
                        secondary={
                          cupon.discountType === "porcentaje"
                            ? `${cupon.discountValue}% de descuento`
                            : `C$${cupon.discountValue} de descuento`
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {tabIndex === 1 && (
            <List disablePadding sx={{ mt: 1 }}>
              {currentDescuentos.filter((d) => d.status === "Activo").map((desc) => (
                <ListItem key={desc.id} disablePadding divider>
                  <ListItemButton onClick={() => handleSelectDescuento(desc)}>
                    <ListItemText
                      primary={desc.name}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {desc.value}
                          </Typography>
                          {" — " + desc.appliesTo}
                        </>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
