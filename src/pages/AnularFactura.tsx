import { useState, useMemo, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { BackButton } from "../components/BackButton";
import PageHeader from "../components/PageHeader";
import { useOrderContext } from "../context/OrderContext";
import { LOGIN_GRADIENTS, LOGIN_COLORS } from "../theme/loginTheme";
import { Order } from "../types/order.types";
import { getOrdersByDateRange } from "../services/db";
import PinValidationDialog from "../components/auth/PinValidationDialog";
import { statusLabels, statusColors } from "../config/orderStatusConfig";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import { useMesasConfig } from "../hooks/useMesasConfig";
import { formatTableName } from "../utils/formatUtils";

const AnularFactura = () => {
  const { updateOrderStatus } = useOrderContext();
  const { floorsConfig } = useMesasConfig();

  const today = new Date();
  const getLocalDate = (d: Date) => new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
  const [startDate, setStartDate] = useState<string>(getLocalDate(today));
  const [endDate, setEndDate] = useState<string>(getLocalDate(today));
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const startObj = new Date(startDate + "T00:00:00");
    const endObj = new Date(endDate + "T23:59:59");
    
    try {
      const fetched = await getOrdersByDateRange(startObj, endObj);
      setOrders(fetched);
    } catch (e) {
      console.error("Error al cargar órdenes:", e);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // Cargar órdenes al inicio y cuando cambien las fechas
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filtramos por búsqueda
  const filteredOrders = useMemo(() => {
    const sorted = [...orders].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    if (!searchQuery) return sorted;

    const lowerQuery = searchQuery.toLowerCase();
    return sorted.filter(
      (o) =>
        o.id.toLowerCase().includes(lowerQuery) ||
        (o.customerName && o.customerName.toLowerCase().includes(lowerQuery)) ||
        (o.tableId && `mesa ${o.tableId}`.toLowerCase().includes(lowerQuery))
    );
  }, [orders, searchQuery]);

  const handleOpenCancelDialog = (order: Order) => {
    setOrderToCancel(order);
    setPinDialogOpen(true);
  };

  const handleCancelSuccess = () => {
    if (orderToCancel) {
      updateOrderStatus(orderToCancel.id, "cancelled");
      // Actualizar localmente la lista de órdenes para reflejar el cambio sin re-feth
      setOrders(prev => prev.map(o => o.id === orderToCancel.id ? { ...o, status: "cancelled" } : o));
    }
    setPinDialogOpen(false);
    setOrderToCancel(null);
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedOrders = filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box
      minHeight="100vh"
      sx={{
        background: LOGIN_GRADIENTS.pageBackground,
        pt: 4,
        pb: 4,
        px: { xs: 2, md: 6 },
      }}
    >
      <PageHeader
        title="Anular Facturas"
        startContent={<BackButton to="/home" />}
      />

      <Typography variant="body1" color="text.secondary" mb={2} mt={2}>
        Aquí puedes ver las facturas del registro histórico y anularlas si hubo algún error. Esta acción requiere PIN de administrador.
      </Typography>

      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
          <Box flex={{ xs: "1 1 100%", sm: "1 1 calc(20% - 16px)" }}>
            <TextField
              fullWidth
              label="Desde"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Box>
          <Box flex={{ xs: "1 1 100%", sm: "1 1 calc(20% - 16px)" }}>
            <TextField
              fullWidth
              label="Hasta"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Box>
          <Box flex={{ xs: "1 1 100%", sm: "1 1 calc(45% - 16px)" }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Buscar por ID, Cliente o Mesa..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box flex={{ xs: "1 1 100%", sm: "1 1 calc(15% - 16px)" }}>
            <Button
              fullWidth
              variant="contained"
              onClick={fetchOrders}
              sx={{
                bgcolor: LOGIN_COLORS.primary,
                "&:hover": { bgcolor: LOGIN_COLORS.primaryDark },
                height: 40,
                borderRadius: 2
              }}
            >
              Buscar
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 4, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: "grey.100" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Fecha / Hora</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>ID Factura</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Cliente / Mesa</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Estado</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>
                    Buscando facturas...
                  </TableCell>
                </TableRow>
              )}
              {!loading && filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>
                    {searchQuery ? "No se encontraron facturas que coincidan con la búsqueda." : "No hay facturas registradas en este rango de fechas."}
                  </TableCell>
                </TableRow>
              )}
              {!loading && paginatedOrders.map((order) => {
                const isCancelled = order.status === "cancelled";
                return (
                  <TableRow key={order.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell>
                      {new Date(order.timestamp).toLocaleDateString()}
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        {new Date(order.timestamp).toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{order.invoiceNumber ? `#${order.invoiceNumber}` : "Sin Factura"}</TableCell>
                    <TableCell>
                      {order.customerName || (order.tableId ? formatTableName(order.tableId, floorsConfig) : "--")}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>C${order.total.toFixed(2)}</TableCell>
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
                        color="error"
                        onClick={() => handleOpenCancelDialog(order)}
                        disabled={isCancelled}
                        title={isCancelled ? "Ya está anulada" : "Anular factura"}
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
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
        />
      </Paper>

      {/* Security Dialog */}
      <PinValidationDialog
        open={pinDialogOpen}
        onClose={() => {
          setPinDialogOpen(false);
          setOrderToCancel(null);
        }}
        onSuccess={handleCancelSuccess}
        title="Anular Factura"
      />
    </Box>
  );
};

export default AnularFactura;
