import {
  Box,
  Button,
  Typography,
} from "@mui/material";
import { LockReset } from "@mui/icons-material";
import { FormCard } from "../components/FormCard";
import { PasswordField } from "../components/PasswordField";
import { useAuth } from "../context/AuthContext";


export default function ChangePassword() {
  const minLength = 6;
  const { username } = useAuth();

  return (
    <Box
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="background.default"
      p={2}
    >
      <FormCard>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <LockReset color="error" />
          <Typography variant="h5" fontWeight={800}>
            Cambiar clave
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" mb={3}>
          Usuario: <strong>{username}</strong>
        </Typography>

        <PasswordField label="Clave actual" />
        <PasswordField
          label="Nueva clave"
          helperText={`Mínimo ${minLength} caracteres`}
        />
        <PasswordField label="Confirmar nueva clave" />

        <Box display="flex" gap={2} mt={3}>
          <Button variant="outlined" fullWidth>
            Cancelar
          </Button>

          <Button
            variant="contained"
            fullWidth
            disabled
          >
            Guardar
          </Button>
        </Box>
      </FormCard>
    </Box>
  );
}
