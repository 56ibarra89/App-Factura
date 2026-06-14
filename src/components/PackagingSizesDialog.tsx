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
  Alert,
  IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { usePackagingSizesConfig } from "../hooks/usePackagingSizesConfig";

interface PackagingSizesDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function PackagingSizesDialog({ open, onClose }: PackagingSizesDialogProps) {
  const theme = useTheme();
  const {
    sizes,
    loading,
    saving,
    snackbar,
    closeSnackbar,
    handleSave,
    handleChangeName,
    handleChangePrice,
    handleAdd,
    handleRemove
  } = usePackagingSizesConfig(open, onClose);

  return (
    <>
    <Dialog open={open} onClose={!saving ? onClose : undefined} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100' }}>
        Configurar Empaques / Tamaños
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Administra los tamaños o empaques disponibles para tus productos (ej. Familiar, Mediana, Mega).
            </Typography>
            <Grid container spacing={2}>
              {sizes.map((size, index) => (
                <Grid size={{ xs: 12 }} key={index} display="flex" alignItems="center">
                  <Grid size={{ xs: 7 }}>
                    <TextField
                      label={`Empaque ${index + 1}`}
                      size="small"
                      fullWidth
                      value={size.name}
                      onChange={(e) => handleChangeName(index, e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 3 }}>
                    <TextField
                      label="Precio (C$)"
                      type="number"
                      size="small"
                      fullWidth
                      value={size.price}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || Number(val) >= 0) {
                          handleChangePrice(index, val);
                        }
                      }}
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>
                  <IconButton color="error" onClick={() => handleRemove(index)} sx={{ ml: 1 }}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              ))}
              <Grid size={{ xs: 12 }}>
                <Button startIcon={<AddIcon />} variant="outlined" fullWidth onClick={handleAdd}>
                  Agregar Empaque
                </Button>
              </Grid>
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
