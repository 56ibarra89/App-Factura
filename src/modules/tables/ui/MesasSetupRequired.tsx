import { Box, Button, Typography } from "@mui/material";

interface MesasSetupRequiredProps {
  canConfigure: boolean;
  assignedZoneWithoutTables?: boolean;
  onBack: () => void;
  onConfigure: () => void;
}

export default function MesasSetupRequired({
  canConfigure,
  assignedZoneWithoutTables = false,
  onBack,
  onConfigure,
}: MesasSetupRequiredProps) {
  const description = assignedZoneWithoutTables
    ? "La zona asignada para hoy no existe o todavía no tiene mesas configuradas."
    : "Todavía no hay mesas configuradas en el sistema.";

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 2,
        px: 3,
        textAlign: "center",
        bgcolor: "background.default",
      }}
    >
      <Typography variant="h5" color="text.primary" fontWeight="bold">
        Configuración de mesas pendiente
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {description}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {canConfigure
          ? "Configura al menos una zona con una o más mesas para continuar."
          : "Solicita a un administrador que configure las zonas y mesas antes de continuar."}
      </Typography>
      <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
        <Button variant="outlined" color="inherit" onClick={onBack}>
          Volver al menú
        </Button>
        {canConfigure && (
          <Button variant="contained" color="primary" onClick={onConfigure}>
            Configurar mesas
          </Button>
        )}
      </Box>
    </Box>
  );
}
