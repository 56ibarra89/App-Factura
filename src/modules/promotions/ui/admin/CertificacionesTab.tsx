
import { useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import type {
  CertificadoRule,
} from "../../model/promotion.types";

function statusColor(
  s: CertificadoRule["status"]
): "success" | "default" | "error" {
  if (s === "Disponible") return "success";
  if (s === "Anulado") return "error";
  return "default";
}

interface CertificacionesTabProps {
  certificados: CertificadoRule[];

  onEmit?: () => void;

  onView?: (certificado: CertificadoRule) => void;

  onDelete?: (id: number) => void;
}

const CertificacionesTab = ({
  certificados,
  onEmit,
  onView,
  onDelete,
}: CertificacionesTabProps) => {
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleConfirmDelete = () => {
    if (deleteId !== null) {
      onDelete?.(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <Box>
      {}
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

      {}
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

      {}
      {certificados.length > 0 && (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "action.hover" }}>
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
                  {}
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

                  {}
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {cert.origin}
                    </Typography>
                  </TableCell>

                  {}
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {cert.product}
                    </Typography>
                  </TableCell>

                  {}
                  <TableCell>{cert.issueDate}</TableCell>

                  {}
                  <TableCell>
                    <Chip
                      label={cert.status}
                      color={statusColor(cert.status)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>

                  {}
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
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
                      <Tooltip title="Eliminar certificado">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => setDeleteId(cert.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {}
      <Dialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar este certificado de forma permanente?
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

export default CertificacionesTab;

