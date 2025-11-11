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
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const fakeAuth = async (username: string, password: string): Promise<boolean> => {
  // Simulamos una autenticación simple para varios usuarios conocidos
  const allowedUsers = new Set(["admin", "fran", "engels", "sidney"]);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(allowedUsers.has(username) && password === "123456");
    }, 1000);
  });
};

const Login = () => {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("rememberedUser");
    if (savedUser) {
      setCredentials((prev) => ({ ...prev, username: savedUser }));
      setRemember(true);
    }

    const isLogged = sessionStorage.getItem("loggedIn");
    if (isLogged) {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!credentials.username || !credentials.password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setLoading(true);
    const isValid = await fakeAuth(credentials.username, credentials.password);
    setLoading(false);

    if (isValid) {
      if (remember) {
        localStorage.setItem("rememberedUser", credentials.username);
      } else {
        localStorage.removeItem("rememberedUser");
      }

      sessionStorage.setItem("loggedIn", "true");
      navigate("/home");
    } else {
      setError("Credenciales incorrectas");
    }
  };

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
          variant="outlined"
          type={showPassword ? "text" : "password"}
          name="password"
          value={credentials.password}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
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

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2, borderRadius: 2 }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Validando..." : "Entrar"}
        </Button>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setError("")} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;