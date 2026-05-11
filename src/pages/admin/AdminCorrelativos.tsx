import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { BackButton } from "../../components/BackButton";
import { useCorrelativos } from "../../hooks/useCorrelativos";
import CorrelativoCard from "../../components/Admin/Correlativos/CorrelativoCard";
import CorrelativoTable from "../../components/Admin/Correlativos/CorrelativoTable";
import CorrelativoFormModal from "../../components/Admin/Correlativos/CorrelativoFormModal";
import { Correlativo } from "../../types/correlativo.types";

const AdminCorrelativos: React.FC = () => {
  const {
    correlativos,
    loading,
    activeFactura,
    saveCorrelativo,
    deleteCorrelativo,
  } = useCorrelativos();

  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleSave = async (formData: Partial<Correlativo>) => {
    try {
      await saveCorrelativo(formData);
      handleCloseModal();
    } catch (error) {
      console.error("Error al guardar en UI:", error);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: "1200px", margin: "0 auto" }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <BackButton to="/admin" />
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Correlativos y Facturación
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestiona los números de comprobantes fiscales y secuencias autorizadas.
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
          sx={{ borderRadius: 2, textTransform: "none", px: 3, py: 1 }}
        >
          Nuevo Rango
        </Button>
      </Box>

      {/* SECUENCIA ACTIVA DASHBOARD */}
      <CorrelativoCard activeFactura={activeFactura} />

      {/* HISTORIAL TABLE */}
      <CorrelativoTable 
        correlativos={correlativos} 
        loading={loading} 
        onDelete={deleteCorrelativo} 
      />

      {/* MODAL NUEVO CORRELATIVO */}
      <CorrelativoFormModal 
        open={openModal} 
        onClose={handleCloseModal} 
        onSave={handleSave} 
      />
    </Box>
  );
};

export default AdminCorrelativos;
