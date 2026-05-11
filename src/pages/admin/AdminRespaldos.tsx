import React from "react";
import {
  Box,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { BackButton } from "../../components/BackButton";
import { useRespaldos } from "../../hooks/useRespaldos";
import ExportCard from "../../components/Admin/Respaldos/ExportCard";
import ImportCard from "../../components/Admin/Respaldos/ImportCard";

const AdminRespaldos: React.FC = () => {
  const {
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    options,
    handleOptionChange,
    handleExport,
    handleImportClick,
    closeSnackbar,
  } = useRespaldos();

  return (
    <Box sx={{ p: 4, maxWidth: "1200px", margin: "0 auto", minHeight: "100vh" }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <BackButton to="/admin" />
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom sx={{ letterSpacing: "-0.5px" }}>
              Respaldos de Datos
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Protege tu información exportando e importando copias de seguridad del sistema.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* CONTENIDO PRINCIPAL */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 4 }}>
        <ExportCard 
          options={options} 
          onOptionChange={handleOptionChange} 
          onExport={handleExport} 
        />
        <ImportCard 
          onImportClick={handleImportClick} 
        />
      </Box>

      {/* SNACKBAR PARA SIMULACIONES */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbarSeverity} sx={{ width: '100%', borderRadius: 2 }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminRespaldos;
