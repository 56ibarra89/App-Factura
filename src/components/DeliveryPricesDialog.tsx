import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Typography,
  CircularProgress,
  useTheme,
  Box,
  Snackbar,
  Alert
} from "@mui/material";
import { useDeliveryPricesConfig } from "../hooks/useDeliveryPricesConfig";

interface DeliveryPricesDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function DeliveryPricesDialog({ open, onClose }: DeliveryPricesDialogProps) {
  const theme = useTheme();
  const {
    prices,
    loading,
    saving,
    snackbar,
    closeSnackbar,
    handleSave,
    handleChange
  } = useDeliveryPricesConfig(open, onClose);

  return (
    <>
    <Dialog open={open} onClose={!saving ? onClose : undefined} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100' }}>
        Configurar Precios de Delivery
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Ingresa hasta 6 precios rápidos que aparecerán en la pantalla de Delivery.
              Deja espacios en blanco para ocultar botones.
            </Typography>
            <Grid container spacing={2}>
              {prices.map((price, index) => (
                <Grid item xs={6} key={index}>
                  <TextField
                    label={`Precio ${index + 1}`}
                    size="small"
                    fullWidth
                    value={price}
                    onChange={(e) => handleChange(index, e.target.value)}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1, color: "text.secondary" }}>C$</Typography>
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100' }}>
        <Button onClick={onClose} disabled={saving} color="inherit">
          Cancelar
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary" 
          disabled={saving || loading}
        >
          {saving ? <CircularProgress size={24} /> : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
    
    <Snackbar
      open={snackbar.open}
      autoHideDuration={4000}
      onClose={closeSnackbar}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: "100%", borderRadius: 2 }}>
        {snackbar.msg}
      </Alert>
    </Snackbar>
    </>
  );
}
