import { Box, Button, CircularProgress } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

interface TableLayoutActionsProps {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onBackToTables: () => void;
  onSave: () => void;
}

export default function TableLayoutActions({
  hasUnsavedChanges,
  isSaving,
  onBackToTables,
  onSave,
}: TableLayoutActionsProps) {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      flexWrap="wrap"
      gap={2}
    >
      <Button
        variant="outlined"
        onClick={onBackToTables}
        sx={{
          borderRadius: 4,
          fontWeight: "bold",
          textTransform: "none",
          color: "text.secondary",
          borderColor: "divider",
        }}
      >
        ← Volver a Vista de Mesas
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={onSave}
        disabled={!hasUnsavedChanges || isSaving}
        startIcon={
          isSaving ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <SaveIcon />
          )
        }
        sx={{
          borderRadius: 4,
          fontWeight: "bold",
          textTransform: "none",
          px: 4,
          py: 1.5,
          boxShadow: hasUnsavedChanges
            ? "0 4px 14px rgba(0,0,0,0.2)"
            : "none",
        }}
      >
        {isSaving ? "Guardando..." : "Guardar Cambios"}
      </Button>
    </Box>
  );
}
