import React from 'react';
import { Box, Typography, Paper, Switch, alpha } from "@mui/material";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { LOGIN_COLORS } from "../../theme/loginTheme";

interface Props {
  isExonerated: boolean;
  onToggle: () => void;
}

export const TaxExemptionToggle: React.FC<Props> = ({ isExonerated, onToggle }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        background: isExonerated 
          ? `linear-gradient(135deg, ${alpha(LOGIN_COLORS.primary, 0.05)} 0%, ${alpha(LOGIN_COLORS.primary, 0.15)} 100%)` 
          : "white",
        boxShadow: isExonerated ? `0 8px 30px ${alpha(LOGIN_COLORS.primary, 0.2)}` : "0 10px 30px rgba(0,0,0,0.04)",
        border: "1px solid",
        borderColor: isExonerated ? alpha(LOGIN_COLORS.primary, 0.4) : "grey.200",
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6" fontWeight="800" color={isExonerated ? LOGIN_COLORS.primary : "text.primary"}>
          Exoneración de Impuestos
        </Typography>
        <Switch 
          checked={isExonerated}
          onChange={onToggle}
          color="error" // Red switch
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": {
              color: LOGIN_COLORS.primary,
            },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              backgroundColor: LOGIN_COLORS.primary,
            },
          }}
        />
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Activa esta opción para suspender el cálculo de impuestos a nivel global (Ej. Fin de semana sin impuestos o campañas especiales del gobierno).
      </Typography>

      <Box 
        sx={{ 
          p: 2, 
          borderRadius: 2, 
          bgcolor: isExonerated ? "rgba(255,255,255,0.7)" : alpha("#4caf50", 0.05),
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mt: 'auto'
        }}
      >
        {isExonerated ? (
          <>
            <ErrorOutlineIcon sx={{ color: LOGIN_COLORS.primary }} />
            <Typography variant="body2" fontWeight="700" color={LOGIN_COLORS.primary}>
              ¡Atención! Actualmente no se cobrarán impuestos en ningún pedido.
            </Typography>
          </>
        ) : (
          <>
            <CheckCircleOutlineIcon sx={{ color: "#2e7d32" }} />
            <Typography variant="body2" fontWeight="700" color="#2e7d32">
              Impuestos listados recuadros están activos y aplicándose normalmente.
            </Typography>
          </>
        )}
      </Box>
    </Paper>
  );
};
