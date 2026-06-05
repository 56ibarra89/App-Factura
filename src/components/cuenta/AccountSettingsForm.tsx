import { Box, Typography, TextField, Button, CircularProgress, Alert, Paper, Divider, InputAdornment, IconButton } from "@mui/material";
import { useState } from "react";
import { LOGIN_COLORS, LOGIN_SHADOWS } from "../../theme/loginTheme";
import { AccountData } from "../../hooks/useAccountSettings";
import SaveIcon from "@mui/icons-material/Save";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

interface AccountSettingsFormProps {
  data: AccountData;
  loading: boolean;
  error: string;
  success: string;
  onChange: (field: keyof AccountData, value: string) => void;
  onSave: () => void;
}

export function AccountSettingsForm({ data, loading, error, success, onChange, onSave }: AccountSettingsFormProps) {
  const [showPin, setShowPin] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const requirements = [
    { regex: /.{8,}/, msg: "Mínimo 8 caracteres" },
    { regex: /[A-Z]/, msg: "Mayúscula" },
    { regex: /[a-z]/, msg: "Minúscula" },
    { regex: /[0-9]/, msg: "Número" },
    { regex: /[@$!%*?&]/, msg: "Especial (@$!%*?&)" },
  ];

  const hasPasswordInput = data.nuevaPassword.length > 0;
  const isPasswordValid = hasPasswordInput && requirements.every(r => r.regex.test(data.nuevaPassword));
  const passwordsMatch = hasPasswordInput && data.confirmarPassword && data.nuevaPassword === data.confirmarPassword;
  const passwordsMismatch = hasPasswordInput && data.confirmarPassword.length > 0 && data.nuevaPassword !== data.confirmarPassword;

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        p: { xs: 3, md: 5 },
        borderRadius: 4,
        boxShadow: LOGIN_SHADOWS.card,
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Typography variant="h5" fontWeight="bold" color="text.primary" mb={1}>
        Configuración de Cuenta
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        Actualiza tu información personal, PIN y contraseña de seguridad.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
        <Typography variant="subtitle2" fontWeight="bold" color="primary.main" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
          Información Personal
        </Typography>
        
        <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
          <TextField
            fullWidth
            label="Nombre Completo"
            variant="outlined"
            value={data.nombreCompleto}
            onChange={(e) => onChange("nombreCompleto", e.target.value)}
          />
          <TextField
            fullWidth
            label="Nombre de Usuario"
            variant="outlined"
            value={data.nombreUsuario}
            onChange={(e) => onChange("nombreUsuario", e.target.value)}
            helperText="Debe ser único en el sistema. Te cerrará sesión si lo cambias."
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
          <TextField
            fullWidth
            label="Correo Electrónico"
            variant="outlined"
            type="email"
            value={data.email || ""}
            onChange={(e) => onChange("email", e.target.value)}
          />
        </Box>

        <Divider sx={{ my: 1 }} />

        <Typography variant="subtitle2" fontWeight="bold" color="primary.main" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
          Seguridad
        </Typography>

        <TextField
          fullWidth
          label="PIN de Autorización (Para anular facturas)"
          variant="outlined"
          type={showPin ? "text" : "password"}
          value={data.pin}
          onChange={(e) => onChange("pin", e.target.value.replace(/\D/g, '').substring(0, 4))}
          inputProps={{ maxLength: 4, inputMode: "numeric" }}
          helperText="Debe ser un código numérico de 4 dígitos"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPin(!showPin)} edge="end" tabIndex={-1}>
                  {showPin ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Contraseña Actual"
          variant="outlined"
          type={showCurrentPassword ? "text" : "password"}
          value={data.passwordActual}
          onChange={(e) => onChange("passwordActual", e.target.value)}
          helperText="Requerida solo si está cambiando la contraseña"
          sx={{ maxWidth: { sm: "calc(50% - 8px)" } }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end" tabIndex={-1}>
                  {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              label="Nueva Contraseña"
              variant="outlined"
              type={showNewPassword ? "text" : "password"}
              value={data.nuevaPassword}
              onChange={(e) => onChange("nuevaPassword", e.target.value)}
              error={hasPasswordInput && !isPasswordValid}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end" tabIndex={-1}>
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {hasPasswordInput && (
              <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.5, pl: 1 }}>
                {requirements.map((req, idx) => {
                  const isValid = req.regex.test(data.nuevaPassword);
                  return (
                    <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {isValid ? (
                        <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />
                      ) : (
                        <CancelIcon sx={{ fontSize: 16, color: "error.main" }} />
                      )}
                      <Typography variant="caption" color={isValid ? "success.main" : "text.secondary"}>
                        {req.msg}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
            {!hasPasswordInput && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, pl: 1.5 }}>
                Debe incluir: 8+ caracteres, Mayúscula, Minúscula, Número y Especial (@$!%*?&)
              </Typography>
            )}
          </Box>

          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              label="Confirmar Nueva Contraseña"
              variant="outlined"
              type={showConfirmPassword ? "text" : "password"}
              value={data.confirmarPassword}
              onChange={(e) => onChange("confirmarPassword", e.target.value)}
              error={Boolean(passwordsMismatch)}
              helperText={passwordsMismatch ? "Las contraseñas no coinciden" : (passwordsMatch ? "Las contraseñas coinciden" : "")}
              FormHelperTextProps={passwordsMatch ? { sx: { color: "success.main" } } : {}}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" tabIndex={-1}>
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>

        <Box sx={{ mt: "auto", pt: 4, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            size="large"
            onClick={onSave}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{
              bgcolor: LOGIN_COLORS.primary,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "1rem",
              "&:hover": {
                bgcolor: LOGIN_COLORS.primaryDark,
                boxShadow: LOGIN_COLORS.primaryHoverShadow,
              },
            }}
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
