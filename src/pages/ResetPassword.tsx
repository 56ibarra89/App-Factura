import { Box, Typography, TextField, Button, Alert, CircularProgress, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff, LockReset } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../services/authService";
import logo from "../assets/images/logo.png";

const inputSx = {
  "& .MuiOutlinedInput-root": { borderRadius: 2 },
};

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Enlace inválido. Falta el token de seguridad.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("El token de seguridad es requerido.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await authService.resetPassword(token, newPassword);
      if (response.success) {
        setSuccess("Contraseña actualizada exitosamente. Redirigiendo al login...");
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        setError(response.message || "Error al restablecer la contraseña");
      }
    } catch (err) {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: "background.default" }}>
      {/* Panel Izquierdo */}
      <Box
        sx={{
          flex: { xs: "none", md: 1 },
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#1a1a1a",
          color: "white",
          p: 6,
        }}
      >
        <Box component="img" src={logo} alt="Logo" sx={{ width: 150, mb: 4 }} />
        <Typography variant="h3" fontWeight="800" align="center" gutterBottom>
          Sistema de<br />Facturación
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ maxWidth: 400 }}>
          Recuperación segura de acceso.
        </Typography>
      </Box>

      {/* Formulario Derecho */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          flex: { xs: 1, md: 1.2 },
          p: { xs: 3, sm: 4, md: 8 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          bgcolor: "background.paper",
        }}
      >
        <LockReset sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
        <Typography variant="h4" fontWeight="800" color="text.primary" mb={1}>
          Nueva Contraseña
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Ingresa y confirma tu nueva contraseña para recuperar el acceso.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

        <TextField
          label="Nueva Contraseña"
          variant="outlined"
          type={showPassword ? "text" : "password"}
          fullWidth
          margin="normal"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={loading || success !== null || !token}
          sx={inputSx}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Confirmar Contraseña"
          variant="outlined"
          type={showPassword ? "text" : "password"}
          fullWidth
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading || success !== null || !token}
          sx={inputSx}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading || success !== null || !token}
          sx={{
            mt: 4,
            borderRadius: 3,
            height: 52,
            fontSize: "1.05rem",
            fontWeight: 700,
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Guardar y Entrar"}
        </Button>

        <Button
          variant="text"
          fullWidth
          onClick={() => navigate("/")}
          disabled={loading}
          sx={{ mt: 2, borderRadius: 3, height: 52 }}
        >
          Volver al Login
        </Button>
      </Box>
    </Box>
  );
};
