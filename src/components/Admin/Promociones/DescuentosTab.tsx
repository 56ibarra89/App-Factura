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
import PercentIcon from "@mui/icons-material/Percent";

const MOCK_DESCUENTOS = [
  {
    id: 1,
    name: "Descuento Empleados",
    type: "Porcentaje",
    value: "20%",
    status: "Activo",
    appliesTo: "Toda la cuenta",
  },
  {
    id: 2,
    name: "Descuento Cumpleañero",
    type: "Monto Fijo",
    value: "$150.00",
    status: "Activo",
    appliesTo: "Solo Bebidas",
  },
];

const DescuentosTab = () => {
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
            Configura descuentos fijos o porcentuales que los cajeros pueden
            aplicar.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          Nuevo Descuento
        </Button>
      </Box>

      <Grid container spacing={3}>
        {MOCK_DESCUENTOS.map((desc) => (
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

                <Box sx={{ display: "flex", justifyContent: "flex-end", borderTop: 1, borderColor: "divider", pt: 1 }}>
                  <IconButton size="small" color="primary">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error">
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

export default DescuentosTab;
