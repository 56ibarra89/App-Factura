import { Box, Typography, TextField, Button, Alert, CircularProgress } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { authService } from "../api/authService";

const inputSx = {
  "& .MuiOutlinedInput-root": { borderRadius: 2 },
};

export const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Por favor, ingresa tu usuario o correo electrónico");
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await authService.requestPasswordReset(identifier);
      if (response.success) {
        setSuccess("Instrucciones enviadas. Revisa tu bandeja de entrada.");
        setIdentifier("");
      } else {
        setError(response.message || "Error al enviar las instrucciones");
      }
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        flex: { xs: "none", md: 1.2 },
        p: { xs: 3, sm: 4, md: 8 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h4" fontWeight="800" color="text.primary" mb={1}>
        Recuperar Contraseña
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Ingresa tu usuario o correo para enviarte las instrucciones de recuperación.
      </Typography>

      <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
        Esta función es solo para Administradores. Si eres mesero o cajero, contacta a tu supervisor para restablecer tu cuenta.
      </Alert>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

      <TextField
        label="Usuario o Correo"
        variant="outlined"
        name="username"
        fullWidth
        margin="normal"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        disabled={loading}
        sx={inputSx}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={loading}
        sx={{
          mt: 4,
          borderRadius: 3,
          height: 52,
          fontSize: "1.05rem",
          fontWeight: 700,
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Enviar Instrucciones"}
      </Button>

      {}
      <Button
        variant="text"
        fullWidth
        startIcon={<ArrowBack />}
        sx={{
          mt: 3,
          height: 52,
          borderRadius: 3,
          fontWeight: 600,
          fontSize: "1rem",
          color: "text.primary",
          "&:hover": {
            bgcolor: "rgba(0, 0, 0, 0.04)",
          },
        }}
        onClick={() => navigate("/")}
      >
        Volver al Login
      </Button>
    </Box>
  );
};

