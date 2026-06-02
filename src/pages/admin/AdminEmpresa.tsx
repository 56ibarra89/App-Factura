import { useState, useRef } from "react";
import { 
  Box, 
  Container, 
  Typography, 
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Snackbar,
  Alert,
  Paper,
  Divider,
  InputAdornment,
  IconButton,
  Tooltip
} from "@mui/material";
import { BackButton } from "../../components/BackButton";
import StorefrontIcon from "@mui/icons-material/Storefront";
import SaveIcon from "@mui/icons-material/Save";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import BusinessIcon from "@mui/icons-material/Business";
import DeleteIcon from "@mui/icons-material/Delete";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PageHeader from "../../components/PageHeader";
import ConfirmDialog from "../../components/ConfirmDialog";
import { LOGIN_GRADIENTS, LOGIN_COLORS } from "../../theme/loginTheme";
import { useEmpresaConfig } from "../../hooks/useEmpresaConfig";

const AdminEmpresa = () => {
  const { config, updateField, saveConfig, resetConfig } = useEmpresaConfig();
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveConfig();
      setToastMessage("¡Identidad de la empresa actualizada con éxito!");
      setToastOpen(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setConfirmOpen(true);
  };

  const confirmReset = async () => {
    setConfirmOpen(false);
    setLoading(true);
    try {
      await resetConfig();
      setToastMessage("¡Configuración eliminada y restablecida con éxito!");
      setToastOpen(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField('logoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box
      minHeight="100vh"
      sx={{
        background: LOGIN_GRADIENTS.pageBackground,
        pt: 4,
        pb: 8,
        px: { xs: 2, md: 6 },
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {/* Decorative Background */}
      <Box
        sx={{
          position: "absolute",
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          background: `radial-gradient(circle, ${LOGIN_COLORS.primarySubtle} 0%, rgba(255,255,255,0) 70%)`,
          borderRadius: "50%",
          zIndex: 0,
          pointerEvents: "none"
        }}
      />

      <Box position="relative" zIndex={1}>
        <PageHeader
          title="Identidad de la Empresa"
          startContent={<BackButton to="/admin" />}
        />

        <Box sx={{ mt: 2, mb: 4, pl: 1 }}>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 650 }}>
            Configura la cara visible de tu negocio. Sube tu logotipo y actualiza los datos que tus clientes verán impresos en todos los tickets y comprobantes.
          </Typography>
        </Box>

        <Container maxWidth="md" disableGutters>
          <Card 
            elevation={0}
            sx={{
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'grey.200',
              boxShadow: '0 12px 40px rgba(0,0,0,0.04)',
              overflow: 'hidden',
              background: 'white'
            }}
          >
            {/* Header decorativo del formulario */}
            <Box 
              sx={{ 
                height: 120, 
                background: `linear-gradient(135deg, #ef5350 0%, ${LOGIN_COLORS.primary} 100%)`,
                position: 'relative'
              }} 
            />
            
            <CardContent sx={{ p: { xs: 3, sm: 5 }, pt: 0, position: 'relative' }}>
              
              {/* Sección de Logo (Superpuesta) */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                mt: -7,
                mb: 4
              }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  hidden 
                  ref={fileInputRef} 
                  onChange={handleLogoUpload} 
                />
                <Box sx={{ position: 'relative' }}>
                  <Paper
                    elevation={3}
                    sx={{
                      width: 140,
                      height: 140,
                      borderRadius: '50%',
                      position: 'relative',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      border: '4px solid white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        '& .upload-overlay': { opacity: 1 }
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {config.logoUrl ? (
                      <Box 
                        component="img" 
                        src={config.logoUrl} 
                        alt="Logotipo" 
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <StorefrontIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                    )}
                    
                    {/* Overlay de Hover */}
                    <Box 
                      className="upload-overlay"
                      sx={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s'
                      }}
                    >
                      <PhotoCameraIcon sx={{ mb: 1 }} />
                      <Typography variant="caption" fontWeight={600}>Subir Logo</Typography>
                    </Box>
                  </Paper>

                  {config.logoUrl && (
                    <Tooltip title="Eliminar logo" placement="top">
                      <IconButton
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation(); // Avoid triggering the upload click
                          updateField('logoUrl', '');
                        }}
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          bgcolor: 'white',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          '&:hover': {
                            bgcolor: 'error.main',
                            color: 'white',
                          }
                        }}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ mt: 2 }}>
                  {config.businessName || "Tu Empresa"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Haz clic en el círculo para cambiar el logotipo
                </Typography>
              </Box>

              <Divider sx={{ mb: 5 }} />

              {/* Formulario */}
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Nombre Comercial"
                    variant="outlined"
                    value={config.businessName}
                    onChange={(e) => updateField('businessName', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon color="action" />
                        </InputAdornment>
                      )
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'grey.50' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Teléfono Principal"
                    variant="outlined"
                    value={config.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon color="action" />
                        </InputAdornment>
                      )
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'grey.50' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Dirección Física"
                    variant="outlined"
                    value={config.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon color="action" />
                        </InputAdornment>
                      )
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'grey.50' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Mensaje al Pie del Ticket"
                    variant="outlined"
                    multiline
                    rows={2}
                    value={config.ticketFooter}
                    onChange={(e) => updateField('ticketFooter', e.target.value)}
                    helperText="Agradecimiento o políticas que se imprimirán al final (Ej: '¡Gracias por su compra!')"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                          <ReceiptIcon color="action" />
                        </InputAdornment>
                      )
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'grey.50' } }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 6, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  size="large"
                  startIcon={<DeleteIcon />}
                  onClick={handleReset}
                  disabled={loading}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 700,
                  }}
                >
                  Restablecer / Eliminar
                </Button>

                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={loading}
                  sx={{
                    px: 5,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 700,
                    boxShadow: '0 6px 20px 0 rgba(229, 57, 53, 0.35)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(229, 57, 53, 0.45)'
                    }
                  }}
                >
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>

      <Snackbar 
        open={toastOpen} 
        autoHideDuration={4000} 
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setToastOpen(false)} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%', borderRadius: 2, boxShadow: 3, fontWeight: 600 }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>

      <ConfirmDialog
        open={confirmOpen}
        title="Restablecer Configuración"
        message="¿Estás seguro de que deseas eliminar el logotipo y restablecer toda la configuración de la empresa a sus valores por defecto? Esta acción no se puede deshacer."
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmReset}
      />
    </Box>
  );
};

export default AdminEmpresa;
