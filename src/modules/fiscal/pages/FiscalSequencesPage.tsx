import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { BackButton, ConfirmDialog, PageHeader } from "../../../shared/ui";
import { useCorrelativos } from "../hooks/useCorrelativos";
import CorrelativoTable from "../ui/admin/CorrelativoTable";
import CorrelativoFormModal from "../ui/admin/CorrelativoFormModal";
import type { Correlativo } from "../model/fiscal.types";

const FiscalSequencesPage: React.FC = () => {
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
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        pt: 4,
        pb: 4,
        px: { xs: 2, md: 6 },
      }}
    >
      <PageHeader
        title="Control Fiscal y Resoluciones"
        startContent={<BackButton to="/admin" />}
        actions={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Nuevo
          </Button>
        }
      />

      {}
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

      {}
      <CorrelativoFormModal
        open={openModal}
        initialData={editingCorrelativo}
        onClose={handleCloseModal}
        onSave={handleSaveCorrelativo}
      />

      {}
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

export default FiscalSequencesPage;

