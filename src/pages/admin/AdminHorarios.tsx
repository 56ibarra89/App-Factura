import { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { BackButton } from "../../components/BackButton";
import PageHeader from "../../components/PageHeader";
import AccountMenu from "../../components/AccountMenu";
import { LOGIN_COLORS } from "../../theme/loginTheme";
import { useAccountManager } from "../../hooks/useAccountManager";

const WEEK_DAYS = [
  { value: "MONDAY", label: "Lunes" },
  { value: "TUESDAY", label: "Martes" },
  { value: "WEDNESDAY", label: "Miércoles" },
  { value: "THURSDAY", label: "Jueves" },
  { value: "FRIDAY", label: "Viernes" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
];

export default function AdminHorarios() {
  const { users, loading, saveUser } = useAccountManager();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Excluir administradores
  const filteredUsers = useMemo(() => {
    return users.filter((u) => u.role !== "admin");
  }, [users]);

  const selectedUser = users.find((u) => u.id === selectedUserId) || null;

  const [currentWorkDays, setCurrentWorkDays] = useState<string[]>([]);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (selectedUser) {
      setCurrentWorkDays(selectedUser.workDays || []);
    } else {
      setCurrentWorkDays([]);
    }
  }, [selectedUser]);

  const handleToggleDay = (dayValue: string) => {
    setCurrentWorkDays((prev) =>
      prev.includes(dayValue)
        ? prev.filter((d) => d !== dayValue)
        : [...prev, dayValue]
    );
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    try {
      await saveUser({
        ...selectedUser,
        workDays: currentWorkDays,
      });
      setToast({
        open: true,
        message: `Horario guardado para ${selectedUser.firstName} ${selectedUser.lastName}.`,
        severity: "success",
      });
    } catch (e) {
      console.error(e);
      setToast({
        open: true,
        message: "Ocurrió un error al guardar el horario.",
        severity: "error",
      });
    }
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: 'background.default',
        pt: 2,
        pb: 2,
        px: { xs: 2, md: 6 },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PageHeader
        title="Horarios de Empleados"
        startContent={<BackButton to="/admin" />}
        actions={<AccountMenu />}
      />

      <Grid container spacing={2} sx={{ mt: 1, flex: 1 }}>
        {/* Columna Izquierda: Lista de Empleados */}
        <Grid item xs={12} md={4} lg={3}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" fontWeight="900" sx={{ opacity: 0.8 }}>
              Empleados ({filteredUsers.length})
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {filteredUsers.map((user) => (
              <Paper
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                elevation={selectedUserId === user.id ? 4 : 1}
                sx={{
                  p: 2,
                  cursor: "pointer",
                  borderRadius: 2,
                  border: `2px solid ${
                    selectedUserId === user.id
                      ? LOGIN_COLORS.primary
                      : "transparent"
                  }`,
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 3,
                  },
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rol: {user.role.toUpperCase()}
                </Typography>
              </Paper>
            ))}
            {filteredUsers.length === 0 && !loading && (
              <Typography color="text.secondary" textAlign="center" mt={4}>
                No hay empleados registrados.
              </Typography>
            )}
          </Box>
        </Grid>

        {/* Columna Derecha: Configuración de Horario */}
        <Grid item xs={12} md={8} lg={9}>
          <Paper
            elevation={2}
            sx={{
              p: { xs: 2, md: 4 },
              borderRadius: 3,
              minHeight: "100%",
            }}
          >
            {selectedUser ? (
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Horario de {selectedUser.firstName} {selectedUser.lastName}
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={3}>
                  Selecciona los días en los que este empleado estará activo y
                  disponible en el sistema (ej. para aparecer en la lista de
                  entregas).
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <FormGroup>
                  {WEEK_DAYS.map((day) => (
                    <FormControlLabel
                      key={day.value}
                      control={
                        <Checkbox
                          checked={currentWorkDays.includes(day.value)}
                          onChange={() => handleToggleDay(day.value)}
                          color="primary"
                        />
                      }
                      label={day.label}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </FormGroup>

                <Box mt={4} display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    disabled={loading}
                    sx={{
                      fontWeight: "bold",
                      textTransform: "none",
                      borderRadius: 2,
                      px: 4,
                    }}
                  >
                    Guardar Horario
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="100%"
                minHeight={300}
              >
                <Typography variant="h6" color="text.secondary">
                  Selecciona un empleado de la lista para configurar su horario
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          sx={{ width: "100%", fontSize: "1.1rem" }}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
