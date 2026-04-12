import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, InputAdornment, Button, alpha } from "@mui/material";
import PercentIcon from "@mui/icons-material/Percent";
import { LOGIN_COLORS } from "../../theme/loginTheme";
import { Tax } from "../../hooks/useImpuestosConfig";

interface Props {
  tax: Tax;
  onUpdate: (id: string, newPercentage: number) => void;
  disabled?: boolean;
}

export const TaxConfigCard: React.FC<Props> = ({ tax, onUpdate, disabled = false }) => {
  const [value, setValue] = useState(tax.percentage.toString());
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      onUpdate(tax.id, num);
      setIsEditing(false);
    } else {
      // Revert if invalid
      setValue(tax.percentage.toString());
      setIsEditing(false);
    }
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
        opacity: disabled ? 0.6 : 1,
        transition: "opacity 0.3s ease",
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
          <PercentIcon />
        </Box>
        <Typography variant="h6" fontWeight="700" color="text.primary">
          {tax.name}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
        Configura la cuota porcentual predeterminada que será agregada al subtotal de los pedidos para este perfil de impuestos.
      </Typography>

      <Box display="flex" alignItems="center" gap={2}>
        <TextField
          disabled={!isEditing || disabled}
          value={isEditing ? value : tax.percentage}
          onChange={(e) => setValue(e.target.value)}
          size="small"
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
              sx: { fontWeight: 'bold' }
            }
          }}
          sx={{ width: 120 }}
        />
        {isEditing ? (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSave}
            sx={{ bgcolor: LOGIN_COLORS.primary, "&:hover": { bgcolor: LOGIN_COLORS.primaryDark } }}
          >
            Guardar
          </Button>
        ) : (
          <Button 
            variant="outlined" 
            onClick={() => setIsEditing(true)}
            disabled={disabled}
            sx={{ borderColor: LOGIN_COLORS.primary, color: LOGIN_COLORS.primary }}
          >
            Modificar
          </Button>
        )}
      </Box>
    </Paper>
  );
};
