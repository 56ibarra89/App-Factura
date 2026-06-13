import { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Divider,
  Snackbar,
  Alert,
  Avatar,
  Fade,
} from "@mui/material";
import { 
  EventNote, 
  DirectionsBike, 
  PointOfSale, 
  RestaurantMenu, 
  Person,
  CheckCircle,
  RadioButtonUnchecked
} from "@mui/icons-material";
import { BackButton } from "../../components/BackButton";
import PageHeader from "../../components/PageHeader";
import { LOGIN_COLORS } from "../../theme/loginTheme";
import { useAccountManager } from "../../hooks/useAccountManager";

const WEEK_DAYS = [
  { value: "MONDAY", label: "Lunes", short: "L" },
  { value: "TUESDAY", label: "Martes", short: "M" },
  { value: "WEDNESDAY", label: "Miércoles", short: "X" },
  { value: "THURSDAY", label: "Jueves", short: "J" },
  { value: "FRIDAY", label: "Viernes", short: "V" },
  { value: "SATURDAY", label: "Sábado", short: "S" },
  { value: "SUNDAY", label: "Domingo", short: "D" },
];

const getRoleIcon = (role: string) => {
  switch (role.toLowerCase()) {
    case "motorizado":
      return <DirectionsBike fontSize="small" />;
    case "cajero":
      return <PointOfSale fontSize="small" />;
    case "mesero":
    case "cocinero":
      return <RestaurantMenu fontSize="small" />;
    default:
      return <Person fontSize="small" />;
  }
};

const stringAvatar = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ''}`.toUpperCase();
};

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
        bgcolor: '#f8fafc', // Fondo sutilmente más moderno
        pt: 2,
        pb: 4,
        px: { xs: 2, md: 6 },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PageHeader
        title="Horarios de Empleados"
        startContent={<BackButton to="/admin" />}
      />

      <Grid container spacing={2} sx={{ mt: 1, flex: 1 }}>
        {/* Columna Izquierda: Lista de Empleados */}
        <Grid size={{ xs: 12, md: 4, lg: 3 }}>
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {filteredUsers.map((user) => {
              const isSelected = selectedUserId === user.id;
              return (
                <Paper
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  elevation={isSelected ? 3 : 0}
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    borderRadius: 3,
                    border: `1px solid ${
                      isSelected ? LOGIN_COLORS.primary : "rgba(0,0,0,0.08)"
                    }`,
                    bgcolor: isSelected ? "rgba(227, 26, 26, 0.04)" : "white",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      borderColor: isSelected ? LOGIN_COLORS.primary : "rgba(0,0,0,0.15)",
                    },
                    display: "flex",
                    alignItems: "center",
                    gap: 2
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: isSelected ? LOGIN_COLORS.primary : "grey.200",
                      color: isSelected ? "white" : "text.secondary",
                      fontWeight: "bold",
                      width: 48,
                      height: 48,
                      boxShadow: isSelected ? `0 0 0 3px rgba(227, 26, 26, 0.2)` : 'none'
                    }}
                  >
                    {stringAvatar(user.firstName, user.lastName)}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight="700" color={isSelected ? "text.primary" : "text.secondary"}>
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                      {getRoleIcon(user.role)}
                      <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                        {user.role}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
            {filteredUsers.length === 0 && !loading && (
              <Box textAlign="center" py={4} bgcolor="white" borderRadius={3} border="1px dashed rgba(0,0,0,0.1)">
                <Typography color="text.secondary">
                  No hay empleados registrados.
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>

        {/* Columna Derecha: Configuración de Horario */}
        <Grid size={{ xs: 12, md: 8, lg: 9 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              minHeight: "100%",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 10px 40px -10px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {selectedUser ? (
              <Fade in={true} timeout={500}>
                <Box flex={1} display="flex" flexDirection="column">
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Avatar sx={{ bgcolor: "rgba(227, 26, 26, 0.1)", color: LOGIN_COLORS.primary, width: 56, height: 56 }}>
                      <EventNote fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: "-0.5px" }}>
                        Horario de {selectedUser.firstName}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                        Configura los días de trabajo semanales para este empleado.
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 4, opacity: 0.6 }} />
                  
                  <Box mb={4}>
                    <Typography variant="subtitle1" fontWeight="700" mb={3} color="text.primary">
                      Días Laborables Seleccionados
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={2}>
                      {WEEK_DAYS.map((day) => {
                        const isChecked = currentWorkDays.includes(day.value);
                        return (
                          <Paper
                            key={day.value}
                            onClick={() => handleToggleDay(day.value)}
                            elevation={isChecked ? 2 : 0}
                            sx={{
                              width: { xs: 'calc(50% - 8px)', sm: '120px' },
                              height: '100px',
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              borderRadius: 4,
                              border: `2px solid ${isChecked ? LOGIN_COLORS.primary : "rgba(0,0,0,0.08)"}`,
                              bgcolor: isChecked ? LOGIN_COLORS.primary : "transparent",
                              color: isChecked ? "white" : "text.secondary",
                              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                              "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                                borderColor: isChecked ? LOGIN_COLORS.primary : "rgba(0,0,0,0.2)",
                              },
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                          >
                            {isChecked && (
                              <Box sx={{ position: 'absolute', top: 8, right: 8, opacity: 0.8 }}>
                                <CheckCircle fontSize="small" />
                              </Box>
                            )}
                            {!isChecked && (
                              <Box sx={{ position: 'absolute', top: 8, right: 8, opacity: 0.3 }}>
                                <RadioButtonUnchecked fontSize="small" />
                              </Box>
                            )}
                            <Typography variant="h5" fontWeight="900" sx={{ mb: 0.5 }}>
                              {day.short}
                            </Typography>
                            <Typography variant="caption" fontWeight="600" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
                              {day.label}
                            </Typography>
                          </Paper>
                        );
                      })}
                    </Box>
                  </Box>

                  <Box mt="auto" display="flex" justifyContent="flex-end" pt={4}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSave}
                      disabled={loading}
                      startIcon={<EventNote />}
                      sx={{
                        fontWeight: "800",
                        textTransform: "none",
                        borderRadius: 3,
                        px: 5,
                        py: 1.5,
                        fontSize: "1.1rem",
                        boxShadow: `0 8px 20px -8px ${LOGIN_COLORS.primary}`,
                        "&:hover": {
                          boxShadow: `0 12px 24px -8px ${LOGIN_COLORS.primary}`,
                          transform: "translateY(-2px)"
                        },
                        transition: "all 0.2s"
                      }}
                    >
                      Guardar Cambios
                    </Button>
                  </Box>
                </Box>
              </Fade>
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                height="100%"
                minHeight={400}
                sx={{ opacity: 0.6 }}
              >
                <Avatar sx={{ width: 80, height: 80, bgcolor: "grey.100", color: "grey.400", mb: 2 }}>
                  <EventNote sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h6" color="text.secondary" fontWeight="600">
                  Selecciona un empleado
                </Typography>
                <Typography variant="body2" color="text.disabled" mt={1}>
                  Haz clic en un empleado de la lista para configurar sus días de trabajo
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
