import React, { useState, useEffect, useCallback } from "react";
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
import type { DeliveryDriver } from "../model/delivery.types";
import {
  statusLabels,
  statusColors,
  ordersGateway,
  type Order,
} from "../../orders";
import Chip from "@mui/material/Chip";
import { useAuth } from "../../auth";
import {
  deliveryGateway,
  type DeliveryGateway,
} from "../api/deliveryGateway";
import { apiClient } from "../../../shared/api";

interface DriverDeliveriesModalProps {
  open: boolean;
  onClose: () => void;
  gateway?: DeliveryGateway;
}

export default function DriverDeliveriesModal({
  open,
  onClose,
  gateway = deliveryGateway,
}: DriverDeliveriesModalProps) {
  const { role } = useAuth();
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchDrivers = useCallback(async () => {
    setLoadingDrivers(true);
    try {
      const usersList: DeliveryDriver[] = await apiClient("/users").catch(() => []);
      const motorizados = usersList.filter((u) => u.role === "motorizado");
      const listToUse = motorizados.length > 0 ? motorizados : usersList;
      setDrivers(listToUse);
      if (listToUse.length > 0) {
        setSelectedDriverId(listToUse[0].id);
      } else {
        setSelectedDriverId(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDrivers(false);
    }
  }, []);

  const fetchOrders = useCallback(async (driverId: string) => {
    setLoadingOrders(true);
    try {
      const [data, currentOrders] = await Promise.all([
        gateway.getDriverOrdersToday(driverId).catch(() => [] as Order[]),
        ordersGateway.listCurrent().catch(() => [] as Order[]),
      ]);
      const orderMap = new Map<string, Order>();
      data.forEach((o) => orderMap.set(o.id, o));
      currentOrders.forEach((o) => {
        if (
          o.orderType === "delivery" &&
          (o.driverId === driverId || !o.driverId)
        ) {
          orderMap.set(o.id, o);
        }
      });
      const combined = Array.from(orderMap.values());
      combined.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setOrders(combined);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  }, [gateway]);

  useEffect(() => {
    if (open) {
      void fetchDrivers();
    } else {
      setSelectedDriverId(null);
      setOrders([]);
    }
  }, [open, fetchDrivers]);

  useEffect(() => {
    if (selectedDriverId) {
      void fetchOrders(selectedDriverId);
    }
  }, [selectedDriverId, fetchOrders]);

  const handleMarkAsPaid = async (orderId: string) => {
    try {
      const order = orders.find((o) => o.id === orderId);
      const method = (order?.paymentMethod || "EFECTIVO").toUpperCase();
      const total = order?.total || 0;
      await gateway.finalizeOrder(orderId, method, total);
      if (selectedDriverId) {
        await fetchOrders(selectedDriverId);
      }
    } catch {
      setErrorMessage("No se pudo marcar la orden como pagada.");
    }
  };

  const renderPaymentMethodChip = (order: Order) => {
    const method = (order.paymentMethod || "EFECTIVO").toUpperCase();

    if (method === "MIXTO") {
      return (
        <Box display="flex" flexDirection="column" alignItems="center">
          <Chip
            label="Mixto"
            size="small"
            color="info"
            sx={{ fontWeight: "bold" }}
          />
          {order.splitAmounts && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mt: 0.3, whiteSpace: "nowrap", fontSize: "0.72rem" }}
            >
              Efec: C${(order.splitAmounts.efectivo || 0).toFixed(2)} | Tarj: C$
              {(order.splitAmounts.tarjeta || 0).toFixed(2)}
              {order.splitAmounts.app !== undefined && order.splitAmounts.app > 0
                ? ` | App: C$${order.splitAmounts.app.toFixed(2)}`
                : ""}
            </Typography>
          )}
        </Box>
      );
    }

    if (method === "TARJETA") {
      return (
        <Chip
          label="Tarjeta"
          size="small"
          color="secondary"
          sx={{ fontWeight: "bold" }}
        />
      );
    }

    if (method === "APP") {
      return (
        <Chip
          label="App"
          size="small"
          color="warning"
          sx={{ fontWeight: "bold" }}
        />
      );
    }

    return (
      <Chip
        label="Efectivo"
        size="small"
        color="success"
        variant="filled"
        sx={{ fontWeight: "bold" }}
      />
    );
  };

  const completedOrders = orders.filter((o) => o.status === "delivered" || o.status === "paid");
  const totalRevenue = completedOrders.reduce((acc, o) => acc + o.total, 0);
  const totalChangeGiven = completedOrders.reduce((acc, o) => acc + (o.deliveryChange || 0), 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Control de Motorizados</DialogTitle>
      <Divider />
      <DialogContent sx={{ display: "flex", height: "550px", p: 0 }}>
        {}
        <Box sx={{ width: "240px", borderRight: 1, borderColor: "divider", overflowY: "auto" }}>
          <Typography variant="subtitle2" sx={{ p: 2, pb: 1, color: "text.secondary", fontWeight: "bold" }}>
            Motorizados
          </Typography>
          {loadingDrivers ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <List disablePadding>
              {drivers.map((driver) => (
                <ListItem key={driver.id} disablePadding>
                  <ListItemButton
                    selected={selectedDriverId === driver.id}
                    onClick={() => setSelectedDriverId(driver.id)}
                  >
                    <ListItemText
                      primary={`${driver.firstName} ${driver.lastName}`.trim() || driver.username}
                      primaryTypographyProps={{
                        fontWeight: selectedDriverId === driver.id ? "bold" : "normal",
                        color: selectedDriverId === driver.id ? "primary.main" : "text.primary",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
              {drivers.length === 0 && (
                <Typography variant="body2" sx={{ p: 2, color: "text.secondary" }}>
                  No hay motorizados registrados.
                </Typography>
              )}
            </List>
          )}
        </Box>

        {/* Tabla de órdenes a la derecha */}
        <Box sx={{ flex: 1, p: 3, display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
          {selectedDriverId ? (
            <>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Entregas Asignadas Hoy
              </Typography>
              <Box sx={{ flex: 1, overflowY: "auto", mb: 2 }}>
                {loadingOrders ? (
                  <Box display="flex" justifyContent="center" py={6}>
                    <CircularProgress size={28} />
                  </Box>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell><b>ID Orden</b></TableCell>
                          <TableCell><b>Estado</b></TableCell>
                          <TableCell><b>Detalles</b></TableCell>
                          <TableCell align="center"><b>Método de Pago</b></TableCell>
                          <TableCell align="right"><b>Total</b></TableCell>
                          <TableCell align="right"><b>Paga con</b></TableCell>
                          <TableCell align="right"><b>Vuelto</b></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orders.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                              No hay entregas para mostrar.
                            </TableCell>
                          </TableRow>
                        ) : (
                          orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell>{order.invoiceNumber || order.id.slice(-6)}</TableCell>
                              <TableCell>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Chip
                                    label={statusLabels[order.status] || order.status}
                                    color={statusColors[order.status] || "default"}
                                    size="small"
                                    sx={{ fontWeight: "bold" }}
                                  />
                                  {order.status === "delivered" && role !== "despachador" && (
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      color="success"
                                      onClick={() => handleMarkAsPaid(order.id)}
                                      sx={{ fontWeight: "bold" }}
                                    >
                                      Cobrar
                                    </Button>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                              </TableCell>
                              <TableCell align="center">
                                {renderPaymentMethodChip(order)}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                C${order.total.toFixed(2)}
                              </TableCell>
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

              <Box sx={{ display: "flex", gap: 4, justifyContent: "flex-end", p: 2, bgcolor: "background.paper", borderRadius: 2, border: 1, borderColor: "divider" }}>
                <Box textAlign="right">
                  <Typography variant="body2" color="text.secondary">Total Recaudado (Pedidos)</Typography>
                  <Typography variant="h6" color="primary.main" fontWeight="900">
                    C${totalRevenue.toFixed(2)}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="body2" color="text.secondary">Vuelto Entregado</Typography>
                  <Typography variant="h6" color="error.main" fontWeight="900">
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
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" color="error" disableElevation sx={{ fontWeight: "bold" }}>
          Cerrar
        </Button>
      </DialogActions>

      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={4000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}

