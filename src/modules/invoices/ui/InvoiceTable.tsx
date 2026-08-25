import { useState } from "react";
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Chip,
  IconButton,
  TablePagination,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import VisibilityIcon from "@mui/icons-material/Visibility";
import type { Invoice } from "../model/invoice.types";
import { statusLabels, statusColors } from "../../orders";
import { useMesasConfig } from "../../tables";
import { formatTableName } from "../../../shared/format";
import PaymentMethodBadge from "./PaymentMethodBadge";
import PaymentBreakdownCell from "./PaymentBreakdownCell";

interface InvoiceTableProps {
  orders: Invoice[];
  loading: boolean;
  onPrintClick: (order: Invoice) => void;
  onViewClick: (order: Invoice) => void;
}

const InvoiceTable = ({
  orders,
  loading,
  onPrintClick,
  onViewClick,
}: InvoiceTableProps) => {
  const { floorsConfig } = useMesasConfig();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedOrders = orders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

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
                Acciones
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
                  Buscando comprobantes...
                </TableCell>
              </TableRow>
            )}
            {!loading && orders.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  align="center"
                  sx={{ py: 6, color: "text.secondary" }}
                >
                  No se encontraron facturas con los filtros seleccionados.
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              paginatedOrders.map((order) => {
                const isCancelled = order.status === "cancelled";
                return (
                  <TableRow
                    key={order.id}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      bgcolor: isCancelled ? "action.hover" : "inherit",
                      opacity: isCancelled ? 0.75 : 1,
                    }}
                  >
                    <TableCell>
                      {order.timestamp.toLocaleDateString()}{" "}
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                      >
                        {order.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {order.invoiceNumber
                        ? `#${order.invoiceNumber}`
                        : "Sin Factura"}
                    </TableCell>
                    <TableCell>
                      {order.customerName && order.customerName !== "Mesa"
                        ? order.customerName
                        : order.tableId
                          ? formatTableName(order.tableId, floorsConfig)
                          : "--"}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {order.cashierName || "--"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <PaymentMethodBadge
                        paymentMethod={order.paymentMethod}
                      />
                    </TableCell>
                    <TableCell>
                      <PaymentBreakdownCell invoice={order} />
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        textDecoration: isCancelled
                          ? "line-through"
                          : "none",
                        color: isCancelled ? "text.secondary" : "text.primary",
                      }}
                    >
                      C${order.total.toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={statusLabels[order.status]}
                        color={statusColors[order.status]}
                        size="small"
                        variant={isCancelled ? "outlined" : "filled"}
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="info"
                        onClick={() => onViewClick(order)}
                        title="Ver Detalles"
                        size="small"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="primary"
                        onClick={() => onPrintClick(order)}
                        title="Reimprimir"
                        size="small"
                      >
                        <PrintIcon fontSize="small" />
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
        count={orders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
      />
    </Paper>
  );
};

export default InvoiceTable;
