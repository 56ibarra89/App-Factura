import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";

const MOCK_CUPONES = [
  {
    id: 1,
    code: "VERANO2026",
    discount: "15%",
    usage: "14 / 50",
    expires: "2026-08-31",
    status: "Activo",
  },
  {
    id: 2,
    code: "BIENVENIDA",
    discount: "$50.00",
    usage: "120 / ∞",
    expires: "Sin límite",
    status: "Activo",
  },
  {
    id: 3,
    code: "FLASH50",
    discount: "50%",
    usage: "10 / 10",
    expires: "2026-04-01",
    status: "Agotado",
  },
];

const CuponesTab = () => {
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
            Cupones Manuales
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Crea códigos alfanuméricos para que los clientes o cajeros los
            rediman.
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<AddIcon />}>
          Crear Cupón
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: "grey.50" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Código</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Descuento</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Uso</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Vencimiento</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {MOCK_CUPONES.map((cupon) => (
              <TableRow key={cupon.id} hover>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color="primary.main"
                      sx={{
                        bgcolor: "primary.50",
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        letterSpacing: 1,
                      }}
                    >
                      {cupon.code}
                    </Typography>
                    <IconButton size="small">
                      <ContentCopyIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{cupon.discount}</TableCell>
                <TableCell>{cupon.usage}</TableCell>
                <TableCell>{cupon.expires}</TableCell>
                <TableCell>
                  <Chip
                    label={cupon.status}
                    color={
                      cupon.status === "Activo"
                        ? "success"
                        : cupon.status === "Agotado"
                        ? "error"
                        : "default"
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton color="error" size="small">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CuponesTab;
// End of file
