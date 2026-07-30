import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

interface ImportCardProps {
  onImportClick: () => void;
}

const ImportCard: React.FC<ImportCardProps> = ({ onImportClick }) => {
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
      <Box sx={{ height: 8, background: "linear-gradient(90deg, #ff9800 0%, #f44336 100%)" }} />
      <CardContent sx={{ p: 4, height: "100%", display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "#fff3e0", color: "#ed6c02", mr: 2 }}>
            <CloudUploadIcon fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Restaurar Sistema
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sube un archivo de respaldo previo.
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />

        <Box 
          sx={{ 
            bgcolor: "#fff4f4", 
            border: "1px dashed #ef5350", 
            borderRadius: 3, 
            p: 3, 
            mb: 4,
            display: "flex",
            gap: 2
          }}
        >
          <WarningAmberIcon color="error" />
          <Typography variant="body2" color="error.dark">
            <strong>Advertencia Destructiva:</strong> Al restaurar un respaldo, toda la información actual del sistema será eliminada y reemplazada permanentemente por los datos del archivo subido.
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Button
          variant="outlined"
          color="warning"
          size="large"
          fullWidth
          onClick={onImportClick}
          startIcon={<CloudUploadIcon />}
          sx={{ py: 1.5, borderRadius: 2, textTransform: "none", fontSize: "1.1rem", fontWeight: 600, borderWidth: 2, "&:hover": { borderWidth: 2 } }}
        >
          Seleccionar Archivo de Respaldo
        </Button>
      </CardContent>
    </Card>
  );
};

export default ImportCard;
