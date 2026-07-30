import React from 'react';
import { Box, Typography, Paper, TextField, alpha, Grid, Switch, Button } from "@mui/material";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import type { GeneralConfigState } from "../model/settings.types";

interface Props {
  config: GeneralConfigState;
  onUpdate: <K extends keyof GeneralConfigState>(key: K, value: GeneralConfigState[K]) => void;
  onSave?: (override?: Partial<GeneralConfigState>) => Promise<void>;
}

export const CurrencyCard: React.FC<Props> = ({ config, onUpdate, onSave }) => {
  const [localRate, setLocalRate] = React.useState(config.exchangeRate.toString());

  React.useEffect(() => {
    setLocalRate((currentRate) => {
      const parsedLocal = parseFloat(currentRate);
      return isNaN(parsedLocal) || parsedLocal !== config.exchangeRate
        ? config.exchangeRate.toString()
        : currentRate;
    });
  }, [config.exchangeRate]);

  const handleSave = async () => {
    const override: Partial<GeneralConfigState> = {};

    if (config.enableSecondaryCurrency) {
      const parsed = parseFloat(localRate);
      if (!isNaN(parsed) && parsed > 0) {
        onUpdate('exchangeRate', parsed);
        override.exchangeRate = parsed;
      } else {
        setLocalRate(config.exchangeRate.toString());
      }
    }

    await onSave?.(Object.keys(override).length ? override : undefined);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        bgcolor: "background.paper",
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
            background: alpha("#4caf50", 0.1),
            color: "#4caf50",
            mr: 2
          }}
        >
          <AttachMoneyIcon />
        </Box>
        <Typography variant="h6" fontWeight="800" color="text.primary">
          Moneda Local
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Establece la divisa oficial y, opcionalmente, una segunda moneda (Ej. Dólares) con su tasa de cambio aplicable a los pagos.
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 8 }}>
          <Typography variant="body2" color="text.secondary" mb={1} fontWeight="600">
            Moneda Principal (ISO)
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={config.currencyCode}
            onChange={(e) => onUpdate('currencyCode', e.target.value.toUpperCase())}
            inputProps={{ maxLength: 3 }}
          />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Typography variant="body2" color="text.secondary" mb={1} fontWeight="600">
            Símbolo
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={config.currencySymbol}
            onChange={(e) => onUpdate('currencySymbol', e.target.value)}
            inputProps={{ maxLength: 2 }}
          />
        </Grid>
      </Grid>

      <Box display="flex" alignItems="center" my={2} gap={1}>
         <Switch 
            checked={config.enableSecondaryCurrency}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate('enableSecondaryCurrency', e.target.checked)}
            size="small"
          />
          <Typography variant="body2" fontWeight="600">Habilitar cobro multimoneda</Typography>
      </Box>

      {config.enableSecondaryCurrency && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 4 }}>
             <Typography variant="caption" color="text.secondary" mb={1} fontWeight="600" display="block">
              Moneda #2
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={config.secondaryCurrencyCode}
              onChange={(e) => onUpdate('secondaryCurrencyCode', e.target.value.toUpperCase())}
              inputProps={{ maxLength: 3 }}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
             <Typography variant="caption" color="text.secondary" mb={1} fontWeight="600" display="block">
              Símbolo
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={config.secondaryCurrencySymbol}
              onChange={(e) => onUpdate('secondaryCurrencySymbol', e.target.value)}
              inputProps={{ maxLength: 2 }}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
             <Typography variant="caption" color="text.secondary" mb={1} fontWeight="600" display="block">
              Tasa (Cambio)
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={localRate}
              onChange={(e) => setLocalRate(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const parsed = parseFloat(localRate);
                  if (!isNaN(parsed) && parsed > 0) {
                    onUpdate('exchangeRate', parsed);
                    (e.target as HTMLInputElement).blur();
                  }
                }
              }}
              onBlur={() => {
                const parsed = parseFloat(localRate);
                if (!isNaN(parsed) && parsed > 0) {
                  onUpdate('exchangeRate', parsed);
                } else {
                  setLocalRate(config.exchangeRate.toString());
                }
              }}
              inputProps={{ step: "0.01", min: "0" }}
            />
          </Grid>
        </Grid>
      )}

      <Box mt={3}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          type="button"
          onClick={handleSave}
        >
          Guardar
        </Button>
      </Box>
    </Paper>
  );
};
