import {
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { LOGIN_COLORS } from "../../../theme/loginTheme";

export default function HardwareSettingsPanel() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 6,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: alpha(LOGIN_COLORS.primary, 0.02),
        boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
      }}
    >
      <Typography variant="h6" fontWeight="900" mb={3}>
        Configuración Global de Hardware
      </Typography>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Comportamiento de Impresión
          </Typography>
          <TextField select fullWidth size="small" defaultValue="auto">
            <MenuItem value="auto">Impresión Automática (Al facturar)</MenuItem>
            <MenuItem value="manual">Confirmación Manual</MenuItem>
            <MenuItem value="none">No imprimir automáticamente</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Apertura de Gaveta
          </Typography>
          <TextField select fullWidth size="small" defaultValue="payment">
            <MenuItem value="payment">Al recibir pago en efectivo</MenuItem>
            <MenuItem value="any">En cualquier método de pago</MenuItem>
            <MenuItem value="manual">Solo apertura manual por Admin</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </Paper>
  );
}
