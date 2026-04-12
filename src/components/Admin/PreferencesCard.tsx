import React from 'react';
import { Box, Typography, Paper, FormControl, Select, MenuItem, Switch, alpha } from "@mui/material";
import PaletteIcon from '@mui/icons-material/Palette';
import LanguageIcon from '@mui/icons-material/Language';
import { LOGIN_COLORS } from "../../theme/loginTheme";
import { GeneralConfigState } from "../../hooks/useGeneralConfigData";

interface Props {
  theme: GeneralConfigState['theme'];
  language: GeneralConfigState['language'];
  onUpdate: <K extends keyof GeneralConfigState>(key: K, value: GeneralConfigState[K]) => void;
}

export const PreferencesCard: React.FC<Props> = ({ theme, language, onUpdate }) => {
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
        display: 'flex',
        flexDirection: 'column'
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
            background: alpha(LOGIN_COLORS.primary, 0.1),
            color: LOGIN_COLORS.primary,
            mr: 2
          }}
        >
          <PaletteIcon />
        </Box>
        <Typography variant="h6" fontWeight="800" color="text.primary">
          Apariencia e Idioma
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Personaliza cómo visualizas la interfaz del sistema de facturación.
      </Typography>

      <Box display="flex" flexDirection="column" gap={3} mt="auto">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body1" fontWeight="600" color="text.primary">
            Modo Oscuro (Dark Mode)
          </Typography>
          <Switch 
            checked={theme === 'dark'}
            onChange={(e) => onUpdate('theme', e.target.checked ? 'dark' : 'light')}
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

        <Box>
          <Typography variant="body2" color="text.secondary" mb={1} display="flex" alignItems="center" gap={1}>
            <LanguageIcon fontSize="small" /> Idioma del Sistema
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={language}
              onChange={(e) => onUpdate('language', e.target.value as GeneralConfigState['language'])}
            >
              <MenuItem value="es">Español (Latinoamérica)</MenuItem>
              <MenuItem value="en">English (US)</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
    </Paper>
  );
};
