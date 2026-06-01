import React, { useState } from "react";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { BackButton } from "../../components/BackButton";
import { useCorrelativos } from "../../hooks/useCorrelativos";
import CorrelativoTable from "../../components/Admin/Correlativos/CorrelativoTable";
import CorrelativoFormModal from "../../components/Admin/Correlativos/CorrelativoFormModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { Correlativo } from "../../types/correlativo.types";

const AdminCorrelativos: React.FC = () => {
  const { correlativos, loading, saveCorrelativo, updateCorrelativo, deleteCorrelativo } = useCorrelativos();

  const [openModal, setOpenModal] = useState(false);
  const [editingCorrelativo, setEditingCorrelativo] = useState<Partial<Correlativo> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleOpenModal = (correlativo?: Partial<Correlativo>) => {
    setEditingCorrelativo(correlativo || null);
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setEditingCorrelativo(null);
    setOpenModal(false);
  };

  const handleSaveCorrelativo = async (formData: Partial<Correlativo>) => {
    try {
      if (formData.id) {
        await updateCorrelativo(formData.id, formData);
      } else {
        await saveCorrelativo(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error al guardar correlativo en UI:", error);
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
              Control Fiscal y Resoluciones
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestiona los datos de resolución DGI y revisa el historial de talonarios generados.
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          sx={{ borderRadius: 2, textTransform: "none", boxShadow: 2, px: 3, py: 1.2 }}
        >
          Nuevo
        </Button>
      </Box>

      {/* HISTORIAL TABLE */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Historial de Talonarios
        </Typography>
        <CorrelativoTable 
          correlativos={correlativos} 
          loading={loading} 
          onDelete={(id) => setDeleteId(id)} 
          onUpdate={(correlativo) => handleOpenModal(correlativo)}
        />
      </Box>

      {/* MODAL CONFIGURACION CORRELATIVO */}
      <CorrelativoFormModal 
        open={openModal} 
        initialData={editingCorrelativo}
        onClose={handleCloseModal} 
        onSave={handleSaveCorrelativo} 
      />

      {/* CONFIRMACION ELIMINAR */}
      <ConfirmDialog
        open={!!deleteId}
        title="Eliminar Talonario"
        message="¿Estás seguro de eliminar este historial de talonario? Esto no eliminará las facturas emitidas, pero afectará el registro del correlativo. Esta acción no se puede deshacer."
        onConfirm={() => {
          if (deleteId) deleteCorrelativo(deleteId);
          setDeleteId(null);
        }}
        onClose={() => setDeleteId(null)}
      />
    </Box>
  );
};

export default AdminCorrelativos;
