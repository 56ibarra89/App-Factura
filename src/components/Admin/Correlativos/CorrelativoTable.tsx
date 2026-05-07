import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  Typography,
  Chip,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Correlativo, CorrelativoStatus } from "../../../types/correlativo.types";

interface CorrelativoTableProps {
  correlativos: Correlativo[];
  loading: boolean;
  onDelete: (id: string) => void;
}

const CorrelativoTable: React.FC<CorrelativoTableProps> = ({
  correlativos,
  loading,
  onDelete,
}) => {
  const getStatusColor = (status: CorrelativoStatus) => {
    switch (status) {
      case "Activo":
        return "success";
      case "Agotado":
        return "warning";
      case "Vencido":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid #e0e0e0", overflow: "hidden" }}>
      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><Typography fontWeight={600}>Tipo</Typography></TableCell>
              <TableCell><Typography fontWeight={600}>Resolución DGI</Typography></TableCell>
              <TableCell><Typography fontWeight={600}>Prefijo</Typography></TableCell>
              <TableCell><Typography fontWeight={600}>Rango</Typography></TableCell>
              <TableCell><Typography fontWeight={600}>Actual</Typography></TableCell>
              <TableCell><Typography fontWeight={600}>Vencimiento</Typography></TableCell>
              <TableCell><Typography fontWeight={600}>Estado</Typography></TableCell>
              <TableCell align="right"><Typography fontWeight={600}>Acciones</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {correlativos.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">No hay correlativos registrados.</Typography>
                </TableCell>
              </TableRow>
            )}
            {correlativos.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.documentType}</TableCell>
                <TableCell>{row.resolutionNumber}</TableCell>
                <TableCell>{row.prefix}</TableCell>
                <TableCell>{row.startNumber} - {row.endNumber}</TableCell>
                <TableCell>{row.currentNumber}</TableCell>
                <TableCell>{new Date(row.expirationDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    label={row.status}
                    color={getStatusColor(row.status)}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (window.confirm("¿Estás seguro de eliminar este registro?")) {
                        onDelete(row.id);
                      }
                    }}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default CorrelativoTable;
