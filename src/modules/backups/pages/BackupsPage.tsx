import React from "react";
import {
  Box,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { BackButton } from "../../../shared/ui";
import { useBackups } from "../hooks/useBackups";
import { BackupStatsHeader } from "../ui/BackupStatsHeader";
import { BackupConfigCard } from "../ui/BackupConfigCard";
import { BackupHistoryTable } from "../ui/BackupHistoryTable";
import { RestoreConfirmDialog } from "../ui/RestoreConfirmDialog";
import { DeleteConfirmDialog } from "../ui/DeleteConfirmDialog";

const BackupsPage: React.FC = () => {
  const {
    backups,
    config,
    loading,
    generating,
    savingConfig,
    restoring,
    deleting,
    snackbar,
    restoreModal,
    deleteModal,
    handleGenerateBackup,
    handleSaveConfig,
    handleDownload,
    handleOpenRestoreItem,
    handleOpenRestoreFile,
    handleCloseRestoreDialog,
    handleConfirmRestore,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
    closeSnackbar,
  } = useBackups();

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1400px", margin: "0 auto", minHeight: "100vh" }}>
      {/* Encabezado con botón de retorno */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <BackButton to="/admin" />
        <Box sx={{ ml: 1 }}>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ letterSpacing: "-0.5px", color: "text.primary" }}
          >
            Respaldos de Datos y Recuperación
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra copias de seguridad de PostgreSQL, automatización nocturna y restauración protegida con snapshot preventivo.
          </Typography>
        </Box>
      </Box>

      {/* Barra de Estadísticas y Acciones Rápidas */}
      <BackupStatsHeader
        backups={backups}
        config={config}
        generating={generating}
        onGenerate={handleGenerateBackup}
        onFileSelectForRestore={handleOpenRestoreFile}
      />

      {/* Contenedor Principal: Configuración y Tabla de Auditoría */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "420px 1fr" },
          gap: 3,
          alignItems: "start",
        }}
      >
        {/* Columna de Configuración */}
        <Box>
          <BackupConfigCard
            config={config}
            saving={savingConfig}
            onSave={handleSaveConfig}
          />
        </Box>

        {/* Columna de Historial de Respaldos */}
        <Box>
          <BackupHistoryTable
            backups={backups}
            loading={loading}
            onDownload={handleDownload}
            onRestore={handleOpenRestoreItem}
            onDelete={handleOpenDeleteDialog}
          />
        </Box>
      </Box>

      {/* Modal de Confirmación de Restauración */}
      <RestoreConfirmDialog
        open={restoreModal.open}
        item={restoreModal.item}
        file={restoreModal.file}
        restoring={restoring}
        onClose={handleCloseRestoreDialog}
        onConfirm={handleConfirmRestore}
      />

      {/* Modal de Confirmación de Eliminación */}
      <DeleteConfirmDialog
        open={deleteModal.open}
        item={deleteModal.item}
        deleting={deleting}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
      />

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4500}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: 2, boxShadow: 3, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BackupsPage;
