import { useState } from "react";
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Typography, Chip, IconButton, TablePagination } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import { Order } from "../../types/order.types";
import { statusLabels, statusColors } from "../../config/orderStatusConfig";

interface ConsultarFacturasTableProps {
  orders: Order[];
  loading: boolean;
  onPrintClick: (order: Order) => void;
}

const ConsultarFacturasTable = ({ orders, loading, onPrintClick }: ConsultarFacturasTableProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedOrders = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 4, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: "grey.100" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Fecha / Hora</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>ID Factura</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Cliente / Mesa</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Estado
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Reimprimir
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell
                  colSpan={6}
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
                  colSpan={6}
                  align="center"
                  sx={{ py: 6, color: "text.secondary" }}
                >
                  No se encontraron facturas en este rango de fechas.
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
                      bgcolor: isCancelled ? "transparent" : "inherit",
                    }}
                  >
                    <TableCell>
                      {order.timestamp.toLocaleDateString()}{" "}
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                      >
                        {order.timestamp.toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell>#{order.invoiceNumber || order.id.split("-")[1]}</TableCell>
                    <TableCell>
                      {order.customerName && order.customerName !== "Mesa"
                        ? order.customerName
                        : (order.tableId ? `Mesa ${order.tableId}` : "--")}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      C${order.total.toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={statusLabels[order.status]}
                        color={statusColors[order.status]}
                        size="small"
                        variant={isCancelled ? "outlined" : "filled"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => onPrintClick(order)}
                        title="Ver Detalles y Reimprimir"
                      >
                        <PrintIcon />
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
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
      />
    </Paper>
  );
};

export default ConsultarFacturasTable;
