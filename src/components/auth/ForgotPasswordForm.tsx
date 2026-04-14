import { Box, Typography, TextField, Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const inputSx = {
  "& .MuiOutlinedInput-root": { borderRadius: 2 },
};

export const ForgotPasswordForm = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        flex: { xs: "none", md: 1.2 },
        p: { xs: 3, sm: 4, md: 8 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        bgcolor: "white",
      }}
    >
      <Typography variant="h4" fontWeight="800" color="text.primary" mb={1}>
        Recuperar Contraseña
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Ingresa tu usuario o correo para enviarte las instrucciones de recuperación.
      </Typography>

      <TextField
        label="Usuario o Correo"
        variant="outlined"
        name="username"
        fullWidth
        margin="normal"
        sx={inputSx}
      />

      {/* Botón principal */}
      <Button
        variant="contained"
        fullWidth
        sx={{
          mt: 4,
          borderRadius: 3,
          height: 52,
          fontSize: "1.05rem",
          fontWeight: 700,
          position: "relative",
          boxShadow: "0 4px 14px 0 rgba(211, 47, 47, 0.39)",
          "&:hover": {
            boxShadow: "0 6px 20px rgba(211, 47, 47, 0.23)",
            transform: "translateY(-1px)",
          },
          transition: "all 0.2s ease-in-out",
        }}
        onClick={() => console.log("Función de recuperación no implementada todavía")}
      >
        Enviar Instrucciones
      </Button>

      {/* Botón Volver al Login */}
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
