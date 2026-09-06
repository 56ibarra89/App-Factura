import { useState, useEffect, useCallback } from "react";
import {
  backupGateway,
  type BackupItem,
  type BackupConfig,
  type BackupGateway,
} from "../api/backupGateway";

export const useBackups = (gateway: BackupGateway = backupGateway) => {
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [config, setConfig] = useState<BackupConfig>({
    enabled: true,
    hour: 3,
    minute: 0,
    backupOnShiftClose: true,
    retentionDays: 30,
  });

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // Diálogo de restauración
  const [restoreModal, setRestoreModal] = useState<{
    open: boolean;
    item: BackupItem | null;
    file: File | null;
  }>({
    open: false,
    item: null,
    file: null,
  });

  // Diálogo de eliminación
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    item: BackupItem | null;
  }>({
    open: false,
    item: null,
  });

  const showNotification = (
    message: string,
    severity: "success" | "error" | "info" | "warning" = "info"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [listData, configData] = await Promise.all([
        gateway.list(),
        gateway.getConfig(),
      ]);
      setBackups(listData);
      if (configData) {
        setConfig(configData);
      }
    } catch (err: any) {
      showNotification(
        err?.message || "Error al cargar la información de respaldos",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [gateway]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Generación Manual
  const handleGenerateBackup = async () => {
    setGenerating(true);
    showNotification("Creando copia de seguridad de la base de datos...", "info");
    try {
      const newItem = await gateway.generate();
      setBackups((prev) => [newItem, ...prev.filter((b) => b.filename !== newItem.filename)]);
      showNotification(
        `¡Respaldo ${newItem.filename} generado exitosamente (${newItem.sizeMb} MB)!`,
        "success"
      );
    } catch (err: any) {
      showNotification(
        err?.message || "No se pudo generar el respaldo",
        "error"
      );
    } finally {
      setGenerating(false);
    }
  };

  // Guardar Configuración
  const handleSaveConfig = async (newConfig: Partial<BackupConfig>) => {
    setSavingConfig(true);
    try {
      const updated = await gateway.updateConfig(newConfig);
      setConfig(updated);
      showNotification("Configuración de respaldos guardada correctamente", "success");
    } catch (err: any) {
      showNotification(
        err?.message || "Error al actualizar la configuración",
        "error"
      );
    } finally {
      setSavingConfig(false);
    }
  };

  // Descargar Archivo
  const handleDownload = async (filename: string) => {
    try {
      showNotification(`Iniciando descarga de ${filename}...`, "info");
      await gateway.download(filename);
      showNotification("Archivo descargado exitosamente", "success");
    } catch (err: any) {
      showNotification(
        err?.message || "Error al descargar el archivo",
        "error"
      );
    }
  };

  // Abrir Modal de Restauración para un ítem del historial
  const handleOpenRestoreItem = (item: BackupItem) => {
    setRestoreModal({ open: true, item, file: null });
  };

  // Abrir Modal de Restauración para un archivo externo
  const handleOpenRestoreFile = (file: File) => {
    setRestoreModal({ open: true, item: null, file });
  };

  const handleCloseRestoreDialog = () => {
    if (restoring) return;
    setRestoreModal({ open: false, item: null, file: null });
  };

  // Confirmar y Ejecutar Restauración con Snapshot Preventivo
  const handleConfirmRestore = async () => {
    setRestoring(true);
    showNotification(
      "Creando snapshot preventivo y restaurando el sistema...",
      "info"
    );

    try {
      let result;
      if (restoreModal.file) {
        result = await gateway.restoreFromFile(restoreModal.file);
      } else if (restoreModal.item) {
        result = await gateway.restore(restoreModal.item.filename);
      } else {
        throw new Error("No se seleccionó ningún origen de restauración");
      }

      showNotification(
        `¡Sistema restaurado con éxito! Se protegió el estado previo en [${result.safetySnapshot}].`,
        "success"
      );
      handleCloseRestoreDialog();
      await loadAll();
    } catch (err: any) {
      showNotification(
        err?.message || "Error crítico al restaurar la base de datos",
        "error"
      );
    } finally {
      setRestoring(false);
    }
  };

  // Modal de Eliminación
  const handleOpenDeleteDialog = (item: BackupItem) => {
    setDeleteModal({ open: true, item });
  };

  const handleCloseDeleteDialog = () => {
    if (deleting) return;
    setDeleteModal({ open: false, item: null });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.item) return;
    const targetFilename = deleteModal.item.filename;
    setDeleting(true);

    try {
      await gateway.delete(targetFilename);
      setBackups((prev) => prev.filter((b) => b.filename !== targetFilename));
      showNotification(`Respaldo ${targetFilename} eliminado correctamente`, "success");
      handleCloseDeleteDialog();
    } catch (err: any) {
      showNotification(
        err?.message || "No se pudo eliminar el archivo",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  return {
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
    loadAll,
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
  };
};
