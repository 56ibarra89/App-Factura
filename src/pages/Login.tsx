import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, TouchApp } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import logoImg from "../assets/images/logo.png";

const Login = () => {
  const navigate = useNavigate();
  const {
    credentials,
    showPassword,
    remember,
    error,
    loading,
    handleChange,
    handleLogin,
    setRemember,
    togglePasswordVisibility,
    clearError,
  } = useLogin();

  return (
    <Box
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)", // Fondo claro y cálido exterior
        padding: 2,
      }}
    >
      <Paper
        elevation={24}
        sx={{
          width: { xs: "100%", sm: "95%", md: 950 },
          minHeight: 650,
          borderRadius: 6,
          display: "flex",
          overflow: "hidden",
          boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/* Lado Izquierdo: Branding/Diseño (Idéntico a LoginPin pero sin flecha atrás) */}
        <Box
          sx={{
            flex: 1,
            background: "linear-gradient(135deg, #2b2b2b 0%, #121212 100%)",
            backgroundImage:
              "radial-gradient(circle at bottom left, #4a4a4a 0%, #121212 100%)",
            color: "white",
            p: { xs: 4, sm: 6 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <Box>
            <Box
              component="img"
              src={logoImg}
              alt="Pizza To Go Logo"
              sx={{
                width: 110,
                height: 110,
                borderRadius: "25%",
                mb: 4,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                objectFit: "cover", // Se asegura que la imagen no se deforme
                border: "3px solid rgba(255,255,255,0.2)", // Agrega un marco suave para destacar el logo rojo sobre el fondo azul
                bgcolor: "white", // Fondo blanco en caso de transparencia
              }}
              onError={(e) => {
                // Fallback temporal si no encuentra logo.png
                e.currentTarget.src =
                  "https://via.placeholder.com/110/cf1f2e/ffffff?text=LOGO";
              }}
            />
            <Typography
              variant="h3"
              fontWeight="900"
              mb={2}
              sx={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}
            >
              Sistema
              <br />
              de Facturación
            </Typography>
            <Typography
              variant="h6"
              fontWeight="400"
              sx={{ opacity: 0.85, maxWidth: 350, lineHeight: 1.5 }}
            >
              Administra todas tus ventas, inventarios y clientes de manera
              rápida y segura.
            </Typography>
          </Box>
        </Box>

        {/* Lado Derecho: Formulario de Login Clásico */}
        <Box
          sx={{
            flex: 1.2,
            p: { xs: 4, sm: 6, md: 8 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            bgcolor: "white",
          }}
        >
          <Typography variant="h4" fontWeight="800" color="text.primary" mb={1}>
            Bienvenido
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Ingresa tus credenciales para continuar
          </Typography>

          <TextField
            label="Usuario"
            variant="outlined"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          <TextField
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            name="password"
            value={credentials.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt={1}
            mb={2}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  sx={{
                    color: "grey.500",
                    "&.Mui-checked": { color: "#d32f2f" },
                  }}
                />
              }
              label={<Typography variant="body2">Recordarme</Typography>}
            />
            <Button
              size="small"
              color="primary"
              onClick={() =>
                alert("Función de recuperar contraseña no implementada")
              }
              sx={{ textTransform: "none", fontWeight: 600, color: "#d32f2f" }}
            >
              ¿Olvidaste tu contraseña?
            </Button>
          </Box>

          <Button
            variant="contained"
            fullWidth
            sx={{
              mt: 1,
              borderRadius: 3,
              height: 52,
              fontSize: "1.05rem",
              fontWeight: 700,
              textTransform: "none",
              bgcolor: "#d32f2f",
              boxShadow: "0 4px 14px 0 rgba(211, 47, 47, 0.39)",
              position: "relative",
              "&:hover": {
                bgcolor: "#b71c1c",
                boxShadow: "0 6px 20px rgba(211, 47, 47, 0.23)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease-in-out",
            }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress
                size={26}
                color="inherit"
                sx={{ position: "absolute" }}
              />
            ) : (
              "Iniciar Sesión"
            )}
          </Button>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<TouchApp />}
            sx={{
              mt: 2,
              height: 52,
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1rem",
              borderColor: "grey.300",
              color: "text.primary",
              "&:hover": {
                borderColor: "#d32f2f",
                bgcolor: "rgba(211, 47, 47, 0.04)",
              },
            }}
            onClick={() => navigate("/login-pin")}
          >
            Ingresar con PIN táctil
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={clearError}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={clearError}
          severity="error"
          sx={{ width: "100%", fontSize: "1.05rem" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;
