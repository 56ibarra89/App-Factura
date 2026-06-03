import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Paper, Avatar, Divider, alpha, Grid, IconButton, InputAdornment, Tooltip } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import BlockIcon from "@mui/icons-material/Block";
import SettingsBackupRestoreIcon from "@mui/icons-material/SettingsBackupRestore";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import BadgeIcon from "@mui/icons-material/Badge";
import CasinoIcon from "@mui/icons-material/Casino";
import { UserAccount, UserRole, ROLE_LABELS } from "../../types/user";
import { LOGIN_COLORS } from "../../theme/loginTheme";
import { useAuth } from "../../context/AuthContext";

interface UserFormProps {
  user: UserAccount | null;
  onSave: (user: UserAccount) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

const DEFAULT_USER: Partial<UserAccount> = {
  firstName: "", lastName: "", username: "", pin: "", password: "", role: "cajero", isActive: true,
};

export function UserForm({ user, onSave, onToggleStatus, onDelete }: UserFormProps) {
  const { role: currentRole } = useAuth();
  const [formData, setFormData] = useState<Partial<UserAccount>>(DEFAULT_USER);
  const isEditing = !!user;

  useEffect(() => {
    if (user) setFormData(user);
    else setFormData(DEFAULT_USER);
  }, [user]);

  const handleChange = (field: keyof UserAccount, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.firstName || !formData.pin) return;
    const userToSave: UserAccount = {
      ...formData,
      id: formData.id || "",
      isActive: formData.isActive !== undefined ? formData.isActive : true,
    } as UserAccount;
    onSave(userToSave);
  };

  const generateRandomPin = () => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    handleChange("pin", randomPin);
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789#$*";
    let pwd = "";
    for(let i=0; i<8; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    handleChange("password", pwd);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, pb: 1 }}>
      
      {/* Banner Superior Estilizado */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        mb: 1.5, 
        background: `linear-gradient(135deg, ${alpha(LOGIN_COLORS.primary, 0.1)} 0%, ${alpha(LOGIN_COLORS.primaryDark, 0.05)} 100%)`, 
        p: 1.5, 
        borderRadius: 4,
        border: '1px solid',
        borderColor: alpha(LOGIN_COLORS.primary, 0.2)
      }}>
        <Avatar sx={{ bgcolor: LOGIN_COLORS.primary, width: 48, height: 48, boxShadow: `0 4px 12px ${LOGIN_COLORS.primaryShadow}` }}>
          {isEditing ? <BadgeIcon fontSize="large" /> : <PersonAddAlt1Icon />}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight="900" color="text.primary">
            {isEditing ? "Edición de Perfil" : "Crear Empleado"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isEditing ? "Modifica los datos personales o restablece accesos." : "Completa la ficha técnica para registrar un nuevo usuario."}
          </Typography>
        </Box>
      </Box>

      {/* Bloque 1: Información Personal */}
      <Paper elevation={0} sx={{ p: 1.5, mb: 1, borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
          <BadgeIcon color="primary" />
          <Typography variant="subtitle2" fontWeight="bold">Identidad del Usuario</Typography>
        </Box>
        <Divider sx={{ mb: 1.5 }} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField id="user-firstname" fullWidth size="small" label="Nombre(s)" value={formData.firstName || ""} onChange={e => handleChange("firstName", e.target.value)} required variant="filled" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField id="user-lastname" fullWidth size="small" label="Apellido(s)" value={formData.lastName || ""} onChange={e => handleChange("lastName", e.target.value)} variant="filled" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField id="user-username" fullWidth size="small" label="Usuario de Login" value={formData.username || ""} onChange={e => handleChange("username", e.target.value.toLowerCase().replace(/\s/g, ''))} disabled={isEditing && currentRole !== "admin"} required variant="filled" helperText={isEditing && currentRole !== "admin" ? "Solo administradores pueden editar el nombre de usuario." : "Usado para iniciar sesión."} />
          </Grid>
          {formData.role === "admin" && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField id="user-email" fullWidth size="small" label="Correo Electrónico" value={formData.email || ""} onChange={e => handleChange("email", e.target.value)} variant="filled" type="email" />
            </Grid>
          )}
          <Grid size={{ xs: 12, sm: 12 }}>
            <TextField id="user-role" fullWidth size="small" select label="Rol en la Empresa" value={formData.role || "cajero"} onChange={e => handleChange("role", e.target.value)} variant="filled" SelectProps={{ native: true }}>
              {(Object.keys(ROLE_LABELS) as UserRole[]).map(role => (
                <option key={role} value={role}>{ROLE_LABELS[role]}</option>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Bloque 2: Credenciales */}
      <Paper elevation={0} sx={{ p: 1.5, borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
          <VpnKeyIcon color="primary" />
          <Typography variant="subtitle2" fontWeight="bold">Seguridad y Acceso</Typography>
        </Box>
        <Divider sx={{ mb: 1.5 }} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField 
              id="user-pin"
              fullWidth 
              size="small"
              label="PIN Numérico" 
              type="text" 
              value={formData.pin || ""} 
              onChange={e => handleChange("pin", e.target.value.replace(/\D/g, '').substring(0,4))} 
              inputProps={{ maxLength: 4 }} 
              required 
              variant="filled" 
              helperText="4 dígitos para acciones rápidas."
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Generar PIN aleatorio">
                      <IconButton onClick={generateRandomPin} edge="end">
                        <CasinoIcon color="primary" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }} 
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField 
              id="user-password"
              fullWidth 
              size="small"
              label="Contraseña Principal" 
              type="text" 
              value={formData.password || ""} 
              onChange={e => handleChange("password", e.target.value)} 
              required={!isEditing} 
              variant="filled" 
              helperText={isEditing ? "Escribe para restablecerla." : "Alfanumérica (Ej. ptg2026)"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Generar Contraseña Segura">
                      <IconButton onClick={generateRandomPassword} edge="end">
                        <CasinoIcon color="primary" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <Box display="flex" gap={2}>
          {isEditing && formData.id !== "admin" ? (
            <>
              <Button
                variant="text"
                color={formData.isActive ? "error" : "success"}
                startIcon={formData.isActive ? <BlockIcon /> : <SettingsBackupRestoreIcon />}
                onClick={() => onToggleStatus(formData.id!)}
                sx={{ fontWeight: "bold", borderRadius: 3, px: 3, py: 1.5 }}
              >
                {formData.isActive ? "Suspender Usuario" : "Reactivar Usuario"}
              </Button>
              <Button
                variant="text"
                color="error"
                onClick={() => onDelete(formData.id!)}
                sx={{ fontWeight: "bold", borderRadius: 3, px: 3, py: 1.5, opacity: 0.8 }}
              >
                Eliminar
              </Button>
            </>
          ) : (
            <Box /> 
          )}
        </Box>

        <Button
          type="submit"
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          sx={{
            px: 5, py: 1.5,
            borderRadius: 8,
            fontWeight: 800,
            textTransform: "none",
            fontSize: "1.05rem",
            background: LOGIN_COLORS.primary,
            boxShadow: `0 8px 24px ${LOGIN_COLORS.primaryHoverShadow}`,
            "&:hover": { background: LOGIN_COLORS.primaryDark, transform: "translateY(-2px)" },
            transition: "all 0.2s"
          }}
        >
          {isEditing ? "Actualizar Perfil" : "Registrar Empleado"}
        </Button>
      </Box>
    </Box>
  );
}

// Icono extra importado directamente aquí para evitar mas problemas de imports
function PersonAddAlt1Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  );
}
