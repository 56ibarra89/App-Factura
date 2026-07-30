import {
  Box,
  Button,
  FormControlLabel,
  IconButton,
  Paper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import type { useAdminKitchens } from "../../hooks/useAdminKitchens";

interface KitchenManagementPanelProps {
  manager: ReturnType<typeof useAdminKitchens>;
}

export default function KitchenManagementPanel({
  manager,
}: KitchenManagementPanelProps) {
  return (
    <>
      <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
        <Typography variant="h6" mb={2}>
          Agregar Nueva Cocina
        </Typography>
        <Box display="flex" gap={2}>
          <TextField
            size="small"
            fullWidth
            label="Nombre de la Cocina"
            value={manager.newKitchenName}
            onChange={(event) => manager.setNewKitchenName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void manager.handleAdd();
            }}
          />
          <Button
            variant="contained"
            onClick={manager.handleAdd}
            disabled={!manager.newKitchenName.trim()}
          >
            Agregar
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h6" mb={3}>
          Cocinas Registradas
        </Typography>
        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          sx={{ maxHeight: 400, overflowY: "auto", pr: 1, pb: 1 }}
        >
          {manager.kitchens.map((kitchen) => (
            <Box
              key={kitchen.id}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              p={2}
              border="1px solid"
              borderColor="divider"
              borderRadius={2}
            >
              {manager.editingId === kitchen.id ? (
                <Box display="flex" alignItems="center" gap={2} flex={1}>
                  <TextField
                    size="small"
                    fullWidth
                    value={manager.editingName}
                    onChange={(event) =>
                      manager.setEditingName(event.target.value)
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={manager.editingActive}
                        onChange={(event) =>
                          manager.setEditingActive(event.target.checked)
                        }
                      />
                    }
                    label={manager.editingActive ? "Activo" : "Inactivo"}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={manager.handleEditSave}
                  >
                    Guardar
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={manager.handleEditCancel}
                  >
                    Cancelar
                  </Button>
                </Box>
              ) : (
                <>
                  <Box>
                    <Typography fontWeight="bold">{kitchen.name}</Typography>
                    <Typography
                      variant="body2"
                      color={kitchen.isActive ? "success.main" : "error.main"}
                    >
                      {kitchen.isActive ? "Activo" : "Inactivo"}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      onClick={() =>
                        manager.handleEditStart(
                          kitchen.id,
                          kitchen.name,
                          kitchen.isActive,
                        )
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => manager.handleDelete(kitchen.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </>
              )}
            </Box>
          ))}
          {manager.kitchens.length === 0 && (
            <Typography textAlign="center" color="text.secondary">
              No hay cocinas registradas.
            </Typography>
          )}
        </Box>
      </Paper>
    </>
  );
}
