/**
 * CuponesTab — Renderiza la tabla de cupones manuales.
 *
 * SOLID:
 *  S — Single Responsibility: solo renderiza. Nada de lógica de negocio.
 *  I — Interface Segregation: cada acción es una prop opcional independiente.
 *      El componente no asume que todas existen (usa el operador ?.).
 *  O — Open/Closed: se agregó onEdit sin modificar el contrato de las props
 *      existentes (onAdd, onCopy, onDelete siguen igual).
 */
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
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { CuponRule, CuponStatus } from "../../../types/promociones";

// ── Helpers de presentación ──────────────────────────────────────────────────

/** Mapea CuponStatus al color del Chip de MUI. */
function statusColor(
  s: CuponStatus
): "success" | "error" | "warning" | "default" {
  if (s === "Activo") return "success";
  if (s === "Agotado") return "error";
  if (s === "Vencido") return "warning";
  return "default";
}

// ── Props (ISP: cada acción es opcional e independiente) ─────────────────────

interface CuponesTabProps {
  cupones: CuponRule[];
  onAdd?: () => void;
  onEdit?: (cupon: CuponRule) => void;  // ← nueva prop ISP
  onCopy?: (code: string) => void;
  onDelete?: (id: number) => void;
}

// ── Componente ───────────────────────────────────────────────────────────────

const CuponesTab = ({
  cupones,
  onAdd,
  onEdit,
  onCopy,
  onDelete,
}: CuponesTabProps) => {
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleConfirmDelete = () => {
    if (deleteId !== null) {
      onDelete?.(deleteId);
      setDeleteId(null);
    }
  };

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
            Cupones Manuales
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Crea códigos alfanuméricos para que los clientes o cajeros los
            rediman. El estado se actualiza automáticamente por uso o
            vencimiento.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAdd}
        >
          Crear Cupón
        </Button>
      </Box>

      {/* Estado vacío */}
      {cupones.length === 0 && (
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
          <LocalOfferIcon sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
          <Typography variant="body1">Aún no hay cupones creados.</Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Haz clic en "Crear Cupón" para añadir el primero.
          </Typography>
        </Box>
      )}

      {/* Tabla */}
      {cupones.length > 0 && (
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
              {cupones.map((cupon) => (
                <TableRow key={cupon.id} hover>
                  {/* Código */}
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
                      <Tooltip title="Copiar código">
                        <IconButton
                          size="small"
                          onClick={() => onCopy?.(cupon.code)}
                        >
                          <ContentCopyIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>

                  {/* Descuento */}
                  <TableCell sx={{ fontWeight: 600 }}>{cupon.discount}</TableCell>

                  {/* Uso */}
                  <TableCell>{cupon.usage}</TableCell>

                  {/* Vencimiento */}
                  <TableCell>{cupon.expires}</TableCell>

                  {/* Estado — color calculado automáticamente */}
                  <TableCell>
                    <Chip
                      label={cupon.status}
                      color={statusColor(cupon.status)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>

                  {/* Acciones */}
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                      <Tooltip title="Editar cupón">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => onEdit?.(cupon)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar cupón">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => setDeleteId(cupon.id)}
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
            ¿Está seguro de que desea eliminar este cupón de forma permanente? 
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

export default CuponesTab;
