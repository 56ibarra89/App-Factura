import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { UserAccount } from "../types/user";
import { Order } from "../types/order.types";
import { apiClient } from "../config/apiClient";
import { statusLabels, statusColors } from "../config/orderStatusConfig";
import Chip from "@mui/material/Chip";
import { useAuth } from "../context/AuthContext";

interface DriverDeliveriesModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DriverDeliveriesModal({
  open,
  onClose,
}: DriverDeliveriesModalProps) {
  const { role } = useAuth();
  const [drivers, setDrivers] = useState<UserAccount[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchDrivers();
    } else {
      setSelectedDriverId(null);
      setOrders([]);
    }
  }, [open]);

  useEffect(() => {
    if (selectedDriverId) {
      fetchOrders(selectedDriverId);
    } else {
      setOrders([]);
    }
  }, [selectedDriverId]);

  const fetchDrivers = async () => {
    setLoadingDrivers(true);
    try {
      const users = await apiClient("/users");
      const now = new Date(); const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
      const todayNameStr = days[new Date().getDay()];

      const motorizados = users.filter((u: UserAccount) => {
        if (u.role !== "motorizado") return false;
        
        const isScheduled = u.workDays && u.workDays.includes(todayNameStr);
        const hasExtraDay = u.extraDays && u.extraDays.some(d => d.date.startsWith(todayStr));
        
        return isScheduled || hasExtraDay;
      });
      
      setDrivers(motorizados);
      if (motorizados.length > 0) {
        setSelectedDriverId(motorizados[0].id);
      } else {
        setSelectedDriverId(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const fetchOrders = async (driverId: string) => {
    setLoadingOrders(true);
    try {
      const data = await apiClient(`/orders/driver/${driverId}/today`);
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleMarkAsPaid = async (orderId: string) => {
    try {
      const orderToPay = orders.find(o => o.id === orderId);
      if (!orderToPay) return;
      
      const paymentMethod = (orderToPay.paymentMethod || 'EFECTIVO').toUpperCase();
      const payments = [{ method: paymentMethod, amount: orderToPay.total }];

      await apiClient(`/orders/${orderId}/finalize`, {
        method: "PATCH",
        body: JSON.stringify({ status: "paid", payments }),
      });
      if (selectedDriverId) {
        fetchOrders(selectedDriverId);
      }
    } catch (e: any) {
      console.error("Error al marcar como pagado:", e);
      setErrorMessage(`No se pudo actualizar la orden a pagado: ${e.message}`);
    }
  };


  const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'paid');
  const totalRevenue = completedOrders.reduce((acc, order) => acc + order.total, 0);
  const totalChangeGiven = completedOrders.reduce((acc, order) => acc + (order.deliveryChange || 0), 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Control de Motorizados</DialogTitle>
      <DialogContent dividers sx={{ display: "flex", gap: 2, height: "60vh" }}>
        {/* Sidebar - Motorizados */}
        <Box sx={{ width: 250, borderRight: 1, borderColor: "divider", overflowY: "auto", pr: 2 }}>
          <Typography variant="h6" gutterBottom>
            Motorizados
          </Typography>
          {loadingDrivers ? (
            <CircularProgress size={24} />
          ) : (
            <List>
              {drivers.map((driver) => (
                <React.Fragment key={driver.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      selected={selectedDriverId === driver.id}
                      onClick={() => setSelectedDriverId(driver.id)}
                      sx={{ borderRadius: 1 }}
                    >
                      <ListItemText primary={`${driver.firstName} ${driver.lastName}`} />
                    </ListItemButton>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              {drivers.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No hay motorizados registrados.
                </Typography>
              )}
            </List>
          )}
        </Box>

        {/* Content - Órdenes */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {selectedDriverId ? (
            <>
              <Typography variant="h6" gutterBottom>
                Entregas Asignadas Hoy
              </Typography>
              <Box sx={{ flex: 1, overflowY: "auto", mb: 2 }}>
                {loadingOrders ? (
                  <CircularProgress size={24} />
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell><b>ID Orden</b></TableCell>
                          <TableCell><b>Estado</b></TableCell>
                          <TableCell><b>Detalles</b></TableCell>
                          <TableCell align="right"><b>Total</b></TableCell>
                          <TableCell align="right"><b>Paga con</b></TableCell>
                          <TableCell align="right"><b>Vuelto</b></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orders.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              No hay entregas para mostrar.
                            </TableCell>
                          </TableRow>
                        ) : (
                          orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell>{order.invoiceNumber || order.id.slice(-6)}</TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip 
                                    label={statusLabels[order.status] || order.status} 
                                    color={statusColors[order.status] || 'default'} 
                                    size="small" 
                                  />
                                  {order.status === 'delivered' && role !== 'despachador' && (
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      color="success"
                                      onClick={() => handleMarkAsPaid(order.id)}
                                    >
                                      Cobrar
                                    </Button>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                              </TableCell>
                              <TableCell align="right">C${order.total.toFixed(2)}</TableCell>
                              <TableCell align="right">
                                {order.customerTendered ? `C$${order.customerTendered.toFixed(2)}` : "-"}
                              </TableCell>
                              <TableCell align="right" sx={{ color: "error.main", fontWeight: "bold" }}>
                                {order.deliveryChange ? `C$${order.deliveryChange.toFixed(2)}` : "-"}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
              
              <Box sx={{ display: "flex", gap: 4, justifyContent: "flex-end", p: 2, bgcolor: "background.paper", borderRadius: 1, border: 1, borderColor: "divider" }}>
                <Box textAlign="right">
                  <Typography variant="body2" color="text.secondary">Total Recaudado (Pedidos)</Typography>
                  <Typography variant="h5" color="primary.main" fontWeight="bold">
                    C${totalRevenue.toFixed(2)}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="body2" color="text.secondary">Vuelto Entregado</Typography>
                  <Typography variant="h5" color="error.main" fontWeight="bold">
                    C${totalChangeGiven.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <Typography color="text.secondary">
                Seleccione un motorizado para ver sus entregas.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" disableElevation>
          Cerrar
        </Button>
      </DialogActions>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setErrorMessage(null)}
          severity="error"
          sx={{ width: "100%", fontSize: "1rem" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
