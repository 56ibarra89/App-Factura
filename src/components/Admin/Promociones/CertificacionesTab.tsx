/**
 * CertificacionesTab — Renderiza la tabla de certificados/vales de producto.
 *
 * SOLID:
 *  S — Single Responsibility: solo renderiza. Nada de lógica de negocio.
 *  I — Interface Segregation: onEmit, onView son props opcionales independientes.
 *  O — Open/Closed: se renombró onAdd → onEmit (semántico) y se añadió chip
 *      para "Anulado" sin tocar el resto del contrato de props.
 */
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
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import { CertificadoRule } from "../../../data/promocionesMockData";

// ── Helper de presentación ───────────────────────────────────────────────────

function statusColor(
  s: CertificadoRule["status"]
): "success" | "default" | "error" {
  if (s === "Disponible") return "success";
  if (s === "Anulado") return "error";
  return "default"; // Entregado
}

// ── Props (ISP: cada acción es opcional e independiente) ─────────────────────

interface CertificacionesTabProps {
  certificados: CertificadoRule[];
  /** Abre el dialog de emisión de un nuevo certificado */
  onEmit?: () => void;
  /** Abre el dialog de detalle del certificado seleccionado */
  onView?: (certificado: CertificadoRule) => void;
}

// ── Componente ───────────────────────────────────────────────────────────────

const CertificacionesTab = ({
  certificados,
  onEmit,
  onView,
}: CertificacionesTabProps) => {
  return (
    <Box>
      {/* Cabecera */}
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
            Emite certificados únicos canjeables por un producto. Cada código es
            válido por{" "}
            <Typography
              component="span"
              variant="body2"
              color="primary.main"
              fontWeight={600}
            >
              un solo uso
            </Typography>
            .
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="error"
          startIcon={<AddIcon />}
          onClick={onEmit}
        >
          Emitir Certificado
        </Button>
      </Box>

      {/* Estado vacío */}
      {certificados.length === 0 && (
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
          <CardMembershipIcon sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
          <Typography variant="body1">
            Aún no se han emitido certificados.
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Haz clic en "Emitir Certificado" para crear el primero.
          </Typography>
        </Box>
      )}

      {/* Tabla */}
      {certificados.length > 0 && (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "grey.50" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Serial Único</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Origen / Empresa</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Producto a Canjear</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Emisión</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {certificados.map((cert) => (
                <TableRow
                  key={cert.id}
                  hover
                  sx={{ opacity: cert.status === "Anulado" ? 0.55 : 1 }}
                >
                  {/* Serial */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={
                        cert.status === "Anulado"
                          ? "text.disabled"
                          : "primary.main"
                      }
                      sx={{
                        letterSpacing: 0.5,
                        textDecoration:
                          cert.status === "Anulado" ? "line-through" : "none",
                      }}
                    >
                      {cert.serial}
                    </Typography>
                  </TableCell>

                  {/* Origen */}
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {cert.origin}
                    </Typography>
                  </TableCell>

                  {/* Producto */}
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {cert.product}
                    </Typography>
                  </TableCell>

                  {/* Fecha */}
                  <TableCell>{cert.issueDate}</TableCell>

                  {/* Estado */}
                  <TableCell>
                    <Chip
                      label={cert.status}
                      color={statusColor(cert.status)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>

                  {/* Acciones */}
                  <TableCell align="right">
                    <Tooltip
                      title={
                        cert.status === "Disponible"
                          ? "Ver detalle / Canjear"
                          : "Ver detalle"
                      }
                    >
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => onView?.(cert)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default CertificacionesTab;
