import { Box, Typography, Button } from "@mui/material";

interface MesasLoadingStateProps {
  error?: string | null;
  onRetry: () => void;
  onBack?: () => void;
}

export default function MesasLoadingState({
  error,
  onRetry,
  onBack,
}: MesasLoadingStateProps) {
  if (error) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" color="error">Oops, no se pudieron cargar las mesas.</Typography>
        <Typography variant="body1" color="text.secondary">
          {error || 'El servidor parece estar ocupado o no hay zonas configuradas.'}
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          {onBack && (
            <Button variant="outlined" color="inherit" onClick={onBack}>
              Volver al menú
            </Button>
          )}
          <Button variant="contained" color="primary" onClick={onRetry}>
            Reintentar
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" color="text.secondary">Cargando...</Typography>
      {onBack && (
        <Button variant="outlined" color="inherit" onClick={onBack}>
          Volver al menú
        </Button>
      )}
    </Box>
  );
}
