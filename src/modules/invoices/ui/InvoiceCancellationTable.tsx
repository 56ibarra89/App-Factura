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
import { statusColors, statusLabels } from "../../orders";
import type { Invoice } from "../model/invoice.types";
import { formatTableName } from "../../../shared/format";
import PaymentMethodBadge from "./PaymentMethodBadge";
import PaymentBreakdownCell from "./PaymentBreakdownCell";

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
  onRowsPerPageChange(event: ChangeEvent<HTMLInputElement>): void;
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
      elevation={0}
      sx={{
        width: "100%",
        overflow: "hidden",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
      }}
    >
      <TableContainer>
        <Table sx={{ minWidth: 950 }}>
          <TableHead sx={{ bgcolor: "action.hover" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Fecha / Hora</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>ID Factura</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Cliente / Mesa</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Cajero</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Método de Pago</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Desglose de Pago</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Estado
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Acción
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  align="center"
                  sx={{ py: 6, color: "text.secondary" }}
                >
                  Buscando facturas...
                </TableCell>
              </TableRow>
            )}
            {!loading && totalRows === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  align="center"
                  sx={{ py: 6, color: "text.secondary" }}
                >
                  {searchQuery
                    ? "No se encontraron facturas que coincidan con la búsqueda."
                    : "No hay facturas registradas en este rango de fechas."}
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              orders.map((order) => {
                const isCancelled = order.status === "cancelled";
                const dateObj = new Date(order.timestamp);
                return (
                  <TableRow
                    key={order.id}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      bgcolor: isCancelled ? "action.hover" : "inherit",
                      opacity: isCancelled ? 0.75 : 1,
                    }}
                  >
                    {/* 1. Fecha / Hora */}
                    <TableCell>
                      {dateObj.toLocaleDateString()}{" "}
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 0.5 }}
                      >
                        {dateObj.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </TableCell>

                    {/* 2. ID Factura */}
                    <TableCell sx={{ fontWeight: 600 }}>
                      {order.invoiceNumber
                        ? `#${order.invoiceNumber}`
                        : "Sin Factura"}
                    </TableCell>

                    {/* 3. Cliente / Mesa */}
                    <TableCell>
                      {order.customerName && order.customerName !== "Mesa"
                        ? order.customerName
                        : order.tableId
                        ? formatTableName(order.tableId, floors)
                        : "--"}
                    </TableCell>

                    {/* 4. Cajero */}
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {order.cashierName || "--"}
                      </Typography>
                    </TableCell>

                    {/* 5. Método de Pago Badge */}
                    <TableCell>
                      <PaymentMethodBadge paymentMethod={order.paymentMethod} />
                    </TableCell>

                    {/* 6. Desglose de Pago */}
                    <TableCell>
                      <PaymentBreakdownCell invoice={order} />
                    </TableCell>

                    {/* 7. Total */}
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        textDecoration: isCancelled ? "line-through" : "none",
                        color: isCancelled ? "text.secondary" : "text.primary",
                      }}
                    >
                      C${order.total.toFixed(2)}
                    </TableCell>

                    {/* 8. Estado */}
                    <TableCell align="center">
                      <Chip
                        label={statusLabels[order.status]}
                        color={statusColors[order.status]}
                        size="small"
                        variant={isCancelled ? "outlined" : "filled"}
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>

                    {/* 9. Botón de Anulación */}
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => onRequestCancellation(order)}
                        disabled={isCancelled}
                        title={
                          isCancelled
                            ? "Factura ya anulada"
                            : "Anular factura"
                        }
                        size="small"
                      >
                        <CancelOutlinedIcon fontSize="small" />
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
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
      />
    </Paper>
  );
}
