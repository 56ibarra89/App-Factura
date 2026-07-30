import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import {
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import type { ChangeEvent } from "react";
import {
  statusColors,
  statusLabels,
} from "../../orders";
import type { Invoice } from "../model/invoice.types";
import { formatTableName } from "../../../shared/format";

interface InvoiceCancellationTableProps {
  orders: Invoice[];
  totalRows: number;
  loading: boolean;
  searchQuery: string;
  page: number;
  rowsPerPage: number;
  floors: Array<{ id: number; name: string }>;
  onRequestCancellation(order: Invoice): void;
  onPageChange(event: unknown, page: number): void;
  onRowsPerPageChange(
    event: ChangeEvent<HTMLInputElement>,
  ): void;
}

export function InvoiceCancellationTable({
  orders,
  totalRows,
  loading,
  searchQuery,
  page,
  rowsPerPage,
  floors,
  onRequestCancellation,
  onPageChange,
  onRowsPerPageChange,
}: InvoiceCancellationTableProps) {
  return (
    <Paper
      sx={{
        width: "100%",
        overflow: "hidden",
        borderRadius: 4,
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
      }}
    >
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: "action.hover" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>
                Fecha / Hora
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                ID Factura
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                Cliente / Mesa
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                Total
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold" }}
              >
                Estado
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold" }}
              >
                Acción
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{
                    py: 6,
                    color: "text.secondary",
                  }}
                >
                  Buscando facturas...
                </TableCell>
              </TableRow>
            )}

            {!loading && totalRows === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{
                    py: 6,
                    color: "text.secondary",
                  }}
                >
                  {searchQuery
                    ? "No se encontraron facturas que coincidan con la búsqueda."
                    : "No hay facturas registradas en este rango de fechas."}
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              orders.map((order) => {
                const isCancelled =
                  order.status === "cancelled";

                return (
                  <TableRow
                    key={order.id}
                    sx={{
                      "&:last-child td, &:last-child th": {
                        border: 0,
                      },
                    }}
                  >
                    <TableCell>
                      {new Date(
                        order.timestamp,
                      ).toLocaleDateString()}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        {new Date(
                          order.timestamp,
                        ).toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {order.invoiceNumber
                        ? `#${order.invoiceNumber}`
                        : "Sin Factura"}
                    </TableCell>
                    <TableCell>
                      {order.customerName ||
                        (order.tableId
                          ? formatTableName(
                              order.tableId,
                              floors,
                            )
                          : "--")}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      C${order.total.toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={statusLabels[order.status]}
                        color={statusColors[order.status]}
                        size="small"
                        variant={
                          isCancelled
                            ? "outlined"
                            : "filled"
                        }
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() =>
                          onRequestCancellation(order)
                        }
                        disabled={isCancelled}
                        title={
                          isCancelled
                            ? "Ya está anulada"
                            : "Anular factura"
                        }
                      >
                        <CancelOutlinedIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={totalRows}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${
            count !== -1 ? count : `más de ${to}`
          }`
        }
      />
    </Paper>
  );
}
