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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PercentIcon from "@mui/icons-material/Percent";
import { DescuentoRule } from "../../../types/promociones";

interface DescuentosTabProps {
  /** OCP: el componente renderiza datos recibidos por props, sin conocer su origen */
  rules: DescuentoRule[];
  onAdd?: () => void;
  onEdit?: (rule: DescuentoRule) => void;
  onDelete?: (id: number) => void;
}

const DescuentosTab = ({ rules, onAdd, onEdit, onDelete }: DescuentosTabProps) => {
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
            Reglas de Descuento
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configura descuentos fijos o porcentuales que los cajeros pueden aplicar.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
          Nuevo Descuento
        </Button>
      </Box>

      <Grid container spacing={3}>
        {rules.map((desc) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={desc.id}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
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
                        bgcolor: "primary.50",
                        color: "primary.main",
                        display: "flex",
                      }}
                    >
                      <PercentIcon fontSize="small" />
                    </Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {desc.name}
                    </Typography>
                  </Box>
                  <Chip
                    label={desc.status}
                    color="success"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Valor:</Typography>
                    <Typography variant="body2" fontWeight={600}>{desc.value}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Tipo:</Typography>
                    <Typography variant="body2" fontWeight={600}>{desc.type}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Aplica a:</Typography>
                    <Typography variant="body2" fontWeight={600}>{desc.appliesTo}</Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    borderTop: 1,
                    borderColor: "divider",
                    pt: 1,
                  }}
                >
                  <IconButton size="small" color="primary" onClick={() => onEdit?.(desc)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeleteId(desc.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
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
            ¿Está seguro de que desea eliminar esta regla de descuento de forma permanente? 
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

export default DescuentosTab;
