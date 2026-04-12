import React from 'react';
import { Box, Typography, Paper, Switch, alpha, Divider } from "@mui/material";
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PrintIcon from '@mui/icons-material/Print';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { LOGIN_COLORS } from "../../theme/loginTheme";
import { GeneralConfigState } from "../../hooks/useGeneralConfigData";

interface Props {
  config: GeneralConfigState;
  onUpdate: <K extends keyof GeneralConfigState>(key: K, value: GeneralConfigState[K]) => void;
}

export const CashRegisterBehaviorCard: React.FC<Props> = ({ config, onUpdate }) => {
  const switchStyles = {
    "& .MuiSwitch-switchBase.Mui-checked": {
      color: LOGIN_COLORS.primary,
    },
    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
      backgroundColor: LOGIN_COLORS.primary,
    },
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        background: "white",
        boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
        border: "1px solid",
        borderColor: "grey.200",
        height: '100%',
      }}
    >
      <Box display="flex" alignItems="center" mb={2}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: alpha("#1976d2", 0.1),
            color: "#1976d2",
            mr: 2
          }}
        >
          <AssignmentIcon />
        </Box>
        <Typography variant="h6" fontWeight="800" color="text.primary">
          Comportamiento de Caja
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Reglas de seguridad y operatividad que se exigirán automáticamente a los cajeros al iniciar y terminar sus turnos laborales.
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1.5}>
            <LockOpenIcon sx={{ color: "text.secondary", fontSize: 20 }} />
            <Box>
              <Typography variant="body1" fontWeight="600" color="text.primary">
                Apertura Exacta Requerida
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Impide abrir si el monto declarado en efectivo difiere del esperado.
              </Typography>
            </Box>
          </Box>
          <Switch 
            checked={config.requireExactOpeningAmount}
            onChange={(e) => onUpdate('requireExactOpeningAmount', e.target.checked)}
            sx={switchStyles}
          />
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1.5}>
            <VisibilityOffIcon sx={{ color: "text.secondary", fontSize: 20 }} />
            <Box>
              <Typography variant="body1" fontWeight="600" color="text.primary">
                Arqueo a Ciegas (Blind Count)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Oculta el total del sistema al cajero durante el cierre de caja.
              </Typography>
            </Box>
          </Box>
          <Switch 
            checked={config.blindCashCount}
            onChange={(e) => onUpdate('blindCashCount', e.target.checked)}
            sx={switchStyles}
          />
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1.5}>
            <PrintIcon sx={{ color: "text.secondary", fontSize: 20 }} />
            <Box>
              <Typography variant="body1" fontWeight="600" color="text.primary">
                Imprimir Ticket de Cierre
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Emite comprobante por impresora térmica automáticamente al finalizar el turno.
              </Typography>
            </Box>
          </Box>
          <Switch 
            checked={config.autoPrintReceipt}
            onChange={(e) => onUpdate('autoPrintReceipt', e.target.checked)}
            sx={switchStyles}
          />
        </Box>
      </Box>
    </Paper>
  );
};
