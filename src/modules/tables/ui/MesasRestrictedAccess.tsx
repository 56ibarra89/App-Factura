import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function TablesRestrictedAccess() {
  const navigate = useNavigate();

  const handleSalir = () => {
    navigate("/home");
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2, bgcolor: "background.default" }}>
      <Typography variant="h5" color="text.primary" fontWeight="bold">Acceso Restringido</Typography>
      <Typography variant="body1" color="text.secondary">
        No tienes zona asignada para el día de hoy.
      </Typography>
      <Button variant="contained" color="primary" onClick={handleSalir} sx={{ mt: 2 }}>
        Volver al Inicio
      </Button>
    </Box>
  );
}
