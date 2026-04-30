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
import VisibilityIcon from "@mui/icons-material/Visibility";
import { CertificadoRule } from "../../../data/promocionesMockData";

interface CertificacionesTabProps {
  /** OCP: el componente renderiza datos recibidos por props, sin conocer su origen */
  certificados: CertificadoRule[];
  onAdd?: () => void;
  onView?: (certificado: CertificadoRule) => void;
}

const CertificacionesTab = ({ certificados, onAdd, onView }: CertificacionesTabProps) => {
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
            Certificados y Vales de Producto
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Emite certificados únicos canjeables por un producto. Cada código es válido por
            un solo uso.
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={onAdd}>
          Emitir Certificado
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: "grey.50" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Serial Único</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Origen / Empresa</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Producto a Canjear</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Emisión</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {certificados.map((cert) => (
              <TableRow key={cert.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={700} color="primary.main">
                    {cert.serial}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {cert.origin}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {cert.product}
                  </Typography>
                </TableCell>
                <TableCell>{cert.issueDate}</TableCell>
                <TableCell>
                  <Chip
                    label={cert.status}
                    color={cert.status === "Disponible" ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => onView?.(cert)}
                  >
                    <VisibilityIcon fontSize="small" />
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

export default CertificacionesTab;
