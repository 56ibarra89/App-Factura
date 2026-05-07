import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PageHeader from "../components/PageHeader";
import { useOrderManagement } from "../hooks/useOrderManagement";
import { LOGIN_GRADIENTS } from "../theme/loginTheme";
import { Order } from "../types/order.types";
import { useNavigate } from "react-router-dom";
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

const AnularFactura = () => {
  const { activeOrders, finishedOrders, updateOrderStatus } = useOrderManagement();
  const navigate = useNavigate();

  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  // Unimos todas las órdenes para mostrarlas juntas en orden histórico
  const allOrders = useMemo(() => {
    return [...activeOrders, ...finishedOrders].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [activeOrders, finishedOrders]);

  const handleOpenCancelDialog = (order: Order) => {
    setOrderToCancel(order);
    setPinDialogOpen(true);
  };

  const handleCancelSuccess = () => {
    if (orderToCancel) {
      updateOrderStatus(orderToCancel.id, "cancelled");
    }
    setPinDialogOpen(false);
    setOrderToCancel(null);
  };

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
        startContent={
          <IconButton 
            onClick={() => navigate("/home")} 
            sx={{ bgcolor: "white", boxShadow: 1, mr: 1, "&:hover": { bgcolor: "grey.100" } }}
          >
            <ArrowBackIcon color="primary" />
          </IconButton>
        }
      />

      <Typography variant="body1" color="text.secondary" mb={4} mt={2}>
        Aquí puedes ver las facturas de la jornada y anularlas si hubo algún error. Esta acción requiere PIN de administrador.
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: "grey.100" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>ID Factura</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Hora</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Cliente / Mesa</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>Estado</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  No hay facturas registradas el día de hoy.
                </TableCell>
              </TableRow>
            )}
            {allOrders.map((order) => {
              const isCancelled = order.status === "cancelled";
              return (
                <TableRow key={order.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell>#{order.id.split("-")[1]}</TableCell>
                  <TableCell>{new Date(order.timestamp).toLocaleTimeString()}</TableCell>
                  <TableCell>
                    {order.customerName || (order.tableId ? `Mesa ${order.tableId}` : "--")}
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
