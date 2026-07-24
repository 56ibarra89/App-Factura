import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import type { FloorConfig } from "../../../hooks/useMesasConfig";
import { LOGIN_COLORS } from "../../../theme/loginTheme";

interface FloorConfigurationGridProps {
  floors: FloorConfig[];
  onAdd: () => void;
  onChangeTableCount: (floorId: number, value: string) => void;
  onDelete: (floorId: number, name: string) => void;
  onRename: (floorId: number, name: string) => void;
}

export default function FloorConfigurationGrid({
  floors,
  onAdd,
  onChangeTableCount,
  onDelete,
  onRename,
}: FloorConfigurationGridProps) {
  return (
    <Grid container spacing={4}>
      {floors.map((floor) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={floor.id}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: "1px solid",
              borderColor:
                floor.tableCount > 0
                  ? alpha(LOGIN_COLORS.primary, 0.3)
                  : "divider",
              bgcolor:
                floor.tableCount > 0
                  ? alpha(LOGIN_COLORS.primary, 0.03)
                  : "background.paper",
              transition: "all 0.2s",
              position: "relative",
              "&:hover": {
                borderColor: LOGIN_COLORS.primary,
                boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
              },
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                display: "flex",
              }}
            >
              <IconButton
                size="small"
                onClick={() => onRename(floor.id, floor.name)}
                sx={{ color: "text.secondary" }}
                title="Editar nombre"
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(floor.id, floor.name)}
                title="Eliminar planta"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box display="flex" flexDirection="column" gap={1} mb={2} pr={7}>
              <Typography variant="h6" fontWeight="800">
                {floor.name}
              </Typography>
              {floor.tableCount > 0 && (
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  color="primary"
                  sx={{
                    bgcolor: alpha(LOGIN_COLORS.primary, 0.08),
                    px: 1,
                    py: 0.3,
                    borderRadius: 1,
                    alignSelf: "flex-start",
                  }}
                >
                  {floor.tableCount} mesas
                </Typography>
              )}
            </Box>
            <TextField
              fullWidth
              label="Número de Mesas"
              type="number"
              variant="outlined"
              value={floor.tableCount === 0 ? "" : floor.tableCount}
              onChange={(event) =>
                onChangeTableCount(floor.id, event.target.value)
              }
              slotProps={{ htmlInput: { min: 0 } }}
              sx={{ bgcolor: "background.paper" }}
            />
          </Paper>
        </Grid>
      ))}

      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onAdd}
          sx={{
            height: "100%",
            minHeight: 140,
            borderRadius: 4,
            borderStyle: "dashed",
            borderWidth: 2,
            color: "text.secondary",
            borderColor: "divider",
            "&:hover": { borderStyle: "dashed", borderWidth: 2 },
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={1}
          >
            <AddIcon fontSize="large" />
            <Typography fontWeight="bold">Añadir Planta</Typography>
          </Box>
        </Button>
      </Grid>
    </Grid>
  );
}
