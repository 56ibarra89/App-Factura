import { Box, Typography, Button } from "@mui/material";

interface Props {
  error?: string | null;
  onRetry: () => void;
}

export default function MesasLoadingState({ error, onRetry }: Props) {
  if (error) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" color="error">Oops, no se pudieron cargar las mesas.</Typography>
        <Typography variant="body1" color="text.secondary">
          {error || 'El servidor parece estar ocupado o no hay zonas configuradas.'}
        </Typography>
        <Button variant="contained" color="primary" onClick={onRetry}>
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" color="text.secondary">Cargando...</Typography>
    </Box>
  );
}
