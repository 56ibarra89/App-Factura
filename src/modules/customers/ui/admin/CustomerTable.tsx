/**
 * CustomerTable — SRP: solo renderiza la tabla de clientes con acciones editar/eliminar.
 * Recibe datos y callbacks del hook via la página padre.
 */

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Typography,
  Skeleton,
  Box,
  Chip,
  TablePagination,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import type { Customer } from "../../model/customer.types";

interface Props {
  customers: Customer[];
  loading: boolean;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

const CustomerTable: React.FC<Props> = ({
  customers,
  loading,
  onEdit,
  onDelete,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const paginated = customers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  if (loading) {
    return (
      <Box sx={{ mt: 2 }}>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height={52} sx={{ mb: 0.5, borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  if (customers.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          color: "text.secondary",
          border: "2px dashed",
          borderColor: "divider",
          borderRadius: 3,
          mt: 2,
        }}
      >
        <PersonIcon sx={{ fontSize: 56, mb: 2, opacity: 0.3 }} />
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Sin clientes registrados
        </Typography>
        <Typography variant="body2">
          Crea tu primer cliente con el botón de arriba.
        </Typography>
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{ borderRadius: 3, overflow: "hidden", mt: 3 }}
    >
      <TableContainer>
        <Table id="customers-table" aria-label="Tabla de clientes">
          <TableHead>
            <TableRow sx={{ bgcolor: "action.hover" }}>
              <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Teléfono</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Direcciones
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Registrado</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((customer) => (
              <TableRow
                key={customer.id}
                hover
                sx={{ "&:last-child td": { borderBottom: 0 } }}
              >
                {/* Nombre */}
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonIcon fontSize="small" color="primary" />
                    <Typography fontWeight={600}>{customer.name}</Typography>
                  </Box>
                </TableCell>

                {/* Teléfono */}
                <TableCell>
                  {customer.phone ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">{customer.phone}</Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.disabled" fontStyle="italic">
                      —
                    </Typography>
                  )}
                </TableCell>

                {/* Nº Direcciones */}
                <TableCell align="center">
                  <Chip
                    label={customer.addresses.length}
                    size="small"
                    color={customer.addresses.length > 0 ? "primary" : "default"}
                    variant="outlined"
                  />
                </TableCell>

                {/* Registrado */}
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(customer.createdAt)}
                  </Typography>
                </TableCell>

                {/* Acciones */}
                <TableCell align="center">
                  <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                    <Tooltip title="Editar cliente">
                      <IconButton
                        id={`edit-customer-${customer.id}`}
                        size="small"
                        color="primary"
                        onClick={() => onEdit(customer)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar cliente">
                      <IconButton
                        id={`delete-customer-${customer.id}`}
                        size="small"
                        color="error"
                        onClick={() => onDelete(customer.id)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={customers.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} de ${count}`
        }
      />
    </Paper>
  );
};

export default CustomerTable;
