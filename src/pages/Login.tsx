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
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useLogin } from "../hooks/useLogin";

const Login = () => {
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
      bgcolor="#f4f6f8"
    >
      <Paper
        elevation={4}
        sx={{ p: 4, width: 350, borderRadius: 3, textAlign: "center" }}
      >
        <Typography variant="h5" fontWeight="bold" mb={1}>
          Iniciar Sesión
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Accede al sistema de facturación
        </Typography>

        <TextField
          label="Usuario"
          variant="outlined"
          name="username"
          value={credentials.username}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />

        <TextField
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          name="password"
          value={credentials.password}
          onChange={handleChange}
          fullWidth
          margin="normal"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={togglePasswordVisibility}
                    edge="end"
                  >
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
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
            }
            label="Recordarme"
          />
          <Button
            size="small"
            color="primary"
            onClick={() =>
              alert("Función de recuperar contraseña no implementada")
            }
          >
            ¿Olvidaste tu contraseña?
          </Button>
        </Box>

        {/* Botón con loader circular */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2, borderRadius: 2, height: 42, position: "relative" }}
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
            "Entrar"
          )}
        </Button>
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
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;