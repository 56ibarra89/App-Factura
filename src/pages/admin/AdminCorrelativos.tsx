import React, { useState } from "react";
import { Box, Typography, Button, Card, CardContent, Divider, Chip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { BackButton } from "../../components/BackButton";
import { useCorrelativos } from "../../hooks/useCorrelativos";
import { useDgiConfig, DgiConfig } from "../../hooks/useDgiConfig";
import CorrelativoTable from "../../components/Admin/Correlativos/CorrelativoTable";
import CorrelativoFormModal from "../../components/Admin/Correlativos/CorrelativoFormModal";
import ConfirmDialog from "../../components/ConfirmDialog";

const AdminCorrelativos: React.FC = () => {
  const { correlativos, loading, deleteCorrelativo } = useCorrelativos();
  const { dgiConfig, saveConfig } = useDgiConfig();

  const [openModal, setOpenModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleSaveConfig = async (formData: DgiConfig) => {
    try {
      await saveConfig(formData);
      handleCloseModal();
    } catch (error) {
      console.error("Error al guardar en UI:", error);
    }
  };

  const isDgiConfigValid = (config: DgiConfig | null) => {
    if (!config) return false;
    return !!config.resolutionNumber && !!config.authorizationDate;
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
              Gestiona los datos de resolución DGI y revisa el historial de talonarios generados automáticamente.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* DGI CONFIG CARD */}
      <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid #e0e0e0", mb: 4 }}>
        <CardContent sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Resolución DGI Activa
            </Typography>
            {isDgiConfigValid(dgiConfig) ? (
              <Box sx={{ mt: 2, display: 'flex', gap: 4 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">No. Resolución</Typography>
                  <Typography variant="body1" fontWeight={500}>{dgiConfig?.resolutionNumber}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Rango Autorizado</Typography>
                  <Typography variant="body1" fontWeight={500}>{dgiConfig?.startNumber} al {dgiConfig?.endNumber}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Fecha Autorizada</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {new Date(dgiConfig?.authorizationDate || "").toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                No has configurado los datos de la resolución DGI. Se utilizará el formato automático estándar.
              </Typography>
            )}
          </Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleOpenModal}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            {isDgiConfigValid(dgiConfig) ? "Editar Datos DGI" : "Configurar Resolución DGI"}
          </Button>
        </CardContent>
      </Card>

      {/* HISTORIAL TABLE */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Historial Automático de Talonarios
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Secuencias mensuales generadas automáticamente por el sistema al iniciar un nuevo mes.
        </Typography>
        <CorrelativoTable 
          correlativos={correlativos} 
          loading={loading} 
          onDelete={(id) => setDeleteId(id)} 
        />
      </Box>

      {/* MODAL CONFIGURACION DGI */}
      <CorrelativoFormModal 
        open={openModal} 
        initialData={dgiConfig}
        onClose={handleCloseModal} 
        onSave={handleSaveConfig} 
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
        onCancel={() => setDeleteId(null)}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </Box>
  );
};

export default AdminCorrelativos;
