import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from "@mui/material";
import { Save, Person } from "@mui/icons-material";
import { LOGIN_COLORS } from "../../theme/loginTheme";
import { UserAccount } from "../../types/user";

const WEEK_DAYS = [
  { value: "MONDAY", label: "Lunes", short: "L" },
  { value: "TUESDAY", label: "Martes", short: "M" },
  { value: "WEDNESDAY", label: "Miércoles", short: "X" },
  { value: "THURSDAY", label: "Jueves", short: "J" },
  { value: "FRIDAY", label: "Viernes", short: "V" },
  { value: "SATURDAY", label: "Sábado", short: "S" },
  { value: "SUNDAY", label: "Domingo", short: "D" },
];

interface WaiterZonesEditorProps {
  selectedUser: UserAccount | null;
  floorsConfig: { id: number; name: string }[];
  currentZones: Record<string, number>;
  onZoneChange: (day: string, floor: number) => void;
  onSave: () => void;
  loading: boolean;
  saving: boolean;
}

export default function WaiterZonesEditor({
  selectedUser,
  floorsConfig,
  currentZones,
  onZoneChange,
  onSave,
  loading,
  saving
}: WaiterZonesEditorProps) {
  if (!selectedUser) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100%"
        minHeight={400}
        bgcolor="background.paper"
        borderRadius={4}
        sx={{ opacity: 0.6 }}
      >
        <Person sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Selecciona un mesero para asignar sus zonas.
        </Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, height: "100%", border: "1px solid", borderColor: "divider" }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Zonas de {selectedUser.firstName}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        Asigna en qué planta atenderá este mesero los días que le toca trabajar.
      </Typography>
      
      {!selectedUser.workDays || selectedUser.workDays.length === 0 ? (
        <Alert severity="warning">
          Este mesero no tiene ningún día laborable asignado en la pantalla de Horarios.
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {WEEK_DAYS.filter(day => (selectedUser.workDays || []).includes(day.value)).map(day => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={day.value}>
                <Box sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.default",
                  transition: "0.2s",
                  "&:hover": { borderColor: LOGIN_COLORS.primary }
                }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="primary.main" mb={2}>
                    {day.label}
                  </Typography>
                  <FormControl fullWidth size="small">
                    <InputLabel>Planta asignada</InputLabel>
                    <Select
                      value={currentZones[day.value] || ""}
                      label="Planta asignada"
                      onChange={(e) => onZoneChange(day.value, Number(e.target.value))}
                    >
                      <MenuItem value=""><em>(Sin asignar)</em></MenuItem>
                      {floorsConfig.map(floor => (
                        <MenuItem key={floor.id} value={floor.id}>
                          {floor.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box display="flex" justifyContent="flex-end" mt={6}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Save />}
              onClick={onSave}
              disabled={saving || loading}
              sx={{
                bgcolor: LOGIN_COLORS.primary,
                borderRadius: 2,
                px: 4,
                py: 1.5,
                textTransform: "none",
                fontWeight: "bold",
                "&:hover": {
                  bgcolor: LOGIN_COLORS.primaryDark,
                }
              }}
            >
              {saving ? "Guardando..." : "Guardar Asignaciones"}
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
}
