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
import { CuponRule } from "../../../data/promocionesMockData";

interface CuponesTabProps {
  /** OCP: el componente renderiza datos recibidos por props, sin conocer su origen */
  cupones: CuponRule[];
  onAdd?: () => void;
  onCopy?: (code: string) => void;
  onDelete?: (id: number) => void;
}

const CuponesTab = ({ cupones, onAdd, onCopy, onDelete }: CuponesTabProps) => {
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
            Crea códigos alfanuméricos para que los clientes o cajeros los rediman.
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={onAdd}>
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
              <TableCell align="right" sx={{ fontWeight: 600 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cupones.map((cupon) => (
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
                    <IconButton size="small" onClick={() => onCopy?.(cupon.code)}>
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
                  <IconButton color="error" size="small" onClick={() => onDelete?.(cupon.id)}>
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
