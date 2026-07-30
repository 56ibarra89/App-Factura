import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Switch,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import type {
  HappyHourRule,
} from "../../model/promotion.types";

interface HappyHourTabProps {
  /** OCP: el componente renderiza datos recibidos por props, sin conocer su origen */
  rules: HappyHourRule[];
  onAdd?: () => void;
  onEdit?: (rule: HappyHourRule) => void;
  onDelete?: (id: number) => void;
  onToggleStatus?: (id: number) => void;
}

const HappyHourTab = ({
  rules,
  onAdd,
  onEdit,
  onDelete,
  onToggleStatus,
}: HappyHourTabProps) => {
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleConfirmDelete = () => {
    if (deleteId !== null) {
      onDelete?.(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Horas Felices (Happy Hour)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configura descuentos automáticos basados en{" "}
            <Typography
              component="span"
              variant="body2"
              color="secondary.main"
              fontWeight={600}
            >
              días de la semana
            </Typography>{" "}
            y{" "}
            <Typography
              component="span"
              variant="body2"
              color="secondary.main"
              fontWeight={600}
            >
              rango de horas
            </Typography>
            .
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={onAdd}
        >
          Nueva Regla
        </Button>
      </Box>

      {rules.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            color: "text.secondary",
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <AccessTimeIcon sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
          <Typography variant="body1">
            Aún no hay reglas de Happy Hour.
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Haz clic en "+ Nueva Regla" para crear la primera.
          </Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        {rules.map((hh) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={hh.id}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2,
                opacity: hh.status === "Inactivo" ? 0.72 : 1,
                transition: "opacity 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                },
              }}
            >
              <CardContent>
                {/* Header: icono + nombre + toggle de estado */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        bgcolor:
                          hh.status === "Activo"
                            ? "secondary.50"
                            : "grey.100",
                        color:
                          hh.status === "Activo"
                            ? "secondary.main"
                            : "grey.500",
                        display: "flex",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <AccessTimeIcon fontSize="small" />
                    </Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {hh.name}
                    </Typography>
                  </Box>

                  {/* Chip de estado + switch inline */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Chip
                      label={hh.status}
                      color={hh.status === "Activo" ? "success" : "default"}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                    {onToggleStatus && (
                      <Tooltip
                        title={
                          hh.status === "Activo" ? "Desactivar" : "Activar"
                        }
                      >
                        <Switch
                          size="small"
                          checked={hh.status === "Activo"}
                          onChange={() => onToggleStatus(hh.id)}
                          color="secondary"
                        />
                      </Tooltip>
                    )}
                  </Box>
                </Box>

                {/* Datos de la regla */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      Días:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {hh.days}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      Horario:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {hh.time}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      Promoción:
                    </Typography>
                    <Typography
                      variant="body2"
                      color="secondary.main"
                      fontWeight={700}
                    >
                      {hh.promotion}
                    </Typography>
                  </Box>
                </Box>

                {/* Acciones */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    borderTop: 1,
                    borderColor: "divider",
                    pt: 1,
                    gap: 0.5,
                  }}
                >
                  <Tooltip title="Editar regla">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onEdit?.(hh)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar regla">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteId(hh.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Diálogo de Confirmación */}
      <Dialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar esta regla de Happy Hour de forma permanente? 
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disableElevation
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HappyHourTab;
