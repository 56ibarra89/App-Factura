import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { HappyHourRule } from "../../../data/promocionesMockData";

interface HappyHourTabProps {
  /** OCP: el componente renderiza datos recibidos por props, sin conocer su origen */
  rules: HappyHourRule[];
  onAdd?: () => void;
  onEdit?: (rule: HappyHourRule) => void;
  onDelete?: (id: number) => void;
}

const HappyHourTab = ({ rules, onAdd, onEdit, onDelete }: HappyHourTabProps) => {
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
            Configura descuentos automáticos basados en días de la semana y rango de horas.
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

      <Grid container spacing={3}>
        {rules.map((hh) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={hh.id}>
            <Card
              variant="outlined"
              sx={{ borderRadius: 2, opacity: hh.status === "Inactivo" ? 0.7 : 1 }}
            >
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
                        bgcolor: hh.status === "Activo" ? "secondary.50" : "grey.100",
                        color: hh.status === "Activo" ? "secondary.main" : "grey.500",
                        display: "flex",
                      }}
                    >
                      <AccessTimeIcon fontSize="small" />
                    </Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {hh.name}
                    </Typography>
                  </Box>
                  <Chip
                    label={hh.status}
                    color={hh.status === "Activo" ? "success" : "default"}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Días:</Typography>
                    <Typography variant="body2" fontWeight={600}>{hh.days}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Horario:</Typography>
                    <Typography variant="body2" fontWeight={600}>{hh.time}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Promoción:</Typography>
                    <Typography variant="body2" color="secondary.main" fontWeight={700}>
                      {hh.promotion}
                    </Typography>
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
                  <IconButton size="small" color="primary" onClick={() => onEdit?.(hh)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => onDelete?.(hh.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HappyHourTab;
