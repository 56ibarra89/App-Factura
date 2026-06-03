import { useState } from "react";
import { apiClient } from "../config/apiClient";

export const useRespaldos = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info">("success");
  
  const [options, setOptions] = useState({
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
      await apiClient("/backups/export", {
        method: "POST",
        body: JSON.stringify(options),
      });
      setSnackbarSeverity("success");
      setSnackbarMessage("¡Respaldo exportado exitosamente!");
    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage("Error al generar respaldo de la base de datos");
    }
  };

  const handleImportClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    // Removed specific file extension requirement here as requested
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setSnackbarSeverity("info");
      setSnackbarMessage("Analizando y restaurando archivo...");
      setSnackbarOpen(true);

      try {
        const formData = new FormData();
        formData.append("backup", file);

        // Removemos el Content-Type por defecto para que fetch asigne multipart/form-data con boundary
        await apiClient("/backups/import", {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": undefined as any
          }
        });

        setSnackbarSeverity("success");
        setSnackbarMessage("¡Sistema restaurado correctamente!");
      } catch (error) {
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
