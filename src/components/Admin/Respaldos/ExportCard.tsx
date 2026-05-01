import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

interface ExportCardProps {
  options: {
    config: boolean;
    menu: boolean;
    history: boolean;
  };
  onOptionChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
}

const ExportCard: React.FC<ExportCardProps> = ({ options, onOptionChange, onExport }) => {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid #e0e0e0",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          boxShadow: "0px 10px 30px rgba(0,0,0,0.08)",
          transform: "translateY(-4px)",
        }
      }}
    >
      <Box sx={{ height: 8, background: "linear-gradient(90deg, #2196f3 0%, #00bcd4 100%)" }} />
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "#e3f2fd", color: "#1976d2", mr: 2 }}>
            <CloudDownloadIcon fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Generar Respaldo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Descarga un archivo local con los datos actuales.
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle2" fontWeight={600} mb={2}>
          ¿Qué información deseas incluir?
        </Typography>
        
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 4 }}>
          <FormControlLabel
            control={<Checkbox checked={options.config} onChange={onOptionChange} name="config" />}
            label="Configuración General y Usuarios"
          />
          <FormControlLabel
            control={<Checkbox checked={options.menu} onChange={onOptionChange} name="menu" />}
            label="Menú de Productos y Categorías"
          />
          <FormControlLabel
            control={<Checkbox checked={options.history} onChange={onOptionChange} name="history" />}
            label="Histórico de Facturas y Turnos"
          />
        </Box>

        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          onClick={onExport}
          startIcon={<CloudDownloadIcon />}
          sx={{ py: 1.5, borderRadius: 2, textTransform: "none", fontSize: "1.1rem", fontWeight: 600 }}
        >
          Exportar Ahora
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExportCard;
