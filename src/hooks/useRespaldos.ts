import { useState } from "react";

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

  const handleExport = () => {
    setSnackbarSeverity("info");
    setSnackbarMessage("Generando archivo de respaldo...");
    setSnackbarOpen(true);

    setTimeout(() => {
      setSnackbarSeverity("success");
      setSnackbarMessage("¡Respaldo exportado exitosamente!");
      setSnackbarOpen(true);
    }, 1500);
  };

  const handleImportClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    // Removed specific file extension requirement here as requested
    input.onchange = () => {
      setSnackbarSeverity("info");
      setSnackbarMessage("Analizando y restaurando archivo...");
      setSnackbarOpen(true);

      setTimeout(() => {
        setSnackbarSeverity("success");
        setSnackbarMessage("¡Sistema restaurado correctamente! (Simulación)");
        setSnackbarOpen(true);
      }, 2000);
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
