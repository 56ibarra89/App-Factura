import { useState } from "react";
import {
  backupGateway,
  type BackupGateway,
  type BackupOptions,
} from "../api/backupGateway";

export const useBackups = (
  gateway: BackupGateway = backupGateway,
) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info">("success");

  const [options, setOptions] = useState<BackupOptions>({
    config: true,
    menu: true,
    history: true,
  });

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOptions((prev) => ({
      ...prev,
      [event.target.name]: event.target.checked,
    }));
  };

  const handleExport = async () => {
    setSnackbarSeverity("info");
    setSnackbarMessage("Generando archivo de respaldo...");
    setSnackbarOpen(true);

    try {
      await gateway.export(options);
      setSnackbarSeverity("success");
      setSnackbarMessage("¡Respaldo exportado exitosamente!");
    } catch {
      setSnackbarSeverity("error");
      setSnackbarMessage("Error al generar respaldo de la base de datos");
    }
  };

  const handleImportClick = () => {
    const input = document.createElement("input");
    input.type = "file";

    input.onchange = async (event) => {
      const target = event.target;
      const file =
        target instanceof HTMLInputElement ? target.files?.[0] : undefined;
      if (!file) return;

      setSnackbarSeverity("info");
      setSnackbarMessage("Analizando y restaurando archivo...");
      setSnackbarOpen(true);

      try {
        await gateway.import(file);

        setSnackbarSeverity("success");
        setSnackbarMessage("¡Sistema restaurado correctamente!");
      } catch {
        setSnackbarSeverity("error");
        setSnackbarMessage("Error al restaurar archivo");
      }
    };
    input.click();
  };

  const closeSnackbar = () => setSnackbarOpen(false);

  return {
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    options,
    handleOptionChange,
    handleExport,
    handleImportClick,
    closeSnackbar,
  };
};

