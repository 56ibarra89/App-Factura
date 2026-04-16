import { ChangeEvent } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import { TouchApp } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { PasswordField } from "../PasswordField";

interface LoginFormProps {
  credentials: { username: string; password: string };
  showPassword: boolean;
  remember: boolean;
  loading: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleLogin: () => void;
  setRemember: (value: boolean) => void;
  togglePasswordVisibility: (value: void) => void;
  lockoutTime: number;
}

const inputSx = {
  "& .MuiOutlinedInput-root": { borderRadius: 2 },
};

export const LoginForm = ({
  credentials,
  showPassword,
  remember,
  loading,
  handleChange,
  handleLogin,
  setRemember,
  togglePasswordVisibility,
  lockoutTime,
}: LoginFormProps) => {
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
        Bienvenido
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4} sx={{ fontWeight: lockoutTime > 0 ? "bold" : "normal", color: lockoutTime > 0 ? "error.main" : "text.secondary" }}>
        {lockoutTime > 0 
          ? `SISTEMA BLOQUEADO: Reintenta en ${lockoutTime}s` 
          : "Ingresa tus credenciales para continuar"}
      </Typography>

      <TextField
        label="Usuario"
        variant="outlined"
        name="username"
        value={credentials.username}
        onChange={handleChange}
        fullWidth
        margin="normal"
        sx={inputSx}
        disabled={lockoutTime > 0}
      />

      <PasswordField
        label="Contraseña"
        name="password"
        value={credentials.password}
        onChange={handleChange}
        showPassword={showPassword}
        onToggleVisibility={togglePasswordVisibility}
        disabled={lockoutTime > 0}
      />

      {/* Recordarme + Olvidé contraseña */}
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
                "&.Mui-checked": { color: "primary.main" },
              }}
            />
          }
          label={<Typography variant="body2">Recordarme</Typography>}
        />
        <Button
          size="small"
          color="primary"
          onClick={() => navigate("/forgot-password")}
          sx={{ fontWeight: 600 }}
        >
          ¿Olvidaste tu contraseña?
        </Button>
      </Box>

      {/* Botón principal */}
      <Button
        variant="contained"
        fullWidth
        sx={{
          mt: 1,
          borderRadius: 3,
          height: 52,
          fontSize: "1.05rem",
          fontWeight: 700,
          position: "relative",
          boxShadow: lockoutTime > 0 ? "none" : "0 4px 14px 0 rgba(211, 47, 47, 0.39)",
          bgcolor: lockoutTime > 0 ? "grey.400" : "primary.main",
          "&:hover": {
            boxShadow: lockoutTime > 0 ? "none" : "0 6px 20px rgba(211, 47, 47, 0.23)",
            transform: lockoutTime > 0 ? "none" : "translateY(-1px)",
            bgcolor: lockoutTime > 0 ? "grey.400" : "primary.dark",
          },
          transition: "all 0.2s ease-in-out",
        }}
        onClick={handleLogin}
        disabled={loading || lockoutTime > 0}
      >
        {loading ? (
          <CircularProgress
            size={26}
            color="inherit"
            sx={{ position: "absolute" }}
          />
        ) : lockoutTime > 0 ? (
          `Bloqueado (${lockoutTime}s)`
        ) : (
          "Iniciar Sesión"
        )}
      </Button>

      {/* Botón PIN */}
      <Button
        variant="outlined"
        fullWidth
        startIcon={<TouchApp />}
        sx={{
          mt: 2,
          height: 52,
          borderRadius: 3,
          fontWeight: 600,
          fontSize: "1rem",
          borderColor: "grey.300",
          color: "text.primary",
          "&:hover": {
            borderColor: "primary.main",
            bgcolor: "rgba(211, 47, 47, 0.04)",
          },
        }}
        onClick={() => navigate("/login-pin")}
      >
        Ingresar con PIN táctil
      </Button>
    </Box>
  );
};
